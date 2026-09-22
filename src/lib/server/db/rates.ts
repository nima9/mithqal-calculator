import { asc, desc } from "drizzle-orm";
import { Effect } from "effect";
import { createDatabase } from "./client";
import { getCurrencyMetadata, type CurrencyKind } from "./currencies";
import {
  parseFxCurrenciesPayload,
  parseFxRatesPayload,
  parseSwissquoteMetalQuote,
} from "./external-api";
import { validateRatesSnapshot } from "./rate-validation";
import { activeCurrencies, currencies, metals, rateFetchLog } from "./schema";

import type { Database, DatabaseConfig } from "./client";
import type { JsonValue } from "./external-api";

const REQUEST_TIMEOUT_MS = 10_000;

const FX_RATES_API_BASE_URL = "https://api.fxratesapi.com";

export type RatesServiceConfig = DatabaseConfig & {
  fxRatesApiKey: string;
};

export type RatesSnapshot = {
  lastFetchTime: number | null;
  metals: Array<{ name: string; priceUSD: number }>;
  currencies: Array<{
    code: string;
    name: string;
    symbol: string;
    kind: CurrencyKind;
    rateToUSD: number;
  }>;
};

export async function getRatesSnapshot(db: Database): Promise<RatesSnapshot> {
  const [lastLog, metalRows, currencyRows, activeCurrencyRows] = await Promise.all([
    db
      .select({ fetchedAt: rateFetchLog.fetchedAt })
      .from(rateFetchLog)
      .orderBy(desc(rateFetchLog.fetchedAt))
      .limit(1),
    db.select().from(metals).orderBy(asc(metals.name)),
    db.select().from(currencies).orderBy(asc(currencies.code)),
    db.select().from(activeCurrencies).orderBy(asc(activeCurrencies.code)),
  ]);

  const ratesByCode = new Map(currencyRows.map((currency) => [currency.code, currency.rateToUsd]));

  const activeCurrencyRates = activeCurrencyRows.flatMap((currency) => {
    const rateToUsd = ratesByCode.get(currency.code);

    return rateToUsd === undefined ? [] : [{ ...currency, rateToUsd }];
  });

  const visibleCurrencies =
    activeCurrencyRows.length > 0
      ? activeCurrencyRates
      : currencyRows.map((currency) => ({
          ...currency,
          kind: getCurrencyMetadata(currency.code).kind,
        }));

  return {
    lastFetchTime: lastLog[0]?.fetchedAt ?? null,
    metals: metalRows.map((metal) => ({ name: metal.name, priceUSD: metal.priceUsd })),
    currencies: visibleCurrencies.map((currency) => ({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      kind: currency.kind,
      rateToUSD: currency.rateToUsd,
    })),
  };
}

// ============================================
// Snapshot cache
// ============================================

/**
 * In-isolate cache for the rates snapshot. Rates only change once a day
 * (cron refresh), so a short TTL removes almost every Turso roundtrip for
 * page loads hitting the same isolate. Concurrent requests share a single
 * in-flight query.
 */
const SNAPSHOT_CACHE_TTL_MS = 5 * 60 * 1000;

let cachedSnapshot: { snapshot: RatesSnapshot; expiresAt: number } | null = null;

let inflightSnapshot: Promise<RatesSnapshot> | null = null;

/** Drop the cached snapshot (called after a cron refresh). */
export function invalidateRatesSnapshotCache(): void {
  cachedSnapshot = null;
}

/** Get the rates snapshot through the cache, never throwing. Callers handle rejections. */
export function getRatesSnapshotCached(config: DatabaseConfig): Promise<RatesSnapshot> {
  if (cachedSnapshot && Date.now() < cachedSnapshot.expiresAt) {
    return Promise.resolve(cachedSnapshot.snapshot);
  }

  if (!inflightSnapshot) {
    inflightSnapshot = getRatesSnapshot(createDatabase(config))
      .then((snapshot) => {
        cachedSnapshot = { snapshot, expiresAt: Date.now() + SNAPSHOT_CACHE_TTL_MS };

        return snapshot;
      })
      .finally(() => {
        inflightSnapshot = null;
      });
  }

  return inflightSnapshot;
}

function fetchJsonEffect(url: string, authorization?: string): Effect.Effect<JsonValue, Error> {
  return Effect.tryPromise({
    try: async () => {
      const response = await fetch(url, {
        headers: authorization ? { Authorization: authorization } : undefined,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);

      return response.json();
    },
    catch: (cause) => (cause instanceof Error ? cause : new Error(`Failed to fetch ${url}`)),
  });
}

function fetchMetalPayloadEffect(symbol: "XAU" | "XAG"): Effect.Effect<JsonValue, Error> {
  return fetchJsonEffect(
    `https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/${symbol}/USD`,
  );
}

export async function refreshRates(config: RatesServiceConfig): Promise<void> {
  const db = createDatabase(config);

  const authorization = `Bearer ${config.fxRatesApiKey}`;

  const [fxPayload, goldPayload, silverPayload] = await Effect.runPromise(
    Effect.all(
      [
        fetchJsonEffect(`${FX_RATES_API_BASE_URL}/latest`, authorization),
        fetchMetalPayloadEffect("XAU"),
        fetchMetalPayloadEffect("XAG"),
      ],
      { concurrency: "unbounded" },
    ),
  );

  const fxSnapshot = parseFxRatesPayload(fxPayload);

  if (!fxSnapshot) throw new Error("FXRatesAPI returned an invalid rates response");

  const goldQuote = parseSwissquoteMetalQuote(goldPayload, fxSnapshot.timestampMs);
  const silverQuote = parseSwissquoteMetalQuote(silverPayload, fxSnapshot.timestampMs);

  if (!goldQuote) throw new Error("Swissquote returned an invalid XAU price");

  if (!silverQuote) throw new Error("Swissquote returned an invalid XAG price");

  const snapshot = validateRatesSnapshot({
    goldPriceUsd: goldQuote.price,
    goldUpdatedAt: goldQuote.timestampMs ?? fxSnapshot.timestampMs,
    silverPriceUsd: silverQuote.price,
    silverUpdatedAt: silverQuote.timestampMs ?? fxSnapshot.timestampMs,
    rates: fxSnapshot.rates,
    retrievedAt: fxSnapshot.timestampMs,
  });

  await db.transaction(async (tx) => {
    await tx.delete(currencies);
    await tx.insert(currencies).values(
      snapshot.currencies.map(({ code, name, symbol, rateToUsd }) => ({
        code,
        name,
        symbol,
        rateToUsd,
      })),
    );

    await tx.delete(metals);
    await tx.insert(metals).values(snapshot.metals);

    await tx.delete(rateFetchLog);
    await tx.insert(rateFetchLog).values({
      fetchedAt: snapshot.retrievedAt,
      metalsSource: "swissquote-median-midpoint",
      currencySource: "fxratesapi",
      success: true,
    });
  });
}

export async function syncActiveCurrencies(config: RatesServiceConfig): Promise<void> {
  const authorization = `Bearer ${config.fxRatesApiKey}`;

  const payload = await Effect.runPromise(
    fetchJsonEffect(`${FX_RATES_API_BASE_URL}/currencies`, authorization),
  );

  const parsedCurrencies = parseFxCurrenciesPayload(payload);

  if (!parsedCurrencies) throw new Error("FXRatesAPI returned an invalid currencies response");

  const db = createDatabase(config);

  await db.transaction(async (tx) => {
    await tx.delete(activeCurrencies);
    await tx.insert(activeCurrencies).values(parsedCurrencies);
  });
}

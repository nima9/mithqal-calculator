import { asc, desc } from "drizzle-orm";
import type { Database, DatabaseConfig } from "./client";
import { createDatabase } from "./client";
import { getCurrencyMetadata, type CurrencyKind } from "./currencies";
import { parseFxRatesPayload, parseSwissquoteMedianMidpoint } from "./external-api";
import { validateRatesSnapshot } from "./rate-validation";
import { currencies, metals, rateFetchLog } from "./schema";

const REQUEST_TIMEOUT_MS = 10_000;

export interface RatesSnapshot {
  lastFetchTime: number | null;
  metals: Array<{ name: string; priceUSD: number }>;
  currencies: Array<{
    code: string;
    name: string;
    symbol: string;
    kind: CurrencyKind;
    rateToUSD: number;
  }>;
}

export async function getRatesSnapshot(db: Database): Promise<RatesSnapshot> {
  const [lastLog, metalRows, currencyRows] = await Promise.all([
    db
      .select({ fetchedAt: rateFetchLog.fetchedAt })
      .from(rateFetchLog)
      .orderBy(desc(rateFetchLog.fetchedAt))
      .limit(1),
    db.select().from(metals).orderBy(asc(metals.name)),
    db.select().from(currencies).orderBy(asc(currencies.code)),
  ]);

  return {
    lastFetchTime: lastLog[0]?.fetchedAt ?? null,
    metals: metalRows.map((metal) => ({ name: metal.name, priceUSD: metal.priceUsd })),
    currencies: currencyRows.map((currency) => ({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      kind: getCurrencyMetadata(currency.code).kind,
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
 * page loads and /api/rates requests hitting the same isolate. Concurrent
 * requests share a single in-flight query.
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

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

async function fetchMetalPrice(symbol: "XAU" | "XAG"): Promise<number> {
  const payload = await fetchJson(
    `https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/${symbol}/USD`,
  );
  const price = parseSwissquoteMedianMidpoint(payload);
  if (!price || price <= 0) throw new Error(`Swissquote returned an invalid ${symbol} price`);
  return price;
}

export async function refreshRates(config: DatabaseConfig): Promise<void> {
  const db = createDatabase(config);
  const [goldPriceUsd, silverPriceUsd, fxPayload] = await Promise.all([
    fetchMetalPrice("XAU"),
    fetchMetalPrice("XAG"),
    fetchJson("https://api.fxratesapi.com/latest"),
  ]);

  const parsedRates = parseFxRatesPayload(fxPayload);
  if (!parsedRates) throw new Error("FXRatesAPI returned an invalid response");

  const snapshot = validateRatesSnapshot({
    goldPriceUsd,
    silverPriceUsd,
    rates: parsedRates,
    retrievedAt: Date.now(),
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

import { asc, desc, lt, sql } from "drizzle-orm";
import type { Database, DatabaseConfig } from "./client";
import { createDatabase } from "./client";
import { CURRENCIES } from "./currencies";
import { parseFxRatesPayload, parseSwissquoteAsk } from "./external-api";
import { currencies, metals, rateFetchLog } from "./schema";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

export interface RatesSnapshot {
  lastFetchTime: number | null;
  metals: Array<{ name: string; priceUSD: number }>;
  currencies: Array<{ code: string; name: string; symbol: string; rateToUSD: number }>;
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
      rateToUSD: currency.rateToUsd,
    })),
  };
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
  const price = parseSwissquoteAsk(payload);
  if (!price || price <= 0) throw new Error(`Swissquote returned an invalid ${symbol} price`);
  return price;
}

async function upsertMetal(db: Database, name: string, priceUsd: number, lastUpdated: number) {
  await db.insert(metals).values({ name, priceUsd, lastUpdated }).onConflictDoUpdate({
    target: metals.name,
    set: { priceUsd, lastUpdated },
  });
}

async function upsertCurrencies(db: Database, rates: Record<string, number>) {
  const values = CURRENCIES.flatMap((currency) => {
    const rateToUsd = rates[currency.code];
    return typeof rateToUsd === "number" ? [{ ...currency, rateToUsd }] : [];
  });

  if (values.length === 0) throw new Error("FXRatesAPI did not return any supported currencies");

  await db
    .insert(currencies)
    .values(values)
    .onConflictDoUpdate({
      target: currencies.code,
      set: {
        name: sql.raw("excluded.name"),
        symbol: sql.raw("excluded.symbol"),
        rateToUsd: sql.raw("excluded.rate_to_usd"),
      },
    });
}

export async function refreshRates(config: DatabaseConfig): Promise<void> {
  const db = createDatabase(config);
  const now = Date.now();
  let success = true;

  const results = await Promise.allSettled([
    fetchMetalPrice("XAU").then((price) => upsertMetal(db, "gold", price, now)),
    fetchMetalPrice("XAG").then((price) => upsertMetal(db, "silver", price, now)),
    fetchJson("https://api.fxratesapi.com/latest")
      .then(parseFxRatesPayload)
      .then((rates) => {
        if (!rates) throw new Error("FXRatesAPI returned an invalid response");
        return upsertCurrencies(db, rates);
      }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      success = false;
      console.error("Rate refresh failed:", result.reason);
    }
  }

  await db.insert(rateFetchLog).values({
    fetchedAt: now,
    metalsSource: "swissquote",
    currencySource: "fxratesapi",
    success,
  });

  await db.delete(rateFetchLog).where(lt(rateFetchLog.fetchedAt, now - ONE_MONTH_MS));

  if (!success) throw new Error("One or more rate providers failed");
}

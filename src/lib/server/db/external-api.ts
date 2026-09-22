import * as v from "valibot";
import { getCurrencyKind } from "./currencies";

/**
 * Raw JSON as it arrives from an external fetch, before domain parsing. Kept as
 * a named boundary type so `unknown` never leaves the decoder functions.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const FxRatesPayloadSchema = v.object({
  success: v.literal(true),
  base: v.literal("USD"),
  timestamp: v.pipe(v.number(), v.finite(), v.integer(), v.gtValue(0)),
  date: v.optional(v.string()),
  rates: v.record(v.string(), v.unknown()),
});

const CurrencyCodeSchema = v.pipe(v.string(), v.regex(/^[A-Z0-9]{2,5}$/));

const PositiveRateSchema = v.pipe(v.number(), v.finite(), v.gtValue(0));

export type FxRatesSnapshot = {
  rates: Record<string, number>;
  timestampMs: number;
};

export function parseFxRatesPayload(value: JsonValue): FxRatesSnapshot | null {
  const payload = v.safeParse(FxRatesPayloadSchema, value);

  if (!payload.success) return null;

  const parsedRates: Record<string, number> = {};

  for (const [code, rate] of Object.entries(payload.output.rates)) {
    const parsedRate = v.safeParse(PositiveRateSchema, rate);

    if (v.is(CurrencyCodeSchema, code) && parsedRate.success) {
      parsedRates[code] = parsedRate.output;
    }
  }

  if (Object.keys(parsedRates).length === 0) return null;

  const dateTimestampMs = Date.parse(payload.output.date ?? "");

  const timestampMs = Number.isFinite(dateTimestampMs)
    ? dateTimestampMs
    : payload.output.timestamp * 1_000;

  return { rates: parsedRates, timestampMs };
}

const FxCurrencySchema = v.object({
  code: CurrencyCodeSchema,
  name: v.pipe(v.string(), v.nonEmpty()),
  symbol: v.string(),
});

const PRECIOUS_METAL_CODES = new Set(["XAG", "XAU", "XPD", "XPT"]);

export type ActiveCurrency = {
  code: string;
  name: string;
  symbol: string;
  kind: "fiat" | "crypto";
};

export function parseFxCurrenciesPayload(value: JsonValue): ActiveCurrency[] | null {
  const payload = v.safeParse(v.record(v.string(), v.unknown()), value);

  if (!payload.success) return null;

  const activeCurrencies: ActiveCurrency[] = [];

  for (const [key, currency] of Object.entries(payload.output)) {
    const parsedCurrency = v.safeParse(FxCurrencySchema, currency);

    if (
      !parsedCurrency.success ||
      parsedCurrency.output.code !== key ||
      PRECIOUS_METAL_CODES.has(key)
    ) {
      continue;
    }

    activeCurrencies.push({
      code: key,
      name: parsedCurrency.output.name,
      symbol: parsedCurrency.output.symbol,
      kind: getCurrencyKind(key),
    });
  }

  if (!activeCurrencies.some(({ code }) => code === "USD")) return null;

  if (!activeCurrencies.some(({ code }) => code === "EUR")) return null;

  return activeCurrencies.sort((left, right) => left.code.localeCompare(right.code));
}

const SpreadProfileSchema = v.object({
  bid: v.pipe(v.number(), v.finite(), v.gtValue(0)),
  ask: v.pipe(v.number(), v.finite(), v.gtValue(0)),
});

const QuoteSchema = v.object({
  ts: v.optional(v.pipe(v.number(), v.finite(), v.integer(), v.gtValue(0))),
  spreadProfilePrices: v.array(v.unknown()),
});

export type MetalQuote = {
  price: number;
  timestampMs: number | null;
};

type ParsedQuote = {
  midpoints: number[];
  timestampMs: number | null;
};

function median(values: number[]): number {
  values.sort((left, right) => left - right);
  const middle = Math.floor(values.length / 2);

  return values.length % 2 === 1 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
}

export function parseSwissquoteMetalQuote(
  value: JsonValue,
  targetTimestampMs: number,
): MetalQuote | null {
  const quotes = v.safeParse(v.array(v.unknown()), value);

  if (!quotes.success) return null;

  const parsedQuotes: ParsedQuote[] = [];

  for (const quote of quotes.output) {
    const parsedQuote = v.safeParse(QuoteSchema, quote);

    if (!parsedQuote.success) continue;

    const midpoints: number[] = [];

    for (const spreadProfile of parsedQuote.output.spreadProfilePrices) {
      const parsedProfile = v.safeParse(SpreadProfileSchema, spreadProfile);

      if (!parsedProfile.success || parsedProfile.output.ask < parsedProfile.output.bid) {
        continue;
      }

      midpoints.push((parsedProfile.output.bid + parsedProfile.output.ask) / 2);
    }

    if (midpoints.length > 0) {
      parsedQuotes.push({
        midpoints,
        timestampMs: parsedQuote.output.ts ?? null,
      });
    }
  }

  if (parsedQuotes.length === 0) return null;

  let closestQuote: ParsedQuote | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const quote of parsedQuotes) {
    if (quote.timestampMs === null) continue;

    const distance = Math.abs(quote.timestampMs - targetTimestampMs);

    if (distance < closestDistance) {
      closestQuote = quote;
      closestDistance = distance;
    }
  }

  if (closestQuote) {
    return {
      price: median(closestQuote.midpoints),
      timestampMs: closestQuote.timestampMs,
    };
  }

  const allMidpoints = parsedQuotes.flatMap(({ midpoints }) => midpoints);

  return { price: median(allMidpoints), timestampMs: null };
}

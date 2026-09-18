type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null ? (value as JsonRecord) : null;
}

export function parseFxRatesPayload(value: unknown): Record<string, number> | null {
  const payload = asRecord(value);
  if (!payload || payload.success !== true || payload.base !== "USD") return null;

  const rates = asRecord(payload.rates);
  if (!rates) return null;

  const parsedRates: Record<string, number> = {};
  for (const [code, rate] of Object.entries(rates)) {
    if (/^[A-Z]{3}$/.test(code) && typeof rate === "number" && Number.isFinite(rate) && rate > 0) {
      parsedRates[code] = rate;
    }
  }

  return Object.keys(parsedRates).length > 0 ? parsedRates : null;
}

export function parseSwissquoteMedianMidpoint(value: unknown): number | null {
  if (!Array.isArray(value)) return null;

  const midpoints: number[] = [];
  for (const quote of value) {
    const record = asRecord(quote);
    if (!record || !Array.isArray(record.spreadProfilePrices)) continue;

    for (const spreadProfile of record.spreadProfilePrices) {
      const price = asRecord(spreadProfile);
      const bid = price?.bid;
      const ask = price?.ask;
      if (
        typeof bid !== "number" ||
        typeof ask !== "number" ||
        !Number.isFinite(bid) ||
        !Number.isFinite(ask) ||
        bid <= 0 ||
        ask <= 0 ||
        ask < bid
      ) {
        continue;
      }

      midpoints.push((bid + ask) / 2);
    }
  }

  if (midpoints.length === 0) return null;
  midpoints.sort((left, right) => left - right);
  const middle = Math.floor(midpoints.length / 2);
  return midpoints.length % 2 === 1
    ? midpoints[middle]
    : (midpoints[middle - 1] + midpoints[middle]) / 2;
}

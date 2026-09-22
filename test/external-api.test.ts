import { describe, expect, test } from "bun:test";
import {
  parseFxCurrenciesPayload,
  parseFxRatesPayload,
  parseSwissquoteMetalQuote,
} from "../src/lib/server/db/external-api";

describe("parseFxRatesPayload", () => {
  test("accepts positive finite USD-based rates", () => {
    expect(
      parseFxRatesPayload({
        success: true,
        base: "USD",
        timestamp: 1_700_000_000,
        date: "2023-11-14T22:13:20.000Z",
        rates: { USD: 1, EUR: 0.85, OP: 0.5, ZERO: 0, NEG: -1, BAD: Number.NaN },
      }),
    ).toEqual({
      rates: { USD: 1, EUR: 0.85, OP: 0.5 },
      timestampMs: 1_700_000_000_000,
    });
  });

  test("rejects failed, non-USD, and empty payloads", () => {
    const timestamp = 1_700_000_000;

    expect(
      parseFxRatesPayload({ success: false, base: "USD", timestamp, rates: { USD: 1 } }),
    ).toBeNull();
    expect(
      parseFxRatesPayload({ success: true, base: "EUR", timestamp, rates: { USD: 1 } }),
    ).toBeNull();
    expect(parseFxRatesPayload({ success: true, base: "USD", timestamp, rates: {} })).toBeNull();
  });
});

describe("parseFxCurrenciesPayload", () => {
  test("parses active fiat and crypto metadata while excluding precious metals", () => {
    expect(
      parseFxCurrenciesPayload({
        USD: { code: "USD", name: "US Dollar", symbol: "$" },
        EUR: { code: "EUR", name: "Euro", symbol: "€" },
        BZD: { code: "BZD", name: "Belize Dollar", symbol: "BZ$" },
        BTC: { code: "BTC", name: "Bitcoin", symbol: "₿" },
        AVAX: { code: "AVAX", name: "Avalanche", symbol: "AVAX" },
        XAU: { code: "XAU", name: "Gold Ounce", symbol: "XAU" },
      }),
    ).toEqual([
      { code: "AVAX", name: "Avalanche", symbol: "AVAX", kind: "crypto" },
      { code: "BTC", name: "Bitcoin", symbol: "₿", kind: "crypto" },
      { code: "BZD", name: "Belize Dollar", symbol: "BZ$", kind: "fiat" },
      { code: "EUR", name: "Euro", symbol: "€", kind: "fiat" },
      { code: "USD", name: "US Dollar", symbol: "$", kind: "fiat" },
    ]);
  });

  test("requires USD and EUR and matching currency keys", () => {
    expect(
      parseFxCurrenciesPayload({ USD: { code: "EUR", name: "Euro", symbol: "€" } }),
    ).toBeNull();
  });
});

describe("parseSwissquoteMetalQuote", () => {
  test("takes the median midpoint across every valid quote", () => {
    const payload = [
      {
        ts: 1_000,
        spreadProfilePrices: [
          { bid: 99, ask: 101 },
          { bid: 119, ask: 121 },
        ],
      },
      { ts: 2_000, spreadProfilePrices: [{ bid: 109, ask: 111 }] },
    ];

    expect(parseSwissquoteMetalQuote(payload, 1_100)).toEqual({
      price: 110,
      timestampMs: 1_000,
    });
  });

  test("chooses the quote closest to the FX timestamp", () => {
    const forward = [
      {
        ts: 3_000,
        spreadProfilePrices: [
          { bid: 39, ask: 41 },
          { bid: 9, ask: 11 },
        ],
      },
      {
        ts: 1_000,
        spreadProfilePrices: [
          { bid: 29, ask: 31 },
          { bid: 19, ask: 21 },
        ],
      },
    ];

    const reversed = [...forward].reverse();

    expect(parseSwissquoteMetalQuote(forward, 1_100)).toEqual({
      price: 25,
      timestampMs: 1_000,
    });
    expect(parseSwissquoteMetalQuote(reversed, 1_100)).toEqual({
      price: 25,
      timestampMs: 1_000,
    });
  });

  test("ignores malformed quotes and fails when none remain", () => {
    const invalid = [
      {
        spreadProfilePrices: [
          { bid: 2, ask: 1 },
          { bid: 0, ask: 1 },
          { bid: Number.NaN, ask: 1 },
        ],
      },
    ];

    expect(parseSwissquoteMetalQuote(invalid, 1_000)).toBeNull();
    expect(parseSwissquoteMetalQuote({}, 1_000)).toBeNull();
  });
});

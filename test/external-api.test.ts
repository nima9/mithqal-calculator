import { describe, expect, test } from "bun:test";
import {
  parseFxRatesPayload,
  parseSwissquoteMedianMidpoint,
} from "../src/lib/server/db/external-api";

describe("parseFxRatesPayload", () => {
  test("accepts positive finite USD-based rates", () => {
    expect(
      parseFxRatesPayload({
        success: true,
        base: "USD",
        rates: { USD: 1, EUR: 0.85, ZERO: 0, NEG: -1, BAD: Number.NaN },
      }),
    ).toEqual({ USD: 1, EUR: 0.85 });
  });

  test("rejects failed, non-USD, and empty payloads", () => {
    expect(parseFxRatesPayload({ success: false, base: "USD", rates: { USD: 1 } })).toBeNull();
    expect(parseFxRatesPayload({ success: true, base: "EUR", rates: { USD: 1 } })).toBeNull();
    expect(parseFxRatesPayload({ success: true, base: "USD", rates: {} })).toBeNull();
  });
});

describe("parseSwissquoteMedianMidpoint", () => {
  test("takes the median midpoint across every valid quote", () => {
    const payload = [
      {
        spreadProfilePrices: [
          { bid: 99, ask: 101 },
          { bid: 119, ask: 121 },
        ],
      },
      { spreadProfilePrices: [{ bid: 109, ask: 111 }] },
    ];

    expect(parseSwissquoteMedianMidpoint(payload)).toBe(110);
  });

  test("is order-independent and averages the middle pair", () => {
    const forward = [
      {
        spreadProfilePrices: [
          { bid: 39, ask: 41 },
          { bid: 9, ask: 11 },
        ],
      },
      {
        spreadProfilePrices: [
          { bid: 29, ask: 31 },
          { bid: 19, ask: 21 },
        ],
      },
    ];
    const reversed = [...forward].reverse();

    expect(parseSwissquoteMedianMidpoint(forward)).toBe(25);
    expect(parseSwissquoteMedianMidpoint(reversed)).toBe(25);
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

    expect(parseSwissquoteMedianMidpoint(invalid)).toBeNull();
    expect(parseSwissquoteMedianMidpoint({})).toBeNull();
  });
});

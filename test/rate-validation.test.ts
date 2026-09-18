import { describe, expect, test } from "bun:test";
import { validateRatesSnapshot } from "../src/lib/server/db/rate-validation";

const validInput = {
  goldPriceUsd: 3_000,
  silverPriceUsd: 35,
  rates: { USD: 1, EUR: 0.85, BTC: 0.00001 },
  retrievedAt: 123_456,
};

describe("validateRatesSnapshot", () => {
  test("requires both metals plus USD and EUR", () => {
    expect(() => validateRatesSnapshot(validInput)).not.toThrow();
    expect(() => validateRatesSnapshot({ ...validInput, goldPriceUsd: 0 })).toThrow();
    expect(() => validateRatesSnapshot({ ...validInput, rates: { USD: 1, JPY: 150 } })).toThrow();
  });

  test("keeps known crypto separate and gives unknown codes blank metadata", () => {
    const snapshot = validateRatesSnapshot({
      ...validInput,
      rates: { ...validInput.rates, XYZ: 12 },
    });

    expect(snapshot.currencies.find(({ code }) => code === "BTC")?.kind).toBe("crypto");
    expect(snapshot.currencies.find(({ code }) => code === "XYZ")).toEqual({
      code: "XYZ",
      name: "",
      symbol: "",
      kind: "fiat",
      rateToUsd: 12,
    });
  });

  test("omits invalid, retired, and non-currency rates", () => {
    const snapshot = validateRatesSnapshot({
      ...validInput,
      rates: {
        ...validInput.rates,
        HRK: 7,
        XAU: 0.0003,
        NEG: -1,
      },
    });

    expect(snapshot.currencies.map(({ code }) => code)).toEqual(["BTC", "EUR", "USD"]);
  });

  test("uses one retrieval timestamp for the complete snapshot", () => {
    const snapshot = validateRatesSnapshot(validInput);
    expect(snapshot.retrievedAt).toBe(validInput.retrievedAt);
    expect(snapshot.metals.every(({ lastUpdated }) => lastUpdated === validInput.retrievedAt)).toBe(
      true,
    );
  });
});

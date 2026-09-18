import { describe, expect, test } from "bun:test";
import {
  calculateMithqalValue,
  MITHQAL_IN_TROY_OZ,
  parsePositiveDecimal,
} from "../src/lib/calculator";

describe("parsePositiveDecimal", () => {
  test("accepts positive ordinary decimals", () => {
    expect(parsePositiveDecimal("19")).toBe(19);
    expect(parsePositiveDecimal("19.5")).toBe(19.5);
    expect(parsePositiveDecimal(".5")).toBe(0.5);
  });

  test("rejects malformed, non-positive, and scientific notation", () => {
    for (const value of ["", "0", "-1", "1abc", "1.2.3", "1e6", "Infinity"]) {
      expect(parsePositiveDecimal(value)).toBeNull();
    }
  });
});

describe("calculateMithqalValue", () => {
  test("scales by quantity, metal price, and FX rate", () => {
    expect(calculateMithqalValue({ quantity: 2, metalPriceUsd: 3_000, currencyRateToUsd: 2 })).toBe(
      MITHQAL_IN_TROY_OZ * 2 * 3_000 * 2,
    );
  });

  test("rejects unavailable or invalid inputs", () => {
    expect(
      calculateMithqalValue({ quantity: 0, metalPriceUsd: 3_000, currencyRateToUsd: 1 }),
    ).toBeNull();
    expect(
      calculateMithqalValue({ quantity: 1, metalPriceUsd: -1, currencyRateToUsd: 1 }),
    ).toBeNull();
    expect(
      calculateMithqalValue({ quantity: 1, metalPriceUsd: 3_000, currencyRateToUsd: Number.NaN }),
    ).toBeNull();
  });
});

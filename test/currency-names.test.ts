import { describe, expect, test } from "bun:test";
import { getLocalizedCurrencyName } from "../src/lib/currencyNames";

describe("getLocalizedCurrencyName", () => {
  test("localizes ISO currency names", () => {
    expect(getLocalizedCurrencyName("USD", "es", "US Dollar")).toBe("dólar estadounidense");
    expect(getLocalizedCurrencyName("JPY", "ja", "Japanese Yen")).toBe("日本円");
  });

  test("localizes supported cryptocurrency names", () => {
    expect(getLocalizedCurrencyName("BTC", "ar", "Bitcoin")).toBe("بيتكوين");
    expect(getLocalizedCurrencyName("BTC", "zh", "Bitcoin")).toBe("比特币");
  });

  test("uses the database name when the locale is invalid", () => {
    expect(getLocalizedCurrencyName("USD", "not-a-locale", "US Dollar")).toBe("US Dollar");
  });
});

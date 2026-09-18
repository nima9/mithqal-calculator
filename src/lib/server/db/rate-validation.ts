import { getCurrencyMetadata, RETIRED_CURRENCY_CODES, type CurrencyKind } from "./currencies";

export interface ValidatedCurrencyRate {
  code: string;
  name: string;
  symbol: string;
  kind: CurrencyKind;
  rateToUsd: number;
}

export interface ValidatedMetalRate {
  name: "gold" | "silver";
  priceUsd: number;
  lastUpdated: number;
}

export interface ValidatedRatesSnapshot {
  retrievedAt: number;
  metals: ValidatedMetalRate[];
  currencies: ValidatedCurrencyRate[];
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function validateRatesSnapshot(input: {
  goldPriceUsd: number;
  silverPriceUsd: number;
  rates: Record<string, number>;
  retrievedAt: number;
}): ValidatedRatesSnapshot {
  if (!isPositiveFinite(input.goldPriceUsd) || !isPositiveFinite(input.silverPriceUsd)) {
    throw new Error("Swissquote did not return valid gold and silver prices");
  }

  const currencies = Object.entries(input.rates)
    .flatMap(([code, rateToUsd]) => {
      if (
        !/^[A-Z]{3}$/.test(code) ||
        !isPositiveFinite(rateToUsd) ||
        RETIRED_CURRENCY_CODES.has(code) ||
        code === "XAU" ||
        code === "XAG"
      ) {
        return [];
      }

      return [{ code, ...getCurrencyMetadata(code), rateToUsd }];
    })
    .sort((left, right) => left.code.localeCompare(right.code));

  const availableCodes = new Set(currencies.map((currency) => currency.code));
  if (!availableCodes.has("USD") || !availableCodes.has("EUR")) {
    throw new Error("FXRatesAPI must return valid USD and EUR rates");
  }

  return {
    retrievedAt: input.retrievedAt,
    metals: [
      { name: "gold", priceUsd: input.goldPriceUsd, lastUpdated: input.retrievedAt },
      { name: "silver", priceUsd: input.silverPriceUsd, lastUpdated: input.retrievedAt },
    ],
    currencies,
  };
}

import { getCurrencyMetadata, RETIRED_CURRENCY_CODES, type CurrencyKind } from "./currencies";

export type ValidatedCurrencyRate = {
  code: string;
  name: string;
  symbol: string;
  kind: CurrencyKind;
  rateToUsd: number;
};

export type ValidatedMetalRate = {
  name: "gold" | "silver";
  priceUsd: number;
  lastUpdated: number;
};

export type ValidatedRatesSnapshot = {
  retrievedAt: number;
  metals: ValidatedMetalRate[];
  currencies: ValidatedCurrencyRate[];
};

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function validateRatesSnapshot(input: {
  goldPriceUsd: number;
  goldUpdatedAt: number;
  silverPriceUsd: number;
  silverUpdatedAt: number;
  rates: Record<string, number>;
  retrievedAt: number;
}): ValidatedRatesSnapshot {
  if (
    !isPositiveFinite(input.goldPriceUsd) ||
    !isPositiveFinite(input.silverPriceUsd) ||
    !isPositiveFinite(input.goldUpdatedAt) ||
    !isPositiveFinite(input.silverUpdatedAt)
  ) {
    throw new Error("Swissquote did not return valid gold and silver prices");
  }

  const currencies = Object.entries(input.rates)
    .flatMap(([code, rateToUsd]) => {
      if (
        !/^[A-Z0-9]{2,5}$/.test(code) ||
        !isPositiveFinite(rateToUsd) ||
        RETIRED_CURRENCY_CODES.has(code) ||
        code === "XAU" ||
        code === "XAG" ||
        code === "XPT" ||
        code === "XPD"
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
      { name: "gold", priceUsd: input.goldPriceUsd, lastUpdated: input.goldUpdatedAt },
      { name: "silver", priceUsd: input.silverPriceUsd, lastUpdated: input.silverUpdatedAt },
    ],
    currencies,
  };
}

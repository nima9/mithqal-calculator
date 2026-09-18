export const MITHQAL_IN_TROY_OZ = 0.11708228065358918;

export function parsePositiveDecimal(value: string): number | null {
  const normalized = value.trim();
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function calculateMithqalValue(input: {
  quantity: number;
  metalPriceUsd: number;
  currencyRateToUsd: number;
}): number | null {
  const { quantity, metalPriceUsd, currencyRateToUsd } = input;
  if (
    !Number.isFinite(quantity) ||
    !Number.isFinite(metalPriceUsd) ||
    !Number.isFinite(currencyRateToUsd) ||
    quantity <= 0 ||
    metalPriceUsd <= 0 ||
    currencyRateToUsd <= 0
  ) {
    return null;
  }

  return MITHQAL_IN_TROY_OZ * quantity * metalPriceUsd * currencyRateToUsd;
}

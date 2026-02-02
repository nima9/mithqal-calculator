/**
 * countryToCurrency.ts
 * Maps ISO country codes to their default currency.
 * Used for geo-based currency selection on initial page load.
 */

interface CurrencyInfo {
  code: string;
  symbol: string;
}

const COUNTRY_TO_CURRENCY: Record<string, CurrencyInfo> = {
  // North America
  US: { code: "USD", symbol: "$" },
  CA: { code: "CAD", symbol: "$" },
  MX: { code: "MXN", symbol: "$" },

  // Europe - Eurozone
  EU: { code: "EUR", symbol: "€" },
  DE: { code: "EUR", symbol: "€" },
  FR: { code: "EUR", symbol: "€" },
  IT: { code: "EUR", symbol: "€" },
  ES: { code: "EUR", symbol: "€" },
  NL: { code: "EUR", symbol: "€" },
  BE: { code: "EUR", symbol: "€" },
  AT: { code: "EUR", symbol: "€" },
  PT: { code: "EUR", symbol: "€" },
  IE: { code: "EUR", symbol: "€" },
  FI: { code: "EUR", symbol: "€" },
  GR: { code: "EUR", symbol: "€" },

  // Europe - Non-Eurozone
  GB: { code: "GBP", symbol: "£" },
  CH: { code: "CHF", symbol: "CHF" },
  NO: { code: "NOK", symbol: "kr" },
  SE: { code: "SEK", symbol: "kr" },
  DK: { code: "DKK", symbol: "kr" },
  PL: { code: "PLN", symbol: "zł" },
  CZ: { code: "CZK", symbol: "Kč" },
  HU: { code: "HUF", symbol: "Ft" },
  RU: { code: "RUB", symbol: "₽" },
  TR: { code: "TRY", symbol: "₺" },

  // Asia Pacific
  JP: { code: "JPY", symbol: "¥" },
  CN: { code: "CNY", symbol: "¥" },
  IN: { code: "INR", symbol: "₹" },
  AU: { code: "AUD", symbol: "$" },
  NZ: { code: "NZD", symbol: "$" },
  KR: { code: "KRW", symbol: "₩" },
  SG: { code: "SGD", symbol: "$" },
  HK: { code: "HKD", symbol: "$" },
  TW: { code: "TWD", symbol: "NT$" },
  TH: { code: "THB", symbol: "฿" },
  MY: { code: "MYR", symbol: "RM" },
  ID: { code: "IDR", symbol: "Rp" },
  PH: { code: "PHP", symbol: "₱" },
  VN: { code: "VND", symbol: "₫" },
  PK: { code: "PKR", symbol: "₨" },
  BD: { code: "BDT", symbol: "৳" },

  // Middle East
  IL: { code: "ILS", symbol: "₪" },
  AE: { code: "AED", symbol: "د.إ" },
  SA: { code: "SAR", symbol: "﷼" },
  KW: { code: "KWD", symbol: "د.ك" },
  QA: { code: "QAR", symbol: "﷼" },
  OM: { code: "OMR", symbol: "﷼" },
  BH: { code: "BHD", symbol: ".د.ب" },
  JO: { code: "JOD", symbol: "د.ا" },
  LB: { code: "LBP", symbol: "ل.ل" },
  IR: { code: "IRR", symbol: "﷼" },
  IQ: { code: "IQD", symbol: "ع.د" },

  // Africa
  ZA: { code: "ZAR", symbol: "R" },
  EG: { code: "EGP", symbol: "E£" },
  NG: { code: "NGN", symbol: "₦" },
  MA: { code: "MAD", symbol: "د.م." },

  // South America
  BR: { code: "BRL", symbol: "R$" },
  CL: { code: "CLP", symbol: "$" },
  CO: { code: "COP", symbol: "$" },
  PE: { code: "PEN", symbol: "S/" },
};

/**
 * Get the default currency for a country code.
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Formatted currency string (e.g., "$ USD")
 */
export function countryToCurrency(countryCode: string): string {
  const currency = COUNTRY_TO_CURRENCY[countryCode.toUpperCase()];

  if (!currency) {
    return "$ USD";
  }

  return `${currency.symbol} ${currency.code}`;
}

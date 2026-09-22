const displayNamesByLocale = new Map<string, Intl.DisplayNames>();

const currencyNameOverrides: Record<string, Record<string, string>> = {
  BTC: {
    en: "Bitcoin",
    ar: "بيتكوين",
    fa: "بیت‌کوین",
    es: "Bitcoin",
    fr: "Bitcoin",
    zh: "比特币",
    ja: "ビットコイン",
    ko: "비트코인",
    hi: "बिटकॉइन",
    sw: "Bitcoin",
    pt: "Bitcoin",
    ru: "Биткоин",
    de: "Bitcoin",
  },
};

/**
 * Return the CLDR currency name for the active locale. The database name stays
 * as a fallback for uncommon/retired codes and cryptocurrencies not covered by
 * Intl.DisplayNames.
 */
export function getLocalizedCurrencyName(
  code: string,
  locale: string,
  fallbackName: string,
): string {
  const normalizedCode = code.toUpperCase();
  const override = currencyNameOverrides[normalizedCode]?.[locale];
  if (override) return override;

  try {
    let displayNames = displayNamesByLocale.get(locale);
    if (!displayNames) {
      displayNames = new Intl.DisplayNames([locale], { type: "currency" });
      displayNamesByLocale.set(locale, displayNames);
    }

    const localizedName = displayNames.of(normalizedCode);
    return localizedName && localizedName !== normalizedCode ? localizedName : fallbackName;
  } catch {
    return fallbackName;
  }
}

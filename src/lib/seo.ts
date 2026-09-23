import { DEFAULT_LOCALE, LANGUAGE_OPTIONS, type Locale, withLocale } from "$lib/i18n";

export const SITE_ORIGIN = "https://mithqal.app";

export const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  en: "en_US",
  af: "af_ZA",
  ar: "ar_SA",
  bem: "bem_ZM",
  my: "my_MM",
  zh: "zh_CN",
  fr: "fr_FR",
  de: "de_DE",
  hi: "hi_IN",
  ja: "ja_JP",
  ko: "ko_KR",
  ln: "ln_CD",
  ms: "ms_MY",
  fa: "fa_IR",
  pt: "pt_BR",
  ru: "ru_RU",
  es: "es_ES",
  sw: "sw_TZ",
  tl: "tl_PH",
  th: "th_TH",
  tpi: "tpi_PG",
  ur: "ur_PK",
  vi: "vi_VN",
  zu: "zu_ZA",
};

export function localizedPath(pathname: string, locale: Locale): string {
  return withLocale(pathname, locale);
}

export function localizedUrl(pathname: string, locale: Locale): string {
  return new URL(localizedPath(pathname, locale), SITE_ORIGIN).href;
}

export function getLanguageAlternates(pathname: string) {
  return LANGUAGE_OPTIONS.map(({ value }) => ({
    hreflang: value,
    href: localizedUrl(pathname, value),
  }));
}

export function getDefaultLanguageUrl(pathname: string): string {
  return localizedUrl(pathname, DEFAULT_LOCALE);
}

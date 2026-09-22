import { DEFAULT_LOCALE, LANGUAGE_OPTIONS, type Locale, withLocale } from "$lib/i18n";

export const SITE_ORIGIN = "https://mithqal.app";

export const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  en: "en_US",
  ar: "ar_SA",
  fa: "fa_IR",
  es: "es_ES",
  fr: "fr_FR",
  zh: "zh_CN",
  ja: "ja_JP",
  ko: "ko_KR",
  hi: "hi_IN",
  sw: "sw_TZ",
  pt: "pt_BR",
  ru: "ru_RU",
  de: "de_DE",
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

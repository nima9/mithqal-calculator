import { locales } from "../locales/data.js";

export type Locale = (typeof locales)[number];

export const DEFAULT_LOCALE: Locale = "en";

/**
 * Language names are intentionally written in their own language. Keeping
 * them in data (rather than literal component text) prevents the translation
 * compiler from translating the picker options into the active locale.
 */
export const LANGUAGE_OPTIONS: ReadonlyArray<{ value: Locale; label: string }> = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
  { value: "fa", label: "فارسی" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "hi", label: "हिन्दी" },
  { value: "sw", label: "Kiswahili" },
  { value: "pt", label: "Português" },
  { value: "ru", label: "Русский" },
  { value: "de", label: "Deutsch" },
];

export function getLocale(value: string | null | undefined): Locale {
  if (value === null || value === undefined) return DEFAULT_LOCALE;

  // SAFETY: `isLocale` narrows `value` to a member of the `locales` tuple.
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}

export function withLocale(pathname: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return pathname;

  const url = new URL(pathname, "https://mithqal.app");
  url.searchParams.set("lang", locale);

  return `${url.pathname}${url.search}${url.hash}`;
}

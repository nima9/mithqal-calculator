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
  { value: "af", label: "Afrikaans" },
  { value: "ar", label: "العربية" },
  { value: "bem", label: "Ichibemba" },
  { value: "my", label: "မြန်မာဘာသာ" },
  { value: "zh", label: "中文" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "hi", label: "हिन्दी" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "ln", label: "Lingála" },
  { value: "ms", label: "Bahasa Melayu" },
  { value: "fa", label: "فارسی" },
  { value: "pt", label: "Português" },
  { value: "ru", label: "Русский" },
  { value: "es", label: "Español" },
  { value: "sw", label: "Kiswahili" },
  { value: "tl", label: "Tagalog" },
  { value: "th", label: "ไทย" },
  { value: "tpi", label: "Tok Pisin" },
  { value: "ur", label: "اردو" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "zu", label: "isiZulu" },
];

/**
 * Locales written right-to-left. Used to set text direction on translated prose
 * that lives outside the calculator's sentence builder, which tracks direction
 * per language in `$lib/sentences`.
 */
export const RTL_LOCALES: ReadonlySet<Locale> = new Set(["ar", "fa", "ur"]);

export function isRtlLocale(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}

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

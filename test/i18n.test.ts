import { describe, expect, test } from "bun:test";
import { DEFAULT_LOCALE, getLocale, LANGUAGE_OPTIONS, withLocale } from "../src/lib/i18n";

describe("locale helpers", () => {
  test("defaults to English for missing or unsupported locales", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(getLocale(null)).toBe("en");
    expect(getLocale("xx")).toBe("en");
  });

  test("accepts every language shown in the picker", () => {
    for (const language of LANGUAGE_OPTIONS) {
      expect(getLocale(language.value)).toBe(language.value);
    }
  });

  test("only adds the language query parameter for non-English locales", () => {
    expect(withLocale("/about", "en")).toBe("/about");
    expect(withLocale("/about", "ar")).toBe("/about?lang=ar");
    expect(withLocale("/support?from=header", "fa")).toBe("/support?from=header&lang=fa");
  });
});

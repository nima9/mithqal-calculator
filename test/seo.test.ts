import { describe, expect, test } from "bun:test";
import { LANGUAGE_OPTIONS } from "../src/lib/i18n";
import {
  getDefaultLanguageUrl,
  getLanguageAlternates,
  localizedUrl,
  OPEN_GRAPH_LOCALES,
} from "../src/lib/seo";

describe("localized SEO URLs", () => {
  test("uses the clean URL for English and a stable lang parameter for translations", () => {
    expect(localizedUrl("/", "en")).toBe("https://mithqal.app/");
    expect(localizedUrl("/", "es")).toBe("https://mithqal.app/?lang=es");
    expect(localizedUrl("/about", "ja")).toBe("https://mithqal.app/about?lang=ja");
  });

  test("provides a reciprocal alternate for every supported language", () => {
    const alternates = getLanguageAlternates("/support");
    expect(alternates).toHaveLength(LANGUAGE_OPTIONS.length);
    expect(alternates.map((alternate) => alternate.hreflang)).toEqual(
      LANGUAGE_OPTIONS.map((language) => language.value),
    );
    expect(getDefaultLanguageUrl("/support")).toBe("https://mithqal.app/support");
  });

  test("maps every supported language to an Open Graph locale", () => {
    for (const language of LANGUAGE_OPTIONS) {
      expect(OPEN_GRAPH_LOCALES[language.value]).toMatch(/^[a-z]{2,3}_[A-Z]{2}$/);
    }
  });
});

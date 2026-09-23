import { describe, expect, test } from "bun:test";
import { LANGUAGE_OPTIONS } from "../src/lib/i18n";
import {
  DEFAULT_SENTENCE_LANGUAGE,
  getSentenceLanguage,
  SENTENCE_LANGUAGES,
  type SentenceSlot,
} from "../src/lib/sentences";

const SLOTS: SentenceSlot[] = ["amount", "mithqalLabel", "metal", "currency"];

describe("getSentenceLanguage", () => {
  test("returns the requested language", () => {
    for (const { value: id } of LANGUAGE_OPTIONS) {
      expect(getSentenceLanguage(id)).toBe(
        SENTENCE_LANGUAGES[id as keyof typeof SENTENCE_LANGUAGES],
      );
    }
  });

  test("matches every language offered by the picker", () => {
    expect(Object.keys(SENTENCE_LANGUAGES).sort()).toEqual(
      LANGUAGE_OPTIONS.map(({ value }) => value).sort(),
    );
  });

  test("falls back to the default for unknown or missing ids", () => {
    expect(getSentenceLanguage("xx")).toBe(DEFAULT_SENTENCE_LANGUAGE);
    expect(getSentenceLanguage()).toBe(DEFAULT_SENTENCE_LANGUAGE);
  });

  test("every language uses only known snippet slots", () => {
    for (const language of Object.values(SENTENCE_LANGUAGES)) {
      for (const item of language.items) {
        if (typeof item !== "string") {
          expect(SLOTS).toContain(item.snippet);
        }
      }
    }
  });

  test("every language provides both tooltip unit formats", () => {
    for (const language of Object.values(SENTENCE_LANGUAGES)) {
      expect(language.mithqalDefinition).toBeTruthy();
      expect(language.mithqalDefinitionOunces).toContain("{value}");
    }
  });
});

import { describe, expect, test } from "bun:test";
import {
  DEFAULT_SENTENCE_LANGUAGE,
  getSentenceLanguage,
  SENTENCE_LANGUAGES,
  type SentenceSlot,
} from "../src/lib/sentences";

const SLOTS: SentenceSlot[] = ["amount", "mithqalLabel", "metal", "currency"];

describe("getSentenceLanguage", () => {
  test("returns the requested language", () => {
    expect(getSentenceLanguage("en")).toBe(SENTENCE_LANGUAGES.en);
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
});

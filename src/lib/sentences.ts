/**
 * sentences.ts
 * Language definitions for the calculator sentence builder.
 *
 * The calculator sentence ("19 Mithqáls of Gold in $ USD is:") is rendered by
 * Sentence.svelte as an ordered sequence of literal words and snippet slots.
 * Snippet slots (amount, mithqalLabel, metal, currency) render the interactive
 * controls passed by Calculator.svelte; every other item is literal text.
 *
 * Because the whole word order lives here, a language can rearrange words
 * freely (SOV/VSO, RTL scripts, dropping the copula) without touching markup.
 */

// ============================================
// Types
// ============================================

/** Interactive control slots rendered by Calculator.svelte */
export type SentenceSlot = "amount" | "mithqalLabel" | "metal" | "currency";

/** One part of a sentence: a literal word or a snippet slot */
export type SentenceItem = string | { snippet: SentenceSlot };

export interface SentenceLanguage {
  /** BCP-47 language code */
  id: string;
  /** Text direction of the sentence container */
  dir: "ltr" | "rtl";
  /** Ordered sentence parts: literal words and snippet slots */
  items: SentenceItem[];
  /** Mithqál unit labels for the singular/plural slot */
  mithqalUnit: { singular: string; plural: string };
}

// ============================================
// Registry
// ============================================

export const SENTENCE_LANGUAGES: Record<string, SentenceLanguage> = {
  en: {
    id: "en",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "of",
      { snippet: "metal" },
      "in",
      { snippet: "currency" },
      "is:",
    ],
    mithqalUnit: { singular: "Mithqál", plural: "Mithqáls" },
  },
};

export const DEFAULT_SENTENCE_LANGUAGE: SentenceLanguage = SENTENCE_LANGUAGES.en;

/**
 * Resolve a sentence language by code, falling back to the default
 * when the language is unknown.
 */
export function getSentenceLanguage(id?: string): SentenceLanguage {
  return SENTENCE_LANGUAGES[id ?? ""] ?? DEFAULT_SENTENCE_LANGUAGE;
}

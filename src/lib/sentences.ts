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

export type SentenceLanguage = {
  /** BCP-47 language code */
  id: string;
  /** Text direction of the sentence container */
  dir: "ltr" | "rtl";
  /** Ordered sentence parts: literal words and snippet slots */
  items: SentenceItem[];
  /** Mithqál unit labels for the singular/plural slot */
  mithqalUnit: { singular: string; plural: string };
  /** Short weight conversion shown in the unit tooltip */
  mithqalDefinition: string;
  /** Localized troy-ounce tooltip template; {value} is filled at runtime */
  mithqalDefinitionOunces: string;
};

// ============================================
// Registry
// ============================================

export const SENTENCE_LANGUAGES = {
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
    mithqalDefinition: "1 Mithqál = 3.642g",
    mithqalDefinitionOunces: "1 Mithqál = {value} troy oz",
  },
  af: {
    id: "af",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      { snippet: "metal" },
      "in",
      { snippet: "currency" },
      "is:",
    ],
    mithqalUnit: { singular: "mithqál", plural: "mithqáls" },
    mithqalDefinition: "1 mithqál = 3,642 gram",
    mithqalDefinitionOunces: "1 mithqál = {value} troy-ons",
  },
  ar: {
    id: "ar",
    dir: "rtl",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "من",
      { snippet: "metal" },
      "بعملة",
      { snippet: "currency" },
      "يساوي:",
    ],
    mithqalUnit: { singular: "مثقال", plural: "مثقال" },
    mithqalDefinition: "1 مثقال = 3.642 غرام",
    mithqalDefinitionOunces: "1 مثقال = {value} أونصة تروي",
  },
  bem: {
    id: "bem",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "sha",
      { snippet: "metal" },
      "mu",
      { snippet: "currency" },
      "ni:",
    ],
    mithqalUnit: { singular: "mithqál", plural: "mithqál" },
    mithqalDefinition: "1 mithqál = 3.642 amagilamu",
    mithqalDefinitionOunces: "1 mithqál = {value} ama awunsi ya troy",
  },
  fa: {
    id: "fa",
    dir: "rtl",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "از",
      { snippet: "metal" },
      "به",
      { snippet: "currency" },
      "برابر است با:",
    ],
    mithqalUnit: { singular: "مثقال", plural: "مثقال" },
    mithqalDefinition: "1 مثقال = 3.642 گرم",
    mithqalDefinitionOunces: "1 مثقال = {value} اونس تروا",
  },
  ln: {
    id: "ln",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "ya",
      { snippet: "metal" },
      "na",
      { snippet: "currency" },
      "ezali:",
    ],
    mithqalUnit: { singular: "mithqál", plural: "mithqáls" },
    mithqalDefinition: "1 mithqál = 3,642 gramɛ",
    mithqalDefinitionOunces: "1 mithqál = {value} onces ya troy",
  },
  ms: {
    id: "ms",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      { snippet: "metal" },
      "dalam",
      { snippet: "currency" },
      "ialah:",
    ],
    mithqalUnit: { singular: "mithqál", plural: "mithqál" },
    mithqalDefinition: "1 mithqál = 3.642 gram",
    mithqalDefinitionOunces: "1 mithqál = {value} auns troy",
  },
  my: {
    id: "my",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      { snippet: "metal" },
      "ကို",
      { snippet: "currency" },
      "ဖြင့်ဆိုလျှင်:",
    ],
    mithqalUnit: { singular: "မစ်ကာလ်", plural: "မစ်ကာလ်" },
    mithqalDefinition: "1 မစ်ကာလ် = 3.642 ဂရမ်",
    mithqalDefinitionOunces: "1 မစ်ကာလ် = {value} ထရွိုင်အောင်စ",
  },
  es: {
    id: "es",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "de",
      { snippet: "metal" },
      "en",
      { snippet: "currency" },
      "son:",
    ],
    mithqalUnit: { singular: "mithqál", plural: "mithqáles" },
    mithqalDefinition: "1 mithqál = 3,642 g",
    mithqalDefinitionOunces: "1 mithqál = {value} oz troy",
  },
  fr: {
    id: "fr",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "de",
      { snippet: "metal" },
      "en",
      { snippet: "currency" },
      "valent :",
    ],
    mithqalUnit: { singular: "mithqál", plural: "mithqáls" },
    mithqalDefinition: "1 mithqál = 3,642 g",
    mithqalDefinitionOunces: "1 mithqál = {value} oz troy",
  },
  zh: {
    id: "zh",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      { snippet: "metal" },
      "折合",
      { snippet: "currency" },
      "为：",
    ],
    mithqalUnit: { singular: "密斯卡勒", plural: "密斯卡勒" },
    mithqalDefinition: "1 密斯卡勒 = 3.642 克",
    mithqalDefinitionOunces: "1 密斯卡勒 = {value} 金衡盎司",
  },
  th: {
    id: "th",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      { snippet: "metal" },
      "ในสกุล",
      { snippet: "currency" },
      "คือ:",
    ],
    mithqalUnit: { singular: "มิทกัล", plural: "มิทกัล" },
    mithqalDefinition: "1 มิทกัล = 3.642 กรัม",
    mithqalDefinitionOunces: "1 มิทกัล = {value} ทรอยออนซ์",
  },
  tl: {
    id: "tl",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "ng",
      { snippet: "metal" },
      "sa",
      { snippet: "currency" },
      "ay:",
    ],
    mithqalUnit: { singular: "mithqál", plural: "mithqáls" },
    mithqalDefinition: "1 mithqál = 3.642 gramo",
    mithqalDefinitionOunces: "1 mithqál = {value} troy ounce",
  },
  tpi: {
    id: "tpi",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "bilong",
      { snippet: "metal" },
      "long",
      { snippet: "currency" },
      "em:",
    ],
    mithqalUnit: { singular: "mithqál", plural: "mithqáls" },
    mithqalDefinition: "1 mithqál = 3.642 gram",
    mithqalDefinitionOunces: "1 mithqál = {value} troy ounce",
  },
  ur: {
    id: "ur",
    dir: "rtl",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      { snippet: "metal" },
      "کی قیمت",
      { snippet: "currency" },
      "میں ہے:",
    ],
    mithqalUnit: { singular: "مثقال", plural: "مثقال" },
    mithqalDefinition: "1 مثقال = 3.642 گرام",
    mithqalDefinitionOunces: "1 مثقال = {value} ٹرائے اونس",
  },
  vi: {
    id: "vi",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      { snippet: "metal" },
      "tính bằng",
      { snippet: "currency" },
      "là:",
    ],
    mithqalUnit: { singular: "mithqál", plural: "mithqál" },
    mithqalDefinition: "1 mithqál = 3,642 gam",
    mithqalDefinitionOunces: "1 mithqál = {value} ounce troy",
  },
  zu: {
    id: "zu",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "ye-",
      { snippet: "metal" },
      "nge-",
      { snippet: "currency" },
      "ithi:",
    ],
    mithqalUnit: { singular: "imithqál", plural: "amimithqál" },
    mithqalDefinition: "1 imithqál = 3.642 amagremu",
    mithqalDefinitionOunces: "1 imithqál = {value} ama-troy ounce",
  },
  ja: {
    id: "ja",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "の",
      { snippet: "metal" },
      "は",
      { snippet: "currency" },
      "で：",
    ],
    mithqalUnit: { singular: "ミスカール", plural: "ミスカール" },
    mithqalDefinition: "1 ミスカール = 3.642 g",
    mithqalDefinitionOunces: "1 ミスカール = {value} トロイオンス",
  },
  ko: {
    id: "ko",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      { snippet: "metal" },
      "의 가치는",
      { snippet: "currency" },
      "로:",
    ],
    mithqalUnit: { singular: "미스칼", plural: "미스칼" },
    mithqalDefinition: "1 미스칼 = 3.642g",
    mithqalDefinitionOunces: "1 미스칼 = {value} 트로이온스",
  },
  hi: {
    id: "hi",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      { snippet: "metal" },
      "का मूल्य",
      { snippet: "currency" },
      "में है:",
    ],
    mithqalUnit: { singular: "मिस्क़ाल", plural: "मिस्क़ाल" },
    mithqalDefinition: "1 मिस्क़ाल = 3.642 ग्राम",
    mithqalDefinitionOunces: "1 मिस्क़ाल = {value} ट्रॉय औंस",
  },
  sw: {
    id: "sw",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "za",
      { snippet: "metal" },
      "katika",
      { snippet: "currency" },
      "ni:",
    ],
    mithqalUnit: { singular: "mithqál", plural: "mithqál" },
    mithqalDefinition: "Mithqál 1 = gramu 3.642",
    mithqalDefinitionOunces: "Mithqál 1 = wakia ya troy {value}",
  },
  pt: {
    id: "pt",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      "de",
      { snippet: "metal" },
      "em",
      { snippet: "currency" },
      "são:",
    ],
    mithqalUnit: { singular: "mithqál", plural: "mithqáls" },
    mithqalDefinition: "1 mithqál = 3,642 g",
    mithqalDefinitionOunces: "1 mithqál = {value} oz troy",
  },
  ru: {
    id: "ru",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      { snippet: "metal" },
      "в",
      { snippet: "currency" },
      "— это:",
    ],
    mithqalUnit: { singular: "мискаль", plural: "мискалей" },
    mithqalDefinition: "1 мискаль = 3,642 г",
    mithqalDefinitionOunces: "1 мискаль = {value} тройской унции",
  },
  de: {
    id: "de",
    dir: "ltr",
    items: [
      { snippet: "amount" },
      { snippet: "mithqalLabel" },
      { snippet: "metal" },
      "in",
      { snippet: "currency" },
      "entsprechen:",
    ],
    mithqalUnit: { singular: "Mithqál", plural: "Mithqál" },
    mithqalDefinition: "1 Mithqál = 3,642 g",
    mithqalDefinitionOunces: "1 Mithqál = {value} Feinunzen",
  },
} satisfies Record<string, SentenceLanguage>;

export const DEFAULT_SENTENCE_LANGUAGE: SentenceLanguage = SENTENCE_LANGUAGES.en;

/**
 * Resolve a sentence language by code, falling back to the default
 * when the language is unknown.
 */
export function getSentenceLanguage(id?: string): SentenceLanguage {
  if (id !== undefined && Object.hasOwn(SENTENCE_LANGUAGES, id)) {
    // SAFETY: `Object.hasOwn` guarantees `id` is one of the registry's literal keys.
    return SENTENCE_LANGUAGES[id as keyof typeof SENTENCE_LANGUAGES];
  }

  return DEFAULT_SENTENCE_LANGUAGE;
}

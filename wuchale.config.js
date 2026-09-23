// @ts-check
import { adapter as svelte } from "@wuchale/svelte";
import { defineConfig } from "wuchale";

export default defineConfig({
  locales: [
    "en",
    "af",
    "ar",
    "bem",
    "my",
    "zh",
    "fr",
    "de",
    "hi",
    "ja",
    "ko",
    "ln",
    "ms",
    "fa",
    "pt",
    "ru",
    "es",
    "sw",
    "tl",
    "th",
    "tpi",
    "ur",
    "vi",
    "zu",
  ],
  adapters: {
    main: svelte({ loader: "sveltekit" }),
  },
});

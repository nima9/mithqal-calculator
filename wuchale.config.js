// @ts-check
import { adapter as svelte } from "@wuchale/svelte";
import { defineConfig } from "wuchale";

export default defineConfig({
  locales: ["en", "ar", "fa", "es", "fr", "zh", "ja", "ko", "hi", "sw", "pt", "ru", "de"],
  adapters: {
    main: svelte({ loader: "sveltekit" }),
  },
});

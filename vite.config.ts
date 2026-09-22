import tailwindcss from "@tailwindcss/vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { wuchale } from "wuchale/vite";

export default defineConfig({
  plugins: [wuchale(), tailwindcss(), enhancedImages(), sveltekit()],
});

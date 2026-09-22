import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { varlockVitePlugin } from "@varlock/vite-integration";
import { defineConfig } from "vite";
import { wuchale } from "wuchale/vite";

export default defineConfig({
  plugins: [varlockVitePlugin(), wuchale(), tailwindcss(), enhancedImages(), sveltekit()],
});

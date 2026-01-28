import adapter from "@sveltejs/adapter-cloudflare";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      edge: true,
    }),
    alias: {
      "@/*": "./path/to/lib/*",
    },
  },
};

export default config;

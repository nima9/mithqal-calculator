// The SvelteKit adapter generates this module during `bun run build`.
// @ts-expect-error Generated build output intentionally has no declaration file.
import svelteKitWorker from "../.svelte-kit/cloudflare/worker.js";
import { invalidateRatesSnapshotCache, refreshRates } from "../src/lib/server/db/rates";

export default {
  fetch(request, env, context) {
    return svelteKitWorker.fetch(request, env, context);
  },

  async scheduled(_controller, env) {
    const startedAt = Date.now();
    try {
      const url = env.TURSO_DATABASE_URL;
      const authToken = env.TURSO_AUTH_TOKEN;
      if (!url || !authToken) throw new Error("Missing Turso credentials");

      await refreshRates({ url, authToken });
      invalidateRatesSnapshotCache();
      console.log(
        JSON.stringify({
          event: "rates.refresh.completed",
          durationMs: Date.now() - startedAt,
        }),
      );
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "rates.refresh.failed",
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      );
      throw error;
    }
  },
} satisfies ExportedHandler<Env>;

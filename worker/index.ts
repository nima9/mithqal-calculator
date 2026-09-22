// The SvelteKit adapter generates this module during `bun run build`.
// @ts-expect-error Generated build output intentionally has no declaration file.
import svelteKitWorker from "../.svelte-kit/cloudflare/worker.js";
import {
  invalidateRatesSnapshotCache,
  refreshRates,
  syncActiveCurrencies,
} from "../src/lib/server/db/rates";

const MONTHLY_CURRENCY_SYNC_CRON = "15 6 1 * *";

export default {
  fetch(request, env, context) {
    return svelteKitWorker.fetch(request, env, context);
  },

  async scheduled(controller, env) {
    const startedAt = Date.now();

    try {
      const url = env.TURSO_DATABASE_URL;
      const authToken = env.TURSO_AUTH_TOKEN;
      const fxRatesApiKey = env.FXRATESAPI_SERVER_KEY;

      if (!url || !authToken || !fxRatesApiKey) {
        throw new Error("Missing scheduled refresh credentials");
      }

      const config = { url, authToken, fxRatesApiKey };

      if (controller.cron === MONTHLY_CURRENCY_SYNC_CRON) {
        await syncActiveCurrencies(config);
        invalidateRatesSnapshotCache();
        console.info(
          JSON.stringify({
            event: "currencies.sync.completed",
            durationMs: Date.now() - startedAt,
          }),
        );

        return;
      }

      await refreshRates(config);
      invalidateRatesSnapshotCache();
      console.info(
        JSON.stringify({
          event: "rates.refresh.completed",
          durationMs: Date.now() - startedAt,
        }),
      );
    } catch (error) {
      console.error(
        JSON.stringify({
          event:
            controller.cron === MONTHLY_CURRENCY_SYNC_CRON
              ? "currencies.sync.failed"
              : "rates.refresh.failed",
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      );
      throw error;
    }
  },
} satisfies ExportedHandler<Env>;

import { refreshRates, syncActiveCurrencies } from "../src/lib/server/db/rates";

const url = process.env.TURSO_DATABASE_URL;

const authToken = process.env.TURSO_AUTH_TOKEN;

const fxRatesApiKey = process.env.FXRATESAPI_SERVER_KEY;

if (!url || !authToken || !fxRatesApiKey) {
  throw new Error(
    "TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, and FXRATESAPI_SERVER_KEY must be configured",
  );
}

const config = { url, authToken, fxRatesApiKey };

await syncActiveCurrencies(config);

await refreshRates(config);

console.info("Stored the latest validated rates snapshot.");

import { refreshRates } from "../src/lib/server/db/rates";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured");
}

const config = { url, authToken };
await refreshRates(config);
console.info("Stored the latest validated rates snapshot.");

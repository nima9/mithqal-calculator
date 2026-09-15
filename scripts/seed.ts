import { createDatabase } from "../src/lib/server/db/client";
import { CURRENCIES } from "../src/lib/server/db/currencies";
import { refreshRates } from "../src/lib/server/db/rates";
import { currencies, metals } from "../src/lib/server/db/schema";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured");
}

const config = { url, authToken };
const db = createDatabase(config);
const now = Date.now();

await db
  .insert(currencies)
  .values(CURRENCIES.map((currency) => ({ ...currency, rateToUsd: 1 })))
  .onConflictDoNothing({ target: currencies.code });

await db
  .insert(metals)
  .values([
    { name: "gold", priceUsd: 2750, lastUpdated: now },
    { name: "silver", priceUsd: 30, lastUpdated: now },
  ])
  .onConflictDoNothing({ target: metals.name });

await refreshRates(config);
console.info(`Seeded ${CURRENCIES.length} currencies and refreshed all rates.`);

import { defineConfig } from "drizzle-kit";
import { env } from "node:process";

// Drizzle Kit's migration runner sends this URL directly to fetch(), which does
// not understand Turso's custom scheme. The runtime SDK normalizes it itself.
const databaseUrl = env.TURSO_DATABASE_URL?.replace(/^turso:\/\//, "https://");

const authToken = env.TURSO_AUTH_TOKEN;

if (!databaseUrl || !authToken) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured");
}

export default defineConfig({
  schema: "./src/lib/server/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: databaseUrl,
    authToken,
  },
});

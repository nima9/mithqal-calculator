import { env } from "$env/dynamic/private";

import type { DatabaseConfig } from "./client";

type CloudflareDatabaseEnv = {
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
};

export function getDatabaseConfig(cloudflareEnv?: CloudflareDatabaseEnv): DatabaseConfig {
  const url = cloudflareEnv?.TURSO_DATABASE_URL ?? env.TURSO_DATABASE_URL;
  const authToken = cloudflareEnv?.TURSO_AUTH_TOKEN ?? env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured");
  }

  return { url, authToken };
}

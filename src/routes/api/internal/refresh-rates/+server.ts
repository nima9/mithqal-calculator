import { error, json } from "@sveltejs/kit";
import { getDatabaseConfig } from "$lib/server/db/config";
import { refreshRates } from "$lib/server/db/rates";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ platform, request }) => {
  const cloudflareEnv = platform?.env;
  const token = cloudflareEnv?.TURSO_AUTH_TOKEN;
  if (!token || request.headers.get("authorization") !== `Bearer ${token}`) {
    error(401, "Unauthorized");
  }

  await refreshRates(getDatabaseConfig(cloudflareEnv));
  return json({ refreshed: true });
};

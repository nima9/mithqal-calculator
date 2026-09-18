import { json } from "@sveltejs/kit";
import { getDatabaseConfig } from "$lib/server/db/config";
import { getRatesSnapshotCached } from "$lib/server/db/rates";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ platform, setHeaders }) => {
  const snapshot = await getRatesSnapshotCached(getDatabaseConfig(platform?.env));
  // Rates refresh once a day via cron: cache hard for an hour, then serve
  // stale content for up to a day while revalidating in the background.
  setHeaders({ "cache-control": "public, max-age=3600, stale-while-revalidate=86400" });
  return json(snapshot);
};

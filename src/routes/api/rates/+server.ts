import { json } from "@sveltejs/kit";
import { createDatabase } from "$lib/server/db/client";
import { getDatabaseConfig } from "$lib/server/db/config";
import { getRatesSnapshot } from "$lib/server/db/rates";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ platform, setHeaders }) => {
  const snapshot = await getRatesSnapshot(createDatabase(getDatabaseConfig(platform?.env)));
  setHeaders({ "cache-control": "public, max-age=300" });
  return json(snapshot);
};

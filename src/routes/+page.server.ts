/**
 * +page.server.ts
 * Server-side load function for the home page.
 * Uses Cloudflare's geolocation headers for country and timezone detection.
 *
 * URL parameters (q, m, c) are handled client-side via $page.url.searchParams
 * following SvelteKit's recommended pattern for URL state.
 *
 * @see https://developers.cloudflare.com/rules/transform/managed-transforms/reference/
 */

import { getDatabaseConfig } from "$lib/server/db/config";
import { getRatesSnapshotCached, type RatesSnapshot } from "$lib/server/db/rates";
import { countryToCurrency } from "$lib/utils/countryToCurrency";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request, platform }) => {
  // Default values
  let defaultCurrency = "$ USD";
  let timezone = "America/Los_Angeles";

  // Try Cloudflare headers first (from Managed Transforms)
  const cfCountry = request.headers.get("cf-ipcountry");
  const cfTimezone = request.headers.get("cf-timezone");

  if (cfCountry) {
    defaultCurrency = countryToCurrency(cfCountry);
  }

  if (cfTimezone) {
    timezone = cfTimezone;
  }

  // Fallback: Try platform.cf object (Cloudflare Workers/Pages)
  // @ts-expect-error - platform.cf exists on Cloudflare but not typed by default
  const cf = platform?.cf;

  if (cf) {
    if (!cfCountry && cf.country) {
      defaultCurrency = countryToCurrency(cf.country);
    }

    if (!cfTimezone && cf.timezone) {
      timezone = cf.timezone;
    }
  }

  // Stream the snapshot instead of awaiting it so client-side navigations back
  // to this page are not blocked on the database query. The calculator renders
  // immediately (from its localStorage cache) and merges this in after mount.
  // The catch resolves to null so the promise never rejects while streaming.
  const initialRates: Promise<RatesSnapshot | null> = getRatesSnapshotCached(
    getDatabaseConfig(platform?.env),
  ).catch(() => {
    // The browser can still use its previously cached snapshot if Turso is unavailable.
    return null;
  });

  return {
    defaultCurrency,
    timezone,
    initialRates,
  };
};

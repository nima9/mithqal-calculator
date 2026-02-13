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

import type { PageServerLoad } from "./$types";
import { countryToCurrency } from "$lib/utils/countryToCurrency";
import { ConvexHttpClient } from "convex/browser";
import { PUBLIC_CONVEX_URL } from "$env/static/public";
import { api } from "../convex/_generated/api";

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

  let initialRates = null;
  try {
    const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
    initialRates = await client.query(api.rates.getRatesSnapshot, {});
  } catch {
    // Fall back to client-side cache/fetch if Convex snapshot is unavailable.
  }

  return {
    defaultCurrency,
    timezone,
    initialRates,
  };
};

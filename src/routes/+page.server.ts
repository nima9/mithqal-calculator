/**
 * +page.server.ts
 * Server-side load function for the home page.
 * Uses Cloudflare's geolocation headers for country and timezone detection.
 *
 * @see https://developers.cloudflare.com/rules/transform/managed-transforms/reference/
 */

import type { PageServerLoad } from "./$types";
import { countryToCurrency } from "$lib/utils/countryToCurrency";

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

  return {
    defaultCurrency,
    timezone,
  };
};

import { requiresGoogleConsent } from "$lib/googleConsent";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ request }) => {
  const country = request.headers.get("cf-ipcountry") || "";
  const requiresConsent = requiresGoogleConsent(country);

  return {
    requiresConsent,
    country,
  };
};

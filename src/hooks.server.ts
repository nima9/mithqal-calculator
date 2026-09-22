import type { Handle } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";
import { renderGoogleTag } from "$lib/server/googleTag";
import { requiresGoogleConsent } from "$lib/googleConsent";
import * as main from "./locales/main.loader.server.svelte.js";
import { locales } from "./locales/data.js";
import { getLocale } from "$lib/i18n";
import { loadLocales, runWithLocale } from "wuchale/load-utils/server";

loadLocales(main.key, main.loadCount, main.loadCatalog, locales);

export const handle: Handle = async ({ event, resolve }) => {
  const locale = getLocale(event.url.searchParams.get("lang"));
  const googleTag = renderGoogleTag(
    env.PUBLIC_GA_MEASUREMENT_ID,
    requiresGoogleConsent(event.request.headers.get("cf-ipcountry") || ""),
  );

  return runWithLocale(locale, () =>
    resolve(event, {
      transformPageChunk: ({ html }) =>
        html.replace("%lang%", locale).replace("%google.tag%", () => googleTag),
    }),
  );
};

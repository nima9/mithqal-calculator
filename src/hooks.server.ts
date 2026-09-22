import type { Handle } from "@sveltejs/kit";
import * as main from "./locales/main.loader.server.svelte.js";
import { locales } from "./locales/data.js";
import { getLocale } from "$lib/i18n";
import { loadLocales, runWithLocale } from "wuchale/load-utils/server";

loadLocales(main.key, main.loadCount, main.loadCatalog, locales);

export const handle: Handle = async ({ event, resolve }) => {
  const locale = getLocale(event.url.searchParams.get("lang"));

  return runWithLocale(locale, () =>
    resolve(event, {
      transformPageChunk: ({ html }) => html.replace("%lang%", locale),
    }),
  );
};

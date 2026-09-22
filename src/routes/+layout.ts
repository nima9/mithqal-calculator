import { browser } from "$app/environment";
import { getLocale } from "$lib/i18n";
import { loadLocale } from "wuchale/load-utils";
import "../locales/main.loader.svelte.js";

import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ data, url }) => {
  const locale = getLocale(url.searchParams.get("lang"));

  if (browser) {
    await loadLocale(locale);
  }

  return { ...data, locale };
};

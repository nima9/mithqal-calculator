/**
 * sitemap.xml/+server.ts
 * Generates XML sitemap for search engine indexing (Google, Bing, etc.).
 * Accessed at: https://mithqal.app/sitemap.xml
 */

import { DEFAULT_LOCALE, LANGUAGE_OPTIONS } from "$lib/i18n";
import { localizedUrl } from "$lib/seo";

// import { Temporal } from "@js-temporal/polyfill";
import type { RequestHandler } from "./$types";

// ============================================
// Configuration
// ============================================

/**
 * Pages to include in the sitemap.
 * - path: URL path relative to the site origin
 * - changefreq: How often the page content changes (daily, weekly, monthly, yearly)
 * - priority: Importance relative to other pages (0.0 to 1.0, higher = more important)
 */
const PAGES = [
  { path: "/", changefreq: "daily", priority: "1.0" }, // Homepage - rates change daily
  { path: "/about", changefreq: "monthly", priority: "0.5" }, // About page - rarely changes
  { path: "/support", changefreq: "monthly", priority: "0.5" }, // Support page - rarely changes
];

// ============================================
// Sitemap Generator
// ============================================

export const GET: RequestHandler = async () => {
  const escapeXml = (value: string) =>
    value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

  const urls = PAGES.flatMap((page) =>
    LANGUAGE_OPTIONS.map(({ value: locale }) => {
      const alternates = LANGUAGE_OPTIONS.map(
        ({ value: alternateLocale }) =>
          `    <xhtml:link rel="alternate" hreflang="${alternateLocale}" href="${escapeXml(localizedUrl(page.path, alternateLocale))}" />`,
      ).join("\n");

      const defaultAlternate = `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(localizedUrl(page.path, DEFAULT_LOCALE))}" />`;

      return `  <url>
    <loc>${escapeXml(localizedUrl(page.path, locale))}</loc>
${alternates}
${defaultAlternate}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }),
  ).join("\n");

  // Wrap in XML sitemap structure
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=3600", // Cache for 1 hour
    },
  });
};

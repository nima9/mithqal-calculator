/**
 * robots.txt/+server.ts
 * Generates robots.txt for search engine crawlers.
 */

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const body = `User-agent: *
Allow: /

Sitemap: https://mithqal.app/sitemap.xml`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
};

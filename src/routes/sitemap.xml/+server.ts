/**
 * sitemap.xml/+server.ts
 * Generates XML sitemap for search engine indexing (Google, Bing, etc.).
 * Accessed at: https://mithqal.app/sitemap.xml
 */

import type { RequestHandler } from './$types';

// ============================================
// Configuration
// ============================================

/** Base URL for all sitemap entries */
const SITE_URL = 'https://mithqal.app';

/**
 * Pages to include in the sitemap.
 * - path: URL path relative to SITE_URL (empty string = homepage)
 * - changefreq: How often the page content changes (daily, weekly, monthly, yearly)
 * - priority: Importance relative to other pages (0.0 to 1.0, higher = more important)
 */
const PAGES = [
	{ path: '', changefreq: 'daily', priority: '1.0' }, // Homepage - rates change daily
	{ path: '/about', changefreq: 'monthly', priority: '0.5' } // About page - rarely changes
];

// ============================================
// Sitemap Generator
// ============================================

export const GET: RequestHandler = async () => {
	// Use today's date as lastmod (YYYY-MM-DD format)
	const lastmod = new Date().toISOString().split('T')[0];

	// Generate <url> entries for each page
	const urls = PAGES.map(
		(page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
	).join('\n');

	// Wrap in XML sitemap structure
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600' // Cache for 1 hour
		}
	});
};

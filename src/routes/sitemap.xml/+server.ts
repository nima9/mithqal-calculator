/**
 * sitemap.xml/+server.ts
 * Generates XML sitemap for search engine indexing.
 */

import type { RequestHandler } from './$types';

const SITE_URL = 'https://mithqal.app';

const PAGES = [
	{ path: '', changefreq: 'daily', priority: '1.0' },
	{ path: '/about', changefreq: 'monthly', priority: '0.5' }
];

export const GET: RequestHandler = async () => {
	const lastmod = new Date().toISOString().split('T')[0];

	const urls = PAGES.map(
		(page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
	).join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};

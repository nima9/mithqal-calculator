import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const site = "https://mithqal.app";
  const lastmod = new Date().toISOString().split("T")[0];
  const pages = [
    { path: "", changefreq: "daily", priority: "1.0" },
    { path: "/about", changefreq: "monthly", priority: "0.5" },
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${site}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=3600",
    },
  });
};

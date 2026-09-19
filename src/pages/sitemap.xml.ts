import { getCollection } from 'astro:content';
import { SITE_URL } from '../config/site.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic XML Sitemap
// Queries the entire Git JSON collection at build time and emits a valid
// sitemap listing every video route with its last-modified timestamp and
// update frequency. A new JSON file pushed to the repo changes the output
// on the very next build — no manual maintenance.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
  const videos = (await getCollection('videos')).sort(
    (a, b) => +b.data.publishedAt - +a.data.publishedAt
  );
  const now = new Date();

  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const url = (loc: string, lastmod: Date, changefreq: string, priority: string) =>
    `  <url>\n` +
    `    <loc>${esc(loc)}</loc>\n` +
    `    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority}</priority>\n` +
    `  </url>`;

  // Trailing slashes match the canonical URLs rendered into every page and
  // the directory-style URLs Cloudflare serves (/video/x → 308 → /video/x/).
  const entries = [
    url(`${SITE_URL}/`, now, 'daily', '1.0'),
    ...videos.map((v) => url(`${SITE_URL}/video/${v.id}/`, v.data.publishedAt, 'monthly', '0.8')),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join('\n') +
    `\n</urlset>\n`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

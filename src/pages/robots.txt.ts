import { SITE_NAME, SITE_URL } from '../config/site.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic robots.txt
// Standard crawl rules for all robots, the admin panel excluded from
// indexing, and an authoritative Sitemap declaration pointing at
// /sitemap.xml on the deployed origin.
// ─────────────────────────────────────────────────────────────────────────────

export function GET() {
  const txt =
    `# ${SITE_NAME} — generated at build time (zero-database architecture)\n` +
    `User-agent: *\n` +
    `Allow: /\n` +
    `Disallow: /admin\n` +
    `\n` +
    `Sitemap: ${SITE_URL}/sitemap.xml\n`;

  return new Response(txt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

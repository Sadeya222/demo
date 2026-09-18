// ─────────────────────────────────────────────────────────────────────────────
// Site-wide configuration — single source of truth.
//
// SITE_URL resolution order (used by /sitemap.xml, /robots.txt, canonical and
// VideoObject schema URLs):
//   1. SITE_URL env var          → pin an exact domain (e.g. a custom domain)
//   2. URL env var               → set automatically by Cloudflare Pages on
//                                  every build (auto-updates per deployment)
//   3. default                   → the Cloudflare Pages project origin
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_NAME = 'DESIDUDE';
export const SITE_TAGLINE = 'Hot video streaming, zero database';

/** Absolute origin (no trailing slash) of the deployed site. */
export const SITE_URL = String(
  process.env.SITE_URL || process.env.URL || 'https://desidude.pages.dev'
).replace(/\/+$/, '');

/** Videos per page in the main catalog grid. */
export const PER_PAGE = 9;

/**
 * Demo seed data — all 10 catalog entries currently point at the same
 * embed + thumbnail. Replace per-video from the /admin panel (Git workflow).
 */
export const DEMO_EMBED_URL = 'https://luluvdo.com/e/h2a4h636uv6u';
export const DEMO_THUMB_URL =
  'https://i.postimg.cc/p5bbqJ8Q/363429454-106817469166168-8969862643825409573-n.jpg';

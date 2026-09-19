// ─────────────────────────────────────────────────────────────────────────────
// Site-wide configuration — single source of truth.
//
// SITE_URL resolution order (used by /sitemap.xml, /robots.txt, canonical and
// VideoObject schema URLs):
//   1. SITE_URL env var  → the live origin. Set it in Cloudflare →
//                          your project → Settings → Variables (build-time),
//                          e.g. https://desidude.pages.dev,
//                               https://desidude.<you>.workers.dev or
//                               https://yourdomain.com
//   2. URL env var       → set automatically by Netlify builds
//   3. DEFAULT_SITE_URL  → fallback below; change it once you know your domain
//
// Note: Cloudflare only exposes per-deployment preview origins
// (CF_PAGES_URL / hashed *.pages.dev), which must never become the canonical
// URL — that's why the production origin is pinned explicitly.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_NAME = 'DESIDUDE';
export const SITE_TAGLINE = 'Hot video streaming, zero database';

/** Fallback production origin when no SITE_URL env var is provided. */
const DEFAULT_SITE_URL = 'https://desidude.pages.dev';

/** Absolute origin (no trailing slash) of the deployed site. */
export const SITE_URL = String(process.env.SITE_URL || process.env.URL || DEFAULT_SITE_URL).replace(
  /\/+$/,
  ''
);

/** Videos per page in the main catalog grid. */
export const PER_PAGE = 9;

/**
 * Demo seed data — all 10 catalog entries currently point at the same
 * embed + thumbnail. Replace per-video from the /admin panel (Git workflow).
 */
export const DEMO_EMBED_URL = 'https://luluvdo.com/e/h2a4h636uv6u';
export const DEMO_THUMB_URL =
  'https://i.postimg.cc/p5bbqJ8Q/363429454-106817469166168-8969862643825409573-n.jpg';

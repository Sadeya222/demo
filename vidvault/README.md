# DESIDUDE — Zero-Database Video Streaming & Catalog

**Brand:** DESIDUDE · pink theme (pink-500/rose-500) · lips logo at `public/logo.svg`
(also used as the favicon and the navbar/admin brand mark).

A production-grade video streaming + cataloging website where **the GitHub repository
is the database**. No SQL, no NoSQL — video metadata lives as human-readable JSON
files in `src/content/videos/`, managed entirely through Git.

Built with **Astro 7.3.2** + **Tailwind CSS v4**, output as a fully static site.

```
[ Git Admin Commits ] ──> [ GitHub Repo JSON Data ]   (src/content/videos/*.json)
                                   │
                                   ▼
                      [ Astro 7.3.2 Engine ]
                      (Content Collections + Zod schema)
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
 [ UI & Layout Engine ]                          [ Programmatic SEO Engine ]
  - Header (logo · live search · nav)             - Schema.org VideoObject JSON-LD
  - Sidebar (category tree + counters)            - Dynamic /sitemap.xml
  - Paginated video grid                          - Dynamic /robots.txt
  - Detail page + click-to-load player
```

---

## Requirements

- **Node.js ≥ 22.12.0** (Astro 7 requirement)
- npm 9.6+

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static production build → dist/
npm run preview    # serve the production build
```

## Configuration

All site-wide settings live in **`src/config/site.mjs`**:

| Constant         | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| `SITE_URL`       | **Set to your production domain.** Used by `/sitemap.xml`, `/robots.txt`, canonical + OG URLs. |
| `SITE_NAME`      | Brand name shown in the header/admin.                          |
| `PER_PAGE`       | Videos per catalog page (default 9).                           |
| `DEMO_*_URL`     | The seed embed/thumbnail used by the 10 demo entries.          |

## The data model (your "database")

One JSON file per video in `src/content/videos/`. **The filename (without `.json`)
is the video's unique ID** and routes to `/video/<id>`.

```json
{
  "title": "Build Your First AI Agent: A Practical Beginner's Guide",
  "description": "A hands-on walkthrough … (max 160 chars)",
  "embedUrl": "https://luluvdo.com/e/h2a4h636uv6u",
  "thumbnailUrl": "https://i.postimg.cc/p5bbqJ8Q/…-n.jpg",
  "duration": "PT12M30S",
  "publishedAt": "2026-09-05T09:00:00.000Z",
  "category": "Tech",
  "subcategory": "AI & Machine Learning",
  "tags": ["ai", "agents", "tutorial", "automation"]
}
```

- `title` — 3–70 chars · `description` — 10–160 chars
- `duration` — ISO 8601 (`PT8M45S`, `PT1H2M3S`)
- `publishedAt` — ISO 8601 timestamp (UTC)
- `embedUrl` / `thumbnailUrl` — external URLs only; **no binaries are ever
  stored on the server** (YouTube, Vimeo, Cloudflare Stream, custom HLS, …)
- `tags` — ≥ 1 string, consumed by the related-videos engine

Every file is validated against the Zod schema in `src/content.config.ts` at
build time — a broken commit fails the build, never the site.

## Admin workflow (`/admin`)

Sign in with **user `admin` / pass `admin`** (demo gate — credentials are checked
client-side because the architecture has no backend by design; front `/admin`
with proxy auth in production).

**Publish a new video:**
1. Fill the **JSON builder** (auto-slug, live character counters, ISO 8601
   duration from h/m/s inputs, category/subcategory picklists, live schema
   validation with an error list).
2. **Copy JSON** or **Download .json**.
3. Save it as `src/content/videos/<id>.json`, then:
   `git add … && git commit -m "Add video: <id>" && git push`
4. CI rebuilds — the catalog, sidebar counters, search index, `sitemap.xml`
   and every video page (incl. its VideoObject schema) update automatically.

**Update an existing video:** click **Edit** on its catalog row → the builder
loads with all current values → change what you need → Copy / Download the
updated JSON, overwrite the file, `git add && git commit && git push`.

**Delete a video:** click **Delete** on its row → copy the generated
`git rm src/content/videos/<id>.json` + commit + push commands, run them in
the repo, push. The rebuild removes the video everywhere (catalog, sitemap,
search index, related lists) automatically.

**Manage the taxonomy:** the Categories & subcategories panel lets you create
new categories and nest subcategories under the selected one. Drafts persist
in your browser and feed the builder's picklists immediately; a category/sub
becomes **LIVE** (and appears in the site sidebar) as soon as a committed
video uses it.

## Features

**UI** — Fixed header (brand logo · centered real-time search · nav controls);
fixed left sidebar with an accordion category→subcategory tree and item counters
(slide-over drawer on mobile); responsive card grid with thumbnail, duration
badge, relative publish date and category tag; structured Prev / numbers / Next
pagination (real static routes: `/`, `/page/2/`, …).

**Search & filtering** — Instant, client-side filtering against a pre-indexed
JSON payload (titles, descriptions, categories, subcategories, tags) with no
page reloads. Filter state is shareable via deep links:
`/?q=astro`, `/?cat=Tech`, `/?cat=Tech&sub=Web Development`, `/?q=ai&page=2`.
Press `/` to focus search.

**Video detail (`/video/[id]`)** — 16:9 responsive player rendering the external
embed iframe directly; metadata badges (date, duration, category/subcategory
links); interactive tags (each tag runs a tag search); expandable description;
**related-videos engine** (same subcategory +3, same category +1, +1 per shared
tag, recency tiebreak → 4-card grid).

**Admin panel (`/admin`, user `admin` / pass `admin`)**

- **JSON builder** — auto-slug, live character counters, ISO 8601 duration
  from h/m/s inputs, live schema validation, Copy / Download of the exact
  `src/content/videos/<id>.json` payload, plus the Git commit workflow.
- **Edit existing videos** — the **Edit** button on any catalog row loads the
  entry into the builder (edit mode: the copy button becomes "Copy updated
  JSON"; overwrite the file and commit).
- **Delete videos** — the **Delete** button shows a confirmation modal with
  the exact `git rm` + commit + push commands (a static site cannot delete
  repo files by itself; after the push, the rebuild cleans the catalog,
  sidebar counters, search index, sitemap and schema automatically).
- **Category & subcategory manager** — create new categories, nest
  subcategories under the selected category, and remove unused drafts.
  Items are marked **LIVE** (used by committed videos, visible in the site
  sidebar) or **DRAFT** (saved in this browser; goes live the moment a video
  using them is published via Git). The builder's picklists always merge
  committed + draft taxonomy.
- **Live SEO engine** — renders the current `sitemap.xml`, `robots.txt` and
  any video's `VideoObject` JSON-LD live (with the current host) so you can
  inspect and copy the exact SEO output at any time.

**SEO engine**

- `VideoObject` JSON-LD injected into `<head>` of every video page (name,
  description, `thumbnailUrl[]`, `uploadDate` ISO 8601, `duration` ISO 8601,
  `embedUrl`, genre, keywords) → Google Video Search indexing.
- `/sitemap.xml` — generated at build time from the JSON collection: every video
  route + home, `lastmod`, `changefreq`, `priority`.
- `/robots.txt` — generated rules (`Allow: /`, `Disallow: /admin`) with the
  authoritative `Sitemap:` declaration.

## Project structure

```
src/
├── config/site.mjs            # SITE_URL, brand, PER_PAGE, demo seed URLs
├── content.config.ts          # Content Collection + Zod schema (the "DB schema")
├── content/videos/*.json      # ← the database (10 demo entries)
├── lib/
│   ├── dates.ts               # ISO 8601 duration ↔ badge, relative dates
│   ├── taxonomy.ts            # category tree builder (sidebar/admin)
│   └── related.ts             # related-videos scoring engine
├── layouts/MainLayout.astro   # shell: head meta/JSON-LD, header, sidebar, footer
├── components/
│   ├── Header.astro           # fixed header: logo · search · nav · theme toggle
│   ├── Sidebar.astro          # fixed category tree (+ mobile drawer)
│   ├── CatalogCanvas.astro    # grid + client search/filter/pagination engine
│   ├── VideoCard.astro        # card (server) — mirrored by the client renderer
│   └── VideoPlayer.astro      # 16:9 click-to-load iframe facade
└── pages/
    ├── index.astro            # /          (catalog page 1)
    ├── index/page/[page].astro# /page/2/…  (static pagination routes)
    ├── video/[id].astro       # /video/<id> (player + JSON-LD + related)
    ├── sitemap.xml.ts         # dynamic sitemap endpoint
    ├── robots.txt.ts          # dynamic robots endpoint
    ├── admin/index.astro      # /admin — Git-based catalog manager
    └── 404.astro
```

## Deployment — Cloudflare Pages (ready)

The project is wired for **Cloudflare Pages** out of the box:

| Setting                | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Build command          | `npm run build`                                |
| Build output directory | `dist`                                         |
| Node version           | **22** (Astro 7.3.2 refuses Node 20 — set it)  |
| Root directory         | (repo root)                                    |

### Option A — Git integration (recommended)

1. Push this folder to a GitHub repo.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build settings: command `npm run build`, output directory `dist`.
4. Add one environment variable: `NODE_VERSION = 22`
   (Build & Deployment → Environment variables).
5. Deploy. Every `git push` now rebuilds automatically (branches/PRs get
   free preview deployments), and `SITE_URL` auto-resolves to the deployed
   origin — the sitemap, robots.txt and every VideoObject schema URL use the
   **real live domain on every build**, no code changes needed.

Custom domain: attach it under the project's **Custom domains** tab, then
optionally pin the exact domain by adding an env var `SITE_URL = https://yourdomain.com`
(the build env `URL` always reports the `*.pages.dev` origin).

### Option B — Wrangler CLI

```bash
npx wrangler login
npm run deploy:cf        # builds, then: wrangler pages deploy dist --project-name=desidude
```

### What Cloudflare Pages handles automatically

- `404.html` → served for unknown routes
- `_headers` (in `public/`) → security headers + smart cache policies
  (fingerprinted `/_astro/*` assets cached forever, SEO files revalidated hourly)
- Directory URLs: `/video/x` → 301 → `/video/x/` (index.html in a folder)

## Other deployment notes

- **Static output** — `dist/` can also ship to Netlify, Vercel, S3, GitHub
  Pages or any CDN; the `SITE_URL` env chain works anywhere (`SITE_URL` →
  `URL` → default).
- CI example (GitHub Actions): `npm ci && npm run build` on push — new JSON
  commits ship in the same pipeline.
- If the catalog ever drops to ≤ 9 videos (single page), delete
  `src/pages/page/[page].astro`.

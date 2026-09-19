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

The Astro app lives at the **repository root** (this is what Cloudflare builds).

```
.
├── astro.config.mjs           # static output · Tailwind v4 vite plugin
├── wrangler.jsonc             # Cloudflare config (Workers static assets, serves dist/)
├── .node-version              # 22 — picked up by Cloudflare's build image & nvm
├── public/
│   ├── _headers               # security + cache headers (Pages & Workers)
│   └── logo.svg
└── src/
    ├── config/site.mjs        # SITE_URL, brand, PER_PAGE, demo seed URLs
    ├── content.config.ts      # Content Collection + Zod schema (the "DB schema")
    ├── content/videos/*.json  # ← the database (10 demo entries)
    ├── lib/
    │   ├── dates.ts           # ISO 8601 duration ↔ badge, relative dates
    │   ├── taxonomy.ts        # category tree builder (sidebar/admin)
    │   └── related.ts         # related-videos scoring engine
    ├── layouts/MainLayout.astro   # shell: head meta/JSON-LD, header, sidebar, footer
    ├── components/
    │   ├── Header.astro       # fixed header: ☰ · logo · search · live chat · theme
    │   ├── Sidebar.astro      # category tree — fixed rail (lg+) / drawer (< lg)
    │   ├── CatalogCanvas.astro# grid + client search/filter/pagination engine
    │   ├── VideoCard.astro    # card (server) — mirrored by the client renderer
    │   └── VideoPlayer.astro  # 16:9 iframe embed
    └── pages/
        ├── index.astro        # /          (catalog page 1)
        ├── page/[page].astro  # /page/2/…  (static pagination routes)
        ├── video/[id].astro   # /video/<id> (player + JSON-LD + related)
        ├── sitemap.xml.ts     # dynamic sitemap endpoint
        ├── robots.txt.ts      # dynamic robots endpoint
        ├── admin/index.astro  # /admin — Git-based catalog manager
        └── 404.astro
```

### Responsive shell

| Breakpoint        | Header                                                     | Sidebar                                        |
| ----------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| `< 640px` (phone) | ☰ · logo · 🔍 (tap → full-width search bar) · chat · theme | off-canvas drawer (☰ opens · ✕ / backdrop / Esc close, page scroll locked) |
| `640–1023px`      | ☰ · logo · inline search · chat · theme                    | off-canvas drawer                              |
| `≥ 1024px`        | logo + wordmark · inline search · "Live chat" · theme      | fixed 16rem rail; content and footer are offset by `lg:pl-64` |

The drawer/accordion logic lives in `Sidebar.astro`, so it works on every page
(catalog, video detail, 404). Other scripts talk to it via one DOM event:
`document.dispatchEvent(new CustomEvent('vv:sidebar', { detail: { open: false } }))`
or `{ detail: { group: 'Tech' } }` to expand a category.

## Deployment — Cloudflare (Pages **or** Workers)

The site is 100 % static: `npm run build` writes plain HTML/CSS/JS to `dist/`
and Cloudflare serves that folder from the edge. Both Cloudflare products are
supported out of the box; pick whichever you created in the dashboard.

> **Golden rule:** Cloudflare must build from the **repository root** (where
> `package.json`, `astro.config.mjs` and `wrangler.jsonc` are) and publish
> the **`dist`** folder. If the *Root directory* setting points anywhere else,
> the build produces no `dist/` and Cloudflare reports that it can't find any
> HTML/JS to deploy.

### Option A — Cloudflare Pages · Git integration

Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick
`Sadeya222/demo`.

| Setting                       | Value           |
| ----------------------------- | --------------- |
| Framework preset              | Astro           |
| Build command                 | `npm run build` |
| Build output directory        | `dist`          |
| Root directory (advanced)     | *(leave empty)* |
| Env var `NODE_VERSION`        | `22` *(optional — `.node-version` already pins it)* |
| Env var `SITE_URL`            | `https://<project>.pages.dev` or your custom domain (see [Configuration](#configuration)) |

Every `git push` rebuilds the site; branches/PRs get preview deployments.

### Option B — Cloudflare Workers · Git integration (Workers Builds)

Dashboard → **Workers & Pages → Create → Workers → Import a repository** →
pick `Sadeya222/demo`.

| Setting          | Value                     |
| ---------------- | ------------------------- |
| Build command    | `npm run build`           |
| Deploy command   | `npx wrangler deploy`     |
| Root directory   | *(leave empty)*           |
| Env var `SITE_URL` | `https://desidude.<you>.workers.dev` or your custom domain |

`wrangler.jsonc` tells Wrangler to upload `./dist` as static assets, serve
`404.html` with a real 404 status and redirect `/video/x` → `/video/x/`.

### Option C — Deploy from your machine (Wrangler CLI)

```bash
npx wrangler login
npm run deploy          # Workers:  astro build → wrangler deploy
npm run deploy:pages    # Pages:    astro build → wrangler pages deploy dist --project-name=desidude
```

### Custom domain

Attach it under the project's **Custom domains** (Pages) or **Settings →
Domains & Routes** (Workers), then set the build-time env var
`SITE_URL=https://yourdomain.com` (or change `DEFAULT_SITE_URL` in
`src/config/site.mjs`) so the sitemap, robots.txt, canonical and VideoObject
URLs use the real domain.

### What Cloudflare handles automatically

- `404.html` → served (with a 404 status) for unknown routes
- `public/_headers` → security headers + cache policy (fingerprinted `/_astro/*`
  assets cached forever, SEO files revalidated hourly)
- Directory URLs: `/video/x` → redirect → `/video/x/` (matches the canonical
  URLs and sitemap entries generated at build time)

### Troubleshooting

| Symptom | Cause → fix |
| ------- | ----------- |
| *"No HTML/JS found"*, *"Output directory 'dist' not found"*, or a blank/404 site after a "successful" deploy | Cloudflare built from the wrong folder. Set **Root directory** to empty (repo root), build command `npm run build`, output `dist`. |
| `Missing script: "build"` / `astro: not found` | Same as above — the build ran outside the project root. |
| `Node.js v18/v20 is not supported by Astro` | Add env var `NODE_VERSION=22` (the repo's `.node-version` also requests 22). |
| `wrangler deploy` says *"Workers-specific command in a Pages project"* | Old config. `wrangler.jsonc` now uses the Workers `assets` format — pull the latest commit. |
| `wrangler pages deploy` warns *"missing pages_build_output_dir"* | Harmless: Pages ignores `wrangler.jsonc` and uses the `dist` folder passed on the CLI. |
| Canonical / sitemap URLs show `desidude.pages.dev` on a custom domain | Set the `SITE_URL` env var (build-time) and redeploy. |

## Other deployment notes

- **Static output** — `dist/` can also ship to Netlify, Vercel, S3, GitHub
  Pages or any CDN; set `SITE_URL` in the build environment (Netlify's own
  `URL` variable is picked up automatically).
- CI example (GitHub Actions): `npm ci && npm run build` on push — new JSON
  commits ship in the same pipeline.
- If the catalog ever drops to ≤ 9 videos (single page), delete
  `src/pages/page/[page].astro`.

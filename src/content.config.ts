import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ─────────────────────────────────────────────────────────────────────────────
// Zero-database "content store"
//
// The Git repository IS the database. Each JSON file in src/content/videos/
// is one row. The FILENAME (without .json) is the video's unique ID and
// routes to /video/<id>. Astro's content layer validates every file against
// this Zod schema at build time, so a broken commit fails the build instead
// of shipping broken data. No SQL, no NoSQL — just git.
// ─────────────────────────────────────────────────────────────────────────────

const videos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/videos' }),
  schema: z.object({
    /** Concise title, optimized for search display (max 70 chars). */
    title: z.string().min(3).max(70),
    /** Summary, optimized for search snippets (max 160 chars). */
    description: z.string().min(10).max(160),
    /** Direct iframe stream source (YouTube / Vimeo / Cloudflare Stream / custom HLS). */
    embedUrl: z.url(),
    /** Direct URL to a high-resolution EXTERNAL preview image (never stored here). */
    thumbnailUrl: z.url(),
    /** ISO 8601 duration, e.g. PT8M45S. */
    duration: z
      .string()
      .regex(/^PT(?=\d)(?:\d+H)?(?:\d+M)?(?:\d+S)?$/, 'ISO 8601 duration required, e.g. PT8M45S'),
    /** ISO 8600/8601 publication timestamp, used for date sorting and indexing. */
    publishedAt: z.coerce.date(),
    /** Main high-level classification grouping. */
    category: z.string().min(1),
    /** Nested topic classification for granular filtering. */
    subcategory: z.string().min(1),
    /** Real view count (as reported by the video platform) — shown on cards & detail page. */
    views: z.number().int().min(0),
    /** String identifiers consumed by the related-videos matching engine. */
    tags: z.array(z.string().min(1)).min(1),
  }),
});

export const collections = { videos };

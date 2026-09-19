import type { Video } from './taxonomy';

/**
 * Related-videos matching engine.
 *
 * Relevance scoring per candidate:
 *   +3  same subcategory
 *   +1  same main category
 *   +1  per overlapping tag
 * Ties break on recency (newest first).
 */
export function relatedVideos(current: Video, all: Video[], limit = 4): Video[] {
  const tags = new Set(current.data.tags);

  return all
    .filter((v) => v.id !== current.id)
    .map((v) => {
      let score = 0;
      if (v.data.subcategory === current.data.subcategory) score += 3;
      if (v.data.category === current.data.category) score += 1;
      for (const t of v.data.tags) if (tags.has(t)) score += 1;
      return { v, score };
    })
    .sort((a, b) => b.score - a.score || +b.v.data.publishedAt - +a.v.data.publishedAt)
    .slice(0, limit)
    .map((x) => x.v);
}

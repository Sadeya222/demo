import type { CollectionEntry } from 'astro:content';

export type Video = CollectionEntry<'videos'>;

export interface SubNode {
  name: string;
  count: number;
}

export interface CatNode {
  name: string;
  count: number;
  subs: SubNode[];
}

/**
 * Build the category → subcategory taxonomy tree with item counters,
 * consumed by the sidebar and the admin panel. Sorted by popularity,
 * then alphabetically.
 */
export function buildTaxonomy(videos: Video[]): CatNode[] {
  const map = new Map<string, Map<string, number>>();
  for (const v of videos) {
    let subs = map.get(v.data.category);
    if (!subs) {
      subs = new Map();
      map.set(v.data.category, subs);
    }
    subs.set(v.data.subcategory, (subs.get(v.data.subcategory) ?? 0) + 1);
  }

  const cats: CatNode[] = [...map.entries()].map(([name, subs]) => ({
    name,
    count: [...subs.values()].reduce((a, b) => a + b, 0),
    subs: [...subs.entries()].map(([n, c]) => ({ name: n, count: c })),
  }));

  cats.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  for (const c of cats) {
    c.subs.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }
  return cats;
}

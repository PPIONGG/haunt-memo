import type { ArchiveStory, FanState } from "./archive";

export type Shelf = { id: string; title: string; stories: ArchiveStory[] };

type ShelfOptions = { maxPerShelf?: number; maxTagShelves?: number };

const byAddedDesc = (a: ArchiveStory, b: ArchiveStory) => b.addedAt.localeCompare(a.addedAt);

/** The Story Home leads with: the Curator's newest pick. */
export function featuredStory(stories: readonly ArchiveStory[]): ArchiveStory | null {
  return [...stories].sort(byAddedDesc)[0] ?? null;
}

/**
 * Home's shelves, in order: the newest Stories (or the unlistened ones, once the Fan has listened to something),
 * the biggest Tags, and the scariest Stories. Shelves with fewer than two Stories are dropped,
 * except the first one.
 */
export function homeShelves(
  stories: readonly ArchiveStory[],
  fanState: FanState,
  { maxPerShelf = 12, maxTagShelves = 3 }: ShelfOptions = {},
): Shelf[] {
  const newest = [...stories].sort(byAddedDesc);
  const featured = newest[0];
  const shelves: Shelf[] = [];

  const hasListened = fanState.listened.size > 0;
  const first = newest.filter((s) => s !== featured && !(hasListened && fanState.listened.has(s.id)));
  if (first.length > 0) {
    shelves.push(
      hasListened
        ? { id: "unlistened", title: "ยังไม่ได้ฟัง", stories: first }
        : { id: "newest", title: "เพิ่มล่าสุด", stories: first },
    );
  }

  const tags = new Map<string, { name: string; stories: ArchiveStory[] }>();
  for (const story of newest) {
    for (const tag of story.tags) {
      const entry = tags.get(tag.id) ?? { name: tag.name, stories: [] };
      entry.stories.push(story);
      tags.set(tag.id, entry);
    }
  }
  [...tags]
    .filter(([, t]) => t.stories.length >= 2)
    .sort(([, a], [, b]) => b.stories.length - a.stories.length || a.name.localeCompare(b.name, "th"))
    .slice(0, maxTagShelves)
    .forEach(([id, t]) => shelves.push({ id: `tag:${id}`, title: t.name, stories: t.stories }));

  const scariest = newest.filter((s) => s.scareLevel >= 4).sort((a, b) => b.scareLevel - a.scareLevel);
  if (scariest.length >= 2) shelves.push({ id: "scariest", title: "น่ากลัวที่สุด", stories: scariest });

  return shelves.map((shelf) => ({ ...shelf, stories: shelf.stories.slice(0, maxPerShelf) }));
}

/** Stories to suggest after this one: the same Province first, otherwise ones sharing a Tag. */
export function relatedStories(
  story: ArchiveStory,
  stories: readonly ArchiveStory[],
  limit = 8,
): { title: string; stories: ArchiveStory[] } {
  const others = stories.filter((s) => s.id !== story.id).sort(byAddedDesc);
  if (story.province) {
    const sameProvince = others.filter((s) => s.province === story.province);
    if (sameProvince.length > 0) return { title: `เรื่องอื่นใน${story.province}`, stories: sameProvince.slice(0, limit) };
  }
  const tagIds = new Set(story.tags.map((t) => t.id));
  const similar = others.filter((s) => s.tags.some((t) => tagIds.has(t.id)));
  return { title: "เรื่องที่คล้ายกัน", stories: similar.slice(0, limit) };
}

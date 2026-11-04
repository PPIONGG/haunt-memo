import Fuse from "fuse.js";
import type { VocabularyEntry } from "./gemini-draft";

export type ArchiveStory = {
  id: string;
  youtubeId: string;
  displayTitle: string;
  synopsis: string;
  scareLevel: number;
  /** ISO date, `YYYY-MM-DD`. */
  broadcastDate: string;
  /** ISO timestamp. */
  addedAt: string;
  province: string | null;
  place: string | null;
  tags: VocabularyEntry[];
  storytellers: VocabularyEntry[];
};

export type FanState = { listened: ReadonlySet<string>; favourites: ReadonlySet<string> };

export const ARCHIVE_SORTS = ["added_desc", "broadcast_desc", "broadcast_asc", "scare_desc", "scare_asc"] as const;
export type ArchiveSort = (typeof ARCHIVE_SORTS)[number];

export type ListenedFilter = "all" | "unlistened" | "listened";

export type ArchiveCriteria = {
  text?: string;
  tagIds?: readonly string[];
  storytellerIds?: readonly string[];
  province?: string | null;
  scareLevel?: { min?: number; max?: number };
  broadcastDate?: { from?: string; to?: string };
  listened?: ListenedFilter;
  favouritesOnly?: boolean;
  sort?: ArchiveSort;
};

export type ArchiveResult = { stories: ArchiveStory[]; total: number };

const SEARCH_KEYS = ["displayTitle", "synopsis", "storytellers.name", "place"];
const fuseCache = new WeakMap<readonly ArchiveStory[], Fuse<ArchiveStory>>();

const byAddedDesc = (a: ArchiveStory, b: ArchiveStory) => b.addedAt.localeCompare(a.addedAt);
const COMPARATORS: Record<ArchiveSort, (a: ArchiveStory, b: ArchiveStory) => number> = {
  added_desc: byAddedDesc,
  broadcast_desc: (a, b) => b.broadcastDate.localeCompare(a.broadcastDate) || byAddedDesc(a, b),
  broadcast_asc: (a, b) => a.broadcastDate.localeCompare(b.broadcastDate) || byAddedDesc(a, b),
  scare_desc: (a, b) => b.scareLevel - a.scareLevel || byAddedDesc(a, b),
  scare_asc: (a, b) => a.scareLevel - b.scareLevel || byAddedDesc(a, b),
};

export function queryArchive(
  stories: readonly ArchiveStory[],
  criteria: ArchiveCriteria,
  fanState: FanState,
): ArchiveResult {
  const textMatches = matchText(stories, criteria.text ?? "");
  const filtered = stories.filter(
    (s) => (textMatches === null || textMatches.has(s.id)) && matchesFilters(s, criteria, fanState),
  );
  filtered.sort(COMPARATORS[criteria.sort ?? "added_desc"]);
  return { stories: filtered, total: filtered.length };
}

export function pickRandomStory(
  stories: readonly ArchiveStory[],
  criteria: ArchiveCriteria,
  fanState: FanState,
  rng: () => number = Math.random,
): ArchiveStory | null {
  const { stories: candidates } = queryArchive(stories, criteria, fanState);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(rng() * candidates.length)];
}

function matchesFilters(story: ArchiveStory, c: ArchiveCriteria, fanState: FanState): boolean {
  if (c.tagIds?.length && !story.tags.some((t) => c.tagIds!.includes(t.id))) return false;
  if (c.storytellerIds?.length && !story.storytellers.some((s) => c.storytellerIds!.includes(s.id))) return false;
  if (c.province && story.province !== c.province) return false;
  if (c.scareLevel?.min !== undefined && story.scareLevel < c.scareLevel.min) return false;
  if (c.scareLevel?.max !== undefined && story.scareLevel > c.scareLevel.max) return false;
  if (c.broadcastDate?.from && story.broadcastDate < c.broadcastDate.from) return false;
  if (c.broadcastDate?.to && story.broadcastDate > c.broadcastDate.to) return false;
  if (c.listened === "listened" && !fanState.listened.has(story.id)) return false;
  if (c.listened === "unlistened" && fanState.listened.has(story.id)) return false;
  if (c.favouritesOnly && !fanState.favourites.has(story.id)) return false;
  return true;
}

function matchText(stories: readonly ArchiveStory[], text: string): Set<string> | null {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  const fuse = searchIndex(stories);
  const [first, ...rest] = words.map((word) => new Set(fuse.search(word).map((r) => r.item.id)));
  return rest.reduce((acc, next) => new Set([...acc].filter((id) => next.has(id))), first);
}

function searchIndex(stories: readonly ArchiveStory[]): Fuse<ArchiveStory> {
  let fuse = fuseCache.get(stories);
  if (!fuse) {
    fuse = new Fuse(stories, { keys: SEARCH_KEYS, ignoreLocation: true, threshold: 0.3 });
    fuseCache.set(stories, fuse);
  }
  return fuse;
}

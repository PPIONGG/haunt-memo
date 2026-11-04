"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { DicesIcon, SlidersHorizontalIcon } from "lucide-react";
import { pickRandomStory, queryArchive, type ArchiveCriteria, type ArchiveStory } from "@/domain/archive";
import { PROVINCES } from "@/domain/provinces";
import { Button } from "@/components/ui/button";
import { useFanState } from "@/lib/fan-state-storage";
import { ClearFiltersButton, FilterPanel, SearchBar, SortSelect, type ArchiveVocabulary } from "./archive-filters";
import { StoryCard } from "./story-card";
import { StoryDialog } from "./story-dialog";

export function ArchiveBrowser({ stories }: { stories: ArchiveStory[] }) {
  const [criteria, setCriteria] = useState<ArchiveCriteria>({});
  const [showFilters, setShowFilters] = useState(false);
  const [openStoryId, setOpenStoryId] = useState<string | null>(null);
  const { fanState, toggleListened, toggleFavourite } = useFanState();

  const deferredCriteria = useDeferredValue(criteria);
  const vocabulary = useMemo(() => vocabularyOf(stories), [stories]);
  const result = useMemo(
    () => queryArchive(stories, deferredCriteria, fanState),
    [stories, deferredCriteria, fanState],
  );
  const openStory = stories.find((s) => s.id === openStoryId) ?? null;
  const filtersActive = hasFilters(criteria);

  const openRandomStory = () => {
    const story = pickRandomStory(stories, criteria, fanState);
    if (story) setOpenStoryId(story.id);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchBar criteria={criteria} onChange={setCriteria} />
        <div className="flex gap-2">
          <SortSelect criteria={criteria} onChange={setCriteria} />
          <Button
            variant={showFilters ? "secondary" : "outline"}
            className="h-10"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
          >
            <SlidersHorizontalIcon /> ตัวกรอง
          </Button>
          <Button className="h-10" onClick={openRandomStory} disabled={result.total === 0}>
            <DicesIcon /> สุ่มเรื่อง
          </Button>
        </div>
      </div>

      {showFilters && <FilterPanel criteria={criteria} vocabulary={vocabulary} onChange={setCriteria} />}

      <div className="flex min-h-9 items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filtersActive ? `พบ ${result.total} จาก ${stories.length} เรื่อง` : `ทั้งหมด ${stories.length} เรื่อง`}
        </p>
        {filtersActive && <ClearFiltersButton onClear={() => setCriteria({ sort: criteria.sort })} />}
      </div>

      {result.total === 0 ? (
        <div className="grid place-items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <p className="text-4xl" aria-hidden>
            🕯️
          </p>
          <p className="font-medium">ไม่พบเรื่องที่ตรงกับการค้นหา</p>
          <p className="text-sm text-muted-foreground">ลองลดตัวกรองหรือเปลี่ยนคำค้นดูนะ</p>
          {filtersActive && <ClearFiltersButton onClear={() => setCriteria({ sort: criteria.sort })} />}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.stories.map((story) => (
            <li key={story.id} className="grid">
              <StoryCard
                story={story}
                listened={fanState.listened.has(story.id)}
                favourite={fanState.favourites.has(story.id)}
                onOpen={() => setOpenStoryId(story.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <StoryDialog
        story={openStory}
        listened={openStory ? fanState.listened.has(openStory.id) : false}
        favourite={openStory ? fanState.favourites.has(openStory.id) : false}
        onToggleListened={() => openStory && toggleListened(openStory.id)}
        onToggleFavourite={() => openStory && toggleFavourite(openStory.id)}
        onClose={() => setOpenStoryId(null)}
      />
    </div>
  );
}

function hasFilters(c: ArchiveCriteria): boolean {
  return Boolean(
    c.text?.trim() ||
      c.tagIds?.length ||
      c.storytellerIds?.length ||
      c.province ||
      c.scareLevel?.min !== undefined ||
      c.scareLevel?.max !== undefined ||
      c.broadcastDate?.from ||
      c.broadcastDate?.to ||
      (c.listened && c.listened !== "all") ||
      c.favouritesOnly,
  );
}

function vocabularyOf(stories: readonly ArchiveStory[]): ArchiveVocabulary {
  const tags = new Map(stories.flatMap((s) => s.tags).map((t) => [t.id, t]));
  const storytellers = new Map(stories.flatMap((s) => s.storytellers).map((t) => [t.id, t]));
  const provinces = new Set(stories.map((s) => s.province).filter((p) => p !== null));
  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, "th");
  return {
    tags: [...tags.values()].sort(byName),
    storytellers: [...storytellers.values()].sort(byName),
    provinces: PROVINCES.filter((p) => provinces.has(p)),
  };
}

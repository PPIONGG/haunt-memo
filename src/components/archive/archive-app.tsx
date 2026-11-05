"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { pickRandomStory, queryArchive, type ArchiveCriteria, type ArchiveStory } from "@/domain/archive";
import { provinceStats } from "@/domain/archive-map";
import { isProvince, PROVINCES, type Province } from "@/domain/provinces";
import type { Shelf } from "@/domain/shelves";
import { useFanState } from "@/lib/fan-state-storage";
import { BottomTabs, MobileTopBar, TopNav, type ArchiveView } from "./app-chrome";
import type { ArchiveVocabulary } from "./filter-fields";
import { HomeView } from "./home-view";
import { MapView } from "./map-view";
import { MineView } from "./mine-view";
import { SearchView } from "./search-view";
import { StoryDetail } from "./story-detail";

/** The public Archive: Home, Map, Search and Mine as views on one page (ADR 0004). */
export function ArchiveApp({ stories }: { stories: ArchiveStory[] }) {
  const [view, setView] = useState<ArchiveView>("home");
  const [criteria, setCriteria] = useState<ArchiveCriteria>({});
  const [openStoryId, setOpenStoryId] = useState<string | null>(null);
  const { fanState, toggleListened, toggleFavourite } = useFanState();

  const stats = useMemo(() => provinceStats(stories), [stories]);
  const [mapProvince, setMapProvince] = useState<Province | null>(stats[0]?.province ?? null);
  const vocabulary = useMemo(() => vocabularyOf(stories), [stories]);
  const deferredCriteria = useDeferredValue(criteria);
  const results = useMemo(() => queryArchive(stories, deferredCriteria, fanState).stories, [stories, deferredCriteria, fanState]);
  const openStory = stories.find((s) => s.id === openStoryId) ?? null;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  const search = (next: ArchiveCriteria) => {
    setCriteria(next);
    setView("search");
  };

  const openRandom = () => {
    const story = pickRandomStory(stories, view === "search" ? criteria : {}, fanState);
    if (story) setOpenStoryId(story.id);
  };

  const seeShelf = (shelf: Shelf) => {
    if (shelf.id === "unlistened") search({ listened: "unlistened" });
    else if (shelf.id === "scariest") search({ scareLevel: { min: 4 }, sort: "scare_desc" });
    else if (shelf.id.startsWith("tag:")) search({ tagIds: [shelf.id.slice(4)] });
    else search({});
  };

  const openMap = (province?: string) => {
    if (province && isProvince(province)) setMapProvince(province);
    setView("map");
  };

  const overHero = view === "home" && stories.length > 0;

  return (
    <div className="relative min-h-dvh font-light">
      <TopNav
        view={view}
        onView={setView}
        searchText={criteria.text ?? ""}
        onSearchText={(text) => search({ ...criteria, text })}
        onRandom={openRandom}
        overHero={overHero}
      />
      <MobileTopBar onHome={() => setView("home")} onRandom={openRandom} overHero={overHero} />

      <main>
        {view === "home" && (
          <HomeView stories={stories} stats={stats} fanState={fanState} onOpenStory={setOpenStoryId} onSeeShelf={seeShelf} onOpenMap={openMap} />
        )}
        {view === "map" && (
          <MapView
            stories={stories}
            stats={stats}
            fanState={fanState}
            selected={mapProvince}
            onSelect={setMapProvince}
            onOpenStory={setOpenStoryId}
            onSeeProvince={(province) => search({ province })}
          />
        )}
        {view === "search" && (
          <SearchView
            allCount={stories.length}
            results={results}
            criteria={criteria}
            onChange={setCriteria}
            vocabulary={vocabulary}
            fanState={fanState}
            onOpenStory={setOpenStoryId}
          />
        )}
        {view === "mine" && <MineView stories={stories} fanState={fanState} onOpenStory={setOpenStoryId} />}
      </main>

      <BottomTabs view={view} onView={setView} />

      <StoryDetail
        story={openStory}
        stories={stories}
        stats={stats}
        fanState={fanState}
        onToggleListened={toggleListened}
        onToggleFavourite={toggleFavourite}
        onOpenStory={setOpenStoryId}
        onShowOnMap={(province) => {
          setOpenStoryId(null);
          openMap(province);
        }}
        onClose={() => setOpenStoryId(null)}
      />
    </div>
  );
}

function vocabularyOf(stories: readonly ArchiveStory[]): ArchiveVocabulary {
  const tags = new Map<string, { id: string; name: string; count: number }>();
  for (const tag of stories.flatMap((s) => s.tags)) {
    const entry = tags.get(tag.id) ?? { ...tag, count: 0 };
    entry.count += 1;
    tags.set(tag.id, entry);
  }
  const storytellers = new Map(stories.flatMap((s) => s.storytellers).map((t) => [t.id, t]));
  const provinces = new Set(stories.map((s) => s.province).filter((p) => p !== null));
  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, "th");
  return {
    tags: [...tags.values()].sort((a, b) => b.count - a.count || byName(a, b)),
    storytellers: [...storytellers.values()].sort(byName),
    provinces: PROVINCES.filter((p) => provinces.has(p)),
  };
}

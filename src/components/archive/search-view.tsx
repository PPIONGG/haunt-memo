"use client";

import { useState } from "react";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import type { ArchiveCriteria, ArchiveStory, FanState } from "@/domain/archive";
import { FilterFields, SortSelect, type ArchiveVocabulary } from "./filter-fields";
import { BottomSheet } from "./overlays";
import { StoryTile } from "./story-tile";

type Props = {
  allCount: number;
  results: ArchiveStory[];
  criteria: ArchiveCriteria;
  onChange: (criteria: ArchiveCriteria) => void;
  vocabulary: ArchiveVocabulary;
  fanState: FanState;
  onOpenStory: (id: string) => void;
};

export function SearchView({ allCount, results, criteria, onChange, vocabulary, fanState, onOpenStory }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const chips = activeFilters(criteria, vocabulary, onChange);
  const clear = () => onChange({ sort: criteria.sort });
  const text = criteria.text?.trim();

  return (
    <div className="lg:grid lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[300px_1fr]">
      <aside className="hidden border-r px-7 py-6 lg:block">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">ตัวกรอง</h2>
          {chips.length > 0 && (
            <button type="button" onClick={clear} className="text-[13px] text-faint hover:text-foreground">
              ล้างทั้งหมด
            </button>
          )}
        </div>
        <FilterFields criteria={criteria} vocabulary={vocabulary} onChange={onChange} />
      </aside>

      <section className="px-4 pt-3 pb-28 lg:px-10 lg:py-6">
        <div className="grid gap-2 lg:hidden">
          <label className="flex h-12 items-center gap-2.5 rounded-xl bg-secondary px-3.5 text-muted-foreground focus-within:ring-2 focus-within:ring-ring/50">
            <SearchIcon className="size-[18px] shrink-0" />
            <input
              type="search"
              inputMode="search"
              placeholder="ค้นหาเรื่อง ผู้เล่า หรือสถานที่"
              aria-label="ค้นหาเรื่อง"
              value={criteria.text ?? ""}
              onChange={(e) => onChange({ ...criteria, text: e.target.value })}
              className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-faint"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-3.5 text-sm"
            >
              <SlidersHorizontalIcon className="size-4 text-faint" /> ตัวกรอง
              {chips.length > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-ember text-xs text-[#1a0806]">{chips.length}</span>
              )}
            </button>
            <SortSelect value={criteria.sort ?? "added_desc"} onChange={(sort) => onChange({ ...criteria, sort })} className="flex-1" />
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4 lg:mt-0">
          <div>
            <h2 className="text-xl font-medium lg:text-[28px]">{text ? `ผลการค้นหา “${text}”` : "ทุกเรื่อง"}</h2>
            <p className="mt-0.5 text-sm text-faint" aria-live="polite">
              {chips.length > 0 ? `${results.length} จาก ${allCount} เรื่อง` : `${allCount} เรื่อง`}
            </p>
          </div>
          <SortSelect value={criteria.sort ?? "added_desc"} onChange={(sort) => onChange({ ...criteria, sort })} className="hidden w-44 lg:flex" />
        </div>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.remove}
                aria-label={`เอา ${chip.label} ออก`}
                className="flex h-8 items-center gap-1.5 rounded-full bg-secondary pr-2.5 pl-3 text-[13px] hover:bg-accent"
              >
                {chip.label}
                <XIcon className="size-3.5 text-faint" />
              </button>
            ))}
          </div>
        )}

        {results.length === 0 ? (
          <div className="mt-6 grid place-items-center gap-2 rounded-2xl border border-dashed px-6 py-16 text-center">
            <p className="font-medium">ไม่พบเรื่องที่ตรงกับการค้นหา</p>
            <p className="text-sm text-muted-foreground">ลองลดตัวกรองหรือเปลี่ยนคำค้น</p>
            {chips.length > 0 && (
              <button type="button" onClick={clear} className="mt-2 h-10 rounded-lg bg-secondary px-4 text-sm">
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        ) : (
          <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:gap-x-4 lg:gap-y-7 xl:grid-cols-4">
            {results.map((story) => (
              <li key={story.id} className="grid">
                <StoryTile
                  story={story}
                  listened={fanState.listened.has(story.id)}
                  favourite={fanState.favourites.has(story.id)}
                  onOpen={() => onOpenStory(story.id)}
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title="ตัวกรอง">
        <div className="flex items-center justify-between px-5 pt-1">
          <h2 className="text-lg font-medium">ตัวกรอง</h2>
          {chips.length > 0 && (
            <button type="button" onClick={clear} className="text-sm text-muted-foreground">
              ล้างทั้งหมด
            </button>
          )}
        </div>
        <div className="overflow-y-auto px-5">
          <FilterFields criteria={criteria} vocabulary={vocabulary} onChange={onChange} />
        </div>
        <div className="border-t px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="h-12 w-full rounded-xl bg-primary text-base font-medium text-primary-foreground"
          >
            ดู {results.length} เรื่อง
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

type Chip = { key: string; label: string; remove: () => void };

function activeFilters(c: ArchiveCriteria, vocabulary: ArchiveVocabulary, onChange: (c: ArchiveCriteria) => void): Chip[] {
  const chips: Chip[] = [];
  const set = (patch: Partial<ArchiveCriteria>) => () => onChange({ ...c, ...patch });
  for (const id of c.tagIds ?? []) {
    const tag = vocabulary.tags.find((t) => t.id === id);
    chips.push({ key: `tag:${id}`, label: tag?.name ?? "ประเภท", remove: set({ tagIds: c.tagIds!.filter((t) => t !== id) }) });
  }
  if (c.scareLevel?.min !== undefined) {
    chips.push({ key: "scare-min", label: `น่ากลัว ${c.scareLevel.min} ขึ้นไป`, remove: set({ scareLevel: { ...c.scareLevel, min: undefined } }) });
  }
  if (c.scareLevel?.max !== undefined) {
    chips.push({ key: "scare-max", label: `น่ากลัวไม่เกิน ${c.scareLevel.max}`, remove: set({ scareLevel: { ...c.scareLevel, max: undefined } }) });
  }
  if (c.province) chips.push({ key: "province", label: c.province, remove: set({ province: null }) });
  for (const id of c.storytellerIds ?? []) {
    const who = vocabulary.storytellers.find((s) => s.id === id);
    chips.push({ key: `teller:${id}`, label: `เล่าโดย ${who?.name ?? ""}`, remove: set({ storytellerIds: c.storytellerIds!.filter((s) => s !== id) }) });
  }
  if (c.broadcastDate?.from) chips.push({ key: "from", label: `ตั้งแต่ ${c.broadcastDate.from}`, remove: set({ broadcastDate: { ...c.broadcastDate, from: undefined } }) });
  if (c.broadcastDate?.to) chips.push({ key: "to", label: `ถึง ${c.broadcastDate.to}`, remove: set({ broadcastDate: { ...c.broadcastDate, to: undefined } }) });
  if (c.listened && c.listened !== "all") {
    chips.push({ key: "listened", label: c.listened === "listened" ? "ฟังแล้ว" : "ยังไม่ฟัง", remove: set({ listened: "all" }) });
  }
  if (c.favouritesOnly) chips.push({ key: "favourites", label: "เรื่องโปรด", remove: set({ favouritesOnly: false }) });
  return chips;
}

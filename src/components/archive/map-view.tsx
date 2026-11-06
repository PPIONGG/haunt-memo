"use client";

import { useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import type { ArchiveStory, FanState } from "@/domain/archive";
import type { ProvinceStat } from "@/domain/archive-map";
import { REGIONS, type Region } from "@/domain/province-geo";
import type { Province } from "@/domain/provinces";
import { cn } from "@/lib/utils";
import { formatThaiDate } from "./format";
import { ScareLevel } from "./scare-level";
import { StoryThumbnail } from "./story-thumbnail";
import { StoryTile } from "./story-tile";
import { ThailandMap, type MapMode } from "./thailand-map";

type Props = {
  stories: readonly ArchiveStory[];
  stats: ProvinceStat[];
  fanState: FanState;
  selected: Province | null;
  onSelect: (province: Province | null) => void;
  onOpenStory: (id: string) => void;
  onSeeProvince: (province: Province) => void;
};

export function MapView({ stories, stats, fanState, selected, onSelect, onOpenStory, onSeeProvince }: Props) {
  const [region, setRegion] = useState<Region | null>(null);
  const [mode, setMode] = useState<MapMode>("count");

  if (stats.length === 0) {
    return <p className="px-4 pt-32 text-center text-muted-foreground">ยังไม่มีเรื่องที่ระบุจังหวัด</p>;
  }

  const inRegion = region ? stats.filter((s) => s.region === region) : stats;
  const stat = stats.find((s) => s.province === selected) ?? null;
  const provinceStories = stat
    ? stories.filter((s) => s.province === stat.province).sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    : [];

  const chooseRegion = (next: Region | null) => {
    setRegion(next);
    const pool = next ? stats.filter((s) => s.region === next) : stats;
    if (!pool.some((s) => s.province === selected)) onSelect(pool[0]?.province ?? null);
  };

  const summary = stat
    ? mode === "scare"
      ? `น่ากลัวเฉลี่ย ${stat.averageScare.toFixed(1)} จาก 5 · อันดับ ${stat.scareRank} จาก ${stats.length} จังหวัด`
      : `${stat.count} เรื่อง · น่ากลัวเฉลี่ย ${stat.averageScare.toFixed(1)}`
    : "แตะจังหวัดบนแผนที่เพื่อดูเรื่องที่นั่น";

  return (
    <div className="lg:grid lg:h-[calc(100dvh-4rem)] lg:grid-cols-[420px_1fr]">
      <aside className="hidden overflow-y-auto border-r px-7 pt-7 pb-10 lg:block">
        {stat ? (
          <div className="grid gap-4">
            <span className="text-[13px] text-faint">
              ภาค{stat.region} / {stat.province}
            </span>
            <h2 className="text-4xl leading-tight font-medium">{stat.province}</h2>
            <div className="grid grid-cols-3 gap-2">
              <Figure value={String(stat.count)} label="เรื่อง" />
              <Figure value={stat.averageScare.toFixed(1)} label="น่ากลัวเฉลี่ย" />
              <Figure value={String(stat.scareRank)} label="อันดับความหลอน" />
            </div>
            <ul>
              {provinceStories.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => onOpenStory(s.id)} className="grid w-full grid-cols-[128px_1fr] gap-3.5 border-b py-3 text-left hover:bg-secondary/40">
                    <StoryThumbnail youtubeId={s.youtubeId} sizes="128px" className="aspect-video rounded-lg" />
                    <span className="grid content-center gap-1">
                      <span className="text-base leading-snug">{s.displayTitle}</span>
                      <span className="flex items-center gap-2 text-[13px] text-faint">
                        <ScareLevel level={s.scareLevel} className="text-[13px]" />
                        {s.storytellers[0]?.name}
                      </span>
                      <span className="text-[13px] text-faint">{formatThaiDate(s.broadcastDate)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => onSeeProvince(stat.province)} className="flex w-fit items-center gap-1 py-1 text-sm text-muted-foreground hover:text-foreground">
              ค้นหาและกรองเรื่องใน{stat.province} <ChevronRightIcon className="size-4" />
            </button>
          </div>
        ) : (
          <p className="text-muted-foreground">{summary}</p>
        )}
      </aside>

      <div className="relative h-[calc(100dvh-7.5rem-env(safe-area-inset-bottom))] lg:h-auto">
        <div className="absolute inset-x-0 top-0 z-10 grid gap-2.5 px-4 pt-3 lg:flex lg:items-start lg:justify-between lg:px-6 lg:pt-5">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <Chip on={region === null} onClick={() => chooseRegion(null)}>
              ทั้งประเทศ
            </Chip>
            {REGIONS.map((r) => (
              <Chip key={r} on={region === r} onClick={() => chooseRegion(r)}>
                {r}
              </Chip>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 lg:grid lg:justify-items-end">
            <div className="flex rounded-[10px] bg-secondary p-[3px] text-[13px]" role="group" aria-label="สีของหมุด">
              {(["count", "scare"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className={cn("rounded-lg px-3 py-1.5", mode === m ? "bg-accent text-foreground" : "text-muted-foreground")}
                >
                  {m === "count" ? "จำนวนเรื่อง" : "ความน่ากลัว"}
                </button>
              ))}
            </div>
            <Legend mode={mode} />
          </div>
        </div>

        <div className="absolute inset-x-4 top-[100px] bottom-24 lg:inset-x-6 lg:top-16 lg:bottom-6">
          <ThailandMap
            stats={inRegion}
            region={region}
            mode={mode}
            selected={selected}
            onSelect={onSelect}
            labels="busiest"
            dotSpacing={16}
            pinScale={1.4}
          />
        </div>

        <section className="absolute inset-x-0 bottom-0 grid h-[264px] gap-3 rounded-t-[20px] border-t bg-card pt-4 lg:hidden">
          <div className="flex items-end justify-between px-4">
            <div>
              <h2 className="text-[22px] leading-tight font-medium">{stat?.province ?? "เลือกจังหวัด"}</h2>
              <p className="text-[13px] text-muted-foreground">{summary}</p>
            </div>
            {stat && (
              <button type="button" onClick={() => onSeeProvince(stat.province)} className="flex items-center py-1 text-[13px] text-faint">
                ดูทั้งหมด <ChevronRightIcon className="size-3.5" />
              </button>
            )}
          </div>
          <div className="no-scrollbar flex snap-x gap-2.5 overflow-x-auto px-4">
            {provinceStories.map((s) => (
              <StoryTile
                key={s.id}
                story={s}
                listened={fanState.listened.has(s.id)}
                favourite={fanState.favourites.has(s.id)}
                onOpen={() => onOpenStory(s.id)}
                sizes="150px"
                className="w-[150px] shrink-0 snap-start"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "h-8 shrink-0 rounded-full border px-3 text-sm transition-colors",
        on ? "border-transparent bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <b className="block text-[22px] font-medium tabular-nums">{value}</b>
      <span className="text-xs text-faint">{label}</span>
    </div>
  );
}

function Legend({ mode }: { mode: MapMode }) {
  if (mode === "count") {
    return (
      <span className="flex items-center gap-2 text-xs text-faint">
        ขนาดวง = จำนวนเรื่อง
        <span className="flex items-end gap-1" aria-hidden>
          <i className="block size-2 rounded-full bg-ember" />
          <i className="block size-3 rounded-full bg-ember" />
          <i className="block size-4 rounded-full bg-ember" />
        </span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 text-xs text-faint">
      น้อย
      <i className="block h-1.5 w-20 rounded-full" style={{ background: "linear-gradient(90deg, rgb(88 88 96), var(--ember))" }} aria-hidden />
      มาก
    </span>
  );
}

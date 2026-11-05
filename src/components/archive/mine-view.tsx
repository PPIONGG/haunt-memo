"use client";

import { useState } from "react";
import type { ArchiveStory, FanState } from "@/domain/archive";
import { cn } from "@/lib/utils";
import { StoryTile } from "./story-tile";

type Props = { stories: readonly ArchiveStory[]; fanState: FanState; onOpenStory: (id: string) => void };

/** The Fan's own lists, kept in this browser. */
export function MineView({ stories, fanState, onOpenStory }: Props) {
  const [tab, setTab] = useState<"favourites" | "listened">("favourites");
  const favourites = stories.filter((s) => fanState.favourites.has(s.id));
  const listened = stories.filter((s) => fanState.listened.has(s.id));
  const shown = (tab === "favourites" ? favourites : listened).toSorted((a, b) => b.addedAt.localeCompare(a.addedAt));

  return (
    <section className="px-4 pt-4 pb-28 lg:mx-auto lg:max-w-6xl lg:px-12 lg:py-10">
      <h2 className="text-2xl font-medium lg:text-[32px]">ของฉัน</h2>
      <p className="mt-1 text-sm text-faint">เก็บไว้ในเครื่องนี้ ไม่ต้องสมัครสมาชิก</p>
      <div className="mt-4 inline-grid grid-cols-2 rounded-[10px] bg-secondary p-[3px] text-sm" role="tablist">
        {(
          [
            ["favourites", `เรื่องโปรด ${favourites.length}`],
            ["listened", `ฟังแล้ว ${listened.length}`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn("h-9 rounded-lg px-4", tab === value ? "bg-accent text-foreground" : "text-muted-foreground")}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="font-medium">{tab === "favourites" ? "ยังไม่มีเรื่องโปรด" : "ยังไม่มีเรื่องที่ฟังแล้ว"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            กด {tab === "favourites" ? "เรื่องโปรด" : "ฟังแล้ว"} ในหน้ารายละเอียดเรื่อง แล้วเรื่องนั้นจะมาอยู่ที่นี่
          </p>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:gap-x-4 xl:grid-cols-4">
          {shown.map((story) => (
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
  );
}

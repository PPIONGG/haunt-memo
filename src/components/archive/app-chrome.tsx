"use client";

import { BookmarkIcon, HouseIcon, MapIcon, SearchIcon, ShuffleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ArchiveView = "home" | "map" | "search" | "mine";

const TABS: { view: ArchiveView; label: string; icon: typeof HouseIcon }[] = [
  { view: "home", label: "หน้าแรก", icon: HouseIcon },
  { view: "map", label: "แผนที่", icon: MapIcon },
  { view: "search", label: "ค้นหา", icon: SearchIcon },
  { view: "mine", label: "ของฉัน", icon: BookmarkIcon },
];

type NavProps = {
  view: ArchiveView;
  onView: (view: ArchiveView) => void;
  searchText: string;
  onSearchText: (text: string) => void;
  onRandom: () => void;
  overHero: boolean;
};

/** Desktop: the top navigation bar, floating over the hero on Home. */
export function TopNav({ view, onView, searchText, onSearchText, onRandom, overHero }: NavProps) {
  return (
    <header
      className={cn(
        "z-40 hidden h-16 items-center justify-between px-12 lg:flex",
        overHero ? "absolute inset-x-0 top-0" : "sticky top-0 border-b bg-background",
      )}
      style={overHero ? { background: "linear-gradient(rgb(11 11 12 / .75), transparent)" } : undefined}
    >
      <div className="flex items-center gap-10">
        <button type="button" onClick={() => onView("home")} className="text-xl font-medium">
          Haunt Memo
        </button>
        <nav className="flex gap-7">
          {TABS.filter((t) => t.view !== "search").map((t) => (
            <button
              key={t.view}
              type="button"
              onClick={() => onView(t.view)}
              aria-current={view === t.view ? "page" : undefined}
              className={cn("text-[15px] transition-colors", view === t.view ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <label
          className={cn(
            "flex h-10 w-80 items-center gap-2.5 rounded-[10px] px-3.5 text-muted-foreground focus-within:ring-2 focus-within:ring-ring/50",
            overHero ? "bg-white/10 backdrop-blur-sm" : "bg-secondary",
          )}
        >
          <SearchIcon className="size-4 shrink-0" />
          <input
            type="search"
            placeholder="ค้นหาเรื่อง ผู้เล่า หรือสถานที่"
            aria-label="ค้นหาเรื่อง"
            value={searchText}
            onChange={(e) => onSearchText(e.target.value)}
            onFocus={() => view !== "search" && searchText && onView("search")}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <button
          type="button"
          onClick={onRandom}
          className={cn("flex h-10 items-center gap-2 rounded-[10px] px-4 text-sm transition-colors", overHero ? "bg-white/10 hover:bg-white/20" : "bg-secondary hover:bg-accent")}
        >
          <ShuffleIcon className="size-4" /> สุ่มเรื่อง
        </button>
      </div>
    </header>
  );
}

/** Phone: a slim top bar, transparent over the hero on Home. */
export function MobileTopBar({ onHome, onRandom, overHero }: { onHome: () => void; onRandom: () => void; overHero: boolean }) {
  return (
    <header
      className={cn("z-40 flex h-14 items-center justify-between px-4 lg:hidden", overHero ? "absolute inset-x-0 top-0" : "sticky top-0 border-b bg-background/95 backdrop-blur-sm")}
    >
      <button type="button" onClick={onHome} className="text-lg font-medium">
        Haunt Memo
      </button>
      <button
        type="button"
        onClick={onRandom}
        aria-label="สุ่มเรื่อง"
        className={cn("grid size-10 place-items-center rounded-xl", overHero ? "bg-black/35 text-white" : "bg-secondary")}
      >
        <ShuffleIcon className="size-[18px]" />
      </button>
    </header>
  );
}

/** Phone: the tab bar along the bottom edge, in reach of the thumb. */
export function BottomTabs({ view, onView }: { view: ArchiveView; onView: (view: ArchiveView) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      {TABS.map(({ view: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onView(v)}
          aria-current={view === v ? "page" : undefined}
          className={cn("grid h-16 content-center justify-items-center gap-1", view === v ? "text-foreground" : "text-faint")}
        >
          <Icon className="size-[22px]" strokeWidth={1.5} />
          <span className="text-[11px]">{label}</span>
        </button>
      ))}
    </nav>
  );
}

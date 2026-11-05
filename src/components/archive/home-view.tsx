"use client";

import { ExternalLinkIcon, MapIcon } from "lucide-react";
import type { ArchiveStory, FanState } from "@/domain/archive";
import type { ProvinceStat } from "@/domain/archive-map";
import { featuredStory, homeShelves, type Shelf as ShelfData } from "@/domain/shelves";
import { youTubeWatchUrl } from "@/domain/youtube";
import { formatThaiDate } from "./format";
import { ScareLevel } from "./scare-level";
import { Shelf } from "./shelf";
import { StoryThumbnail } from "./story-thumbnail";
import { ThailandMap } from "./thailand-map";

type Props = {
  stories: readonly ArchiveStory[];
  stats: ProvinceStat[];
  fanState: FanState;
  onOpenStory: (id: string) => void;
  onSeeShelf: (shelf: ShelfData) => void;
  onOpenMap: (province?: string) => void;
};

export function HomeView({ stories, stats, fanState, onOpenStory, onSeeShelf, onOpenMap }: Props) {
  const featured = featuredStory(stories);
  const shelves = homeShelves(stories, fanState);

  if (!featured) {
    return <p className="px-4 pt-32 text-center text-muted-foreground">ยังไม่มีเรื่องในคลัง</p>;
  }

  const shelf = (s: ShelfData) => (
    <Shelf key={s.id} title={s.title} stories={s.stories} fanState={fanState} onOpenStory={onOpenStory} onSeeAll={() => onSeeShelf(s)} />
  );

  return (
    <div className="pb-28 lg:pb-0">
      <Hero story={featured} onDetails={() => onOpenStory(featured.id)} />
      <div className="grid gap-8 pt-4 lg:gap-10 lg:pt-6">
        {shelves.slice(0, 1).map(shelf)}
        {stats.length > 0 && <MapTeaser stats={stats} total={stories.length} onOpenMap={onOpenMap} />}
        {shelves.slice(1).map(shelf)}
      </div>
      <footer className="mt-14 hidden justify-between border-t px-12 pt-10 pb-10 text-[13px] text-faint lg:flex">
        <span>Haunt Memo · เรื่องผีที่คัดมาจาก YouTube</span>
        <span>ฟังเต็ม ๆ ได้ที่ช่องต้นทางของแต่ละเรื่อง</span>
      </footer>
    </div>
  );
}

function Hero({ story, onDetails }: { story: ArchiveStory; onDetails: () => void }) {
  const tag = story.tags[0]?.name;
  const who = story.storytellers[0]?.name;
  return (
    <section className="relative h-[520px] lg:h-[660px]">
      <StoryThumbnail youtubeId={story.youtubeId} large priority sizes="100vw" className="absolute inset-0" />
      <div
        className="absolute inset-0 lg:hidden"
        style={{ background: "linear-gradient(rgb(11 11 12 / .6), transparent 20%, transparent 42%, var(--background) 94%)" }}
      />
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgb(11 11 12 / .92), rgb(11 11 12 / .55) 32%, transparent 62%), linear-gradient(rgb(11 11 12 / .6), transparent 18%, transparent 60%, var(--background))",
        }}
      />
      <div className="absolute inset-x-4 bottom-2 grid gap-2 lg:right-auto lg:bottom-20 lg:left-12 lg:w-[560px] lg:gap-3.5">
        <span className="text-[13px] text-muted-foreground">เพิ่มล่าสุด{tag ? ` · ${tag}` : ""}</span>
        <h1 className="text-[38px] leading-[1.1] font-medium lg:text-[64px] lg:leading-[1.05]">{story.displayTitle}</h1>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
          <ScareLevel level={story.scareLevel} className="text-[15px]" />
          <span>
            {[story.province, who && `เล่าโดย ${who}`].filter(Boolean).join(" · ")}
            <span className="hidden lg:inline"> · {formatThaiDate(story.broadcastDate)}</span>
          </span>
        </div>
        <p className="hidden text-[17px] leading-relaxed text-muted-foreground lg:line-clamp-3">{story.synopsis}</p>
        <div className="mt-2 flex gap-2">
          <a
            href={youTubeWatchUrl(story.youtubeId)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base text-primary-foreground transition-colors hover:bg-primary/90 lg:flex-none"
          >
            <ExternalLinkIcon className="size-[18px]" /> เปิดใน YouTube
          </a>
          <button
            type="button"
            onClick={onDetails}
            className="h-12 rounded-xl bg-white/12 px-5 text-base backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            รายละเอียด
          </button>
        </div>
      </div>
    </section>
  );
}

function MapTeaser({ stats, total, onOpenMap }: { stats: ProvinceStat[]; total: number; onOpenMap: (province?: string) => void }) {
  const top = stats.slice(0, 5);
  const max = top[0]?.count ?? 1;
  return (
    <section className="mx-4 grid overflow-hidden rounded-[20px] border bg-card lg:mx-12 lg:h-[520px] lg:grid-cols-[minmax(0,560px)_1fr]">
      <div className="relative grid content-start gap-2 p-5 lg:gap-3 lg:p-10">
        <span className="text-[13px] text-ember">แผนที่</span>
        <h2 className="text-2xl leading-tight font-medium lg:text-[40px]">เรื่องผีทั่วไทย</h2>
        <p className="max-w-[13rem] text-sm text-muted-foreground lg:max-w-md lg:text-base">
          {total} เรื่อง จาก {stats.length} จังหวัด ดูว่าแถวบ้านคุณมีเรื่องอะไร หรือจังหวัดไหนหลอนที่สุด
        </p>
        <ol className="mt-4 hidden max-w-md gap-2.5 lg:grid">
          {top.map((s) => (
            <li key={s.province}>
              <button
                type="button"
                onClick={() => onOpenMap(s.province)}
                className="grid w-full grid-cols-[120px_1fr_28px] items-center gap-3 text-left text-sm text-muted-foreground hover:text-foreground"
              >
                <span className="truncate">{s.province}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <span className="block h-full rounded-full bg-ember" style={{ width: `${(s.count / max) * 100}%` }} />
                </span>
                <span className="text-right text-foreground tabular-nums">{s.count}</span>
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => onOpenMap()}
          className="mt-28 flex h-11 w-fit items-center gap-2 rounded-xl bg-primary px-4 text-[15px] text-primary-foreground transition-colors hover:bg-primary/90 lg:mt-auto lg:px-5"
        >
          <MapIcon className="size-[18px]" /> เปิดแผนที่
        </button>
        <div className="pointer-events-none absolute top-3 right-0 bottom-3 w-[46%] lg:hidden">
          <ThailandMap stats={stats} labels="none" dotSpacing={22} pinScale={1.6} />
        </div>
      </div>
      <div className="hidden border-l p-6 lg:block">
        <ThailandMap stats={stats} labels="busiest" dotSpacing={16} pinScale={1.15} onSelect={(p) => onOpenMap(p)} />
      </div>
    </section>
  );
}

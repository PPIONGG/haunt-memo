"use client";

import { CheckIcon, ChevronRightIcon, ExternalLinkIcon, HeartIcon, XIcon } from "lucide-react";
import type { ArchiveStory, FanState } from "@/domain/archive";
import type { ProvinceStat } from "@/domain/archive-map";
import { regionOf } from "@/domain/archive-map";
import { isProvince } from "@/domain/provinces";
import { relatedStories } from "@/domain/shelves";
import { youTubeWatchUrl } from "@/domain/youtube";
import { cn } from "@/lib/utils";
import { formatThaiDate } from "./format";
import { OverlayClose, StoryOverlay } from "./overlays";
import { ScareLevel } from "./scare-level";
import { StoryThumbnail } from "./story-thumbnail";
import { StoryTile } from "./story-tile";
import { ThailandMap } from "./thailand-map";

type Props = {
  story: ArchiveStory | null;
  stories: readonly ArchiveStory[];
  stats: ProvinceStat[];
  fanState: FanState;
  onToggleListened: (id: string) => void;
  onToggleFavourite: (id: string) => void;
  onOpenStory: (id: string) => void;
  onShowOnMap: (province: string) => void;
  onClose: () => void;
};

export function StoryDetail({ story, stories, stats, fanState, onToggleListened, onToggleFavourite, onOpenStory, onShowOnMap, onClose }: Props) {
  return (
    <StoryOverlay
      open={story !== null}
      onOpenChange={(open) => !open && onClose()}
      title={story?.displayTitle ?? "รายละเอียดเรื่อง"}
      description={story ? `เรื่องย่อและรายละเอียดของ ${story.displayTitle}` : undefined}
    >
      {story && (
        <DetailBody
          key={story.id}
          story={story}
          stories={stories}
          stats={stats}
          fanState={fanState}
          onToggleListened={onToggleListened}
          onToggleFavourite={onToggleFavourite}
          onOpenStory={onOpenStory}
          onShowOnMap={onShowOnMap}
        />
      )}
    </StoryOverlay>
  );
}

function DetailBody({
  story,
  stories,
  stats,
  fanState,
  onToggleListened,
  onToggleFavourite,
  onOpenStory,
  onShowOnMap,
}: Omit<Props, "story" | "onClose"> & { story: ArchiveStory }) {
  const listened = fanState.listened.has(story.id);
  const favourite = fanState.favourites.has(story.id);
  const related = relatedStories(story, stories);
  const tagNames = story.tags.map((t) => t.name).join(" · ");
  const provinceStat = stats.find((s) => s.province === story.province);

  return (
    <div className="pb-10">
      <div className="relative aspect-[4/3] lg:aspect-[21/9]">
        <StoryThumbnail youtubeId={story.youtubeId} large sizes="(min-width: 1024px) 980px, 100vw" className="absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(rgb(0 0 0 / .45), transparent 25%, transparent 55%, var(--detail-bg))" }}
        />
        <OverlayClose
          aria-label="ปิด"
          className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-black/55 text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:top-4 lg:right-4"
        >
          <XIcon className="size-5" />
        </OverlayClose>
      </div>

      <div className="relative -mt-10 grid gap-8 px-4 lg:-mt-14 lg:grid-cols-[1fr_300px] lg:gap-10 lg:px-10">
        <div className="grid content-start gap-3">
          {tagNames && <p className="text-[13px] text-muted-foreground">{tagNames}</p>}
          <h2 className="text-3xl leading-tight font-medium lg:text-[44px]">{story.displayTitle}</h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <ScareLevel level={story.scareLevel} className="text-base" />
            <span>
              น่ากลัวระดับ {story.scareLevel} · ออกอากาศ {formatThaiDate(story.broadcastDate)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={youTubeWatchUrl(story.youtubeId)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 flex-1 basis-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base text-primary-foreground transition-colors hover:bg-primary/90 sm:basis-auto sm:flex-none"
            >
              <ExternalLinkIcon className="size-[18px]" /> เปิดใน YouTube
            </a>
            <ToggleAction pressed={listened} onClick={() => onToggleListened(story.id)} icon={<CheckIcon className="size-[18px]" />}>
              ฟังแล้ว
            </ToggleAction>
            <ToggleAction
              pressed={favourite}
              onClick={() => onToggleFavourite(story.id)}
              icon={<HeartIcon className={cn("size-[18px]", favourite && "fill-current text-ember")} />}
            >
              เรื่องโปรด
            </ToggleAction>
          </div>

          <p className="mt-2 text-base leading-[1.8] whitespace-pre-line text-muted-foreground lg:text-[17px]">{story.synopsis}</p>

          <dl className="mt-2 grid grid-cols-[84px_1fr] gap-x-3 gap-y-2 text-[15px]">
            {story.storytellers.length > 0 && (
              <>
                <dt className="text-faint">ผู้เล่า</dt>
                <dd>{story.storytellers.map((s) => s.name).join(", ")}</dd>
              </>
            )}
            <dt className="text-faint">เพิ่มเมื่อ</dt>
            <dd>{formatThaiDate(story.addedAt.slice(0, 10))}</dd>
          </dl>
        </div>

        <aside className="grid content-start gap-3 rounded-2xl border bg-card p-4 lg:mt-16 lg:bg-background">
          <span className="text-xs text-faint">เกิดที่</span>
          {story.province && isProvince(story.province) ? (
            <div className="flex gap-4 lg:grid">
              <div className="h-28 w-16 shrink-0 lg:h-52 lg:w-full">
                <ThailandMap
                  stats={provinceStat ? [provinceStat] : []}
                  selected={null}
                  labels="none"
                  dotSpacing={24}
                  pinScale={2.2}
                />
              </div>
              <div className="grid content-center gap-1">
                <p className="text-[17px]">{story.place ?? story.province}</p>
                <p className="text-[13px] text-muted-foreground">
                  {story.province} · ภาค{regionOf(story.province)}
                </p>
                <button
                  type="button"
                  onClick={() => onShowOnMap(story.province!)}
                  className="mt-1 flex w-fit items-center gap-0.5 text-sm hover:text-ember"
                >
                  ดูบนแผนที่ <ChevronRightIcon className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[15px] text-muted-foreground">{story.place ?? "ไม่ระบุจังหวัด"}</p>
          )}
        </aside>
      </div>

      {related.stories.length > 0 && (
        <section className="mt-10 grid gap-3">
          <h3 className="px-4 text-lg font-medium lg:px-10">{related.title}</h3>
          <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-4 lg:px-10">
            {related.stories.map((s) => (
              <StoryTile
                key={s.id}
                story={s}
                listened={fanState.listened.has(s.id)}
                favourite={fanState.favourites.has(s.id)}
                onOpen={() => onOpenStory(s.id)}
                sizes="(min-width: 1024px) 214px, 168px"
                className="w-[168px] shrink-0 snap-start lg:w-[214px]"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ToggleAction({ pressed, onClick, icon, children }: { pressed: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-[15px] transition-colors sm:flex-none",
        pressed ? "bg-accent text-foreground" : "bg-secondary text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

"use client";

import { CheckIcon, HeartIcon } from "lucide-react";
import type { ArchiveStory } from "@/domain/archive";
import { cn } from "@/lib/utils";
import { ScareLevel } from "./scare-level";
import { StoryThumbnail } from "./story-thumbnail";

type Props = {
  story: ArchiveStory;
  listened: boolean;
  favourite: boolean;
  onOpen: () => void;
  sizes: string;
  className?: string;
};

export function StoryTile({ story, listened, favourite, onOpen, sizes, className }: Props) {
  const meta = [story.province ?? "ไม่ระบุจังหวัด", story.storytellers[0]?.name].filter(Boolean).join(" · ");

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group grid content-start gap-2 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <div className="relative">
        <StoryThumbnail
          youtubeId={story.youtubeId}
          sizes={sizes}
          className={cn(
            "aspect-video rounded-lg transition-opacity duration-150",
            listened && "opacity-45 group-hover:opacity-100",
          )}
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {listened && (
            <span className="flex h-6 items-center gap-1 rounded-md bg-black/65 px-2 text-xs text-white">
              <CheckIcon className="size-3.5" /> ฟังแล้ว
            </span>
          )}
          {favourite && (
            <span className="grid size-6 place-items-center rounded-md bg-black/65 text-white" aria-label="เรื่องโปรด">
              <HeartIcon className="size-3.5 fill-current" />
            </span>
          )}
        </div>
      </div>
      <span className="line-clamp-2 text-[15px] leading-snug font-normal lg:text-base">{story.displayTitle}</span>
      <span className="flex min-w-0 items-center gap-2 text-xs text-faint lg:text-[13px]">
        <ScareLevel level={story.scareLevel} className="shrink-0 text-xs lg:text-[13px]" />
        <span className="truncate">{meta}</span>
      </span>
    </button>
  );
}

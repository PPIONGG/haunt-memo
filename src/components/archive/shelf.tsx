"use client";

import { ChevronRightIcon } from "lucide-react";
import type { ArchiveStory, FanState } from "@/domain/archive";
import { StoryTile } from "./story-tile";

type Props = {
  title: string;
  stories: ArchiveStory[];
  fanState: FanState;
  onOpenStory: (id: string) => void;
  onSeeAll?: () => void;
};

/** A titled, horizontally scrolling row of Stories. */
export function Shelf({ title, stories, fanState, onOpenStory, onSeeAll }: Props) {
  return (
    <section className="grid gap-3">
      <div className="flex items-baseline justify-between px-4 lg:px-12">
        <h2 className="text-lg font-medium lg:text-[22px]">{title}</h2>
        {onSeeAll && (
          <button type="button" onClick={onSeeAll} className="flex items-center gap-0.5 text-[13px] text-faint hover:text-foreground">
            ดูทั้งหมด
            <ChevronRightIcon className="size-3.5" />
          </button>
        )}
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 lg:scroll-px-12 lg:gap-4 lg:px-12">
        {stories.map((story) => (
          <StoryTile
            key={story.id}
            story={story}
            listened={fanState.listened.has(story.id)}
            favourite={fanState.favourites.has(story.id)}
            onOpen={() => onOpenStory(story.id)}
            sizes="(min-width: 1024px) 256px, 168px"
            className="w-[168px] shrink-0 snap-start lg:w-64"
          />
        ))}
      </div>
    </section>
  );
}

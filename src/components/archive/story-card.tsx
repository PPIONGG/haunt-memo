import Image from "next/image";
import { CheckIcon, HeartIcon } from "lucide-react";
import type { ArchiveStory } from "@/domain/archive";
import { youTubeThumbnailUrl } from "@/domain/youtube";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScareLevel } from "./scare-level";

type Props = {
  story: ArchiveStory;
  listened: boolean;
  favourite: boolean;
  onOpen: () => void;
};

export function StoryCard({ story, listened, favourite, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        listened && "opacity-60 hover:opacity-100",
      )}
    >
      <div className="relative aspect-video w-full bg-muted">
        <Image
          src={youTubeThumbnailUrl(story.youtubeId)}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition group-hover:scale-[1.02]"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {listened && (
            <Badge variant="secondary" className="gap-1">
              <CheckIcon /> ฟังแล้ว
            </Badge>
          )}
          {favourite && (
            <Badge variant="secondary" aria-label="เรื่องโปรด">
              <HeartIcon className="fill-current text-rose-400" />
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="font-heading text-base leading-snug font-semibold">{story.displayTitle}</h3>
        <div className="mt-auto flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>{story.province ?? "ไม่ระบุจังหวัด"}</span>
          <ScareLevel level={story.scareLevel} className="text-sm" />
        </div>
        {story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {story.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

import { CheckIcon, ExternalLinkIcon, HeartIcon } from "lucide-react";
import type { ArchiveStory } from "@/domain/archive";
import { youTubeWatchUrl } from "@/domain/youtube";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatThaiDate } from "./format";
import { ScareLevel } from "./scare-level";

type Props = {
  story: ArchiveStory | null;
  listened: boolean;
  favourite: boolean;
  onToggleListened: () => void;
  onToggleFavourite: () => void;
  onClose: () => void;
};

export function StoryDialog({ story, listened, favourite, onToggleListened, onToggleFavourite, onClose }: Props) {
  return (
    <Dialog open={story !== null} onOpenChange={(open) => !open && onClose()}>
      {story && (
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl leading-snug">{story.displayTitle}</DialogTitle>
            <DialogDescription asChild>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <ScareLevel level={story.scareLevel} />
                <span>ออกอากาศ {formatThaiDate(story.broadcastDate)}</span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <p className="leading-relaxed whitespace-pre-line">{story.synopsis}</p>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            {story.storytellers.length > 0 && (
              <>
                <dt className="text-muted-foreground">ผู้เล่า</dt>
                <dd>{story.storytellers.map((s) => s.name).join(", ")}</dd>
              </>
            )}
            <dt className="text-muted-foreground">จังหวัด</dt>
            <dd>{story.province ?? "ไม่ระบุ"}</dd>
            {story.place && (
              <>
                <dt className="text-muted-foreground">สถานที่</dt>
                <dd>{story.place}</dd>
              </>
            )}
          </dl>

          {story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {story.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              <Button variant={listened ? "secondary" : "outline"} onClick={onToggleListened} aria-pressed={listened}>
                <CheckIcon /> {listened ? "ฟังแล้ว" : "ทำเครื่องหมายว่าฟังแล้ว"}
              </Button>
              <Button
                variant={favourite ? "secondary" : "outline"}
                size="icon"
                onClick={onToggleFavourite}
                aria-pressed={favourite}
                aria-label={favourite ? "เอาออกจากเรื่องโปรด" : "เพิ่มในเรื่องโปรด"}
              >
                <HeartIcon className={favourite ? "fill-current text-rose-400" : undefined} />
              </Button>
            </div>
            <Button asChild size="lg">
              <a href={youTubeWatchUrl(story.youtubeId)} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon /> เปิดใน YouTube
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

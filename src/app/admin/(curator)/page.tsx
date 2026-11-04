import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoryRowActions } from "@/components/admin/story-row-actions";
import { formatThaiDate } from "@/components/archive/format";
import { requireCurator } from "@/lib/curator";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "draft", label: "ฉบับร่าง" },
  { value: "published", label: "เผยแพร่แล้ว" },
] as const;

export default async function AdminStoriesPage(props: PageProps<"/admin">) {
  const { supabase } = await requireCurator();
  const { status: rawStatus } = await props.searchParams;
  const status = rawStatus === "draft" || rawStatus === "published" ? rawStatus : "all";

  let query = supabase
    .from("stories")
    .select("id, display_title, status, added_at, broadcast_date, scare_level")
    .order("added_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);
  const { data: stories, error } = await query;
  if (error) throw error;

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-2xl font-bold">เรื่องในคลัง</h1>
        <div className="flex gap-1" role="group" aria-label="กรองตามสถานะ">
          {STATUS_FILTERS.map((f) => (
            <Button key={f.value} asChild size="sm" variant={status === f.value ? "secondary" : "ghost"}>
              <Link href={f.value === "all" ? "/admin" : `/admin?status=${f.value}`}>{f.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {stories.length === 0 ? (
        <p className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">ยังไม่มีเรื่อง</p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {stories.map((story) => (
            <li key={story.id} className="flex flex-wrap items-center gap-3 p-3">
              <div className="grid min-w-0 flex-1 gap-1">
                <Link href={`/admin/stories/${story.id}`} className="truncate font-medium hover:underline">
                  {story.display_title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  เพิ่มเมื่อ {formatThaiDate(story.added_at.slice(0, 10))}
                  {story.broadcast_date && ` · ออกอากาศ ${formatThaiDate(story.broadcast_date)}`}
                  {story.scare_level && ` · ${"👻".repeat(story.scare_level)}`}
                </p>
              </div>
              <Badge
                variant={story.status === "published" ? "default" : "outline"}
                className={cn(story.status === "draft" && "text-muted-foreground")}
              >
                {story.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
              </Badge>
              <StoryRowActions storyId={story.id} status={story.status} title={story.display_title} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

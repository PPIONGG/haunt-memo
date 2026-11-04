import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { ArchiveStory } from "@/domain/archive";
import { createPublicClient } from "@/lib/supabase/public";

/** Cache tag for everything the public Archive page reads. Curator mutations expire it. */
export const ARCHIVE_CACHE_TAG = "archive";

export async function getPublishedArchive(): Promise<ArchiveStory[]> {
  "use cache";
  cacheTag(ARCHIVE_CACHE_TAG);
  cacheLife("days");

  const { data, error } = await createPublicClient()
    .from("stories")
    .select(
      "id, youtube_id, display_title, synopsis, scare_level, broadcast_date, added_at, province, place, tags(id, name), storytellers(id, name)",
    )
    .eq("status", "published")
    .order("added_at", { ascending: false });
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    youtubeId: row.youtube_id,
    displayTitle: row.display_title,
    synopsis: row.synopsis,
    scareLevel: row.scare_level!,
    broadcastDate: row.broadcast_date!,
    addedAt: row.added_at,
    province: row.province,
    place: row.place,
    tags: row.tags,
    storytellers: row.storytellers,
  }));
}

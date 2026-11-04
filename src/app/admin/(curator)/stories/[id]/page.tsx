import { notFound } from "next/navigation";
import { StoryForm, type StoryFormValues } from "@/components/admin/story-form";
import { youTubeWatchUrl } from "@/domain/youtube";
import { requireCurator } from "@/lib/curator";
import { getCuratorVocabulary } from "@/lib/curator-vocabulary";

export default async function EditStoryPage(props: PageProps<"/admin/stories/[id]">) {
  const { id } = await props.params;
  const { supabase } = await requireCurator();
  const [{ data: story }, vocabulary] = await Promise.all([
    supabase
      .from("stories")
      .select("*, tags(name), storytellers(name)")
      .eq("id", id)
      .maybeSingle(),
    getCuratorVocabulary(),
  ]);
  if (!story) notFound();

  const initial: StoryFormValues = {
    youtubeUrl: youTubeWatchUrl(story.youtube_id),
    youtubeId: story.youtube_id,
    youtubeTitle: story.youtube_title,
    displayTitle: story.display_title,
    synopsis: story.synopsis,
    storytellers: story.storytellers.map((s) => s.name),
    province: story.province,
    place: story.place ?? "",
    tags: story.tags.map((t) => t.name),
    scareLevel: story.scare_level,
    broadcastDate: story.broadcast_date ?? "",
    status: story.status,
  };

  return (
    <section className="grid gap-6">
      <h1 className="font-heading text-2xl font-bold">แก้ไขเรื่อง</h1>
      <StoryForm
        storyId={story.id}
        initial={initial}
        existingTags={vocabulary.tags}
        existingStorytellers={vocabulary.storytellers}
      />
    </section>
  );
}

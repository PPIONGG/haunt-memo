import { EMPTY_STORY, StoryForm } from "@/components/admin/story-form";
import { getCuratorVocabulary } from "@/lib/curator-vocabulary";

export default async function NewStoryPage() {
  const { tags, storytellers } = await getCuratorVocabulary();

  return (
    <section className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">เพิ่มเรื่องใหม่</h1>
      <StoryForm storyId={null} initial={EMPTY_STORY} existingTags={tags} existingStorytellers={storytellers} />
    </section>
  );
}

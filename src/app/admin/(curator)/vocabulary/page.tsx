// Per-request: the page depends on the signed-in Curator.
export const instant = false;

import { VocabularyManager } from "@/components/admin/vocabulary-manager";
import { requireCurator } from "@/lib/curator";

export default async function VocabularyPage() {
  const { supabase } = await requireCurator();
  const [tags, storytellers] = await Promise.all([
    supabase.from("tags").select("id, name, story_tags(count)").order("name"),
    supabase.from("storytellers").select("id, name, story_storytellers(count)").order("name"),
  ]);
  if (tags.error) throw tags.error;
  if (storytellers.error) throw storytellers.error;

  return (
    <section className="grid gap-8">
      <h1 className="font-heading text-2xl font-semibold">แท็กและผู้เล่า</h1>
      <VocabularyManager
        kind="tags"
        title="แท็ก"
        entries={tags.data.map((t) => ({ id: t.id, name: t.name, stories: t.story_tags[0]?.count ?? 0 }))}
      />
      <VocabularyManager
        kind="storytellers"
        title="ผู้เล่า"
        entries={storytellers.data.map((s) => ({
          id: s.id,
          name: s.name,
          stories: s.story_storytellers[0]?.count ?? 0,
        }))}
      />
    </section>
  );
}

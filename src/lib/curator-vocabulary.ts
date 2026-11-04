import "server-only";
import type { VocabularyEntry } from "@/domain/gemini-draft";
import { requireCurator } from "@/lib/curator";

export async function getCuratorVocabulary(): Promise<{ tags: VocabularyEntry[]; storytellers: VocabularyEntry[] }> {
  const { supabase } = await requireCurator();
  const [tags, storytellers] = await Promise.all([
    supabase.from("tags").select("id, name").order("name"),
    supabase.from("storytellers").select("id, name").order("name"),
  ]);
  if (tags.error) throw tags.error;
  if (storytellers.error) throw storytellers.error;
  return { tags: tags.data, storytellers: storytellers.data };
}

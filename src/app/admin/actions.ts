"use server";

import { updateTag } from "next/cache";
import { isProvince } from "@/domain/provinces";
import { parseYouTubeUrl, youTubeWatchUrl } from "@/domain/youtube";
import { ARCHIVE_CACHE_TAG } from "@/lib/archive-data";
import { requireCurator } from "@/lib/curator";
import type { Database } from "@/lib/supabase/database.types";
import type { PostgrestError } from "@supabase/supabase-js";

type SaveStoryArgs = Database["public"]["Functions"]["save_story"]["Args"];

export type ActionResult<T = void> = { ok: true; value: T } | { ok: false; error: string };

export type StoryStatus = "draft" | "published";

export type StoryInput = {
  id: string | null;
  youtubeId: string;
  youtubeTitle: string;
  displayTitle: string;
  synopsis: string;
  scareLevel: number | null;
  broadcastDate: string | null;
  province: string | null;
  place: string | null;
  tags: string[];
  storytellers: string[];
  status: StoryStatus;
};

export type YouTubeLookup = {
  youtubeId: string;
  title: string | null;
  duplicate: { id: string; displayTitle: string } | null;
};

export async function lookupYouTube(url: string, editingStoryId: string | null): Promise<ActionResult<YouTubeLookup>> {
  const { supabase } = await requireCurator();
  const youtubeId = parseYouTubeUrl(url);
  if (!youtubeId) return { ok: false, error: "ลิงก์นี้ไม่ใช่คลิป YouTube" };

  const [title, { data: existing }] = await Promise.all([
    fetchYouTubeTitle(youtubeId),
    supabase.from("stories").select("id, display_title").eq("youtube_id", youtubeId).maybeSingle(),
  ]);
  const duplicate =
    existing && existing.id !== editingStoryId ? { id: existing.id, displayTitle: existing.display_title } : null;
  return { ok: true, value: { youtubeId, title, duplicate } };
}

export async function saveStory(input: StoryInput): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireCurator();
  const invalid = validateStory(input);
  if (invalid) return { ok: false, error: invalid };

  const args = {
    p_id: input.id,
    p_youtube_id: input.youtubeId,
    p_youtube_title: input.youtubeTitle.trim(),
    p_display_title: input.displayTitle.trim(),
    p_synopsis: input.synopsis.trim(),
    p_scare_level: input.scareLevel,
    p_broadcast_date: input.broadcastDate,
    p_province: input.province,
    p_place: input.place?.trim() || null,
    p_status: input.status,
    p_tags: input.tags,
    p_storytellers: input.storytellers,
  };
  // Generated types mark every function argument non-null, but save_story takes nulls for unset fields.
  const { data: id, error } = await supabase.rpc("save_story", args as SaveStoryArgs);
  if (error) return { ok: false, error: describeError(error) };

  updateTag(ARCHIVE_CACHE_TAG);
  return { ok: true, value: { id } };
}

export async function setStoryStatus(id: string, status: StoryStatus): Promise<ActionResult> {
  const { supabase } = await requireCurator();
  const { error } = await supabase.from("stories").update({ status }).eq("id", id);
  if (error) return { ok: false, error: describeError(error) };
  updateTag(ARCHIVE_CACHE_TAG);
  return { ok: true, value: undefined };
}

export async function deleteStory(id: string): Promise<ActionResult> {
  const { supabase } = await requireCurator();
  const { error } = await supabase.from("stories").delete().eq("id", id);
  if (error) return { ok: false, error: describeError(error) };
  updateTag(ARCHIVE_CACHE_TAG);
  return { ok: true, value: undefined };
}

export type VocabularyKind = "tags" | "storytellers";

export async function renameVocabulary(kind: VocabularyKind, id: string, name: string): Promise<ActionResult> {
  const { supabase } = await requireCurator();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "ชื่อต้องไม่ว่าง" };
  const { error } = await supabase.from(kind).update({ name: trimmed }).eq("id", id);
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "มีชื่อนี้อยู่แล้ว ใช้การรวมแทน" : describeError(error),
    };
  }
  updateTag(ARCHIVE_CACHE_TAG);
  return { ok: true, value: undefined };
}

export async function mergeVocabulary(kind: VocabularyKind, sourceId: string, targetId: string): Promise<ActionResult> {
  const { supabase } = await requireCurator();
  const args = { p_source: sourceId, p_target: targetId };
  const { error } =
    kind === "tags" ? await supabase.rpc("merge_tags", args) : await supabase.rpc("merge_storytellers", args);
  if (error) return { ok: false, error: describeError(error) };
  updateTag(ARCHIVE_CACHE_TAG);
  return { ok: true, value: undefined };
}

function validateStory(input: StoryInput): string | null {
  if (!parseYouTubeUrl(youTubeWatchUrl(input.youtubeId))) return "ไม่มีคลิป YouTube ที่ถูกต้อง";
  if (!input.youtubeTitle.trim()) return "ต้องมีชื่อคลิป YouTube";
  if (!input.displayTitle.trim()) return "ต้องมีชื่อเรื่อง";
  if (input.province !== null && !isProvince(input.province)) return "จังหวัดไม่ถูกต้อง";
  if (input.scareLevel !== null && ![1, 2, 3, 4, 5].includes(input.scareLevel)) return "ระดับความน่ากลัวต้องอยู่ระหว่าง 1–5";
  if (input.broadcastDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(input.broadcastDate)) return "วันที่ออกอากาศไม่ถูกต้อง";
  if (input.status === "published") {
    if (!input.synopsis.trim()) return "ต้องมีเรื่องย่อก่อนเผยแพร่";
    if (input.scareLevel === null) return "ต้องกำหนดระดับความน่ากลัวก่อนเผยแพร่";
    if (input.broadcastDate === null) return "ต้องกรอกวันที่ออกอากาศก่อนเผยแพร่";
  }
  return null;
}

function describeError(error: PostgrestError): string {
  if (error.code === "23505") return "คลิปนี้อยู่ในคลังแล้ว";
  if (error.code === "23514" && error.message.includes("published_story_is_complete")) {
    return "ต้องมีเรื่องย่อ ระดับความน่ากลัว และวันที่ออกอากาศก่อนเผยแพร่";
  }
  if (error.code === "42501") return "ไม่มีสิทธิ์ทำรายการนี้";
  return `บันทึกไม่สำเร็จ: ${error.message}`;
}

async function fetchYouTubeTitle(youtubeId: string): Promise<string | null> {
  const endpoint = new URL("https://www.youtube.com/oembed");
  endpoint.searchParams.set("url", youTubeWatchUrl(youtubeId));
  endpoint.searchParams.set("format", "json");
  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const body = (await response.json()) as { title?: unknown };
    return typeof body.title === "string" ? body.title : null;
  } catch {
    return null;
  }
}

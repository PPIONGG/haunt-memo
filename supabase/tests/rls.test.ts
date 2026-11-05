import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PROVINCES } from "@/domain/provinces";
import { allowCurator, anonClient, resetArchive, serviceClient, signedInClient } from "./local-supabase";

const CURATOR_EMAIL = "curator@haunt-memo.test";
const STRANGER_EMAIL = "stranger@haunt-memo.test";
const UNCLAIMED_CURATOR_EMAIL = "allowlisted-without-account@haunt-memo.test";

const PUBLISHED_ID = "pubAAAAAAAA";
const DRAFT_ID = "draftBBBBBB";

function storyRow(youtubeId: string, status: "draft" | "published") {
  return {
    youtube_id: youtubeId,
    youtube_title: `clip ${youtubeId}`,
    display_title: `เรื่อง ${youtubeId}`,
    synopsis: "พยาบาลเวรดึกได้ยินเสียงเรียกชื่อ",
    scare_level: 3,
    broadcast_date: "2024-01-01",
    status,
  };
}

type Seeded = { publishedStoryId: string; draftStoryId: string; publicTagId: string; draftOnlyTagId: string };
let seeded: Seeded;

async function seedArchive(): Promise<Seeded> {
  const db = serviceClient();
  const { data: stories } = await db
    .from("stories")
    .insert([storyRow(PUBLISHED_ID, "published"), storyRow(DRAFT_ID, "draft")])
    .select("id, status")
    .throwOnError();
  const publishedStoryId = stories!.find((s) => s.status === "published")!.id;
  const draftStoryId = stories!.find((s) => s.status === "draft")!.id;

  const { data: tags } = await db.from("tags").insert([{ name: "โรงพยาบาล" }, { name: "ทหาร" }]).select().throwOnError();
  const { data: tellers } = await db
    .from("storytellers")
    .insert([{ name: "คุณสมชาย" }, { name: "พี่หนึ่ง" }])
    .select()
    .throwOnError();
  await db
    .from("story_tags")
    .insert([
      { story_id: publishedStoryId, tag_id: tags![0].id },
      { story_id: draftStoryId, tag_id: tags![1].id },
    ])
    .throwOnError();
  await db
    .from("story_storytellers")
    .insert([
      { story_id: publishedStoryId, storyteller_id: tellers![0].id },
      { story_id: draftStoryId, storyteller_id: tellers![1].id },
    ])
    .throwOnError();
  return { publishedStoryId, draftStoryId, publicTagId: tags![0].id, draftOnlyTagId: tags![1].id };
}

async function archiveSnapshot() {
  const db = serviceClient();
  const tables = ["stories", "tags", "storytellers", "story_tags", "story_storytellers", "curator_allowlist"];
  const rows = await Promise.all(tables.map((t) => db.from(t).select("*").throwOnError()));
  const sortRows = (data: unknown[]) => data.map((r) => JSON.stringify(r)).sort();
  return Object.fromEntries(tables.map((t, i) => [t, sortRows(rows[i].data!)]));
}

async function storyCount(): Promise<number> {
  const { count } = await serviceClient().from("stories").select("*", { count: "exact", head: true });
  return count ?? 0;
}

let curator: SupabaseClient;
let stranger: SupabaseClient;

beforeAll(async () => {
  await allowCurator(CURATOR_EMAIL);
  await allowCurator(UNCLAIMED_CURATOR_EMAIL);
  curator = await signedInClient(CURATOR_EMAIL);
  stranger = await signedInClient(STRANGER_EMAIL);
});

beforeEach(async () => {
  await resetArchive();
  seeded = await seedArchive();
});

describe("an anonymous Fan", () => {
  it("sees Published Stories but not Drafts", async () => {
    const { data, error } = await anonClient().from("stories").select("youtube_id");

    expect(error).toBeNull();
    expect(data!.map((s) => s.youtube_id)).toEqual([PUBLISHED_ID]);
  });

  it("sees only the Tags and Storytellers of Published Stories", async () => {
    const fan = anonClient();
    const { data: tags } = await fan.from("tags").select("name");
    const { data: tellers } = await fan.from("storytellers").select("name");
    const { data: tagLinks } = await fan.from("story_tags").select("story_id");

    expect(tags!.map((t) => t.name)).toEqual(["โรงพยาบาล"]);
    expect(tellers!.map((t) => t.name)).toEqual(["คุณสมชาย"]);
    expect(tagLinks).toEqual([{ story_id: seeded.publishedStoryId }]);
  });

  it("can't read the Curator allowlist", async () => {
    const { data } = await anonClient().from("curator_allowlist").select("email");

    expect(data).toEqual([]);
  });
});

describe("sign-up", () => {
  it("is closed, so nobody can claim an allowlisted email that has no account yet", async () => {
    const { data, error } = await anonClient().auth.signUp({
      email: UNCLAIMED_CURATOR_EMAIL,
      password: "a-long-enough-password",
    });

    expect(error).not.toBeNull();
    expect(data.session).toBeNull();
  });
});

describe.each([
  ["an anonymous Fan", () => anonClient()],
  ["a signed-in non-Curator", () => stranger],
])("%s", (_who, client) => {
  it("can't insert into any table", async () => {
    const db = client();
    const attempts = await Promise.all([
      db.from("stories").insert(storyRow("newCCCCCCCC", "published")),
      db.from("tags").insert({ name: "ใหม่" }),
      db.from("storytellers").insert({ name: "ใหม่" }),
      db.from("story_tags").insert({ story_id: seeded.publishedStoryId, tag_id: seeded.draftOnlyTagId }),
      db.from("story_storytellers").insert({ story_id: seeded.draftStoryId, storyteller_id: seeded.publicTagId }),
      db.from("curator_allowlist").insert({ email: "sneaky@haunt-memo.test" }),
    ]);

    for (const { error } of attempts) expect(error).not.toBeNull();
    expect(await storyCount()).toBe(2);
  });

  it("can't update or delete any table", async () => {
    const db = client();
    const before = await archiveSnapshot();
    await db.from("stories").update({ status: "published" }).eq("id", seeded.draftStoryId);
    await db.from("stories").update({ display_title: "ถูกแก้" }).eq("id", seeded.publishedStoryId);
    await db.from("tags").update({ name: "ถูกแก้" }).eq("id", seeded.publicTagId);
    await db.from("storytellers").update({ name: "ถูกแก้" }).not("id", "is", null);
    await db.from("story_tags").update({ tag_id: seeded.draftOnlyTagId }).eq("story_id", seeded.publishedStoryId);
    await db.from("story_tags").delete().eq("story_id", seeded.publishedStoryId);
    await db.from("story_storytellers").delete().eq("story_id", seeded.publishedStoryId);
    await db.from("stories").delete().eq("id", seeded.publishedStoryId);
    await db.from("tags").delete().eq("id", seeded.publicTagId);
    await db.from("storytellers").delete().not("id", "is", null);
    await db.from("curator_allowlist").delete().eq("email", CURATOR_EMAIL);

    expect(await archiveSnapshot()).toEqual(before);
  });

  it("can't save Stories or merge Tags through the database functions", async () => {
    const db = client();
    const save = await db.rpc("save_story", saveArgs({ youtube_id: "newCCCCCCCC" }));
    const merge = await db.rpc("merge_tags", { p_source: seeded.draftOnlyTagId, p_target: seeded.publicTagId });

    expect(save.error).not.toBeNull();
    expect(merge.error).not.toBeNull();
    expect(await storyCount()).toBe(2);
  });
});

describe("a signed-in non-Curator", () => {
  it("can't read Drafts", async () => {
    const { data } = await stranger.from("stories").select("youtube_id");

    expect(data!.map((s) => s.youtube_id)).toEqual([PUBLISHED_ID]);
  });
});

describe("the Curator", () => {
  it("reads Drafts and every Tag", async () => {
    const { data: stories } = await curator.from("stories").select("youtube_id").order("youtube_id");
    const { data: tags } = await curator.from("tags").select("name").order("name");

    expect(stories!.map((s) => s.youtube_id)).toEqual([DRAFT_ID, PUBLISHED_ID]);
    expect(tags!.map((t) => t.name)).toEqual(["ทหาร", "โรงพยาบาล"]);
  });

  it("inserts, updates, and deletes on every table", async () => {
    const { data: story } = await curator
      .from("stories")
      .insert(storyRow("newCCCCCCCC", "draft"))
      .select()
      .single()
      .throwOnError();
    const { data: tag } = await curator.from("tags").insert({ name: "ผีบ้าน" }).select().single().throwOnError();
    const { data: teller } = await curator.from("storytellers").insert({ name: "ป้าแดง" }).select().single().throwOnError();
    await curator.from("story_tags").insert({ story_id: story!.id, tag_id: tag!.id }).throwOnError();
    await curator.from("story_storytellers").insert({ story_id: story!.id, storyteller_id: teller!.id }).throwOnError();

    await curator.from("stories").update({ status: "published" }).eq("id", story!.id).throwOnError();
    await curator.from("tags").update({ name: "ผีในบ้าน" }).eq("id", tag!.id).throwOnError();
    await curator.from("storytellers").update({ name: "ป้าแดงจ๋า" }).eq("id", teller!.id).throwOnError();

    const { data: published } = await anonClient().from("stories").select("youtube_id").eq("id", story!.id);
    expect(published).toEqual([{ youtube_id: "newCCCCCCCC" }]);

    await curator.from("story_tags").delete().eq("story_id", story!.id).throwOnError();
    await curator.from("story_storytellers").delete().eq("story_id", story!.id).throwOnError();
    await curator.from("tags").delete().eq("id", tag!.id).throwOnError();
    await curator.from("storytellers").delete().eq("id", teller!.id).throwOnError();
    await curator.from("stories").delete().eq("id", story!.id).throwOnError();

    expect(await storyCount()).toBe(2);
  });

  it("saves a Story with its Tags and Storytellers, reusing existing ones by name", async () => {
    const { data: id, error } = await curator.rpc(
      "save_story",
      saveArgs({ p_tags: [" โรงพยาบาล ", "ผีบ้าน"], p_storytellers: ["คุณสมชาย", "ป้าแดง"] }),
    );
    expect(error).toBeNull();

    const { data } = await curator
      .from("stories")
      .select("display_title, tags(name), storytellers(name)")
      .eq("id", id)
      .single();
    expect(data!.display_title).toBe("ยายกลับมาเยี่ยมบ้าน");
    expect(data!.tags.map((t: { name: string }) => t.name).sort()).toEqual(["ผีบ้าน", "โรงพยาบาล"]);
    expect(data!.storytellers.map((s: { name: string }) => s.name).sort()).toEqual(["คุณสมชาย", "ป้าแดง"]);
    const { count } = await curator.from("tags").select("*", { count: "exact", head: true });
    expect(count).toBe(3);
  });

  it("re-saving a Story replaces its Tags and Storytellers", async () => {
    const { data: id } = await curator.rpc("save_story", saveArgs({ p_tags: ["โรงพยาบาล"] }));
    await curator.rpc("save_story", saveArgs({ p_id: id, p_tags: ["ทหาร"], p_storytellers: [] })).throwOnError();

    const { data } = await curator.from("stories").select("tags(name), storytellers(name)").eq("id", id).single();
    expect(data).toEqual({ tags: [{ name: "ทหาร" }], storytellers: [] });
  });

  it("merges one Tag into another, keeping every Story's link", async () => {
    await curator
      .rpc("merge_tags", { p_source: seeded.draftOnlyTagId, p_target: seeded.publicTagId })
      .throwOnError();

    const { data: tags } = await curator.from("tags").select("id");
    const { data: links } = await curator.from("story_tags").select("story_id, tag_id").order("story_id");
    expect(tags).toEqual([{ id: seeded.publicTagId }]);
    expect(links!.map((l) => l.tag_id)).toEqual([seeded.publicTagId, seeded.publicTagId]);
  });

  it("merges Storytellers even when a Story already links both", async () => {
    const { data: tellers } = await curator.from("storytellers").select("id, name");
    const somchai = tellers!.find((t) => t.name === "คุณสมชาย")!.id;
    const nueng = tellers!.find((t) => t.name === "พี่หนึ่ง")!.id;
    await curator.from("story_storytellers").insert({ story_id: seeded.draftStoryId, storyteller_id: somchai }).throwOnError();

    await curator.rpc("merge_storytellers", { p_source: nueng, p_target: somchai }).throwOnError();

    const { data: links } = await curator.from("story_storytellers").select("storyteller_id");
    expect(links!.map((l) => l.storyteller_id)).toEqual([somchai, somchai]);
  });
});

describe("Story constraints", () => {
  const insert = (overrides: Record<string, unknown>) =>
    serviceClient().from("stories").insert({ ...storyRow("newCCCCCCCC", "draft"), ...overrides });

  it("accepts every one of the 77 Provinces", async () => {
    const rows = PROVINCES.map((province, i) => ({
      ...storyRow(`prov${String(i).padStart(7, "0")}`, "draft"),
      province,
    }));

    expect(PROVINCES).toHaveLength(77);
    expect((await serviceClient().from("stories").insert(rows)).error).toBeNull();
  });

  it("rejects a Province that isn't one of the 77", async () => {
    expect((await insert({ province: "เชียงใหม" })).error).not.toBeNull();
  });

  it("accepts an empty Province", async () => {
    expect((await insert({ province: null })).error).toBeNull();
  });

  it.each([0, 6])("rejects Scare Level %i", async (scare_level) => {
    expect((await insert({ scare_level })).error).not.toBeNull();
  });

  it("rejects a duplicate YouTube clip", async () => {
    expect((await insert({ youtube_id: PUBLISHED_ID })).error).not.toBeNull();
  });

  it("allows an unfinished Draft but not an unfinished Published Story", async () => {
    const unfinished = { scare_level: null, broadcast_date: null, synopsis: "" };

    expect((await insert(unfinished)).error).toBeNull();
    expect(
      (await insert({ ...unfinished, youtube_id: "newDDDDDDDD", status: "published" })).error,
    ).not.toBeNull();
  });
});

function saveArgs(overrides: Record<string, unknown> = {}) {
  return {
    p_id: null,
    p_youtube_id: "newCCCCCCCC",
    p_youtube_title: "ยายกลับมา | The Ghost Radio",
    p_display_title: "ยายกลับมาเยี่ยมบ้าน",
    p_synopsis: "หลังงานศพยาย หลานสาวได้กลิ่นหมากในห้องนอนทุกคืน",
    p_scare_level: 4,
    p_broadcast_date: "2022-02-02",
    p_province: "เชียงใหม่",
    p_place: null,
    p_status: "draft",
    p_tags: [],
    p_storytellers: [],
    ...overrides,
  };
}

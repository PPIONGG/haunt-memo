import { describe, expect, it } from "vitest";
import type { ArchiveStory, FanState } from "./archive";
import { featuredStory, homeShelves, relatedStories } from "./shelves";

const hospital = { id: "tag-hospital", name: "โรงพยาบาล" };
const house = { id: "tag-house", name: "ผีบ้าน" };
const road = { id: "tag-road", name: "ถนน" };
const noFanState: FanState = { listened: new Set(), favourites: new Set() };

function story(id: string, day: number, overrides: Partial<ArchiveStory> = {}): ArchiveStory {
  return {
    id,
    youtubeId: "dQw4w9WgXcQ",
    displayTitle: id,
    synopsis: "",
    scareLevel: 3,
    broadcastDate: "2024-01-01",
    addedAt: `2025-01-${String(day).padStart(2, "0")}T00:00:00Z`,
    province: null,
    place: null,
    tags: [],
    storytellers: [],
    ...overrides,
  };
}

const s1 = story("s1", 1, { tags: [house], scareLevel: 5, province: "นนทบุรี" });
const s2 = story("s2", 2, { tags: [house, hospital], scareLevel: 2 });
const s3 = story("s3", 3, { tags: [hospital], scareLevel: 4, province: "เชียงใหม่" });
const s4 = story("s4", 4, { tags: [house], scareLevel: 4, province: "เชียงใหม่" });
const s5 = story("s5", 5, { tags: [road], scareLevel: 1, province: "เชียงใหม่" });
const archive = [s1, s2, s3, s4, s5];
const ids = (stories: ArchiveStory[]) => stories.map((s) => s.id);

describe("featuredStory", () => {
  it("is the newest Story by Added Date", () => {
    expect(featuredStory(archive)?.id).toBe("s5");
    expect(featuredStory([])).toBeNull();
  });
});

describe("homeShelves", () => {
  it("starts with the newest Stories after the featured one, for a Fan who hasn't listened yet", () => {
    const [first] = homeShelves(archive, noFanState);
    expect(first).toMatchObject({ id: "newest", title: "เพิ่มล่าสุด" });
    expect(ids(first.stories)).toEqual(["s4", "s3", "s2", "s1"]);
  });

  it("switches the first shelf to unlistened Stories once the Fan has listened to one", () => {
    const [first] = homeShelves(archive, { listened: new Set(["s3"]), favourites: new Set() });
    expect(first).toMatchObject({ id: "unlistened", title: "ยังไม่ได้ฟัง" });
    expect(ids(first.stories)).toEqual(["s4", "s2", "s1"]);
  });

  it("adds a shelf per Tag with at least two Stories, biggest first", () => {
    const tagShelves = homeShelves(archive, noFanState).filter((s) => s.id.startsWith("tag:"));
    expect(tagShelves.map((s) => [s.title, ids(s.stories)])).toEqual([
      ["ผีบ้าน", ["s4", "s2", "s1"]],
      ["โรงพยาบาล", ["s3", "s2"]],
    ]);
  });

  it("ends with the scariest Stories, Scare Level 4 and up", () => {
    const shelves = homeShelves(archive, noFanState);
    const last = shelves[shelves.length - 1];
    expect(last.id).toBe("scariest");
    expect(ids(last.stories)).toEqual(["s1", "s4", "s3"]);
  });

  it("caps shelves and the number of Tag shelves", () => {
    const shelves = homeShelves(archive, noFanState, { maxPerShelf: 2, maxTagShelves: 1 });
    expect(shelves.every((s) => s.stories.length <= 2)).toBe(true);
    expect(shelves.filter((s) => s.id.startsWith("tag:"))).toHaveLength(1);
  });

  it("returns no shelves for an empty Archive", () => {
    expect(homeShelves([], noFanState)).toEqual([]);
  });
});

describe("relatedStories", () => {
  it("suggests other Stories from the same Province, newest first", () => {
    expect(relatedStories(s3, archive)).toEqual({ title: "เรื่องอื่นในเชียงใหม่", stories: [s5, s4] });
  });

  it("falls back to Stories that share a Tag", () => {
    expect(relatedStories(s2, archive)).toEqual({ title: "เรื่องที่คล้ายกัน", stories: [s4, s3, s1] });
  });

  it("returns an empty list when nothing is related", () => {
    expect(relatedStories(story("lonely", 9, { tags: [{ id: "x", name: "x" }] }), archive).stories).toEqual([]);
  });
});

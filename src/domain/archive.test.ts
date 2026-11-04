import { describe, expect, it } from "vitest";
import { pickRandomStory, queryArchive, type ArchiveCriteria, type ArchiveSort, type ArchiveStory, type FanState } from "./archive";

const hospital = { id: "tag-hospital", name: "โรงพยาบาล" };
const house = { id: "tag-house", name: "ผีบ้าน" };
const military = { id: "tag-military", name: "ทหาร" };
const somchai = { id: "st-somchai", name: "คุณสมชาย" };
const nueng = { id: "st-nueng", name: "พี่หนึ่ง" };

function story(overrides: Partial<ArchiveStory> & Pick<ArchiveStory, "id">): ArchiveStory {
  return {
    youtubeId: "dQw4w9WgXcQ",
    displayTitle: "เรื่องเล่า",
    synopsis: "",
    scareLevel: 3,
    broadcastDate: "2024-01-01",
    addedAt: "2025-01-01T00:00:00Z",
    province: null,
    place: null,
    tags: [],
    storytellers: [],
    ...overrides,
  };
}

const ward = story({
  id: "ward",
  displayTitle: "เสียงเรียกจากตึกผู้ป่วยเก่า",
  synopsis: "พยาบาลเวรดึกได้ยินเสียงเรียกชื่อจากตึกที่ปิดไปแล้ว",
  scareLevel: 5,
  broadcastDate: "2023-06-10",
  addedAt: "2025-03-01T10:00:00Z",
  province: "เชียงใหม่",
  place: "โรงพยาบาลนครพิงค์",
  tags: [hospital],
  storytellers: [somchai],
});
const camp = story({
  id: "camp",
  displayTitle: "ยามดึกในค่ายทหาร",
  synopsis: "ทหารเกณฑ์เข้าเวรยามคนเดียวแล้วเห็นเงาคนเดินตรวจแถวค่าย",
  scareLevel: 2,
  broadcastDate: "2024-11-20",
  addedAt: "2025-01-15T10:00:00Z",
  province: "ลพบุรี",
  place: null,
  tags: [military],
  storytellers: [nueng],
});
const grandma = story({
  id: "grandma",
  displayTitle: "ยายกลับมาเยี่ยมบ้าน",
  synopsis: "หลังงานศพยาย หลานสาวได้กลิ่นหมากในห้องนอนทุกคืน",
  scareLevel: 4,
  broadcastDate: "2022-02-02",
  addedAt: "2025-02-01T10:00:00Z",
  province: "เชียงใหม่",
  place: "หมู่บ้านในอำเภอสันทราย",
  tags: [house, hospital],
  storytellers: [nueng, somchai],
});

const stories = [camp, ward, grandma];
const noFanState: FanState = { listened: new Set(), favourites: new Set() };
const ids = (result: { stories: ArchiveStory[] }) => result.stories.map((s) => s.id);

describe("queryArchive", () => {
  it("returns every Story newest-added first, with the total, when there are no criteria", () => {
    const result = queryArchive(stories, {}, noFanState);

    expect(ids(result)).toEqual(["ward", "grandma", "camp"]);
    expect(result.total).toBe(3);
  });

  describe("text search", () => {
    const search = (text: string) => ids(queryArchive(stories, { text }, noFanState));

    it("matches part of a Thai Display Title without word segmentation", () => {
      expect(search("ค่ายทหาร")).toEqual(["camp"]);
    });

    it("matches words inside the Synopsis", () => {
      expect(search("กลิ่นหมาก")).toEqual(["grandma"]);
    });

    it("matches Storyteller names", () => {
      expect(search("พี่หนึ่ง")).toEqual(["grandma", "camp"]);
    });

    it("matches the Place", () => {
      expect(search("นครพิงค์")).toEqual(["ward"]);
    });

    it("tolerates a small typo", () => {
      expect(search("กลิ่นหมกในห้อง")).toEqual(["grandma"]);
    });

    it("requires every space-separated word to match", () => {
      expect(search("ยาย หลานสาว")).toEqual(["grandma"]);
      expect(search("ยาย ทหารเกณฑ์")).toEqual([]);
    });

    it("finds nothing for unrelated text", () => {
      expect(search("ฉลามยักษ์")).toEqual([]);
    });

    it("ignores a blank query", () => {
      expect(search("   ")).toHaveLength(3);
    });
  });

  describe("filters", () => {
    const filter = (criteria: ArchiveCriteria, fanState = noFanState) =>
      ids(queryArchive(stories, criteria, fanState));

    it("keeps Stories with any of the chosen Tags", () => {
      expect(filter({ tagIds: ["tag-house"] })).toEqual(["grandma"]);
      expect(filter({ tagIds: ["tag-house", "tag-military"] })).toEqual(["grandma", "camp"]);
    });

    it("keeps Stories told by any of the chosen Storytellers", () => {
      expect(filter({ storytellerIds: ["st-somchai"] })).toEqual(["ward", "grandma"]);
    });

    it("keeps Stories from the chosen Province", () => {
      expect(filter({ province: "ลพบุรี" })).toEqual(["camp"]);
    });

    it("keeps Stories within a Scare Level range, inclusive", () => {
      expect(filter({ scareLevel: { min: 4 } })).toEqual(["ward", "grandma"]);
      expect(filter({ scareLevel: { min: 2, max: 4 } })).toEqual(["grandma", "camp"]);
    });

    it("keeps Stories within a Broadcast Date range, inclusive", () => {
      expect(filter({ broadcastDate: { from: "2023-06-10" } })).toEqual(["ward", "camp"]);
      expect(filter({ broadcastDate: { to: "2023-06-10" } })).toEqual(["ward", "grandma"]);
      expect(filter({ broadcastDate: { from: "2023-01-01", to: "2023-12-31" } })).toEqual(["ward"]);
    });

    it("filters by listened marks", () => {
      const fanState: FanState = { listened: new Set(["ward"]), favourites: new Set() };

      expect(filter({ listened: "unlistened" }, fanState)).toEqual(["grandma", "camp"]);
      expect(filter({ listened: "listened" }, fanState)).toEqual(["ward"]);
      expect(filter({ listened: "all" }, fanState)).toHaveLength(3);
    });

    it("keeps only favourites when asked", () => {
      const fanState: FanState = { listened: new Set(), favourites: new Set(["camp", "grandma"]) };

      expect(filter({ favouritesOnly: true }, fanState)).toEqual(["grandma", "camp"]);
    });

    it("combines search and every filter", () => {
      const fanState: FanState = { listened: new Set(["ward"]), favourites: new Set() };
      const criteria: ArchiveCriteria = {
        text: "ยาย",
        tagIds: ["tag-hospital"],
        province: "เชียงใหม่",
        scareLevel: { min: 4 },
      };

      expect(filter(criteria, fanState)).toEqual(["grandma"]);
      expect(filter({ ...criteria, listened: "listened" }, fanState)).toEqual([]);
    });

    it("reports an empty result with a zero total", () => {
      expect(queryArchive(stories, { province: "ภูเก็ต" }, noFanState)).toEqual({ stories: [], total: 0 });
    });
  });

  describe("sort", () => {
    const sortBy = (sort: ArchiveSort) => ids(queryArchive(stories, { sort }, noFanState));

    it.each<[ArchiveSort, string[]]>([
      ["added_desc", ["ward", "grandma", "camp"]],
      ["broadcast_desc", ["camp", "ward", "grandma"]],
      ["broadcast_asc", ["grandma", "ward", "camp"]],
      ["scare_desc", ["ward", "grandma", "camp"]],
      ["scare_asc", ["camp", "grandma", "ward"]],
    ])("orders by %s", (sort, expected) => {
      expect(sortBy(sort)).toEqual(expected);
    });

    it("breaks Scare Level ties by newest Added Date", () => {
      const tied = [story({ id: "old", scareLevel: 3, addedAt: "2024-01-01T00:00:00Z" }), story({ id: "new", scareLevel: 3, addedAt: "2025-01-01T00:00:00Z" })];

      expect(ids(queryArchive(tied, { sort: "scare_desc" }, noFanState))).toEqual(["new", "old"]);
    });
  });

  it("doesn't reorder the caller's array", () => {
    const input = [...stories];
    queryArchive(input, { sort: "scare_asc" }, noFanState);

    expect(input.map((s) => s.id)).toEqual(["camp", "ward", "grandma"]);
  });
});

describe("pickRandomStory", () => {
  const fixed = (value: number) => () => value;

  it("picks within the current query result", () => {
    const fanState: FanState = { listened: new Set(["ward"]), favourites: new Set() };
    const criteria: ArchiveCriteria = { tagIds: ["tag-hospital"], listened: "unlistened" };

    for (const value of [0, 0.5, 0.999]) {
      expect(pickRandomStory(stories, criteria, fanState, fixed(value))?.id).toBe("grandma");
    }
  });

  it("returns null when nothing matches", () => {
    expect(pickRandomStory(stories, { province: "ภูเก็ต" }, noFanState, fixed(0.5))).toBeNull();
  });

  it("is deterministic for a given rng and can reach every matching Story", () => {
    const picks = [0, 0.4, 0.9].map((v) => pickRandomStory(stories, {}, noFanState, fixed(v))?.id);

    expect(picks).toEqual(["ward", "grandma", "camp"]);
  });
});

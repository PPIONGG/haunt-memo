import { describe, expect, it } from "vitest";
import { hasUnsavedChanges } from "./unsaved-changes";

const NEW_STORY = {
  youtubeUrl: "",
  youtubeId: null as string | null,
  displayTitle: "",
  synopsis: "",
  tags: [] as string[],
  scareLevel: null as number | null,
  broadcastDate: "",
};

const SAVED_STORY = {
  ...NEW_STORY,
  youtubeUrl: "https://youtu.be/jNQXAC9IVRw",
  youtubeId: "jNQXAC9IVRw",
  displayTitle: "ธิติมา",
  tags: ["บ้านร้าง", "เรือนไทย"],
  scareLevel: 3,
  broadcastDate: "2024-02-04",
};

describe("hasUnsavedChanges", () => {
  it("is false for an untouched new Story", () => {
    expect(hasUnsavedChanges(NEW_STORY, { ...NEW_STORY })).toBe(false);
  });

  it("is false for an untouched saved Story", () => {
    expect(hasUnsavedChanges(SAVED_STORY, { ...SAVED_STORY, tags: [...SAVED_STORY.tags] })).toBe(false);
  });

  it("is true once a YouTube link is pasted, even before fetching", () => {
    expect(hasUnsavedChanges(NEW_STORY, { ...NEW_STORY, youtubeUrl: "https://youtu.be/jNQXAC9IVRw" })).toBe(true);
  });

  it("is true when a field changes", () => {
    expect(hasUnsavedChanges(SAVED_STORY, { ...SAVED_STORY, synopsis: "เรื่องย่อใหม่" })).toBe(true);
    expect(hasUnsavedChanges(SAVED_STORY, { ...SAVED_STORY, scareLevel: 5 })).toBe(true);
    expect(hasUnsavedChanges(SAVED_STORY, { ...SAVED_STORY, broadcastDate: "" })).toBe(true);
  });

  it("is true when a Tag is added or removed", () => {
    expect(hasUnsavedChanges(SAVED_STORY, { ...SAVED_STORY, tags: ["บ้านร้าง"] })).toBe(true);
    expect(hasUnsavedChanges(SAVED_STORY, { ...SAVED_STORY, tags: [...SAVED_STORY.tags, "ทางเปลี่ยว"] })).toBe(true);
  });

  it("ignores the order of Tags", () => {
    expect(hasUnsavedChanges(SAVED_STORY, { ...SAVED_STORY, tags: ["เรือนไทย", "บ้านร้าง"] })).toBe(false);
  });

  it("ignores surrounding spaces and empty versus missing", () => {
    expect(hasUnsavedChanges(SAVED_STORY, { ...SAVED_STORY, displayTitle: "  ธิติมา " })).toBe(false);
    expect(hasUnsavedChanges(NEW_STORY, { ...NEW_STORY, synopsis: "   " })).toBe(false);
  });

  it("is true while a pasted Gemini reply hasn't been applied", () => {
    expect(hasUnsavedChanges(NEW_STORY, NEW_STORY, '{"display_title": "ธิติมา"}')).toBe(true);
    expect(hasUnsavedChanges(NEW_STORY, NEW_STORY, "  \n ")).toBe(false);
  });
});

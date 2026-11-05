import { describe, expect, it } from "vitest";
import { prefillFromClip, type ClipFields } from "./clip-prefill";

const EMPTY: ClipFields = { youtubeId: null, youtubeTitle: "", displayTitle: "", broadcastDate: "" };

const ZOO = { youtubeId: "jNQXAC9IVRw", title: "Me at the zoo", publishDate: "2005-04-24" };
const RICK = { youtubeId: "dQw4w9WgXcQ", title: "Never Gonna Give You Up", publishDate: "2009-10-25" };

/** The form after fetching `clip` into an empty form. */
function filledWith(clip: typeof ZOO) {
  return prefillFromClip(EMPTY, null, clip);
}

describe("prefillFromClip", () => {
  it("fills an empty form from the clip", () => {
    const result = filledWith(ZOO);

    expect(result.fields).toEqual({
      youtubeId: "jNQXAC9IVRw",
      youtubeTitle: "Me at the zoo",
      displayTitle: "Me at the zoo",
      broadcastDate: "2005-04-24",
    });
    expect(result.filledFrom).toBe("jNQXAC9IVRw");
    expect(result.warnings).toEqual([]);
  });

  describe("switching to a different clip", () => {
    it("replaces the Broadcast Date with the new clip's", () => {
      const first = filledWith(RICK);

      const second = prefillFromClip(first.fields, first.filledFrom, ZOO);

      expect(second.fields.broadcastDate).toBe("2005-04-24");
    });

    it("replaces a Broadcast Date the Curator typed for the old clip", () => {
      const first = filledWith(RICK);
      const corrected = { ...first.fields, broadcastDate: "2009-11-01" };

      const second = prefillFromClip(corrected, first.filledFrom, ZOO);

      expect(second.fields.broadcastDate).toBe("2005-04-24");
    });

    it("clears the old Broadcast Date when the new clip's date can't be fetched, and warns", () => {
      const first = filledWith(RICK);

      const second = prefillFromClip(first.fields, first.filledFrom, { ...ZOO, publishDate: null });

      expect(second.fields.broadcastDate).toBe("");
      expect(second.warnings).toContain("date_missing");
    });

    it("replaces a Display Title that was just the old clip's title", () => {
      const first = filledWith(RICK);

      const second = prefillFromClip(first.fields, first.filledFrom, ZOO);

      expect(second.fields.displayTitle).toBe("Me at the zoo");
      expect(second.fields.youtubeTitle).toBe("Me at the zoo");
    });

    it("keeps a Display Title the Curator wrote themselves", () => {
      const first = filledWith(RICK);
      const renamed = { ...first.fields, displayTitle: "ผีในสวนสัตว์" };

      const second = prefillFromClip(renamed, first.filledFrom, ZOO);

      expect(second.fields.displayTitle).toBe("ผีในสวนสัตว์");
    });

    it("clears the old YouTube title when the new clip's title can't be fetched, and warns", () => {
      const first = filledWith(RICK);

      const second = prefillFromClip(first.fields, first.filledFrom, { ...ZOO, title: null });

      expect(second.fields.youtubeTitle).toBe("");
      expect(second.fields.displayTitle).toBe("");
      expect(second.warnings).toContain("title_missing");
    });
  });

  describe("fetching the same clip again", () => {
    it("keeps a Broadcast Date the Curator corrected", () => {
      const first = filledWith(ZOO);
      const corrected = { ...first.fields, broadcastDate: "2005-05-01" };

      const again = prefillFromClip(corrected, first.filledFrom, ZOO);

      expect(again.fields.broadcastDate).toBe("2005-05-01");
      expect(again.warnings).toEqual([]);
    });

    it("keeps the fields when YouTube gives nothing back this time", () => {
      const first = filledWith(ZOO);

      const again = prefillFromClip(first.fields, first.filledFrom, { ...ZOO, title: null, publishDate: null });

      expect(again.fields).toEqual(first.fields);
      expect(again.warnings).toEqual(["title_missing"]);
    });
  });

  describe("editing a saved Story", () => {
    const saved: ClipFields = {
      youtubeId: "jNQXAC9IVRw",
      youtubeTitle: "Me at the zoo",
      displayTitle: "ผีในสวนสัตว์",
      broadcastDate: "2005-05-01",
    };

    it("keeps the saved date and title when re-fetching the saved clip", () => {
      const again = prefillFromClip(saved, saved.youtubeId, ZOO);

      expect(again.fields).toEqual(saved);
    });

    it("takes the new clip's date when the Story is moved to another clip", () => {
      const moved = prefillFromClip(saved, saved.youtubeId, RICK);

      expect(moved.fields.broadcastDate).toBe("2009-10-25");
      expect(moved.fields.displayTitle).toBe("ผีในสวนสัตว์");
    });
  });
});

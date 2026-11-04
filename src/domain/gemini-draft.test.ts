import { describe, expect, it } from "vitest";
import { buildGeminiPrompt, GEMINI_DRAFT_SCHEMA, parseGeminiDraft } from "./gemini-draft";
import { PROVINCES } from "./provinces";

const context = {
  existingTags: [
    { id: "tag-hospital", name: "โรงพยาบาล" },
    { id: "tag-house", name: "ผีบ้าน" },
  ],
  existingStorytellers: [{ id: "st-somchai", name: "คุณสมชาย" }],
  provinces: PROVINCES,
};

const validDraft = {
  display_title: "เสียงเรียกจากตึกเก่า",
  synopsis: "พยาบาลเวรดึกได้ยินเสียงเรียกชื่อจากตึกที่ปิดไปแล้ว เธอตัดสินใจเดินไปดู",
  storytellers: ["คุณสมชาย"],
  province: "เชียงใหม่",
  place: "โรงพยาบาลเก่าแห่งหนึ่ง",
  tags: ["โรงพยาบาล"],
};

describe("parseGeminiDraft", () => {
  it("prefills the form from a valid draft that only uses existing vocabulary", () => {
    const result = parseGeminiDraft(JSON.stringify(validDraft), context);

    expect(result).toEqual({
      ok: true,
      formValues: {
        displayTitle: "เสียงเรียกจากตึกเก่า",
        synopsis: "พยาบาลเวรดึกได้ยินเสียงเรียกชื่อจากตึกที่ปิดไปแล้ว เธอตัดสินใจเดินไปดู",
        storytellers: [{ id: "st-somchai", name: "คุณสมชาย" }],
        province: "เชียงใหม่",
        place: "โรงพยาบาลเก่าแห่งหนึ่ง",
        tags: [{ id: "tag-hospital", name: "โรงพยาบาล" }],
      },
      warnings: [],
    });
  });

  it("accepts JSON wrapped in a markdown code fence and surrounded by prose", () => {
    const raw = `นี่คือร่างที่คุณขอครับ\n\n\`\`\`json\n${JSON.stringify(validDraft, null, 2)}\n\`\`\`\n\nหวังว่าจะช่วยได้นะครับ`;

    const result = parseGeminiDraft(raw, context);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.formValues.displayTitle).toBe("เสียงเรียกจากตึกเก่า");
  });

  it("accepts a bare JSON object surrounded by prose without a fence", () => {
    const raw = `แน่นอนครับ ${JSON.stringify(validDraft)} ขอให้สนุกนะครับ`;

    expect(parseGeminiDraft(raw, context).ok).toBe(true);
  });

  it("reports an error when the text contains no JSON object", () => {
    const result = parseGeminiDraft("ขอโทษครับ ผมดูคลิปนี้ไม่ได้", context);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toHaveLength(1);
  });

  it("reports an error when the JSON is malformed", () => {
    const result = parseGeminiDraft('{"display_title": "เสียงเรียก", "synopsis": }', context);

    expect(result.ok).toBe(false);
  });

  it("reports every missing or mistyped field by name", () => {
    const raw = JSON.stringify({ ...validDraft, display_title: undefined, tags: undefined, storytellers: "คุณสมชาย" });

    const result = parseGeminiDraft(raw, context);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((e) => e.field).sort()).toEqual(["display_title", "storytellers", "tags"]);
    }
  });

  it("matches existing Tags and Storytellers by trimmed, case-insensitive name", () => {
    const raw = JSON.stringify({
      ...validDraft,
      storytellers: ["  คุณสมชาย "],
      tags: ["โรงพยาบาล ", "ผีบ้าน"],
    });
    const result = parseGeminiDraft(raw, {
      ...context,
      existingTags: [...context.existingTags, { id: "tag-army", name: "Military" }],
    });
    const withLatin = parseGeminiDraft(JSON.stringify({ ...validDraft, tags: ["military"] }), {
      ...context,
      existingTags: [{ id: "tag-army", name: "Military" }],
    });

    expect(result.ok && result.formValues.storytellers).toEqual([{ id: "st-somchai", name: "คุณสมชาย" }]);
    expect(result.ok && result.formValues.tags).toEqual([
      { id: "tag-hospital", name: "โรงพยาบาล" },
      { id: "tag-house", name: "ผีบ้าน" },
    ]);
    expect(withLatin.ok && withLatin.formValues.tags).toEqual([{ id: "tag-army", name: "Military" }]);
  });

  it("flags Tags and Storytellers that don't exist yet as new", () => {
    const raw = JSON.stringify({
      ...validDraft,
      storytellers: ["คุณสมชาย", "พี่หนึ่ง"],
      tags: ["โรงพยาบาล", "ทหาร"],
    });

    const result = parseGeminiDraft(raw, context);

    expect(result).toMatchObject({
      ok: true,
      formValues: {
        storytellers: [
          { id: "st-somchai", name: "คุณสมชาย" },
          { id: null, name: "พี่หนึ่ง" },
        ],
        tags: [
          { id: "tag-hospital", name: "โรงพยาบาล" },
          { id: null, name: "ทหาร" },
        ],
      },
      warnings: [
        { kind: "new_storyteller", name: "พี่หนึ่ง" },
        { kind: "new_tag", name: "ทหาร" },
      ],
    });
  });

  it("drops blank and duplicate names", () => {
    const raw = JSON.stringify({ ...validDraft, tags: ["โรงพยาบาล", " ", "โรงพยาบาล "] });

    const result = parseGeminiDraft(raw, context);

    expect(result.ok && result.formValues.tags).toEqual([{ id: "tag-hospital", name: "โรงพยาบาล" }]);
  });

  it("flags a Province that isn't one of the 77 and leaves the field empty", () => {
    const raw = JSON.stringify({ ...validDraft, province: "เชียงใหม" });

    const result = parseGeminiDraft(raw, context);

    expect(result).toMatchObject({
      ok: true,
      formValues: { province: null },
      warnings: [{ kind: "unknown_province", value: "เชียงใหม" }],
    });
  });

  it("accepts a null Province and Place for stories abroad or of unknown location", () => {
    const raw = JSON.stringify({ ...validDraft, province: null, place: null });

    const result = parseGeminiDraft(raw, context);

    expect(result).toMatchObject({ ok: true, formValues: { province: null, place: null }, warnings: [] });
  });

  it("never sets Scare Level or Broadcast Date, even when Gemini includes them", () => {
    const raw = JSON.stringify({ ...validDraft, scare_level: 5, broadcast_date: "2024-01-01" });

    const result = parseGeminiDraft(raw, context);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Object.keys(result.formValues).sort()).toEqual(
        ["displayTitle", "place", "province", "storytellers", "synopsis", "tags"],
      );
    }
  });
});

describe("buildGeminiPrompt", () => {
  it("includes the current Tag list, every Province, and the JSON schema contract", () => {
    const prompt = buildGeminiPrompt(["โรงพยาบาล", "ผีบ้าน"], PROVINCES);

    expect(prompt).toContain("โรงพยาบาล, ผีบ้าน");
    for (const province of PROVINCES) expect(prompt).toContain(province);
    expect(prompt).toContain(JSON.stringify(GEMINI_DRAFT_SCHEMA, null, 2));
  });

  it("describes the six fields the spec's contract asks Gemini for, and no Scare Level or Broadcast Date", () => {
    expect(GEMINI_DRAFT_SCHEMA.required).toEqual(["display_title", "synopsis", "storytellers", "province", "place", "tags"]);
    expect(Object.keys(GEMINI_DRAFT_SCHEMA.properties)).not.toContain("scare_level");
    expect(Object.keys(GEMINI_DRAFT_SCHEMA.properties)).not.toContain("broadcast_date");
  });
});

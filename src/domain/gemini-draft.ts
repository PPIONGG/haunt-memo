export type VocabularyEntry = { id: string; name: string };
/** `id` is null when the name doesn't match an existing record and would be created on save. */
export type VocabularyPick = { id: string | null; name: string };

export type GeminiDraftContext = {
  existingTags: readonly VocabularyEntry[];
  existingStorytellers: readonly VocabularyEntry[];
  provinces: readonly string[];
};

export type DraftFormValues = {
  displayTitle: string;
  synopsis: string;
  storytellers: VocabularyPick[];
  province: string | null;
  place: string | null;
  tags: VocabularyPick[];
};

export type DraftWarning =
  | { kind: "new_tag"; name: string }
  | { kind: "new_storyteller"; name: string }
  | { kind: "unknown_province"; value: string };

export type DraftError = { field: string | null; message: string };

export type GeminiDraftResult =
  | { ok: true; formValues: DraftFormValues; warnings: DraftWarning[] }
  | { ok: false; errors: DraftError[] };

export function normaliseName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function parseGeminiDraft(rawText: string, context: GeminiDraftContext): GeminiDraftResult {
  const json = extractJsonObject(rawText);
  if (json === null) {
    return { ok: false, errors: [{ field: null, message: "ไม่พบ JSON ในข้อความที่วาง" }] };
  }

  let draft: unknown;
  try {
    draft = JSON.parse(json);
  } catch {
    return { ok: false, errors: [{ field: null, message: "JSON ไม่ถูกต้อง อ่านไม่ได้" }] };
  }
  if (!isRecord(draft)) {
    return { ok: false, errors: [{ field: null, message: "JSON ต้องเป็นออบเจกต์" }] };
  }

  const errors: DraftError[] = [];
  const displayTitle = requireString(draft, "display_title", errors);
  const synopsis = requireString(draft, "synopsis", errors);
  const storytellerNames = requireStringArray(draft, "storytellers", errors);
  const tagNames = requireStringArray(draft, "tags", errors);
  const province = optionalString(draft, "province", errors);
  const place = optionalString(draft, "place", errors);
  if (errors.length > 0) return { ok: false, errors };

  const warnings: DraftWarning[] = [];
  const storytellers = matchVocabulary(storytellerNames!, context.existingStorytellers);
  const tags = matchVocabulary(tagNames!, context.existingTags);
  for (const s of storytellers) if (s.id === null) warnings.push({ kind: "new_storyteller", name: s.name });
  for (const t of tags) if (t.id === null) warnings.push({ kind: "new_tag", name: t.name });

  let matchedProvince: string | null = null;
  if (province) {
    matchedProvince = context.provinces.find((p) => p === province) ?? null;
    if (matchedProvince === null) warnings.push({ kind: "unknown_province", value: province });
  }

  return {
    ok: true,
    formValues: {
      displayTitle: displayTitle!,
      synopsis: synopsis!,
      storytellers,
      province: matchedProvince,
      place: place || null,
      tags,
    },
    warnings,
  };
}

/** The contract between Gemini and the Curator's form (ADR 0003); `parseGeminiDraft` enforces it. */
export const GEMINI_DRAFT_SCHEMA = {
  type: "object",
  required: ["display_title", "synopsis", "storytellers", "province", "place", "tags"],
  additionalProperties: false,
  properties: {
    display_title: { type: "string", description: "ชื่อเรื่องภาษาไทยสั้น ๆ อ่านง่าย" },
    synopsis: { type: "string", description: "เรื่องย่อ 3–5 ประโยค ปูเรื่องให้น่าฟัง ห้ามเปิดเผยตอนจบ" },
    storytellers: { type: "array", items: { type: "string" }, description: "ชื่อผู้เล่าเรื่อง" },
    province: { type: ["string", "null"], description: "ชื่อจังหวัดจากรายการด้านล่างแบบตรงตัว หรือ null" },
    place: { type: ["string", "null"], description: "สถานที่เกิดเหตุแบบเจาะจง หรือ null" },
    tags: { type: "array", items: { type: "string" }, description: "แท็กจากรายการด้านล่าง" },
  },
} as const;

export function buildGeminiPrompt(tagNames: readonly string[], provinces: readonly string[]): string {
  return [
    "คุณเป็นผู้ช่วยทำคลังเรื่องผีจากรายการ The Ghost Radio",
    "ดูคลิป YouTube ที่แนบมา แล้วตอบกลับเป็น JSON ออบเจกต์เดียวเท่านั้น ที่ตรงกับ JSON Schema นี้:",
    "",
    "```json",
    JSON.stringify(GEMINI_DRAFT_SCHEMA, null, 2),
    "```",
    "",
    "กติกา:",
    "- synopsis ต้องไม่สปอยล์ตอนจบ",
    "- province ต้องเป็นหนึ่งในรายชื่อจังหวัดด้านล่างแบบตรงตัว ถ้าเกิดต่างประเทศหรือไม่ทราบ ให้ใส่ null",
    "- tags ให้เลือกจากรายการแท็กด้านล่าง ถ้าไม่มีแท็กที่เหมาะจริง ๆ จึงเสนอแท็กใหม่ได้",
    "- ไม่ต้องใส่ระดับความน่ากลัวหรือวันที่ออกอากาศ",
    "",
    `แท็กที่มีอยู่: ${tagNames.length > 0 ? tagNames.join(", ") : "(ยังไม่มี)"}`,
    "",
    `จังหวัด: ${provinces.join(", ")}`,
  ].join("\n");
}

function extractJsonObject(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = fenced ? fenced[1] : text;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  return start !== -1 && end > start ? source.slice(start, end + 1) : null;
}

function matchVocabulary(names: string[], existing: readonly VocabularyEntry[]): VocabularyPick[] {
  const byName = new Map(existing.map((e) => [normaliseName(e.name), e]));
  const picks = new Map<string, VocabularyPick>();
  for (const raw of names) {
    const key = normaliseName(raw);
    if (!key || picks.has(key)) continue;
    const match = byName.get(key);
    picks.set(key, match ? { id: match.id, name: match.name } : { id: null, name: raw.trim() });
  }
  return [...picks.values()];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(draft: Record<string, unknown>, field: string, errors: DraftError[]) {
  const value = draft[field];
  if (typeof value === "string" && value.trim()) return value.trim();
  errors.push({ field, message: `ต้องมี "${field}" เป็นข้อความ` });
  return null;
}

function requireStringArray(draft: Record<string, unknown>, field: string, errors: DraftError[]) {
  const value = draft[field];
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) return value as string[];
  errors.push({ field, message: `ต้องมี "${field}" เป็นรายการข้อความ` });
  return null;
}

function optionalString(draft: Record<string, unknown>, field: string, errors: DraftError[]) {
  const value = draft[field];
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value.trim();
  errors.push({ field, message: `"${field}" ต้องเป็นข้อความหรือ null` });
  return null;
}

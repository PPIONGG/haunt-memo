"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ClipboardCopyIcon, WandSparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { lookupYouTube, saveStory, type StoryStatus, type YouTubeLookup } from "@/app/admin/actions";
import { prefillFromClip, type PrefillWarning } from "@/domain/clip-prefill";
import { buildGeminiPrompt, parseGeminiDraft, type DraftWarning, type VocabularyEntry } from "@/domain/gemini-draft";
import { PROVINCES } from "@/domain/provinces";
import { youTubeThumbnailUrl } from "@/domain/youtube";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { hasUnsavedChanges } from "@/domain/unsaved-changes";
import { copyText } from "@/lib/copy-text";
import { LeaveGuard } from "./leave-guard";
import { cn } from "@/lib/utils";
import { VocabularyInput } from "./vocabulary-input";

const NO_PROVINCE = "none";

const PREFILL_WARNINGS: Record<PrefillWarning, string> = {
  title_missing: "ดึงชื่อคลิปไม่ได้ พิมพ์ชื่อเองได้เลย",
  date_missing: "ดึงวันที่ออกอากาศไม่ได้ กรอกเองได้เลย",
};

export type StoryFormValues = {
  youtubeUrl: string;
  youtubeId: string | null;
  youtubeTitle: string;
  displayTitle: string;
  synopsis: string;
  storytellers: string[];
  province: string | null;
  place: string;
  tags: string[];
  scareLevel: number | null;
  broadcastDate: string;
  status: StoryStatus;
};

export const EMPTY_STORY: StoryFormValues = {
  youtubeUrl: "",
  youtubeId: null,
  youtubeTitle: "",
  displayTitle: "",
  synopsis: "",
  storytellers: [],
  province: null,
  place: "",
  tags: [],
  scareLevel: null,
  broadcastDate: "",
  status: "draft",
};

type Props = {
  storyId: string | null;
  initial: StoryFormValues;
  existingTags: VocabularyEntry[];
  existingStorytellers: VocabularyEntry[];
};

export function StoryForm({ storyId, initial, existingTags, existingStorytellers }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  /** The clip whose details are in the form, to tell a re-fetch of the same clip from a new one. */
  const [filledFrom, setFilledFrom] = useState(initial.youtubeId);
  const [lookup, setLookup] = useState<{ pending: boolean; error: string | null; duplicate: YouTubeLookup["duplicate"] }>({
    pending: false,
    error: null,
    duplicate: null,
  });
  const [geminiText, setGeminiText] = useState("");
  const [geminiErrors, setGeminiErrors] = useState<string[]>([]);
  const [geminiWarnings, setGeminiWarnings] = useState<DraftWarning[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  /** Set once saving succeeds, so moving on to the list doesn't ask about unsaved work. */
  const [saved, setSaved] = useState(false);

  const set = (patch: Partial<StoryFormValues>) => setValues((v) => ({ ...v, ...patch }));

  const fetchYouTube = async () => {
    if (!values.youtubeUrl.trim()) return;
    setLookup({ pending: true, error: null, duplicate: null });
    const result = await lookupYouTube(values.youtubeUrl, storyId);
    if (!result.ok) {
      setLookup({ pending: false, error: result.error, duplicate: null });
      set({ youtubeId: null });
      return;
    }
    const { duplicate, ...clip } = result.value;
    const { warnings } = prefillFromClip(values, filledFrom, clip);
    setFilledFrom(clip.youtubeId);
    setLookup({
      pending: false,
      error: warnings.map((w) => PREFILL_WARNINGS[w]).join(" · ") || null,
      duplicate,
    });
    // Apply to the latest values, in case the Curator typed while the clip was loading.
    setValues((v) => ({ ...v, ...prefillFromClip(v, filledFrom, clip).fields }));
  };

  const copyPrompt = async () => {
    const copied = await copyText(buildGeminiPrompt(existingTags.map((t) => t.name), PROVINCES));
    if (copied) toast.success("คัดลอก prompt แล้ว นำไปวางใน Gemini พร้อมลิงก์คลิป");
    else toast.error("คัดลอกไม่สำเร็จ คลิกที่หน้าเว็บก่อนแล้วลองใหม่");
  };

  const applyGemini = () => {
    const result = parseGeminiDraft(geminiText, { existingTags, existingStorytellers, provinces: PROVINCES });
    if (!result.ok) {
      setGeminiErrors(result.errors.map((e) => e.message));
      setGeminiWarnings([]);
      return;
    }
    const { formValues } = result;
    setGeminiErrors([]);
    setGeminiWarnings(result.warnings);
    set({
      displayTitle: formValues.displayTitle,
      synopsis: formValues.synopsis,
      storytellers: formValues.storytellers.map((s) => s.name),
      province: formValues.province,
      place: formValues.place ?? "",
      tags: formValues.tags.map((t) => t.name),
    });
    toast.success("เติมฟอร์มจากร่างของ Gemini แล้ว ตรวจทานก่อนบันทึกนะ");
  };

  const submit = (status: StoryStatus) => {
    if (!values.youtubeId) {
      setSaveError("ใส่ลิงก์ YouTube แล้วกด “ดึงข้อมูล” ก่อน");
      return;
    }
    setSaveError(null);
    startSaving(async () => {
      const result = await saveStory({
        id: storyId,
        youtubeId: values.youtubeId!,
        youtubeTitle: values.youtubeTitle,
        displayTitle: values.displayTitle,
        synopsis: values.synopsis,
        scareLevel: values.scareLevel,
        broadcastDate: values.broadcastDate || null,
        province: values.province,
        place: values.place || null,
        tags: values.tags,
        storytellers: values.storytellers,
        status,
      });
      if (!result.ok) {
        setSaveError(result.error);
        return;
      }
      setSaved(true);
      toast.success(status === "published" ? "บันทึกและเผยแพร่แล้ว" : "บันทึกเป็นฉบับร่างแล้ว");
      router.push("/admin");
      router.refresh();
    });
  };

  const unknownProvince = geminiWarnings.find((w) => w.kind === "unknown_province");

  return (
    <form className="grid gap-8" onSubmit={(e) => e.preventDefault()}>
      <LeaveGuard active={!saved && hasUnsavedChanges(initial, values, geminiText)} />
      <Section title="คลิป YouTube">
        <div className="grid gap-1.5">
          <Label htmlFor="youtube-url">ลิงก์ YouTube</Label>
          <div className="flex gap-2">
            <Input
              id="youtube-url"
              inputMode="url"
              placeholder="https://youtu.be/…"
              value={values.youtubeUrl}
              onChange={(e) => set({ youtubeUrl: e.target.value })}
              onBlur={fetchYouTube}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  fetchYouTube();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={fetchYouTube} disabled={lookup.pending}>
              {lookup.pending ? "กำลังดึง…" : "ดึงข้อมูล"}
            </Button>
          </div>
          {lookup.error && <p className="text-sm text-amber-300">{lookup.error}</p>}
          {lookup.duplicate && (
            <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-sm">
              คลิปนี้อยู่ในคลังแล้ว:{" "}
              <Link className="underline" href={`/admin/stories/${lookup.duplicate.id}`}>
                {lookup.duplicate.displayTitle}
              </Link>
            </p>
          )}
        </div>
        {values.youtubeId && (
          <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <Image src={youTubeThumbnailUrl(values.youtubeId)} alt="" fill sizes="12rem" className="object-cover" />
            </div>
            <div className="grid content-start gap-1.5">
              <Label htmlFor="youtube-title">ชื่อคลิปต้นฉบับ</Label>
              <Input
                id="youtube-title"
                value={values.youtubeTitle}
                onChange={(e) => set({ youtubeTitle: e.target.value })}
              />
            </div>
          </div>
        )}
      </Section>

      <Section title="ร่างจาก Gemini">
        <p className="text-sm text-muted-foreground">
          คัดลอก prompt ไปวางใน Gemini พร้อมลิงก์คลิป แล้วนำ JSON ที่ได้กลับมาวางด้านล่าง
        </p>
        <div>
          <Button type="button" variant="outline" onClick={copyPrompt}>
            <ClipboardCopyIcon /> คัดลอก prompt สำหรับ Gemini
          </Button>
        </div>
        <Textarea
          aria-label="วาง JSON จาก Gemini"
          placeholder='{"display_title": "…", "synopsis": "…", …}'
          value={geminiText}
          onChange={(e) => setGeminiText(e.target.value)}
          className="min-h-28 font-mono text-xs"
        />
        <div>
          <Button type="button" variant="secondary" onClick={applyGemini} disabled={!geminiText.trim()}>
            <WandSparklesIcon /> เติมฟอร์มจาก JSON
          </Button>
        </div>
        {geminiErrors.length > 0 && (
          <ul role="alert" className="list-inside list-disc rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
            {geminiErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        {geminiWarnings.some((w) => w.kind !== "unknown_province") && (
          <p className="text-sm text-amber-300">
            มีแท็กหรือผู้เล่าใหม่ (กรอบสีเหลือง) จะถูกสร้างเมื่อบันทึก ตรวจดูว่าตั้งใจสร้างจริง
          </p>
        )}
      </Section>

      <Section title="รายละเอียดเรื่อง">
        <Field label="ชื่อเรื่อง (ภาษาไทย)" htmlFor="display-title">
          <Input id="display-title" value={values.displayTitle} onChange={(e) => set({ displayTitle: e.target.value })} />
        </Field>
        <Field label="เรื่องย่อ (3–5 ประโยค ห้ามสปอยล์ตอนจบ)" htmlFor="synopsis">
          <Textarea
            id="synopsis"
            value={values.synopsis}
            onChange={(e) => set({ synopsis: e.target.value })}
            className="min-h-32"
          />
        </Field>
        <VocabularyInput
          label="ผู้เล่า"
          placeholder="พิมพ์ชื่อแล้วกด Enter"
          values={values.storytellers}
          existing={existingStorytellers}
          onChange={(storytellers) => set({ storytellers })}
        />
        <VocabularyInput
          label="แท็ก"
          placeholder="พิมพ์แท็กแล้วกด Enter"
          values={values.tags}
          existing={existingTags}
          onChange={(tags) => set({ tags })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="จังหวัด">
            <Select
              value={values.province ?? NO_PROVINCE}
              onValueChange={(p) => set({ province: p === NO_PROVINCE ? null : p })}
            >
              <SelectTrigger aria-label="จังหวัด" className={cn("w-full", unknownProvince && "border-amber-400")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PROVINCE}>ไม่ระบุ / ต่างประเทศ</SelectItem>
                {PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {unknownProvince?.kind === "unknown_province" && (
              <p className="text-sm text-amber-300">
                Gemini ระบุจังหวัด “{unknownProvince.value}” ซึ่งไม่ตรงกับ 77 จังหวัด เลือกเองอีกครั้ง
              </p>
            )}
          </Field>
          <Field label="สถานที่ (ไม่บังคับ)" htmlFor="place">
            <Input id="place" value={values.place} onChange={(e) => set({ place: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="ผู้คัดสรรกำหนดเอง">
        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset className="grid gap-1.5">
            <legend className="mb-1.5 text-sm font-medium">ระดับความน่ากลัว</legend>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={values.scareLevel === n ? "secondary" : "outline"}
                  aria-pressed={values.scareLevel === n}
                  aria-label={`ระดับ ${n}`}
                  onClick={() => set({ scareLevel: n })}
                >
                  {"👻".repeat(n)}
                </Button>
              ))}
            </div>
          </fieldset>
          <Field label="วันที่ออกอากาศ" htmlFor="broadcast-date">
            <Input
              id="broadcast-date"
              type="date"
              value={values.broadcastDate}
              onChange={(e) => set({ broadcastDate: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              กด &ldquo;ดึงข้อมูล&rdquo; แล้วระบบจะใส่วันที่คลิปเผยแพร่บน YouTube ให้ แก้ได้ถ้าวันออกอากาศจริงต่างกัน
            </p>
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur">
        {saveError && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            {saveError}
          </p>
        )}
        <Button type="button" variant="outline" disabled={saving || lookup.pending} onClick={() => submit("draft")}>
          บันทึกเป็นฉบับร่าง
        </Button>
        <Button type="button" disabled={saving || lookup.pending} onClick={() => submit("published")}>
          บันทึกและเผยแพร่
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

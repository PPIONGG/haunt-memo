"use client";

import { CheckIcon, GhostIcon } from "lucide-react";
import type { ArchiveCriteria, ArchiveSort, ListenedFilter } from "@/domain/archive";
import type { VocabularyEntry } from "@/domain/gemini-draft";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ANY = "any";

export const SORT_LABELS: Record<ArchiveSort, string> = {
  added_desc: "เพิ่มล่าสุด",
  broadcast_desc: "ออกอากาศล่าสุด",
  broadcast_asc: "ออกอากาศเก่าสุด",
  scare_desc: "น่ากลัวมากสุด",
  scare_asc: "น่ากลัวน้อยสุด",
};

const LISTENED_LABELS: Record<ListenedFilter, string> = { all: "ทั้งหมด", unlistened: "ยังไม่ฟัง", listened: "ฟังแล้ว" };

export type ArchiveVocabulary = {
  tags: (VocabularyEntry & { count: number })[];
  storytellers: VocabularyEntry[];
  provinces: string[];
};

type Props = { criteria: ArchiveCriteria; vocabulary: ArchiveVocabulary; onChange: (criteria: ArchiveCriteria) => void };

export function FilterFields({ criteria, vocabulary, onChange }: Props) {
  const set = (patch: Partial<ArchiveCriteria>) => onChange({ ...criteria, ...patch });
  const selectedTags = new Set(criteria.tagIds ?? []);
  const minScare = criteria.scareLevel?.min;

  return (
    <div className="grid">
      {vocabulary.tags.length > 0 && (
        <Group title="ประเภทเรื่อง">
          {vocabulary.tags.map((tag) => {
            const on = selectedTags.has(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => {
                  const next = new Set(selectedTags);
                  if (on) next.delete(tag.id);
                  else next.add(tag.id);
                  set({ tagIds: [...next] });
                }}
                className={cn("flex items-center gap-2.5 py-1 text-left text-[15px]", on ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                <span className={cn("grid size-[18px] shrink-0 place-items-center rounded-[5px] border-[1.5px]", on ? "border-transparent bg-primary text-primary-foreground" : "border-input")}>
                  {on && <CheckIcon className="size-3" strokeWidth={2.5} />}
                </span>
                <span className="flex-1">{tag.name}</span>
                <span className="text-[13px] text-faint tabular-nums">{tag.count}</span>
              </button>
            );
          })}
        </Group>
      )}

      <Group title="ความน่ากลัว">
        <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="ความน่ากลัวขั้นต่ำ">
          {[1, 2, 3, 4, 5].map((n) => {
            const on = minScare !== undefined && n >= minScare;
            return (
              <button
                key={n}
                type="button"
                aria-pressed={minScare === n}
                aria-label={`ตั้งแต่ระดับ ${n}`}
                onClick={() => set({ scareLevel: { ...criteria.scareLevel, min: minScare === n ? undefined : n } })}
                className={cn(
                  "flex h-10 items-center justify-center gap-1 rounded-lg border text-sm transition-colors",
                  on ? "border-foreground/80 bg-secondary text-foreground" : "border-input text-muted-foreground hover:text-foreground",
                )}
              >
                <GhostIcon className="size-4" strokeWidth={1.5} />
                {n}
              </button>
            );
          })}
        </div>
        <p className="text-[13px] text-faint">{minScare ? `ตั้งแต่ระดับ ${minScare} ขึ้นไป` : "ทุกระดับ"}</p>
      </Group>

      <Group title="จังหวัด">
        <FieldSelect
          label="จังหวัด"
          value={criteria.province ?? ANY}
          onValueChange={(v) => set({ province: v === ANY ? null : v })}
          anyLabel="ทุกจังหวัด"
          options={vocabulary.provinces.map((p) => ({ value: p, label: p }))}
        />
      </Group>

      {vocabulary.storytellers.length > 0 && (
        <Group title="ผู้เล่า">
          <FieldSelect
            label="ผู้เล่า"
            value={criteria.storytellerIds?.[0] ?? ANY}
            onValueChange={(v) => set({ storytellerIds: v === ANY ? [] : [v] })}
            anyLabel="ทุกคน"
            options={vocabulary.storytellers.map((s) => ({ value: s.id, label: s.name }))}
          />
        </Group>
      )}

      <Group title="ช่วงออกอากาศ">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            aria-label="ออกอากาศตั้งแต่"
            value={criteria.broadcastDate?.from ?? ""}
            onChange={(e) => set({ broadcastDate: { ...criteria.broadcastDate, from: e.target.value || undefined } })}
            className="h-10 bg-secondary"
          />
          <Input
            type="date"
            aria-label="ออกอากาศถึง"
            value={criteria.broadcastDate?.to ?? ""}
            onChange={(e) => set({ broadcastDate: { ...criteria.broadcastDate, to: e.target.value || undefined } })}
            className="h-10 bg-secondary"
          />
        </div>
      </Group>

      <Group title="ของฉัน" last>
        <div className="grid grid-cols-3 rounded-lg bg-secondary p-[3px] text-[13px]" role="group" aria-label="สถานะการฟัง">
          {(Object.keys(LISTENED_LABELS) as ListenedFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={(criteria.listened ?? "all") === value}
              onClick={() => set({ listened: value })}
              className={cn("h-8 rounded-md", (criteria.listened ?? "all") === value ? "bg-accent text-foreground" : "text-muted-foreground")}
            >
              {LISTENED_LABELS[value]}
            </button>
          ))}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={criteria.favouritesOnly ?? false}
          onClick={() => set({ favouritesOnly: !criteria.favouritesOnly })}
          className="flex items-center justify-between py-1 text-[15px]"
        >
          เฉพาะเรื่องโปรด
          <span className={cn("relative h-6 w-10 rounded-full transition-colors", criteria.favouritesOnly ? "bg-ember" : "bg-secondary")}>
            <span className={cn("absolute top-1 size-4 rounded-full bg-white transition-transform", criteria.favouritesOnly ? "translate-x-5" : "translate-x-1")} />
          </span>
        </button>
      </Group>
    </div>
  );
}

export function SortSelect({ value, onChange, className }: { value: ArchiveSort; onChange: (sort: ArchiveSort) => void; className?: string }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ArchiveSort)}>
      <SelectTrigger aria-label="เรียงตาม" className={cn("h-10 bg-secondary", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(SORT_LABELS) as ArchiveSort[]).map((sort) => (
          <SelectItem key={sort} value={sort}>
            {SORT_LABELS[sort]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Group({ title, last, children }: { title: string; last?: boolean; children: React.ReactNode }) {
  return (
    <fieldset className={cn("grid gap-2.5 py-4", !last && "border-b")}>
      <legend className="float-left mb-1 text-[13px] text-faint">{title}</legend>
      {children}
    </fieldset>
  );
}

type FieldSelectProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  anyLabel: string;
};

function FieldSelect({ label, value, onValueChange, options, anyLabel }: FieldSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={label} className="h-10 w-full bg-secondary">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>{anyLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

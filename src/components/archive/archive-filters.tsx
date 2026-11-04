"use client";

import { HeartIcon, SearchIcon, XIcon } from "lucide-react";
import type { ArchiveCriteria, ArchiveSort, ListenedFilter } from "@/domain/archive";
import type { VocabularyEntry } from "@/domain/gemini-draft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

const ANY = "any";

const SORT_LABELS: Record<ArchiveSort, string> = {
  added_desc: "เพิ่มล่าสุด",
  broadcast_desc: "ออกอากาศล่าสุด",
  broadcast_asc: "ออกอากาศเก่าสุด",
  scare_desc: "น่ากลัวมากสุด",
  scare_asc: "น่ากลัวน้อยสุด",
};

const LISTENED_LABELS: Record<ListenedFilter, string> = {
  all: "ทุกเรื่อง",
  unlistened: "ยังไม่ได้ฟัง",
  listened: "ฟังแล้ว",
};

export type ArchiveVocabulary = {
  tags: VocabularyEntry[];
  storytellers: VocabularyEntry[];
  provinces: string[];
};

type Props = {
  criteria: ArchiveCriteria;
  vocabulary: ArchiveVocabulary;
  onChange: (criteria: ArchiveCriteria) => void;
};

export function SearchBar({ criteria, onChange }: Omit<Props, "vocabulary">) {
  return (
    <div className="relative flex-1">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        inputMode="search"
        placeholder="ค้นหาชื่อเรื่อง เรื่องย่อ ผู้เล่า หรือสถานที่"
        aria-label="ค้นหาเรื่อง"
        value={criteria.text ?? ""}
        onChange={(e) => onChange({ ...criteria, text: e.target.value })}
        className="h-10 pl-9 text-base"
      />
    </div>
  );
}

export function SortSelect({ criteria, onChange }: Omit<Props, "vocabulary">) {
  return (
    <Select
      value={criteria.sort ?? "added_desc"}
      onValueChange={(sort) => onChange({ ...criteria, sort: sort as ArchiveSort })}
    >
      <SelectTrigger aria-label="เรียงตาม" className="h-10 w-full sm:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FilterPanel({ criteria, vocabulary, onChange }: Props) {
  const set = (patch: Partial<ArchiveCriteria>) => onChange({ ...criteria, ...patch });
  const selectedTags = new Set(criteria.tagIds ?? []);

  return (
    <div className="grid gap-4 rounded-xl border bg-card/50 p-4">
      {vocabulary.tags.length > 0 && (
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">แท็ก</legend>
          <div className="flex flex-wrap gap-1.5">
            {vocabulary.tags.map((tag) => (
              <Toggle
                key={tag.id}
                size="sm"
                variant="outline"
                pressed={selectedTags.has(tag.id)}
                onPressedChange={(pressed) => {
                  const next = new Set(selectedTags);
                  if (pressed) next.add(tag.id);
                  else next.delete(tag.id);
                  set({ tagIds: [...next] });
                }}
              >
                {tag.name}
              </Toggle>
            ))}
          </div>
        </fieldset>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LabelledSelect
          label="ผู้เล่า"
          value={criteria.storytellerIds?.[0] ?? ANY}
          onValueChange={(id) => set({ storytellerIds: id === ANY ? [] : [id] })}
          options={vocabulary.storytellers.map((s) => ({ value: s.id, label: s.name }))}
          anyLabel="ทุกคน"
        />
        <LabelledSelect
          label="จังหวัด"
          value={criteria.province ?? ANY}
          onValueChange={(province) => set({ province: province === ANY ? null : province })}
          options={vocabulary.provinces.map((p) => ({ value: p, label: p }))}
          anyLabel="ทุกจังหวัด"
        />
        <LabelledSelect
          label="ความน่ากลัวขั้นต่ำ"
          value={String(criteria.scareLevel?.min ?? ANY)}
          onValueChange={(v) => set({ scareLevel: { ...criteria.scareLevel, min: v === ANY ? undefined : Number(v) } })}
          options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: "👻".repeat(n) }))}
          anyLabel="ไม่กำหนด"
        />
        <LabelledSelect
          label="ความน่ากลัวสูงสุด"
          value={String(criteria.scareLevel?.max ?? ANY)}
          onValueChange={(v) => set({ scareLevel: { ...criteria.scareLevel, max: v === ANY ? undefined : Number(v) } })}
          options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: "👻".repeat(n) }))}
          anyLabel="ไม่กำหนด"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5">
          <Label htmlFor="broadcast-from">ออกอากาศตั้งแต่</Label>
          <Input
            id="broadcast-from"
            type="date"
            value={criteria.broadcastDate?.from ?? ""}
            onChange={(e) => set({ broadcastDate: { ...criteria.broadcastDate, from: e.target.value || undefined } })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="broadcast-to">ถึง</Label>
          <Input
            id="broadcast-to"
            type="date"
            value={criteria.broadcastDate?.to ?? ""}
            onChange={(e) => set({ broadcastDate: { ...criteria.broadcastDate, to: e.target.value || undefined } })}
          />
        </div>
        <LabelledSelect
          label="สถานะการฟัง"
          value={criteria.listened ?? "all"}
          onValueChange={(listened) => set({ listened: listened as ListenedFilter })}
          options={Object.entries(LISTENED_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <div className="grid content-end">
          <Toggle
            variant="outline"
            pressed={criteria.favouritesOnly ?? false}
            onPressedChange={(favouritesOnly) => set({ favouritesOnly })}
          >
            <HeartIcon /> เฉพาะเรื่องโปรด
          </Toggle>
        </div>
      </div>
    </div>
  );
}

export function ClearFiltersButton({ onClear }: { onClear: () => void }) {
  return (
    <Button variant="ghost" onClick={onClear}>
      <XIcon /> ล้างตัวกรองทั้งหมด
    </Button>
  );
}

type LabelledSelectProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  anyLabel?: string;
};

function LabelledSelect({ label, value, onValueChange, options, anyLabel }: LabelledSelectProps) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-label={label} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {anyLabel && <SelectItem value={ANY}>{anyLabel}</SelectItem>}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { XIcon } from "lucide-react";
import { normaliseName, type VocabularyEntry } from "@/domain/gemini-draft";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  placeholder: string;
  values: string[];
  existing: readonly VocabularyEntry[];
  onChange: (values: string[]) => void;
};

/** Picks names from existing vocabulary with autocomplete; typing a new name creates it on save. */
export function VocabularyInput({ label, placeholder, values, existing, onChange }: Props) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const known = new Map(existing.map((e) => [normaliseName(e.name), e.name]));
  const chosen = new Set(values.map(normaliseName));

  const add = (raw: string) => {
    const key = normaliseName(raw);
    if (!key || chosen.has(key)) return setDraft("");
    onChange([...values, known.get(key) ?? raw.trim()]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {values.map((name) => {
            const isNew = !known.has(normaliseName(name));
            return (
              <li
                key={name}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm",
                  isNew && "border-dashed border-amber-400/70 bg-amber-400/10",
                )}
              >
                {name}
                {isNew && <span className="text-xs text-amber-300">ใหม่</span>}
                <button
                  type="button"
                  onClick={() => onChange(values.filter((v) => v !== name))}
                  aria-label={`เอา ${name} ออก`}
                  className="rounded-full p-0.5 hover:bg-muted"
                >
                  <XIcon className="size-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Input
        id={id}
        list={`${id}-options`}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft && add(draft)}
      />
      <datalist id={`${id}-options`}>
        {existing
          .filter((e) => !chosen.has(normaliseName(e.name)))
          .map((e) => (
            <option key={e.id} value={e.name} />
          ))}
      </datalist>
    </div>
  );
}

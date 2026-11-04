"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { mergeVocabulary, renameVocabulary, type ActionResult, type VocabularyKind } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Entry = { id: string; name: string; stories: number };

type Props = { kind: VocabularyKind; title: string; entries: Entry[] };

export function VocabularyManager({ kind, title, entries }: Props) {
  return (
    <div className="grid gap-3">
      <h2 className="font-heading text-lg font-semibold">
        {title} <span className="text-sm font-normal text-muted-foreground">({entries.length})</span>
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">ยังไม่มี</p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {entries.map((entry) => (
            <EntryRow key={entry.id} kind={kind} entry={entry} others={entries.filter((e) => e.id !== entry.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function EntryRow({ kind, entry, others }: { kind: VocabularyKind; entry: Entry; others: Entry[] }) {
  const router = useRouter();
  const [name, setName] = useState(entry.name);
  const [mergeTarget, setMergeTarget] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>, success: string) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });

  const target = others.find((o) => o.id === mergeTarget);

  return (
    <li className="flex flex-wrap items-center gap-2 p-3">
      <form
        className="flex min-w-0 flex-1 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => renameVocabulary(kind, entry.id, name), "เปลี่ยนชื่อแล้ว");
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} aria-label={`ชื่อของ ${entry.name}`} />
        <Button type="submit" variant="outline" disabled={pending || name.trim() === entry.name}>
          เปลี่ยนชื่อ
        </Button>
      </form>
      <span className="w-16 text-sm text-muted-foreground">{entry.stories} เรื่อง</span>
      {others.length > 0 && (
        <div className="flex gap-2">
          <Select value={mergeTarget} onValueChange={setMergeTarget}>
            <SelectTrigger aria-label={`รวม ${entry.name} เข้ากับ`} className="w-40">
              <SelectValue placeholder="รวมเข้ากับ…" />
            </SelectTrigger>
            <SelectContent>
              {others.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            disabled={pending || !target}
            onClick={() => target && run(() => mergeVocabulary(kind, entry.id, target.id), `รวมเข้ากับ “${target.name}” แล้ว`)}
          >
            รวม
          </Button>
        </div>
      )}
    </li>
  );
}

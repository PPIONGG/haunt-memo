"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteStory, setStoryStatus, type ActionResult, type StoryStatus } from "@/app/admin/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = { storyId: string; status: StoryStatus; title: string };

export function StoryRowActions({ storyId, status, title }: Props) {
  const router = useRouter();
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

  return (
    <div className="flex gap-1">
      <Button asChild size="sm" variant="ghost">
        <Link href={`/admin/stories/${storyId}`}>แก้ไข</Link>
      </Button>
      {status === "draft" ? (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setStoryStatus(storyId, "published"), "เผยแพร่แล้ว")}>
          เผยแพร่
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setStoryStatus(storyId, "draft"), "ย้ายกลับเป็นฉบับร่างแล้ว")}>
          ซ่อน
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive" disabled={pending}>
            ลบ
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบ “{title}”?</AlertDialogTitle>
            <AlertDialogDescription>เรื่องนี้จะหายจากคลังถาวร กู้คืนไม่ได้</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => run(() => deleteStory(storyId), "ลบแล้ว")}>
              ลบเรื่อง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

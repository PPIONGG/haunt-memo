"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Leaving = { kind: "link"; href: string } | { kind: "form"; action: string; method: string };

/**
 * While `active`, asks before the Curator leaves the page and loses unsaved work:
 * - links inside the app and the sign-out form open a confirm dialog;
 * - closing or reloading the tab shows the browser's own warning (its wording can't be changed).
 * The browser's back button isn't covered.
 */
export function LeaveGuard({ active }: { active: boolean }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState<Leaving | null>(null);
  const allowed = useRef(false);

  useEffect(() => {
    if (!active) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowed.current) return;
      event.preventDefault();
    };

    // Capture phase on the document runs before Next.js <Link> handles the click.
    const onClick = (event: MouseEvent) => {
      if (allowed.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      event.preventDefault();
      event.stopPropagation();
      setLeaving({ kind: "link", href: url.pathname + url.search + url.hash });
    };

    const onSubmit = (event: SubmitEvent) => {
      if (allowed.current) return;
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.getAttribute("action") !== "/auth/sign-out") return;
      event.preventDefault();
      event.stopPropagation();
      // Keep where it posts, not the element: the sign-out form lives in a menu that unmounts when it closes.
      setLeaving({ kind: "form", action: form.getAttribute("action")!, method: form.method });
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, [active]);

  const leave = () => {
    if (!leaving) return;
    allowed.current = true;
    if (leaving.kind === "form") {
      // A fresh form, since the original may be gone. form.submit() skips the submit event,
      // so the guard doesn't catch it again.
      const form = document.createElement("form");
      form.action = leaving.action;
      form.method = leaving.method;
      document.body.appendChild(form);
      form.submit();
    } else {
      router.push(leaving.href);
    }
    setLeaving(null);
  };

  return (
    <AlertDialog open={leaving !== null} onOpenChange={(open) => !open && setLeaving(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>มีข้อมูลที่ยังไม่บันทึก</AlertDialogTitle>
          <AlertDialogDescription>
            {leaving?.kind === "form"
              ? "ถ้าออกจากระบบตอนนี้ ข้อมูลที่กรอกไว้ในฟอร์มจะหายทั้งหมด"
              : "ถ้าออกจากหน้านี้ ข้อมูลที่กรอกไว้ในฟอร์มจะหายทั้งหมด"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>อยู่ต่อ</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={leave}>
            {leaving?.kind === "form" ? "ออกจากระบบโดยไม่บันทึก" : "ออกโดยไม่บันทึก"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

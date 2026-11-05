import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

export default function CuratorLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <nav className="flex flex-wrap items-center gap-1">
          <Link href="/admin" className="mr-3 font-heading text-lg font-semibold">
            Haunt Memo · จัดการ
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">เรื่องทั้งหมด</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/vocabulary">แท็กและผู้เล่า</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/" target="_blank">
              ดูหน้าคลัง
            </Link>
          </Button>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/admin/stories/new">+ เพิ่มเรื่อง</Link>
          </Button>
          <form action="/auth/sign-out" method="post">
            <Button type="submit" variant="outline" size="sm">
              ออกจากระบบ
            </Button>
          </form>
        </div>
      </header>
      <Suspense fallback={<p className="text-muted-foreground">กำลังโหลด…</p>}>{children}</Suspense>
    </div>
  );
}

import { ArchiveBrowser } from "@/components/archive/archive-browser";
import { getPublishedArchive } from "@/lib/archive-data";

export default async function ArchivePage() {
  const stories = await getPublishedArchive();

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:py-12">
      <header className="grid gap-2 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Haunt Memo 👻</h1>
        <p className="text-muted-foreground">คลังเรื่องผีคัดสรรจากรายการ The Ghost Radio</p>
      </header>
      <ArchiveBrowser stories={stories} />
    </main>
  );
}

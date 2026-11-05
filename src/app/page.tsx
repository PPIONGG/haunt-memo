import { ArchiveApp } from "@/components/archive/archive-app";
import { getPublishedArchive } from "@/lib/archive-data";

export default async function ArchivePage() {
  const stories = await getPublishedArchive();
  return <ArchiveApp stories={stories} />;
}

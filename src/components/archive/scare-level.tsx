import { GhostIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** The Scare Level as five line-icon ghosts, the first `level` of them lit. */
export function ScareLevel({ level, className }: { level: number; className?: string }) {
  return (
    <span role="img" aria-label={`ความน่ากลัว ${level} จาก 5`} className={cn("inline-flex gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <GhostIcon
          key={n}
          aria-hidden
          strokeWidth={1.5}
          className={cn("size-[1em]", n <= level ? "text-foreground" : "text-faint opacity-40")}
        />
      ))}
    </span>
  );
}

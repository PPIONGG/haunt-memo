import { cn } from "@/lib/utils";

export function ScareLevel({ level, className }: { level: number; className?: string }) {
  return (
    <span role="img" aria-label={`ความน่ากลัว ${level} จาก 5`} className={cn("inline-flex gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden className={n <= level ? undefined : "opacity-20 grayscale"}>
          👻
        </span>
      ))}
    </span>
  );
}

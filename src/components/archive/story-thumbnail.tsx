"use client";

import Image from "next/image";
import { useState } from "react";
import { youTubeThumbnailUrl } from "@/domain/youtube";
import { cn } from "@/lib/utils";

type Props = {
  youtubeId: string;
  sizes: string;
  /** Ask for the 1280×720 thumbnail first; older clips without one fall back to the standard one. */
  large?: boolean;
  priority?: boolean;
  className?: string;
};

/** A Story's YouTube thumbnail, cropped to fill its box. Shows the plain surface if YouTube has none. */
export function StoryThumbnail({ youtubeId, sizes, large = false, priority = false, className }: Props) {
  const [size, setSize] = useState<"max" | "hq" | "none">(large ? "max" : "hq");

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {size !== "none" && (
        <Image
          key={size}
          src={youTubeThumbnailUrl(youtubeId, size)}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setSize(size === "max" ? "hq" : "none")}
        />
      )}
    </div>
  );
}

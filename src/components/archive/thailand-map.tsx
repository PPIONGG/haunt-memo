"use client";

import { useMemo, type KeyboardEvent } from "react";
import { MAP_HEIGHT, MAP_WIDTH, landDots, type ProvinceStat } from "@/domain/archive-map";
import type { Region } from "@/domain/province-geo";
import type { Province } from "@/domain/provinces";
import { cn } from "@/lib/utils";

export type MapMode = "count" | "scare";

type Props = {
  stats: ProvinceStat[];
  mode?: MapMode;
  /** Zoom to one Region's Provinces; others are hidden. */
  region?: Region | null;
  selected?: Province | null;
  onSelect?: (province: Province) => void;
  /** Which pins get a name next to them. */
  labels?: "none" | "selected" | "busiest";
  /** Distance between land dots, in map units (100 units = 1° of latitude). */
  dotSpacing?: number;
  /** Scales pins and labels; raise it for small maps so they stay legible. */
  pinScale?: number;
  className?: string;
};

const LOW = [88, 88, 96];
const HIGH = [240, 90, 74];

/** Grey for a Province whose Stories are mild on average, through to ember for the most frightening. */
export function scareColour(averageScare: number): string {
  const t = Math.min(1, Math.max(0, (averageScare - 2) / 2.5));
  const [r, g, b] = LOW.map((low, i) => Math.round(low + (HIGH[i] - low) * t));
  return `rgb(${r} ${g} ${b})`;
}

export function ThailandMap({
  stats,
  mode = "count",
  region = null,
  selected = null,
  onSelect,
  labels = "selected",
  dotSpacing = 14,
  pinScale = 1,
  className,
}: Props) {
  const dots = useMemo(() => landDots(dotSpacing).map(({ x, y }) => `M${x.toFixed(1)} ${y.toFixed(1)}h0`).join(""), [dotSpacing]);
  const visible = region ? stats.filter((s) => s.region === region) : stats;
  const viewBox = region ? regionViewBox(visible) : `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`;
  const zoom = region ? MAP_HEIGHT / Number(viewBox.split(" ")[3]) : 1;
  const scale = pinScale / Math.sqrt(zoom);
  const labelled = new Set(
    labels === "busiest" ? visible.filter((s) => s.count >= Math.max(2, visible[Math.min(7, visible.length - 1)]?.count ?? 0)).map((s) => s.province) : [],
  );

  // Draw small pins last so they stay clickable on top of big neighbours.
  const pins = [...visible].sort((a, b) => b.count - a.count);

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className={cn("block h-full w-full", className)} role="group" aria-label="แผนที่เรื่องผีในประเทศไทย">
      <path d={dots} stroke="var(--dot)" strokeWidth={dotSpacing * 0.4} strokeLinecap="round" />
      {pins.map((s) => {
        const r = (11 + Math.sqrt(s.count) * 6) * scale;
        const isSelected = s.province === selected;
        const fill = mode === "scare" ? scareColour(s.averageScare) : "var(--ember)";
        const name = isSelected || labelled.has(s.province);
        const select = onSelect ? () => onSelect(s.province) : undefined;
        return (
          <g
            key={s.province}
            role={select ? "button" : undefined}
            tabIndex={select ? 0 : undefined}
            aria-label={`${s.province} ${s.count} เรื่อง น่ากลัวเฉลี่ย ${s.averageScare.toFixed(1)}`}
            aria-pressed={select ? isSelected : undefined}
            onClick={select}
            onKeyDown={select ? (e: KeyboardEvent) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), select()) : undefined}
            className={cn(select && "cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-ring")}
          >
            <circle cx={s.x} cy={s.y} r={r + 7 * scale} fill="transparent" stroke={isSelected ? "var(--foreground)" : "none"} strokeWidth={3 * scale} />
            <circle cx={s.x} cy={s.y} r={r} fill={fill} stroke="var(--background)" strokeWidth={3 * scale} />
            {s.count >= 5 && (
              <text x={s.x} y={s.y} dy="0.35em" textAnchor="middle" fontSize={20 * scale} fontWeight={500} fill="#1a0806" className="pointer-events-none">
                {s.count}
              </text>
            )}
            {name && (
              <text
                x={s.x + r + 8 * scale}
                y={s.y}
                dy="0.35em"
                fontSize={(isSelected ? 30 : 24) * scale}
                fontWeight={isSelected ? 500 : 400}
                fill={isSelected ? "var(--foreground)" : "var(--muted-foreground)"}
                stroke="var(--background)"
                strokeWidth={6 * scale}
                paintOrder="stroke"
                className="pointer-events-none"
              >
                {s.province}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function regionViewBox(stats: ProvinceStat[]): string {
  if (stats.length === 0) return `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`;
  const pad = 120;
  const xs = stats.map((s) => s.x);
  const ys = stats.map((s) => s.y);
  let [x0, x1, y0, y1] = [Math.min(...xs) - pad, Math.max(...xs) + pad, Math.min(...ys) - pad, Math.max(...ys) + pad];
  // Keep at least a third of the country in view so a single pin doesn't fill the screen.
  const minW = MAP_WIDTH / 2;
  const minH = MAP_HEIGHT / 3;
  if (x1 - x0 < minW) [x0, x1] = [(x0 + x1 - minW) / 2, (x0 + x1 + minW) / 2];
  if (y1 - y0 < minH) [y0, y1] = [(y0 + y1 - minH) / 2, (y0 + y1 + minH) / 2];
  return `${x0.toFixed(0)} ${y0.toFixed(0)} ${(x1 - x0).toFixed(0)} ${(y1 - y0).toFixed(0)}`;
}

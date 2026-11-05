import type { ArchiveStory } from "./archive";
import { PROVINCE_LOCATION, REGION_OF, type Region } from "./province-geo";
import { isProvince, type Province } from "./provinces";
import { THAILAND_OUTLINE } from "./thailand-outline";

/**
 * Map space: an equirectangular projection of Thailand where one degree of latitude is 100 units,
 * and longitude is narrowed by cos(13°), Thailand's middle latitude, so shapes keep their proportions.
 */
export const MAP_BOUNDS = { west: 97.2, east: 105.8, north: 20.6, south: 5.5 } as const;
const UNITS_PER_DEGREE = 100;
const X_SCALE = UNITS_PER_DEGREE * Math.cos((13 * Math.PI) / 180);
export const MAP_WIDTH = Math.round((MAP_BOUNDS.east - MAP_BOUNDS.west) * X_SCALE);
export const MAP_HEIGHT = Math.round((MAP_BOUNDS.north - MAP_BOUNDS.south) * UNITS_PER_DEGREE);

export type MapPoint = { x: number; y: number };

export type ProvinceStat = MapPoint & {
  province: Province;
  region: Region;
  count: number;
  averageScare: number;
  /** 1 is the Province whose Stories are the most frightening on average. */
  scareRank: number;
};

export function project(longitude: number, latitude: number): MapPoint {
  return { x: (longitude - MAP_BOUNDS.west) * X_SCALE, y: (MAP_BOUNDS.north - latitude) * UNITS_PER_DEGREE };
}

function unproject({ x, y }: MapPoint): [number, number] {
  return [MAP_BOUNDS.west + x / X_SCALE, MAP_BOUNDS.north - y / UNITS_PER_DEGREE];
}

export function regionOf(province: Province): Region {
  return REGION_OF[province];
}

const RING_BOXES = THAILAND_OUTLINE.map((ring) => {
  const lons = ring.map(([lon]) => lon);
  const lats = ring.map(([, lat]) => lat);
  return { ring, west: Math.min(...lons), east: Math.max(...lons), south: Math.min(...lats), north: Math.max(...lats) };
});

export function isOnLand(longitude: number, latitude: number): boolean {
  return RING_BOXES.some(
    (b) =>
      longitude >= b.west &&
      longitude <= b.east &&
      latitude >= b.south &&
      latitude <= b.north &&
      insideRing(longitude, latitude, b.ring),
  );
}

function insideRing(x: number, y: number, ring: readonly (readonly [number, number])[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const dotCache = new Map<number, MapPoint[]>();

/** Points of a square grid, `spacing` map units apart, that fall on Thai land. */
export function landDots(spacing: number): MapPoint[] {
  let dots = dotCache.get(spacing);
  if (!dots) {
    dots = [];
    for (let y = spacing / 2; y < MAP_HEIGHT; y += spacing) {
      for (let x = spacing / 2; x < MAP_WIDTH; x += spacing) {
        const point = { x, y };
        if (isOnLand(...unproject(point))) dots.push(point);
      }
    }
    dotCache.set(spacing, dots);
  }
  return dots;
}

/** One entry per Province that has Stories, most Stories first. Stories without a Province are left out. */
export function provinceStats(stories: readonly ArchiveStory[]): ProvinceStat[] {
  const totals = new Map<Province, { count: number; scareSum: number }>();
  for (const story of stories) {
    if (!story.province || !isProvince(story.province)) continue;
    const total = totals.get(story.province) ?? { count: 0, scareSum: 0 };
    total.count += 1;
    total.scareSum += story.scareLevel;
    totals.set(story.province, total);
  }

  const stats = [...totals].map(([province, { count, scareSum }]) => ({
    province,
    region: REGION_OF[province],
    count,
    averageScare: scareSum / count,
    scareRank: 0,
    ...project(...PROVINCE_LOCATION[province]),
  }));

  const byName = (a: ProvinceStat, b: ProvinceStat) => a.province.localeCompare(b.province, "th");
  [...stats]
    .sort((a, b) => b.averageScare - a.averageScare || b.count - a.count || byName(a, b))
    .forEach((stat, i) => (stat.scareRank = i + 1));
  return stats.sort((a, b) => b.count - a.count || b.averageScare - a.averageScare || byName(a, b));
}

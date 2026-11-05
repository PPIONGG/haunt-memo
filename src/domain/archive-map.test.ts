import { describe, expect, it } from "vitest";
import type { ArchiveStory } from "./archive";
import { MAP_HEIGHT, MAP_WIDTH, isOnLand, landDots, project, provinceStats, regionOf } from "./archive-map";
import { PROVINCE_LOCATION, REGIONS } from "./province-geo";
import { PROVINCES } from "./provinces";

function story(id: string, province: string | null, scareLevel: number): ArchiveStory {
  return {
    id,
    youtubeId: "dQw4w9WgXcQ",
    displayTitle: id,
    synopsis: "",
    scareLevel,
    broadcastDate: "2024-01-01",
    addedAt: "2025-01-01T00:00:00Z",
    province,
    place: null,
    tags: [],
    storytellers: [],
  };
}

describe("provinceStats", () => {
  const stories = [
    story("a", "เชียงใหม่", 5),
    story("b", "เชียงใหม่", 2),
    story("c", "เชียงใหม่", 2),
    story("d", "สงขลา", 4),
    story("e", "สงขลา", 4),
    story("f", "นนทบุรี", 1),
    story("abroad", null, 5),
    story("typo", "เชียงไหม่", 5),
  ];

  it("counts Stories and averages their Scare Level per Province, most Stories first", () => {
    const stats = provinceStats(stories);
    expect(stats.map((s) => [s.province, s.count, s.averageScare])).toEqual([
      ["เชียงใหม่", 3, 3],
      ["สงขลา", 2, 4],
      ["นนทบุรี", 1, 1],
    ]);
  });

  it("leaves out Stories without a known Province", () => {
    const total = provinceStats(stories).reduce((sum, s) => sum + s.count, 0);
    expect(total).toBe(6);
  });

  it("ranks Provinces by average Scare Level, scariest first", () => {
    const rank = Object.fromEntries(provinceStats(stories).map((s) => [s.province, s.scareRank]));
    expect(rank).toEqual({ สงขลา: 1, เชียงใหม่: 2, นนทบุรี: 3 });
  });

  it("places each Province at its capital and names its Region", () => {
    const [chiangMai] = provinceStats(stories);
    expect(chiangMai.region).toBe("เหนือ");
    expect({ x: chiangMai.x, y: chiangMai.y }).toEqual(project(...PROVINCE_LOCATION["เชียงใหม่"]));
  });

  it("returns nothing for an empty Archive", () => {
    expect(provinceStats([])).toEqual([]);
  });
});

describe("Province geography", () => {
  it("gives every one of the 77 Provinces a Region", () => {
    for (const province of PROVINCES) expect(REGIONS).toContain(regionOf(province));
  });

  it("puts every Province capital on Thai land, inside the map", () => {
    for (const province of PROVINCES) {
      const [lon, lat] = PROVINCE_LOCATION[province];
      const { x, y } = project(lon, lat);
      expect(x, province).toBeGreaterThan(0);
      expect(x, province).toBeLessThan(MAP_WIDTH);
      expect(y, province).toBeGreaterThan(0);
      expect(y, province).toBeLessThan(MAP_HEIGHT);
      expect(isOnLand(lon, lat), province).toBe(true);
    }
  });
});

describe("isOnLand", () => {
  it("is true inland and on Phuket, false at sea and in neighbouring countries", () => {
    expect(isOnLand(100.5, 15)).toBe(true);
    expect(isOnLand(98.33, 7.95)).toBe(true);
    expect(isOnLand(100.8, 11)).toBe(false); // Gulf of Thailand
    expect(isOnLand(97.5, 10)).toBe(false); // Andaman Sea
    expect(isOnLand(102.6, 18.5)).toBe(false); // Laos, across the Mekong
  });
});

describe("landDots", () => {
  it("returns grid points inside the map, and the same array for the same spacing", () => {
    const dots = landDots(20);
    expect(dots.length).toBeGreaterThan(300);
    for (const { x, y } of dots) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(MAP_WIDTH);
      expect(y).toBeLessThan(MAP_HEIGHT);
    }
    expect(landDots(20)).toBe(dots);
  });
});

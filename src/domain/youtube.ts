export type YouTubeId = string;

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"]);
const PATH_ID_PREFIXES = ["/shorts/", "/embed/", "/live/"];

export function parseYouTubeUrl(input: string): YouTubeId | null {
  const url = toUrl(input.trim());
  if (!url) return null;
  const candidate = extractCandidate(url);
  return candidate && YOUTUBE_ID.test(candidate) ? candidate : null;
}

const THUMBNAIL_FILES = { hq: "hqdefault.jpg", max: "maxresdefault.jpg" } as const;

/**
 * `hq` (480×360) exists for every clip but is letterboxed, so show it at 16:9 to crop the bars.
 * `max` (1280×720) is sharper but missing for some older clips, so keep `hq` as a fallback.
 */
export function youTubeThumbnailUrl(id: YouTubeId, size: keyof typeof THUMBNAIL_FILES = "hq"): string {
  return `https://i.ytimg.com/vi/${id}/${THUMBNAIL_FILES[size]}`;
}

export function youTubeWatchUrl(id: YouTubeId): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

const PUBLISH_DATE_PATTERNS = [
  /"publishDate":"([^"]+)"/,
  /itemprop="datePublished"\s+content="([^"]+)"/,
  /"uploadDate":"([^"]+)"/,
  /itemprop="uploadDate"\s+content="([^"]+)"/,
];

const thaiCalendarDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Bangkok",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Reads the day a clip went public from the HTML of its YouTube watch page, as `YYYY-MM-DD` in Thai time.
 * The Broadcast Date is usually that day, so the admin form uses it as a starting value.
 */
export function parseYouTubePublishDate(html: string): string | null {
  for (const pattern of PUBLISH_DATE_PATTERNS) {
    const raw = pattern.exec(html)?.[1];
    if (!raw) continue;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const instant = new Date(raw);
    if (!Number.isNaN(instant.getTime())) return thaiCalendarDate.format(instant);
  }
  return null;
}

function toUrl(text: string): URL | null {
  if (!text) return null;
  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    return new URL(withScheme);
  } catch {
    return null;
  }
}

function extractCandidate(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (host === "youtu.be") return url.pathname.slice(1).split("/")[0];
  if (!YOUTUBE_HOSTS.has(host)) return null;
  const prefix = PATH_ID_PREFIXES.find((p) => url.pathname.startsWith(p));
  if (prefix) return url.pathname.slice(prefix.length).split("/")[0];
  return url.searchParams.get("v");
}

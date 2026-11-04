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

export function youTubeThumbnailUrl(id: YouTubeId): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youTubeWatchUrl(id: YouTubeId): string {
  return `https://www.youtube.com/watch?v=${id}`;
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

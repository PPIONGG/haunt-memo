import { describe, expect, it } from "vitest";
import { parseYouTubePublishDate, parseYouTubeUrl } from "./youtube";

describe("parseYouTubeUrl", () => {
  it("reads the id from a watch URL", () => {
    expect(parseYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("reads the id from a youtu.be short link with a share param", () => {
    expect(parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?si=AbCdEf123")).toBe("dQw4w9WgXcQ");
  });

  it("reads the id from a shorts URL", () => {
    expect(parseYouTubeUrl("https://youtube.com/shorts/dQw4w9WgXcQ?feature=share")).toBe("dQw4w9WgXcQ");
  });

  it("reads the id from an embed URL", () => {
    expect(parseYouTubeUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("reads the id from a mobile watch URL with extra query params before v", () => {
    expect(
      parseYouTubeUrl("https://m.youtube.com/watch?feature=shared&t=120&v=dQw4w9WgXcQ&list=PL123"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("accepts a link pasted without a scheme and with surrounding whitespace", () => {
    expect(parseYouTubeUrl("  youtu.be/dQw4w9WgXcQ \n")).toBe("dQw4w9WgXcQ");
  });

  it.each([
    ["empty input", ""],
    ["text that isn't a URL", "เรื่องผีโรงพยาบาล"],
    ["a non-YouTube host", "https://vimeo.com/watch?v=dQw4w9WgXcQ"],
    ["a channel page", "https://www.youtube.com/@TheGhostRadio"],
    ["a watch URL without an id", "https://www.youtube.com/watch?list=PL123"],
    ["an id of the wrong length", "https://youtu.be/abc"],
  ])("returns null for %s", (_label, input) => {
    expect(parseYouTubeUrl(input)).toBeNull();
  });
});

describe("parseYouTubePublishDate", () => {
  it("reads the publish date in Thai time", () => {
    // 23:57 in California on 24 Oct is already the afternoon of 25 Oct in Thailand.
    const html = `<script>{"publishDate":"2009-10-24T23:57:33-07:00","uploadDate":"2009-10-24T23:57:33-07:00"}</script>`;
    expect(parseYouTubePublishDate(html)).toBe("2009-10-25");
  });

  it("prefers the publish date over the upload date of a scheduled clip", () => {
    const html = `"uploadDate":"2024-03-01T10:00:00+07:00" "publishDate":"2024-03-08T20:00:00+07:00"`;
    expect(parseYouTubePublishDate(html)).toBe("2024-03-08");
  });

  it("falls back to the meta tags", () => {
    const html = `<meta itemprop="uploadDate" content="2023-12-31T20:00:00+07:00">`;
    expect(parseYouTubePublishDate(html)).toBe("2023-12-31");
  });

  it("accepts a plain date", () => {
    expect(parseYouTubePublishDate(`<meta itemprop="datePublished" content="2022-05-06">`)).toBe("2022-05-06");
  });

  it("returns null when the page has no date", () => {
    expect(parseYouTubePublishDate("<html><body>consent page</body></html>")).toBeNull();
    expect(parseYouTubePublishDate(`"publishDate":"not a date"`)).toBeNull();
  });
});

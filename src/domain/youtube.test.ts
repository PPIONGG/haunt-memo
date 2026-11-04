import { describe, expect, it } from "vitest";
import { parseYouTubeUrl } from "./youtube";

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

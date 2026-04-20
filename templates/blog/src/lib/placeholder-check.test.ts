import { describe, it, expect } from "vitest";
import { findPlaceholderWarnings } from "./placeholder-check";

const CUSTOMISED = {
  siteName: "My Blog",
  siteAuthor: "Alice",
  siteDescription: "A real description.",
  astroSiteUrl: "https://example.org",
};

describe("findPlaceholderWarnings", () => {
  it("returns no warnings when every value is customised", () => {
    expect(findPlaceholderWarnings(CUSTOMISED)).toEqual([]);
  });

  it("warns when site name is the placeholder", () => {
    const result = findPlaceholderWarnings({ ...CUSTOMISED, siteName: "My Site" });
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("config.site.name");
  });

  it("warns when author is the placeholder", () => {
    const result = findPlaceholderWarnings({ ...CUSTOMISED, siteAuthor: "Your Name" });
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("config.site.author");
  });

  it("warns when description is the placeholder", () => {
    const result = findPlaceholderWarnings({
      ...CUSTOMISED,
      siteDescription: "My site powered by Notion and Astro.",
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("config.site.description");
  });

  it("warns when astro site URL is example.com", () => {
    const result = findPlaceholderWarnings({
      ...CUSTOMISED,
      astroSiteUrl: "https://example.com",
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("astro.config.mjs");
    expect(result[0]).toContain("SITE_URL");
  });

  it("accumulates multiple warnings independently", () => {
    const result = findPlaceholderWarnings({
      siteName: "My Site",
      siteAuthor: "Your Name",
      siteDescription: "My site powered by Notion and Astro.",
      astroSiteUrl: "https://example.com",
    });
    expect(result).toHaveLength(4);
  });

  it("does not warn when astro site URL is undefined", () => {
    expect(
      findPlaceholderWarnings({ ...CUSTOMISED, astroSiteUrl: undefined }),
    ).toEqual([]);
  });
});

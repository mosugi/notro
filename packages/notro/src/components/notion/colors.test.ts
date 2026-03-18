import { describe, it, expect } from "vitest";
import { colorToCSS } from "./colors.js";

// ============================================================
// colorToCSS — Notion color name → CSS style string
// ============================================================

describe("colorToCSS: undefined / empty input", () => {
  it("returns empty string for undefined", () => {
    expect(colorToCSS(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(colorToCSS("")).toBe("");
  });
});

describe("colorToCSS: plain text colors", () => {
  it("gray → text color", () => {
    expect(colorToCSS("gray")).toBe("color:#787774");
  });

  it("blue → text color", () => {
    expect(colorToCSS("blue")).toBe("color:#337EA9");
  });

  it("red → text color", () => {
    expect(colorToCSS("red")).toBe("color:#D44C47");
  });

  it("green → text color", () => {
    expect(colorToCSS("green")).toBe("color:#448361");
  });

  it("yellow → text color", () => {
    expect(colorToCSS("yellow")).toBe("color:#CB912F");
  });

  it("orange → text color", () => {
    expect(colorToCSS("orange")).toBe("color:#D9730D");
  });

  it("brown → text color", () => {
    expect(colorToCSS("brown")).toBe("color:#9F6B53");
  });

  it("purple → text color", () => {
    expect(colorToCSS("purple")).toBe("color:#9065B0");
  });

  it("pink → text color", () => {
    expect(colorToCSS("pink")).toBe("color:#C14C8A");
  });
});

describe("colorToCSS: _bg suffix (background colors)", () => {
  it("gray_bg → background-color", () => {
    expect(colorToCSS("gray_bg")).toBe("background-color:#F1F1EF");
  });

  it("blue_bg → background-color", () => {
    expect(colorToCSS("blue_bg")).toBe("background-color:#E7F3F8");
  });

  it("red_bg → background-color", () => {
    expect(colorToCSS("red_bg")).toBe("background-color:#FDEBEC");
  });

  it("green_bg → background-color", () => {
    expect(colorToCSS("green_bg")).toBe("background-color:#EDF3EC");
  });

  it("yellow_bg → background-color", () => {
    expect(colorToCSS("yellow_bg")).toBe("background-color:#FBF3DB");
  });

  it("purple_bg → background-color", () => {
    expect(colorToCSS("purple_bg")).toBe("background-color:#F6F3F9");
  });
});

describe("colorToCSS: _background suffix (Notion API form)", () => {
  // Notion API uses the _background suffix form for background colors.
  // The implementation supports both _background and _bg suffixes.
  it("gray_background → background-color", () => {
    expect(colorToCSS("gray_background")).toBe("background-color:#F1F1EF");
  });

  it("blue_background → background-color", () => {
    expect(colorToCSS("blue_background")).toBe("background-color:#E7F3F8");
  });

  it("red_background → background-color", () => {
    expect(colorToCSS("red_background")).toBe("background-color:#FDEBEC");
  });

  it("green_background → background-color", () => {
    expect(colorToCSS("green_background")).toBe("background-color:#EDF3EC");
  });

  it("yellow_background → background-color", () => {
    expect(colorToCSS("yellow_background")).toBe("background-color:#FBF3DB");
  });
});

describe("colorToCSS: unknown color values", () => {
  it("returns empty string for completely unknown color name", () => {
    expect(colorToCSS("magenta")).toBe("");
  });

  it("returns empty string for unknown color with _bg suffix", () => {
    expect(colorToCSS("magenta_bg")).toBe("");
  });

  it("returns empty string for 'default' (not in color map)", () => {
    // 'default' is used by Notion to mean no color
    expect(colorToCSS("default")).toBe("");
  });
});

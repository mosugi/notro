import { describe, it, expect } from "vitest";
import { colorToClass } from "./colors.js";

// ============================================================
// colorToClass — Notion color name → CSS class name (nt-color-*)
// ============================================================

describe("colorToClass: undefined / empty input", () => {
  it("returns empty string for undefined", () => {
    expect(colorToClass(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(colorToClass("")).toBe("");
  });

  it("returns empty string for 'default' (not a color)", () => {
    expect(colorToClass("default")).toBe("");
  });
});

describe("colorToClass: plain text colors", () => {
  it("gray → nt-color-gray", () => {
    expect(colorToClass("gray")).toBe("nt-color-gray");
  });

  it("blue → nt-color-blue", () => {
    expect(colorToClass("blue")).toBe("nt-color-blue");
  });

  it("red → nt-color-red", () => {
    expect(colorToClass("red")).toBe("nt-color-red");
  });

  it("green → nt-color-green", () => {
    expect(colorToClass("green")).toBe("nt-color-green");
  });

  it("yellow → nt-color-yellow", () => {
    expect(colorToClass("yellow")).toBe("nt-color-yellow");
  });

  it("orange → nt-color-orange", () => {
    expect(colorToClass("orange")).toBe("nt-color-orange");
  });

  it("brown → nt-color-brown", () => {
    expect(colorToClass("brown")).toBe("nt-color-brown");
  });

  it("purple → nt-color-purple", () => {
    expect(colorToClass("purple")).toBe("nt-color-purple");
  });

  it("pink → nt-color-pink", () => {
    expect(colorToClass("pink")).toBe("nt-color-pink");
  });
});

describe("colorToClass: _background suffix (Notion API form)", () => {
  it("gray_background → nt-color-gray_background", () => {
    expect(colorToClass("gray_background")).toBe("nt-color-gray_background");
  });

  it("blue_background → nt-color-blue_background", () => {
    expect(colorToClass("blue_background")).toBe("nt-color-blue_background");
  });

  it("red_background → nt-color-red_background", () => {
    expect(colorToClass("red_background")).toBe("nt-color-red_background");
  });

  it("green_background → nt-color-green_background", () => {
    expect(colorToClass("green_background")).toBe("nt-color-green_background");
  });

  it("yellow_background → nt-color-yellow_background", () => {
    expect(colorToClass("yellow_background")).toBe("nt-color-yellow_background");
  });
});

describe("colorToClass: unknown color values", () => {
  it("returns empty string for completely unknown color name", () => {
    expect(colorToClass("magenta")).toBe("");
  });
});


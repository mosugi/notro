import { describe, it, expect } from "vitest";
import { isActive } from "./nav";

describe("isActive", () => {
  it("matches identical paths exactly", () => {
    expect(isActive("/blog/", "/blog/")).toBe(true);
  });

  it("treats trailing slashes as equivalent on both sides", () => {
    expect(isActive("/blog", "/blog/")).toBe(true);
    expect(isActive("/blog/", "/blog")).toBe(true);
    expect(isActive("/blog", "/blog")).toBe(true);
  });

  it("returns false when paths differ", () => {
    expect(isActive("/blog/", "/docs/")).toBe(false);
  });

  it("does not treat a prefix match as active", () => {
    expect(isActive("/blog/", "/blog-extra/")).toBe(false);
    expect(isActive("/blog-extra/", "/blog/")).toBe(false);
  });

  it("does not treat a nested path as active for the parent link", () => {
    expect(isActive("/blog/hello/", "/blog/")).toBe(false);
  });

  it("matches the root path", () => {
    expect(isActive("/", "/")).toBe(true);
  });
});

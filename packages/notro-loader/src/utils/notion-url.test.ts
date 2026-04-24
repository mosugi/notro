import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isPresignedUrlExpired } from "./notion-url.ts";

// Build a fake S3 presigned URL with the given issued-at time and expiry.
function makePresignedUrl(issuedAt: Date, expiresSeconds: number): string {
  const date = issuedAt
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z$/, "Z"); // YYYYMMDDTHHmmssZ
  return `https://prod-files-secure.s3.us-west-2.amazonaws.com/file.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=${date}&X-Amz-Expires=${expiresSeconds}&X-Amz-Signature=abc`;
}

describe("isPresignedUrlExpired", () => {
  const NOW = new Date("2024-06-01T12:00:00Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false for a URL that is still valid (well within expiry)", () => {
    // issued 30 min ago, expires in 60 min → 30 min remaining
    const issuedAt = new Date(NOW - 30 * 60 * 1000);
    const url = makePresignedUrl(issuedAt, 3600);
    expect(isPresignedUrlExpired(url)).toBe(false);
  });

  it("returns true for a URL that has already expired", () => {
    // issued 2 hours ago, expires in 1 hour → expired 1 hour ago
    const issuedAt = new Date(NOW - 2 * 60 * 60 * 1000);
    const url = makePresignedUrl(issuedAt, 3600);
    expect(isPresignedUrlExpired(url)).toBe(true);
  });

  it("returns true when within the default 1-minute buffer window", () => {
    // issued 59 min 30 sec ago, expires in 60 min → 30 sec remaining (< 60s buffer)
    const issuedAt = new Date(NOW - (60 * 60 - 30) * 1000);
    const url = makePresignedUrl(issuedAt, 3600);
    expect(isPresignedUrlExpired(url)).toBe(true);
  });

  it("respects a custom bufferMs of 0", () => {
    // issued 59 min 59 sec ago, expires in 60 min → 1 sec remaining
    const issuedAt = new Date(NOW - (60 * 60 - 1) * 1000);
    const url = makePresignedUrl(issuedAt, 3600);
    expect(isPresignedUrlExpired(url, 0)).toBe(false);
  });

  it("returns true for a non-URL string", () => {
    expect(isPresignedUrlExpired("not-a-url")).toBe(true);
  });

  it("returns true when X-Amz-Date is missing", () => {
    const url =
      "https://prod-files-secure.s3.us-west-2.amazonaws.com/file.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600";
    expect(isPresignedUrlExpired(url)).toBe(true);
  });

  it("returns true when X-Amz-Expires is missing", () => {
    const url =
      "https://prod-files-secure.s3.us-west-2.amazonaws.com/file.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240601T120000Z";
    expect(isPresignedUrlExpired(url)).toBe(true);
  });

  it("returns false for a plain external URL (no X-Amz-* params, non-S3 host)", () => {
    expect(isPresignedUrlExpired("https://example.com/image.png")).toBe(false);
  });

  it("returns true for a Notion S3 URL without X-Amz-* params (conservative)", () => {
    expect(
      isPresignedUrlExpired(
        "https://prod-files-secure.s3.amazonaws.com/file.png",
      ),
    ).toBe(true);
  });
});

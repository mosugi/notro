import sharpImageService from "astro/assets/services/sharp";

export const notionImageServiceConfig = () => ({
  entrypoint: "./src/lib/notionImageService.ts",
  config: {},
});

// Notion pre-signed S3 URLs contain expiring query parameters (X-Amz-*).
// Stripping them yields a stable cache key so the same image reuses the cached
// build output even when a fresh pre-signed URL is fetched on every build.
function normalizeNotionPresignedUrl(src: string): string {
  try {
    const url = new URL(src);
    if (url.searchParams.has("X-Amz-Algorithm")) {
      return `${url.protocol}//${url.hostname}${url.pathname}`;
    }
  } catch {
    // Not a valid URL, return as-is
  }
  return src;
}

const notionImageService = {
  ...sharpImageService,
  getURL(
    options: Parameters<typeof sharpImageService.getURL>[0],
    serviceConfig: Parameters<typeof sharpImageService.getURL>[1],
  ): string {
    return sharpImageService.getURL(
      {
        ...options,
        src:
          typeof options.src === "string"
            ? normalizeNotionPresignedUrl(options.src)
            : options.src,
      },
      serviceConfig,
    );
  },
};

export default notionImageService;

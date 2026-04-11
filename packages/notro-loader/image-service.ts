import sharpImageService from "astro/assets/services/sharp";
import { normalizeNotionPresignedUrl } from "./src/utils/notion-url.ts";

/**
 * Astro image service config for astro.config.mjs.
 *
 * Notion images are served from pre-signed S3 URLs whose query parameters
 * (X-Amz-*) expire after ~1 hour. Astro derives the image cache key from
 * the full URL, so a fresh URL on each build causes a cache miss and forces
 * re-optimization every time. This service strips those expiring parameters
 * before the cache key is computed, so the optimized output is reused across
 * builds as long as the underlying file is unchanged.
 *
 * @example
 * // astro.config.mjs
 * import { notionImageService } from "notro-loader/image-service";
 * export default defineConfig({
 *   image: { service: notionImageService },
 * });
 */
export const notionImageService = {
  entrypoint: "notro-loader/image-service",
  config: {},
};

// Runtime image service — called by Astro during the build.
// Must be the default export of the module named in `entrypoint` above.
export default {
  ...sharpImageService,
  getURL(
    options: Parameters<typeof sharpImageService.getURL>[0],
    serviceConfig: Parameters<typeof sharpImageService.getURL>[1],
  ): ReturnType<typeof sharpImageService.getURL> {
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

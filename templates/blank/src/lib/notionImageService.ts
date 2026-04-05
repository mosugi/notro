import sharpImageService from "astro/assets/services/sharp";
import { normalizeNotionPresignedUrl } from "notro-loader/utils";

/**
 * Returns the Astro image service config object for astro.config.mjs.
 *
 * `entrypoint` is a self-reference to this file. Astro's image service API
 * requires a module path that exports the service as `default`. By pointing
 * back to this file, we ship a single file that acts as both the config helper
 * (exported as `notionImageServiceConfig`) and the runtime service (exported
 * as `default`).
 */
export const notionImageServiceConfig = () => ({
  entrypoint: "./src/lib/notionImageService.ts",
  config: {},
});

/**
 * Astro image service that wraps the built-in Sharp service.
 *
 * Notion images use pre-signed S3 URLs whose query parameters (X-Amz-*)
 * expire after ~1 hour. Astro's image cache key is derived from the full URL,
 * so a new URL per build produces a cache miss and forces re-optimization on
 * every build. This service strips the expiring query parameters before the
 * cache key is computed, so the same image re-uses the cached optimized output
 * across builds as long as the file path is unchanged.
 */
const notionImageService = {
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

export default notionImageService;

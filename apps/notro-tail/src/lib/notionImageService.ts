import sharpImageService from "astro/assets/services/sharp";
import { normalizeNotionPresignedUrl } from "notro";

export const notionImageServiceConfig = () => ({
  entrypoint: "./src/lib/notionImageService.ts",
  config: {},
});

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

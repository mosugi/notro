import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { notionImageServiceConfig } from "./src/lib/notionImageService.js";

// https://astro.build/config
export default defineConfig({
  site: "https://notrotail.mosugi.com",

  image: {
    service: notionImageServiceConfig(),
    remotePatterns: [
      {
        protocol: "https",
      },
    ],
  },

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});

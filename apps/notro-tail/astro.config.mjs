import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { notionImageServiceConfig } from "./src/lib/notionImageService.js";
import { ProxyAgent, setGlobalDispatcher } from "undici";

const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
if (httpsProxy) {
  setGlobalDispatcher(new ProxyAgent(httpsProxy));
}

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

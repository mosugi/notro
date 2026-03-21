import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { notionImageServiceConfig } from "./src/lib/notionImageService.js";
import { notro } from "notro/integration";

// Apply HTTPS proxy for corporate networks or CI environments.
// Node.js does not honor the system https_proxy env var by default; undici
// (the HTTP client used by @notionhq/client under the hood) requires explicit
// dispatcher configuration. Without this, Notion API calls fail silently
// behind a proxy.
const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
if (httpsProxy) {
  const { ProxyAgent, setGlobalDispatcher } = await import("undici");
  setGlobalDispatcher(new ProxyAgent(httpsProxy));
}

// https://astro.build/config
export default defineConfig({
  site: "https://notrotail.mosugi.com",

  redirects: {
    "/contact/": "/docs/",
  },

  image: {
    service: notionImageServiceConfig(),
    // Restrict to Notion-related S3 domains and notion.so origins.
    // Notion images are served from AWS S3 (various subdomains) and notion.so CDN.
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "prod-files-secure.s3.us-west-2.amazonaws.com" },
      { protocol: "https", hostname: "www.notion.so" },
      { protocol: "https", hostname: "notion.so" },
    ],
  },

  integrations: [notro(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});

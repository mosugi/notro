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

  image: {
    service: notionImageServiceConfig(),
    // Allow all HTTPS origins. Notion images are served from dynamic S3
    // subdomains that change per region and cannot be enumerated in advance.
    remotePatterns: [
      {
        protocol: "https",
      },
    ],
  },

  integrations: [notro(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});

import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import tailwindcss from "@tailwindcss/vite";
import { notionImageServiceConfig } from "./src/lib/notionImageService.js";
import { notro } from "notro/integration";
import { rehypeMermaid } from "rehype-mermaid";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// To enable SSR, install the adapter for your platform and uncomment the relevant lines:
// - Vercel:     npm i @astrojs/vercel     → import vercel from "@astrojs/vercel";
// - Netlify:    npm i @astrojs/netlify    → import netlify from "@astrojs/netlify";
// - Cloudflare Workers: npm i @astrojs/cloudflare → import cloudflare from "@astrojs/cloudflare"; (v13+, Workers only)

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

  // output: "server",   // Uncomment to enable SSR
  // adapter: vercel(),  // Match your platform (vercel / netlify / cloudflare)

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

  integrations: [
    notro({
      // Shiki is injected last automatically, after rehypeMermaid and rehypeKatex.
      shikiConfig: { theme: "github-dark" },
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        [rehypeMermaid, { theme: "github-dark" }],
        rehypeKatex,
      ],
    }),
    sitemap(),
    // Offloads third-party scripts (Google Analytics) to a web worker via Partytown.
    // "dataLayer.push" must be forwarded so gtag() calls reach the worker.
    partytown({ config: { forward: ["dataLayer.push"] } }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});

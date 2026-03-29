import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import tailwindcss from "@tailwindcss/vite";
import { notionImageServiceConfig } from "./src/lib/notionImageService.js";
import { notro } from "notro/integration";
import { rehypeMermaid } from "notro/utils";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";

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
    // Allow any HTTPS remote image so that Notion content images
    // (S3 pre-signed URLs, CDN URLs, etc.) can be processed by the
    // notionImageService and optimized by Sharp.
    remotePatterns: [{ protocol: "https" }],
  },

  integrations: [
    notro({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        // rehypeMermaid must come before rehypeShiki so Shiki doesn't
        // syntax-highlight mermaid code blocks before they are rendered.
        [rehypeMermaid, { theme: "github-dark" }],
        rehypeKatex,
        [rehypeShiki, { theme: "github-dark" }],
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

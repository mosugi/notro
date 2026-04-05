import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://notrotail.mosugi.com",
  integrations: [
    starlight({
      title: "notro",
      description: "Notion-to-Astro static site generator",
      logo: {
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
        replacesTitle: false,
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/mosugi/notro-tail",
        },
        {
          icon: "npm",
          label: "npm",
          href: "https://www.npmjs.com/package/notro",
        },
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Introduction", slug: "getting-started/introduction" },
            { label: "Quick Start", slug: "getting-started/quick-start" },
            { label: "Notion Setup", slug: "getting-started/notion-setup" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Configuration", slug: "guides/configuration" },
            { label: "Customizing Components", slug: "guides/customizing-components" },
            { label: "Content Collections", slug: "guides/content-collections" },
            { label: "Tags & Filtering", slug: "guides/tags-and-filtering" },
            { label: "RSS & Sitemap", slug: "guides/rss-and-sitemap" },
          ],
        },
        {
          label: "Deployment",
          items: [
            { label: "Cloudflare Pages", slug: "deployment/cloudflare-pages" },
            { label: "Vercel", slug: "deployment/vercel" },
            { label: "Netlify", slug: "deployment/netlify" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "notro() Integration", slug: "reference/integration" },
            { label: "loader()", slug: "reference/loader" },
            { label: "NotroContent", slug: "reference/notro-content" },
            { label: "Markdown Pipeline", slug: "reference/markdown-pipeline" },
          ],
        },
      ],
      editLink: {
        baseUrl: "https://github.com/mosugi/notro-tail/edit/main/docs/",
      },
    }),
  ],
});

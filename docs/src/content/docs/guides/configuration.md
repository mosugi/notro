---
title: Configuration
description: Configure your notro site via src/config.ts and astro.config.mjs.
---

## src/config.ts

`src/config.ts` is the main configuration file for your site. Edit it to set your site name, navigation, and other options.

```ts
const config = {
  site: {
    name: "My Site",
    description: "My site powered by Notion and Astro.",
    author: "Your Name",
    lang: "ja",           // BCP 47 language tag
    locale: "ja_JP",      // og:locale
  },
  analytics: {
    gaMeasurementId: undefined, // e.g. "G-XXXXXXXXXX"
  },
  blog: {
    postsPerPage: 10,
    internalTags: ["page", "pinned"],
  },
  navigation: {
    nav: [
      { href: "/blog/", label: "Blog" },
    ],
    footer: [/* ... */],
    social: {
      github: "https://github.com/...",
    },
  },
};
```

## astro.config.mjs

Key configuration in `astro.config.mjs`:

```js
export default defineConfig({
  site: "https://your-domain.com",  // Required for sitemap + og:url
  integrations: [
    notro({
      shikiConfig: { theme: "github-dark" },  // Code block theme
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeMermaid, { theme: "github-dark" }], rehypeKatex],
    }),
    sitemap(),
    partytown({ config: { forward: ["dataLayer.push"] } }),
  ],
});
```

The `notro()` integration registers `@astrojs/mdx` with the correct plugin pipeline. It is required.

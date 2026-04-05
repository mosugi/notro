---
title: RSS & Sitemap
description: Configure RSS feed and sitemap for your notro site.
---

## RSS Feed

The template generates an RSS feed at `/rss.xml` via `src/pages/rss.xml.ts`.

Ensure `site` is set in `astro.config.mjs`:

```js
export default defineConfig({
  site: "https://your-domain.com",
  // ...
});
```

The feed title defaults to `config.site.name`. Edit `src/pages/rss.xml.ts` to customize the feed description and items.

## Sitemap

The `@astrojs/sitemap` integration is pre-configured. It automatically generates `sitemap-index.xml` and `sitemap-0.xml` on each build.

No additional configuration is needed. The `site` URL in `astro.config.mjs` is used as the base for all sitemap URLs.

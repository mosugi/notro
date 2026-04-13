---
slug: guides/configuration
title: Configuration
---

# Configuration

This page covers all configuration options for notro — the Astro integration, environment variables, and the image service.

## astro.config.mjs

A typical `astro.config.mjs` for the blog template looks like this:

```js
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { notro } from "notro-loader/integration";
import { notionImageService } from "notro-loader/image-service";
import { rehypeMermaid } from "rehype-beautiful-mermaid";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  site: "https://example.com",
  image: {
    service: notionImageService,
  },
  integrations: [
    notro({
      shikiConfig: { theme: "github-dark" },
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        [rehypeMermaid, { theme: "github-dark" }],
        rehypeKatex,
      ],
    }),
    sitemap(),
  ],
});
```

## notro() integration options

The `notro()` integration registers `@astrojs/mdx` with notro's core plugin suite. All options are optional.

| Option | Type | Default | Description |
|---|---|---|---|
| `remarkPlugins` | `PluggableList` | `[]` | Additional remark plugins appended after `remarkNfm` |
| `rehypePlugins` | `PluggableList` | `[]` | Additional rehype plugins, inserted before `rehypeShiki` |
| `shikiConfig` | `Record<string, unknown>` | `undefined` | When set, injects `@shikijs/rehype` as the last plugin. Requires `npm i @shikijs/rehype` |
| `viteExternals` | `string[]` | `[]` | Packages to add to Vite's `ssr.external` (for native binaries like Mermaid) |
| `extendMarkdownConfig` | `boolean` | `false` | Whether to extend Astro's base markdown config |

### Adding syntax highlighting

```js
notro({
  shikiConfig: {
    theme: "github-dark",
    // or multiple themes:
    themes: { light: "github-light", dark: "github-dark" },
  },
}),
```

### Adding math support

```bash
pnpm add remark-math rehype-katex
```

```js
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

notro({
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
}),
```

### Adding Mermaid diagrams

```bash
pnpm add rehype-beautiful-mermaid
```

```js
import { rehypeMermaid } from "rehype-beautiful-mermaid";

notro({
  rehypePlugins: [[rehypeMermaid, { theme: "github-dark" }]],
  viteExternals: ["@mermaid-js/mermaid-zenuml"],  // if using ZenUML
}),
```

## Image service

`notionImageService` should be set as the `image.service` in `astro.config.mjs`. It wraps Astro's built-in Sharp service and strips Notion's expiring S3 URL parameters (`X-Amz-*`) before computing the image cache key, preventing redundant re-processing on every build.

```js
import { notionImageService } from "notro-loader/image-service";

export default defineConfig({
  image: {
    service: notionImageService,
  },
  // ...
});
```

If you do not configure this service, images will be re-processed on every build because Notion's pre-signed URLs change each time they are fetched.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NOTION_TOKEN` | ✓ | Notion Internal Integration Secret |
| `NOTION_DATASOURCE_ID` | ✓ | Notion database (data source) UUID |

Create a `.env` file in your project root (already in `.gitignore`):

```bash
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATASOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

For production, set these as environment variables in your hosting platform. See the deployment guides for details.

## TypeScript configuration

The generated `tsconfig.json` extends Astro's strict config. No changes are needed for notro.

If you see type errors from `@notionhq/client`, make sure `skipLibCheck: true` is set:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

## Site URL

Set the `site` option in `astro.config.mjs` to your production URL. This is required for canonical URLs, `og:url`, and the sitemap:

```js
export default defineConfig({
  site: "https://your-site.com",
  // ...
});
```

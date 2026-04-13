---
slug: reference/integration
title: "notro() Integration"
---

# notro() Integration

`notro()` is an Astro integration that registers `@astrojs/mdx` with notro's core remark/rehype plugin pipeline.

## Why it is required

`notro()` is required for two reasons:

1. **`astro:jsx` renderer** — `@astrojs/mdx` registers the `astro:jsx` renderer that `@mdx-js/mdx`'s `evaluate()` relies on to produce Astro VNodes. Without it, `NotroContent` fails at runtime.
2. **Static `.mdx` files** — if your project uses `.mdx` files alongside Notion content, `notro()` ensures they are processed with the same plugin pipeline as Notion content.

## Import

```js
// astro.config.mjs
import { notro } from "notro-loader/integration";
```

> **Important:** Always import from `notro-loader/integration`, not from `notro-loader`. The `/integration` entry point is safe to use in `astro.config.mjs` because it does not import any Astro components.

## Usage

```js
import { defineConfig } from "astro/config";
import { notro } from "notro-loader/integration";

export default defineConfig({
  integrations: [
    notro(),
  ],
});
```

## Options

All options are optional.

```ts
notro({
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  shikiConfig?: Record<string, unknown>;
  viteExternals?: string[];
  extendMarkdownConfig?: boolean;
})
```

### remarkPlugins

Additional remark plugins to append after `remarkNfm` in the pipeline.

```js
import remarkMath from "remark-math";

notro({
  remarkPlugins: [remarkMath],
})
```

Plugins are appended in the order provided.

### rehypePlugins

Additional rehype plugins to insert before `rehypeShiki` (if configured) in the pipeline.

```js
import rehypeKatex from "rehype-katex";
import { rehypeMermaid } from "rehype-beautiful-mermaid";

notro({
  rehypePlugins: [
    rehypeKatex,
    [rehypeMermaid, { theme: "github-dark" }],
  ],
})
```

Each item can be a plugin function or a `[plugin, options]` tuple.

### shikiConfig

When set, injects `@shikijs/rehype` as the last rehype plugin for syntax highlighting. Requires `@shikijs/rehype` to be installed separately.

```bash
pnpm add @shikijs/rehype
```

```js
notro({
  shikiConfig: {
    theme: "github-dark",
  },
})
```

All keys are passed directly to `@shikijs/rehype`. Refer to the [Shiki documentation](https://shiki.style/) for available themes and options.

**Dual-theme (light/dark) example:**

```js
notro({
  shikiConfig: {
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
  },
})
```

### viteExternals

Packages to add to Vite's `ssr.external`. Useful for packages with native binaries or dynamic imports that Vite should not bundle:

```js
notro({
  rehypePlugins: [[rehypeMermaid, { strategy: "img-svg" }]],
  viteExternals: ["@mermaid-js/mermaid-zenuml"],
})
```

### extendMarkdownConfig

When `true`, extends Astro's base markdown configuration with notro's plugin pipeline. Defaults to `false`.

This is rarely needed. Enable it only if you want notro's plugins to also process Astro's built-in `.md` and `.mdx` files (those not managed by the Notion loader).

## Plugin pipeline order

The full pipeline when all options are configured:

```
remarkNfm
  ↓ (user remarkPlugins)
rehypeRaw
rehypeNotionColor
rehypeBlockElements
rehypeInlineMentions
  ↓ (user rehypePlugins)
rehypeShiki          ← only if shikiConfig is set
rehypeSlug
rehypeToc
resolvePageLinks
```

## Type reference

```ts
interface NotroIntegrationOptions {
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  shikiConfig?: Record<string, unknown>;
  viteExternals?: string[];
  extendMarkdownConfig?: boolean;
}

function notro(options?: NotroIntegrationOptions): AstroIntegration;
```

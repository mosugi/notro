# rehype-beautiful-mermaid

![npm](https://img.shields.io/npm/v/rehype-beautiful-mermaid)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

A [rehype](https://github.com/rehypejs/rehype) plugin that renders ` ```mermaid ` code blocks to inline SVG at build time using [beautiful-mermaid](https://www.npmjs.com/package/beautiful-mermaid).

`beautiful-mermaid` is an optional peer dependency. If it is not installed, mermaid code blocks are left unchanged so downstream plugins (e.g. `@shikijs/rehype`) can still process them as ordinary code blocks.

## Installation

```sh
npm install rehype-beautiful-mermaid
# Install the rendering engine separately
npm install beautiful-mermaid
```

## Usage

### With notro (Astro + Notion)

Pass `rehypeMermaid` to `notro()` in `astro.config.mjs`. It must come **before** `rehypeKatex` and any syntax highlighter so that mermaid blocks are converted to SVG before other rehype plugins see them.

```js
// astro.config.mjs
import { notro } from "notro/integration";
import { rehypeMermaid } from "rehype-beautiful-mermaid";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";

export default defineConfig({
  integrations: [
    notro({
      rehypePlugins: [
        [rehypeMermaid, { theme: "github-dark" }], // must come before rehypeShiki
        rehypeKatex,
        [rehypeShiki, { theme: "github-dark" }],
      ],
    }),
  ],
});
```

### Standalone (any unified pipeline)

```ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { rehypeMermaid } from "rehype-beautiful-mermaid";

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeMermaid, { theme: "default" })
  .use(rehypeStringify);
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | `string` | `undefined` | beautiful-mermaid theme key (e.g. `"github-dark"`, `"default"`). Passed to `beautiful-mermaid`'s `THEMES` map. |
| `className` | `string` | `"notro-mermaid"` | CSS class applied to the `<div>` wrapper around each rendered SVG. |

## How it works

1. Visits all `<pre><code class="language-mermaid">` nodes in the hast tree.
2. Attempts to load `beautiful-mermaid` at runtime via a native ESM import (bypasses Vite's module runner so the plugin works correctly inside Astro's SSG prerender phase).
3. If `beautiful-mermaid` is not installed or fails to load, the plugin exits early and leaves all mermaid blocks unchanged.
4. For each mermaid block, calls `renderMermaidSVG()` to produce an SVG string, parses it into hast nodes, and replaces the `<pre>` block with a `<div class="notro-mermaid">` containing the SVG.

## Graceful fallback

If `beautiful-mermaid` is not installed, the plugin is a no-op. Mermaid code blocks remain as `<pre><code class="language-mermaid">` and can be processed by a syntax highlighter or left as-is.

## Relationship to notro

`rehype-beautiful-mermaid` is an optional add-on for the notro ecosystem. It has no dependency on `notro` and can be used in any rehype pipeline.

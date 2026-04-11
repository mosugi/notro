# remark-notro

![npm](https://img.shields.io/npm/v/remark-notro)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

A [remark](https://github.com/remarkjs/remark) plugin for Notion-flavored Markdown (NFM). It fixes structural issues in Notion Public API Markdown output and adds callout block support so content can be processed correctly in a remark pipeline.

> [!TIP]
> This package is used internally by [notro](https://www.npmjs.com/package/notro) (Astro Content Loader for Notion). If you are integrating Astro with Notion, use `notro` instead.

## Installation

```sh
npm install remark-notro
```

## Usage

```ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { remarkNfm } from "remark-notro";

const processor = unified()
  .use(remarkParse)
  .use(remarkNfm)
  .use(remarkGfm);
```

With `@mdx-js/mdx`'s `evaluate()`:

```ts
import { evaluate } from "@mdx-js/mdx";
import { remarkNfm } from "remark-notro";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const { default: Content } = await evaluate(markdown, {
  remarkPlugins: [remarkNfm, remarkGfm, remarkMath],
  // ...
});
```

## Features

`remarkNfm` combines three capabilities into one plugin.

### 1. Preprocessing (`preprocessNotionMarkdown`)

Fixes structural issues in Notion Markdown before remark tokenizes it.

| Fix | Problem fixed |
|-----|--------------|
| 0 | (Migration) Escaped inline math `\$…\$` from old preprocessing bugs converted back to `$…$` |
| 1 | `---` dividers without a preceding blank line are misread as setext H2 headings |
| 2 | Callout directive syntax `"::: callout {…}"` → `":::callout{…}"`; tab-indented content inside callout blocks is dedented |
| 3 | Block-level color annotations `{color="…"}` → raw `<p color="…">` HTML |
| 4 | `<table_of_contents/>` tag (underscore) wrapped in `<div>` for CommonMark HTML detection |
| 5 | Inline equation `$\`…\`$` → `$…$` for remark-math |
| 6 | `<synced_block>` wrapper stripped and content dedented |
| 7 | `<empty-block/>` isolated with blank lines so it becomes a block-level element |
| 8 | Closing tags `</table>`, `</details>`, `</columns>`, `</column>`, `</summary>` get a trailing blank line — without it, CommonMark HTML blocks swallow all following markdown as raw text |
| 9 | Markdown link syntax `[text](url)` inside raw HTML `<td>` cells converted to `<a href>` tags, because remark does not process inline markdown inside raw HTML blocks |

### 2. Directive syntax support

Integrates [micromark-extension-directive](https://github.com/micromark/micromark-extension-directive) and [mdast-util-directive](https://github.com/syntax-tree/mdast-util-directive) internally to parse `:::callout{...}` block syntax.

```
:::callout{icon="💡" color="blue_background"}
This block is treated as a callout.
:::
```

### 3. Callout conversion (`calloutPlugin`)

Transforms directive nodes (`containerDirective`) into `<callout icon="..." color="...">` custom HTML elements.

## API

### `remarkNfm`

```ts
import { remarkNfm } from "remark-notro";
import type { RemarkNfmOptions } from "remark-notro";
```

A remark plugin. Currently accepts no options (reserved for future use).

### `preprocessNotionMarkdown(markdown: string): string`

```ts
import { preprocessNotionMarkdown } from "remark-notro";
```

A pure function that preprocesses Notion API Markdown before passing it to remark. Applies fixes 0–9 listed above.

Normally called automatically by `remarkNfm`, but can be used standalone when processing Markdown outside a remark pipeline (e.g. for cache key computation).

### `calloutPlugin`

```ts
import { calloutPlugin } from "remark-notro";
```

A remark transformer that converts `containerDirective` nodes into `<callout>` elements. Included inside `remarkNfm`; direct use is rarely needed.

## Relationship to notro-loader

```
remark-notro        Pure remark plugin — no Astro or Notion API dependencies
   ↑ used by
notro-loader        Astro + Notion API integration library
                    (Content Loader / MDX compiler / Astro components)
   ↑ used by
notro-blog          Deployable Astro template app
```

- `remark-notro` has no dependency on Astro or the Notion API and can be published independently
- `notro-loader` uses `remarkNfm` in its internal MDX compile pipeline
- You can use `remark-notro` directly in any `unified` or `@mdx-js/mdx` pipeline

---
title: Markdown Pipeline
description: How notro processes Notion Markdown through remark and rehype plugins.
---

## Overview

The MDX compile pipeline runs inside `NotroContent` at render time via `@mdx-js/mdx`'s `evaluate()`.

## Remark plugins (Markdown → mdast)

| Plugin | Purpose |
|---|---|
| `remarkNfm` | Pre-parse normalization + directive syntax + callout conversion |
| `remark-gfm` | GitHub Flavored Markdown (tables, strikethrough, etc.) |
| `remark-math` | Inline `$...$` and block `$$...$$` math syntax |

## Rehype plugins (hast → HTML)

| Plugin | Purpose |
|---|---|
| `rehypeKatex` | Renders math nodes as KaTeX HTML |
| `resolvePageLinksPlugin` | Resolves Notion internal links using `linkToPages` map |
| `@shikijs/rehype` | Syntax highlighting for code blocks |

## preprocessNotionMarkdown

`remarkNfm` calls `preprocessNotionMarkdown()` before parsing. It fixes 10 known structural issues in Notion's Markdown output:

| Fix | Problem |
|---|---|
| 0 | Migrates old escaped math `\$…\$` back to `$…$` |
| 1 | `---` dividers without blank line treated as setext H2 |
| 2 | Callout directive syntax normalization |
| 3 | Block-level color annotations → raw HTML |
| 4 | `<table_of_contents/>` wrapped in `<div>` |
| 5 | Inline equation `$\`…\`$` → `$…$` |
| 6 | `<synced_block>` wrapper stripped |
| 7 | `<empty-block/>` isolated with blank lines |
| 8 | Closing tags get trailing blank line |
| 9 | Markdown links inside `<td>` converted to `<a>` tags |

## Adding plugins

Pass additional plugins via the `notro()` integration in `astro.config.mjs`:

```js
notro({
  remarkPlugins: [remarkMath],
  rehypePlugins: [[rehypeMermaid, { theme: "github-dark" }], rehypeKatex],
})
```

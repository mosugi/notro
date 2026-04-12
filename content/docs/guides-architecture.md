---
slug: guides/architecture
title: Architecture
---

# Architecture

This page explains how notro works under the hood — from fetching Notion content to rendering the final HTML page.

## Overview

```
Notion database
  ↓  loader()          — Astro Content Loader (notro-loader)
Content Collection     — cached markdown + properties per page
  ↓  NotroContent      — compileMdx() + component mapping
Rendered HTML page
```

notro is built entirely on top of [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/). It does not require a separate server or webhook — everything happens at build time (or during `astro dev`).

## Content loading

The `loader()` function from `notro-loader` is a custom Astro Content Loader. On each build or dev-server start, it:

1. Calls `notion.dataSources.query` to list all pages in the data source (paginated)
2. For each page, checks whether the cached entry is still valid by comparing `last_edited_time`
3. For stale or new pages, calls `notion.pages.retrieveMarkdown` to fetch the raw markdown
4. Runs `preprocessNotionMarkdown()` (from `remark-nfm`) on the raw markdown to fix structural issues
5. Stores the page `id`, `properties`, and preprocessed `markdown` in the Content Collection store

Pages that no longer exist in Notion are removed from the store.

### Cache invalidation

Entries are invalidated when:
- The Notion `last_edited_time` is newer than the cached value
- The cached markdown contains expired Notion pre-signed S3 image URLs (`X-Amz-Expires`)
- The page no longer exists in Notion (deleted or un-shared)

### Error handling

| Error | Behavior |
|---|---|
| `429 rate_limited` / `500` / `503` | Retry with exponential backoff (1s, 2s, 4s; max 3 retries) |
| `401 unauthorized` / `403 restricted_resource` / `404 object_not_found` | Log warning, skip page — build continues |
| Other unexpected errors | Log warning, skip page — build continues |

## MDX compile pipeline

When `NotroContent` renders a page, it calls `compileMdxCached()` which runs the stored markdown through `@mdx-js/mdx`'s `evaluate()` with the following plugin pipeline:

### Remark plugins (Markdown AST)

| Plugin | Purpose |
|---|---|
| `remarkNfm` | Bundles: `preprocessNotionMarkdown` normalization, directive syntax + GFM (strikethrough, task lists), callout conversion |
| _(user-provided)_ | e.g. `remark-math` for LaTeX equations |

### Rehype plugins (HTML AST)

| Plugin | Order | Purpose |
|---|---|---|
| `rehypeRaw` | 1 | Parses raw HTML strings from Notion into hast nodes; passes through custom elements |
| `rehypeNotionColor` | 2 | Converts `color="gray_bg"` attributes → `notro-*` CSS classes |
| `rehypeBlockElements` | 3 | Renames Notion block elements to PascalCase for MDX component routing (`video` → `Video`) |
| `rehypeInlineMentions` | 4 | Renames inline mention elements (`mention-user` → `MentionUser`) |
| _(user-provided)_ | 5 | e.g. `rehype-katex`, `rehype-beautiful-mermaid` |
| `rehypeShiki` | 6 | Syntax highlighting (injected when `shikiConfig` is set) |
| `rehypeSlug` | 7 | Adds `id` attributes to headings |
| `rehypeToc` | 8 | Populates `<TableOfContents>` with anchor links |
| `resolvePageLinks` | 9 | Resolves `notion.so` URLs using the `linkToPages` map |

### Component mapping

After `evaluate()`, `<Content components={notionComponents} />` maps every Notion block type to its Astro component:

```ts
const notionComponents = {
  // Notion block elements
  callout: Callout,
  toggle: Toggle,
  columns: Columns,
  column: Column,
  video: Video,
  table_of_contents: TableOfContents,
  // ... and more
  // Standard HTML elements
  a: Link,
  img: NotionImage,
  pre: CodeBlock,
  // ...
};
```

Custom component overrides are merged in via the `components` prop on `NotroContent`.

## Markdown preprocessing

Before the MDX pipeline runs, `preprocessNotionMarkdown()` fixes structural issues in Notion's raw Markdown output:

| Fix | Problem |
|---|---|
| Fix 1 | `---` without preceding blank line is misread as setext H2 |
| Fix 2 | Callout directive syntax normalization |
| Fix 3 | Block-level color annotations converted to raw HTML |
| Fix 4 | `<table_of_contents/>` wrapped in `<div>` for CommonMark detection |
| Fix 5 | Inline equation format normalization |
| Fix 6 | `<synced_block>` wrapper stripped |
| Fix 7 | `<empty-block/>` isolated as block-level element |
| Fix 8 | Closing tags get trailing blank lines (prevents CommonMark swallowing following markdown) |
| Fix 9 | Markdown links inside `<td>` cells converted to `<a>` tags |

## Image handling

Notion serves page images as pre-signed S3 URLs with expiry timestamps in query parameters (`X-Amz-Expires`, `X-Amz-Date`, etc.). These change on every API call, causing Astro's image cache to miss on every build.

`notionImageService` wraps Astro's built-in Sharp service and strips these expiring parameters before computing the cache key, so images are only re-processed when their actual content changes.

## Package entry points

`notro-loader` exposes four entry points to handle different import contexts:

| Entry point | Use case |
|---|---|
| `notro-loader` | Components and loader — use in `.astro` and `content.config.ts` |
| `notro-loader/integration` | `notro()` Astro integration — use in `astro.config.mjs` |
| `notro-loader/utils` | Pure TypeScript helpers — safe in `astro.config.mjs` and Node scripts |
| `notro-loader/image-service` | `notionImageService` — use in `astro.config.mjs` under `image.service` |

The split exists because `astro.config.mjs` is evaluated before the JSX renderer is registered, so importing Astro components at config time would fail.

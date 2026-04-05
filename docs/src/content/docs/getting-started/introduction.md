---
title: Introduction
description: What is notro and how does it work?
---

**notro** is a Notion-to-Astro static site generator. It fetches content from Notion via the Notion Public API, compiles it as MDX, and maps Notion block types to Astro components. The result is a fast, SEO-optimized static site styled with TailwindCSS 4.

## How it works

1. **Content Loader** — The `loader()` from `notro` is used in Astro Content Collections. It calls the Notion API, fetches page metadata and Markdown, and stores everything in the build-time content store.
2. **MDX Pipeline** — At render time, `NotroContent` compiles the stored Markdown via `@mdx-js/mdx`'s `evaluate()` and renders it using Astro components mapped to Notion block types.
3. **Component Mapping** — Every Notion block type (callout, toggle, table, columns, etc.) has a corresponding Astro component. You can override individual components via the `components` prop.

## Packages

| Package | Purpose |
|---|---|
| `notro` | Astro Content Loader + MDX compile pipeline + Notion block components |
| `remark-nfm` | Remark plugin for Notion-flavored Markdown — pre-parse fixes and callout conversion |
| `create-notro` | CLI scaffolding tool (`npm create notro@latest`) |

## Next steps

- [Quick Start](/getting-started/quick-start) — scaffold a new site in minutes
- [Notion Setup](/getting-started/notion-setup) — create an integration and connect your database

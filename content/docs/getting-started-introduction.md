---
slug: getting-started/introduction
title: Introduction
---

# Introduction

**notro** is a Notion-to-Astro static site generator. It fetches content from Notion via the [Notion Public API](https://developers.notion.com/), compiles it as MDX, and maps every Notion block type to a styled Astro component — giving you a fast, SEO-optimized static site without managing a CMS separately.

## Why notro?

Notion is a powerful writing tool, but publishing its content as a polished website traditionally requires custom API integrations and manual rendering logic. notro handles all of that for you:

- **Zero build-time latency for renders** — pages are statically generated at build time
- **Full Notion block support** — callouts, toggles, columns, synced blocks, equations, and more
- **MDX pipeline** — use remark/rehype plugins (math, Mermaid diagrams, syntax highlighting) alongside Notion content
- **Copy-and-own components** — notro-ui provides styled Notion block components you can customize freely
- **Multiple templates** — start with the full-featured blog template or the minimal blank template

## How it works

notro is built on [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/). The `loader()` function acts as a custom content loader that:

1. Queries your Notion data source via `dataSources.query`
2. Fetches each page's markdown via `pages.retrieveMarkdown`
3. Caches pages by `last_edited_time` to avoid redundant API calls on rebuild
4. Stores preprocessed markdown in the Content Collection store

At render time, the `NotroContent` component compiles the stored markdown through the MDX pipeline and renders it with the full Notion component mapping.

```
Notion database
  ↓  notro-loader (Astro Content Loader)
Content Collection store
  ↓  NotroContent + compileMdx
Rendered HTML page
```

## Packages

notro is a monorepo. The published npm packages are:

| Package | Purpose |
|---|---|
| `notro-loader` | Astro Content Loader + MDX compile pipeline + Notion block components |
| `remark-nfm` | Remark plugin for Notion-flavored Markdown normalization |
| `notro-ui` | Copy-and-own styled Notion block components (shadcn-style) |
| `rehype-beautiful-mermaid` | Renders Mermaid code blocks to inline SVG at build time |
| `create-notro` | CLI scaffolding tool (`npm create notro@latest`) |

## Templates

Two starter templates are available:

- **notro-blog** — Full-featured blog with pagination, tags, categories, RSS, and sitemap
- **notro-blank** — Minimal single-page starter for custom projects

Both templates include pre-configured TailwindCSS 4, notro-ui components, and the MDX pipeline.

## Next steps

- [Quick Start](/getting-started/quick-start) — Scaffold a project and connect it to Notion in minutes
- [Notion Setup](/getting-started/notion-setup) — How to create an integration and configure your database

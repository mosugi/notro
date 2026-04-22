---
slug: hello-notro
title: Hello, notro!
description: An introduction to notro — a Notion-to-Astro static site generator.
public: true
tags:
  - intro
date: 2026-04-22
---

# Hello, notro!

Welcome to this blog, powered by [notro](https://github.com/mosugi/notro) — a Notion-to-Astro static site generator.

notro lets you write blog posts directly in Notion and publish them as a fast, SEO-optimized static site built with [Astro](https://astro.build/) and styled with [TailwindCSS 4](https://tailwindcss.com/).

## What is notro?

notro is a monorepo containing:

- **notro-loader** — An Astro Content Loader that fetches pages from Notion via the Public API, converts them to MDX, and caches intelligently by `last_edited_time`.
- **remark-nfm** — A remark plugin that normalizes Notion-flavored Markdown quirks before parsing.
- **notro-ui** — Copy-and-own styled Notion block components (shadcn-style).
- **rehype-beautiful-mermaid** — A rehype plugin that renders Mermaid diagrams to inline SVG at build time.
- **create-notro** — A CLI scaffolding tool (`npm create notro@latest`) to bootstrap a new project.

## How it works

1. Write content in Notion — use headings, lists, callouts, toggles, tables, code blocks, and more.
2. Connect your Notion integration and set your `NOTION_TOKEN` + `NOTION_DATASOURCE_ID`.
3. Run `pnpm run build` — notro fetches all public pages, compiles them through the MDX pipeline, and generates a static site.

The rendered site is fully static, loads fast, and can be deployed anywhere: Vercel, Netlify, Cloudflare Pages, or any static host.

## Next steps

- Read the [Introduction](https://notrotail.mosugi.com/getting-started/introduction) to learn how notro works.
- Follow the [Quick Start](https://notrotail.mosugi.com/getting-started/quick-start) to scaffold a project in minutes.
- Browse the [Configuration](https://notrotail.mosugi.com/guides/configuration) guide to customize your setup.

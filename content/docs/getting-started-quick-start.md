---
slug: getting-started/quick-start
title: Quick Start
---

# Quick Start

This guide walks you from zero to a running notro site in under ten minutes.

## Prerequisites

- **Node.js 24+** and **pnpm 9+** (or npm/yarn)
- A [Notion account](https://www.notion.so/) with an existing database, or permission to create one

## 1. Scaffold a project

```bash
npm create notro@latest
```

The CLI will prompt you to:

1. **Choose a template** — `blog` (full-featured) or `blank` (minimal)
2. **Enter a project name** — used as the directory name

```
◆  Which template would you like to use?
│  ● blog    Full-featured blog with pagination, tags, and RSS
│  ○ blank   Minimal starter
◆  Project name: my-notro-site
◆  Scaffolding to ./my-notro-site…
✔  Done! Next steps:
```

## 2. Install dependencies

```bash
cd my-notro-site
pnpm install
```

## 3. Configure environment variables

Copy the example env file and fill in your Notion credentials:

```bash
cp .env.example .env
```

Open `.env` and set:

```bash
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATASOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

See [Notion Setup](/getting-started/notion-setup) for how to obtain these values.

## 4. Start the dev server

```bash
pnpm dev
```

The Astro dev server starts at **http://localhost:4321**. On first run, notro fetches all pages from your Notion database and caches them locally.

> **Tip:** The first run may take a few seconds depending on how many pages are in your database. Subsequent starts are fast because pages are cached by `last_edited_time`.

## 5. Edit content in Notion

While the dev server is running, edit a page in your Notion database. Restart the dev server (or save any file to trigger a refresh) to see the changes reflected.

## 6. Build for production

```bash
pnpm build
```

Astro runs `astro check` (type checking) followed by `astro build`, generating a fully static site in `dist/`.

```bash
pnpm preview   # Preview the production build locally
```

## 7. Deploy

Push your project to GitHub and connect it to your preferred hosting platform. See the deployment guides for step-by-step instructions:

- [Cloudflare Pages](/deployment/cloudflare-pages)
- [Vercel](/deployment/vercel)
- [Netlify](/deployment/netlify)

## Project structure

After scaffolding, your project looks like this (blog template):

```
my-notro-site/
├── src/
│   ├── components/      # Header, Footer, BlogList
│   ├── layouts/         # Layout.astro
│   ├── lib/             # blog.ts, nav.ts, seo.ts
│   ├── pages/           # File-based routing
│   │   ├── index.astro
│   │   └── blog/
│   │       ├── [...page].astro
│   │       └── [slug].astro
│   ├── styles/
│   │   ├── global.css       # TailwindCSS 4 + layout utilities
│   │   └── notro-theme.css  # Notion block color tokens
│   └── content.config.ts    # Astro Content Collections
├── astro.config.mjs
├── package.json
└── .env
```

## Next steps

- [Notion Setup](/getting-started/notion-setup) — Configure your Notion integration and database schema
- [Configuration](/guides/configuration) — Customize the notro pipeline, plugins, and image service
- [Customizing Components](/guides/customizing-components) — Override or extend Notion block components

---
slug: getting-started/notion-setup
title: Notion Setup
---

# Notion Setup

This page explains how to create a Notion Internal Integration, set up a database with the correct schema, and obtain the credentials notro needs.

## 1. Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **+ New integration**
3. Fill in:
   - **Name** — e.g. `notro-blog`
   - **Associated workspace** — select your workspace
   - **Type** — Internal
4. Under **Capabilities**, ensure **Read content** is checked
5. Click **Submit**
6. Copy the **Internal Integration Secret** — this is your `NOTION_TOKEN`

```bash
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Security:** Treat `NOTION_TOKEN` like a password. Never commit it to version control. Add `.env` to your `.gitignore`.

## 2. Create a database

Create a new full-page database in Notion. The blog template expects the following property schema:

| Property | Type | Required | Purpose |
|---|---|---|---|
| `Name` | Title | ✓ | Post title |
| `Slug` | Rich text | ✓ | URL slug (e.g. `hello-world`) |
| `Description` | Rich text | | Post excerpt shown in listings |
| `Public` | Checkbox | ✓ | Only pages where `Public = true` are included in the build |
| `Date` | Date | | Publication date |
| `Tags` | Multi-select | | Tags for filtering |
| `Category` | Select | | Category for filtering |

You can add any additional properties; notro passes all properties through the schema you define in `content.config.ts`.

## 3. Share the database with your integration

Notion integrations do not have access to content by default.

1. Open your database in Notion
2. Click **⋯** (top-right) → **Connections** → **+ Add connections**
3. Search for your integration name and click **Confirm**

The integration now has read access to this database.

## 4. Get the database ID

The `NOTION_DATASOURCE_ID` is the UUID in your database's URL.

Open the database as a full page. The URL looks like:

```
https://www.notion.so/your-workspace/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...
```

The 32-character hex string (with or without hyphens) is the database ID:

```bash
NOTION_DATASOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 5. Set environment variables

Add both values to your project's `.env` file:

```bash
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATASOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

For production deployments, set these as environment variables in your hosting platform (Cloudflare Pages, Vercel, or Netlify) rather than shipping an `.env` file.

## 6. Create your first page

In your Notion database, create a new page:

1. Set **Name** to your post title (e.g. `Hello, World!`)
2. Set **Slug** to a URL-friendly string (e.g. `hello-world`)
3. Check **Public** so it's included in the build
4. Set **Date** to today
5. Write some content in the page body

Run `pnpm dev` in your project — the page should appear at `/blog/hello-world`.

## Tips

### Markdown in Notion

notro fetches content via Notion's Markdown Content API, which converts your Notion blocks to Markdown. Most block types are supported, including:

- Callouts, toggles, columns
- Code blocks with syntax highlighting
- Tables, images, embeds
- Math equations (LaTeX)
- Synced blocks

Unsupported blocks are silently omitted. Notion logs the block IDs in `unknown_block_ids` in the API response; notro logs a warning for these.

### Notion-flavored Markdown

Notion's Markdown output has some quirks (divider/heading ambiguity, color annotations, etc.). The `remark-nfm` plugin handles these automatically — you don't need to do anything special.

### Images in Notion

Notion serves images as pre-signed S3 URLs that expire after a period. notro includes `notionImageService` (set in `astro.config.mjs`) which strips the expiring query parameters before computing the cache key, so repeated builds reuse cached images. See [Configuration](/guides/configuration) for setup details.

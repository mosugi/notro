---
slug: notion-as-cms
title: Using Notion as a CMS for Your Blog
---

# Using Notion as a CMS for Your Blog

Notion is a powerful all-in-one workspace — and with notro, you can use it as a full-featured CMS for your static blog without writing a single line of custom API code.

## Why Notion?

Notion offers a rich editing experience that most CMSes struggle to match:

- **Rich block types** — callouts, toggles, columns, synced blocks, databases, code with syntax highlighting, math equations, and more.
- **Collaboration** — invite teammates to co-author posts.
- **No lock-in** — your content lives in your Notion workspace. You can export it at any time.
- **Free tier** — the Notion free plan is sufficient for personal blogs.

## Setting up Notion as your content source

### 1. Create a Notion integration

Go to [notion.so/profile/integrations](https://www.notion.so/profile/integrations) and create a new integration. Copy the **Internal Integration Token** — this is your `NOTION_TOKEN`.

### 2. Create a database

Create a new database (or use an existing one) in your Notion workspace with the following properties:

| Property | Type |
|---|---|
| Name | Title |
| Slug | Rich text |
| Description | Rich text |
| Public | Checkbox |
| Tags | Multi-select |
| Date | Date |

### 3. Share the database with your integration

Open the database, click **...** → **Connect to** → select your integration.

### 4. Configure your project

Create a `templates/blog/.env` file:

```bash
NOTION_TOKEN=secret_xxxx
NOTION_DATASOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 5. Build

```bash
pnpm run build
```

notro will fetch all pages where `Public = true`, compile the Markdown through the MDX pipeline, and generate a static site.

## Writing blog posts

Once connected, writing a blog post is as simple as:

1. Create a new page in your Notion database.
2. Set `Slug` to a URL-friendly string (e.g. `my-first-post`).
3. Set `Public` to checked.
4. Write your content using Notion's editor.
5. Rebuild your site.

notro caches pages by `last_edited_time`, so unchanged pages are not re-fetched on rebuild — keeping build times fast even as your content grows.

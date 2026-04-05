---
title: Quick Start
description: Scaffold a new notro site in minutes.
---

## Prerequisites

- Node.js 22 or later
- A Notion account with an Internal Integration token

## Scaffold a new site

```sh
npm create notro@latest my-site
```

The CLI will:
1. Download the starter template
2. Copy `.env.example` to `.env`
3. Optionally install dependencies

## Configure environment variables

Edit `.env` in your new project:

```sh
# Notion Internal Integration Token
# https://www.notion.so/my-integrations
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Notion Database ID
NOTION_DATASOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

See [Notion Setup](/getting-started/notion-setup) for how to get these values.

## Start the dev server

```sh
cd my-site
npm run dev
```

Your site will be available at **http://localhost:4321**.

## Build for production

```sh
npm run build
npm run preview
```

---
title: Deploy to Vercel
description: Deploy your notro site to Vercel.
---

## One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mosugi/notro-tail/tree/main/template&env=NOTION_TOKEN,NOTION_DATASOURCE_ID)

## Manual deploy

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com/) → **"Add New Project"** → import your repository
3. Set the framework preset to **"Astro"**
4. Add environment variables:

| Variable | Value |
|---|---|
| `NOTION_TOKEN` | Your Notion integration token |
| `NOTION_DATASOURCE_ID` | Your Notion database ID |

5. Click **"Deploy"**

Vercel automatically re-deploys on every push to `main`.

## Trigger rebuild on Notion changes

Vercel provides a [Deploy Hook](https://vercel.com/docs/deployments/deploy-hooks) URL. Use a Notion automation or a simple cron job to POST to that URL whenever you want the site rebuilt.

---
title: Deploy to Cloudflare Pages
description: Deploy your notro site to Cloudflare Pages for free.
---

notro generates a fully static site — no server required. Cloudflare Pages serves it globally for free.

## Option 1: Deploy button (fastest)

Click the button below to import the starter template into your Cloudflare account and deploy it automatically:

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mosugi/notro-tail)

You will be prompted to fork the template repository and set environment variables during setup.

## Option 2: Connect your GitHub repository

1. Push your project to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/) → **"Create a project"** → **"Connect to Git"**
3. Select your repository
4. Set the build configuration:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (or the path to your project if in a monorepo) |
| Node.js version | `22` |

5. Add environment variables:

| Variable | Value |
|---|---|
| `NOTION_TOKEN` | Your Notion integration token |
| `NOTION_DATASOURCE_ID` | Your Notion database ID |

6. Click **"Save and Deploy"**

## Custom domain

After deployment, go to your Pages project → **"Custom domains"** → **"Set up a custom domain"** and follow the instructions.

---
title: Deploy to Netlify
description: Deploy your notro site to Netlify.
---

## One-click deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/mosugi/notro-tail)

## Manual deploy

1. Push your project to GitHub
2. Go to [netlify.com](https://netlify.com/) → **"Add new site"** → **"Import an existing project"**
3. Select your repository and configure the build settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | `22` |

4. Add environment variables under **"Site configuration" → "Environment variables"**:

| Variable | Value |
|---|---|
| `NOTION_TOKEN` | Your Notion integration token |
| `NOTION_DATASOURCE_ID` | Your Notion database ID |

5. Click **"Deploy site"**

A `netlify.toml` is included in the template with the correct build settings.

---
slug: deployment/vercel
title: Vercel
---

# Deploy to Vercel

This guide shows how to deploy your notro site to [Vercel](https://vercel.com/).

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your project pushed to a GitHub, GitLab, or Bitbucket repository

## 1. Import your project

1. Log in to [vercel.com](https://vercel.com/) and click **Add New Project**
2. Click **Import Git Repository** and select your repository
3. Vercel auto-detects Astro projects and pre-fills most settings

## 2. Configure the build

Verify the settings in the build configuration:

| Setting | Value |
|---|---|
| **Framework Preset** | Astro |
| **Build Command** | `pnpm build` |
| **Output Directory** | `dist` |
| **Install Command** | `pnpm install` |
| **Node.js Version** | `24.x` (set in **Settings → General**) |

For monorepo setups where the Astro site is in a subdirectory, set **Root Directory** to the package path (e.g. `templates/blog`).

## 3. Set environment variables

Click **Environment Variables** and add:

| Variable | Environment | Value |
|---|---|---|
| `NOTION_TOKEN` | Production, Preview | Your Notion integration secret |
| `NOTION_DATASOURCE_ID` | Production, Preview | Your Notion database UUID |

## 4. Deploy

Click **Deploy**. Vercel runs `pnpm install` and `pnpm build`, then deploys the `dist/` directory globally.

## 5. Automatic deploys and rebuild triggers

Vercel automatically deploys on every push to your production branch. For content-only Notion changes, set up a Deploy Hook:

1. Go to **Settings** → **Git** → **Deploy Hooks**
2. Click **Create Hook**, name it, and choose the branch
3. Copy the URL

Use this URL in a cron job, GitHub Action, or Notion automation to trigger a rebuild whenever content changes:

```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/HOOK_ID"
```

### GitHub Actions scheduled rebuild

```yaml
# .github/workflows/rebuild.yml
name: Scheduled rebuild
on:
  schedule:
    - cron: "0 2 * * *"   # Daily at 2:00 AM UTC

jobs:
  rebuild:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel deploy hook
        run: curl -X POST "${{ secrets.VERCEL_DEPLOY_HOOK }}"
```

Add `VERCEL_DEPLOY_HOOK` as a secret in your GitHub repository settings.

## Custom domain

1. Go to your project → **Settings** → **Domains** → **Add**
2. Enter your domain and follow the DNS instructions
3. Vercel provisions a TLS certificate via Let's Encrypt

## Vercel Edge Functions (optional)

To use Astro's server-side rendering features (SSR) on Vercel, install the Vercel adapter:

```bash
pnpm add @astrojs/vercel
```

```js
// astro.config.mjs
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  // ...
});
```

> **Note:** notro's static site generation mode (`output: "static"`, the default) is recommended for most sites. SSR is only needed for features like server-side search or personalization.

## Troubleshooting

**Build fails with "Cannot find module"**

Ensure `node_modules` is not committed to your repository. Vercel installs dependencies from scratch.

**Node.js version mismatch**

Set the Node.js version in **Settings → General → Node.js Version** to `24.x`, or add an `.nvmrc` file:

```
24
```

**Memory limit exceeded on large Notion databases**

Vercel's build container has a 4 GB memory limit. For very large sites, consider fetching only public pages using the `filter` option in `loader()`.

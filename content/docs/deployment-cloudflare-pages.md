---
slug: deployment/cloudflare-pages
title: Cloudflare Pages
---

# Deploy to Cloudflare Pages

This guide shows how to deploy your notro site to [Cloudflare Pages](https://pages.cloudflare.com/).

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- Your project pushed to a GitHub or GitLab repository

## 1. Create a Pages project

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** → **Pages** → **Create a project**
3. Click **Connect to Git** and authorize Cloudflare to access your repository
4. Select your repository and click **Begin setup**

## 2. Configure the build

In the build configuration form, set:

| Setting | Value |
|---|---|
| **Framework preset** | Astro |
| **Build command** | `pnpm build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (leave blank if project is at the repo root) |
| **Node.js version** | `24` |

If your project uses a monorepo and the Astro site is in a subdirectory (e.g. `templates/blog/`), set **Root directory** to that path.

## 3. Set environment variables

Click **Environment variables (advanced)** and add:

| Variable | Value |
|---|---|
| `NOTION_TOKEN` | Your Notion integration secret |
| `NOTION_DATASOURCE_ID` | Your Notion database UUID |

> **Tip:** Set these under **Production** only, or duplicate them for **Preview** if you want preview deploys to also fetch from Notion.

## 4. Deploy

Click **Save and Deploy**. Cloudflare will clone your repository, run `pnpm install` and `pnpm build`, and deploy the `dist/` directory to the Cloudflare edge network.

## 5. Configure automatic deploys

After the first deployment, Cloudflare automatically deploys on every push to your production branch (usually `main`).

For notro sites, content changes in Notion do **not** automatically trigger a rebuild. Set up a scheduled rebuild using Cloudflare's Deploy Hooks:

1. Go to **Pages** → your project → **Settings** → **Builds & deployments**
2. Scroll to **Deploy hooks** → **Add deploy hook**
3. Name it (e.g. `Notion content update`) and choose the branch to build
4. Copy the generated URL

Use this webhook URL with a cron job or Notion automation to trigger rebuilds when content changes.

## Custom domain

1. Go to your Pages project → **Custom domains** → **Set up a custom domain**
2. Enter your domain and follow the DNS setup instructions
3. Cloudflare provisions a TLS certificate automatically

## Node.js version

Cloudflare Pages supports Node.js versions via the `NODE_VERSION` environment variable. Set it to `24` in your project's environment variables, or add a `.node-version` file to your repository:

```
24
```

## Troubleshooting

**Build fails with "pnpm not found"**

Add the `pnpm` version to your `package.json`:

```json
{
  "packageManager": "pnpm@10.33.0"
}
```

**Environment variables not available**

Make sure variables are set for the **Production** environment (not just Preview) and that you have redeployed after adding them.

**Large sites hit the 20,000 file limit**

Cloudflare Pages has a 20,000 file limit. For large sites, use Cloudflare Workers with KV storage, or consider Vercel/Netlify.

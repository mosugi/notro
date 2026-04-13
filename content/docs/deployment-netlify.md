---
slug: deployment/netlify
title: Netlify
---

# Deploy to Netlify

This guide shows how to deploy your notro site to [Netlify](https://www.netlify.com/).

## Prerequisites

- A [Netlify account](https://app.netlify.com/signup)
- Your project pushed to a GitHub, GitLab, or Bitbucket repository

## 1. Create a new site

1. Log in to [app.netlify.com](https://app.netlify.com/) and click **Add new site** → **Import an existing project**
2. Connect to your Git provider and select your repository

## 2. Configure the build

Set the following in the build settings:

| Setting | Value |
|---|---|
| **Base directory** | _(leave blank, or set to your package path for monorepos)_ |
| **Build command** | `pnpm build` |
| **Publish directory** | `dist` |

### netlify.toml (recommended)

Define your build settings in `netlify.toml` at the repo root to keep them in version control:

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "24"
  PNPM_VERSION = "10"
```

For monorepos with the Astro project in a subdirectory:

```toml
[build]
  base    = "templates/blog"
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "24"
```

## 3. Set environment variables

In the Netlify dashboard, go to **Site configuration** → **Environment variables** → **Add a variable**:

| Key | Value |
|---|---|
| `NOTION_TOKEN` | Your Notion integration secret |
| `NOTION_DATASOURCE_ID` | Your Notion database UUID |

> **Tip:** Use **Scopes** to restrict variables to the Production context only, if you don't want preview builds to fetch from Notion.

## 4. Deploy

Click **Deploy site**. Netlify clones your repo, installs dependencies, runs the build, and serves the `dist/` directory from its CDN.

## 5. Automatic deploys and rebuild triggers

Netlify deploys automatically on every push to your production branch. For Notion content changes, use a Build Hook:

1. Go to **Site configuration** → **Build & deploy** → **Build hooks**
2. Click **Add build hook**, name it (e.g. `Notion content`), and choose the branch
3. Copy the generated URL

Trigger the hook to rebuild:

```bash
curl -X POST -d {} "https://api.netlify.com/build_hooks/YOUR_HOOK_ID"
```

### Scheduled rebuilds with Netlify Functions

Create a scheduled Netlify Function to rebuild on a schedule:

```ts
// netlify/functions/scheduled-rebuild.ts
import type { Config } from "@netlify/functions";

export default async function handler() {
  await fetch(process.env.BUILD_HOOK_URL!, { method: "POST" });
  return { statusCode: 200 };
}

export const config: Config = {
  schedule: "0 2 * * *",  // Daily at 2:00 AM UTC
};
```

Add `BUILD_HOOK_URL` as an environment variable pointing to your own build hook URL.

## Custom domain

1. Go to **Domain management** → **Add a domain**
2. Enter your custom domain and follow the DNS configuration instructions
3. Netlify provisions a TLS certificate automatically via Let's Encrypt

## Netlify Edge Functions (optional)

For SSR, install the Netlify adapter:

```bash
pnpm add @astrojs/netlify
```

```js
// astro.config.mjs
import netlify from "@astrojs/netlify";

export default defineConfig({
  output: "server",
  adapter: netlify(),
  // ...
});
```

## Troubleshooting

**`pnpm: command not found`**

Set `PNPM_VERSION` in your environment variables or `netlify.toml`:

```toml
[build.environment]
  PNPM_VERSION = "10"
```

**Build succeeds but site shows 404**

Verify the **Publish directory** is set to `dist`, not the project root.

**Environment variables not available at build time**

Make sure variables are set with the **Builds** scope enabled. Go to the variable settings and check the scope includes **Builds** (not just **Runtime**).

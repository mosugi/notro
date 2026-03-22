<p>
<a href="README.ja.md">English</a>
 | 
<a href="./README.ja.md">日本語</a>
<!-- |
<a href="./README.zh.md">中文</a>
 |
<a href="./README.ko.md">한국어</a>-->
</p>

![NotroTail.webp](docs%2Fpublic%2FNotroTail.webp)

<p align="center">
<a href="https://notrotail.mosugi.com">Website</a>
 | 
<a href="https://notrotail.mosugi.com/doc">Documentation</a>
 | 
<a href="https://notro.mosugi.com">Quick Start</a>
</p>

> [!NOTE]
> NotroTail is currently in alpha release. Please provide feedback to help us achieve a stable release.

## Demo

<p align="center">
<a href="https://mosugeek.notion.site/NotroTail-f3d908099c714fbfa6c4d792d1b6d3f2">Original</a>
 | 
<a href="https://notrotail.mosugi.com">NotroTail</a>
</p>

![BeforeAfter.png](docs%2Fpublic%2FBeforeAfter.png)

## Quick Start

Using [Notro Connect](https://notro.mosugi.com/) (Notion Public Integration), you can automatically set up IDs and tokens and deploy to platforms like Netlify in just a few steps. Give it a try! (And don't forget to star the repository!)

[Deploy to Netlify or Vercel with Notro Connect](https://notro.mosugi.com/)

## Features

### 🚀 Content-First

Create content and build a website with Notion’s user-friendly interface. No coding knowledge required.

### ⚡️ High Performance

Websites are output as static HTML by Astro, making them extremely fast and optimized for SEO. Whether for personal blogs or business purposes, it offers a great experience.

### 🔌 No Block-by-Block Retrieval — Fast Builds

Supports Notion's [Markdown Content API](https://developers.notion.com/guides/data-apis/working-with-markdown-content), so page content is fetched in a single API call rather than block by block. This significantly reduces the number of API calls at build time, resulting in fast builds.

### 📷 Image Optimization

Images used in Notion are delivered in WebP format, optimized for each device by Astro Assets.

### 🎨 Modern Styling

Integrated with TailwindCSS, it allows you to easily create modern and responsive sites.

### 📚 Templates & Free Format

Generate websites from database templates or create from specific pages in a free format.

### 🔧 Advanced Customization

In addition to changing pre-defined CSS in tailwind.css, you can apply utilities directly in Notion, defining the appearance close to the content. HTML can also be written for advanced customization.

[Check out NotroTail's style on Tailwind Play](https://play.tailwindcss.com/RY0CPlb2r9)

[Check out NotroTail's Collection style on Tailwind Play](https://play.tailwindcss.com/eac1s7OY4c)

## Installation Instructions

For running locally or in an environment without Notro Connect.

### 1. Create a Notion Internal Integration

Create an integration from [here](https://developers.notion.com/docs/create-a-notion-integration##step-1-create-an-integration) and record the **Internal Integration Token** as `NOTION_TOKEN`.

### 2. Select or Create a Notion Page

Choose an existing Notion page or duplicate a template. NotroTail works with any Notion page, but using a template provides rich features like headers and blogs.

### 3. Identify the Notion ID

Record the ID part of the URL as `NOTION_ID`.

```plaintext
https://www.notion.so/myworkspace/a8aec43384f447ed84390e8e42c2e089?v=...
                                 |---------- NOTION_ID ----------|
```

### 4. Configure Integration

Share the page with your integration following the steps [here](https://developers.notion.com/docs/create-a-notion-integration##step-2-share-a-database-with-your-integration).

### 5. Set Environment Variables

```bash
NOTION_ID=<NOTION_ID>
NOTION_SECRET=<NOTION_TOKEN>
```

### 6. Launch

NotroTail needs Astro 5.0 and Node.js 22 or later

```bash

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321/) in your browser.

## Deploy

NotroTail uses Astro's static output mode — no SSR adapter required. Config files for each platform are included in the repository.

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmosugi%2Fnotro-tail&env=NOTION_TOKEN,NOTION_DATASOURCE_ID&envDescription=Notion%20API%20credentials&project-name=notro-tail&repository-name=notro-tail)

1. Click the button above, or import the repository at [vercel.com](https://vercel.com)
2. Add environment variables: `NOTION_TOKEN` and `NOTION_DATASOURCE_ID`
3. Click **Deploy** — `vercel.json` handles all build settings automatically

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/mosugi/notro-tail)

1. Click the button above, or import the repository at [netlify.com](https://app.netlify.com)
2. Add environment variables: `NOTION_TOKEN` and `NOTION_DATASOURCE_ID`
3. Click **Deploy** — `netlify.toml` handles all build settings automatically

### Cloudflare Pages

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mosugi/notro-tail)

1. Click the button above, or go to **Workers & Pages → Create → Pages → Connect to Git** in the [Cloudflare dashboard](https://dash.cloudflare.com)
2. Select the repository and enter the following build settings:
   ```
   Build command:    npm run build
   Build output dir: apps/notro-tail/dist
   Root directory:   (leave empty)
   ```
3. Add environment variables: `NOTION_TOKEN` and `NOTION_DATASOURCE_ID`
4. Click **Save and Deploy** — `wrangler.toml` is also included for reference

> After updating Notion content, trigger a manual redeploy from the platform dashboard to rebuild the static site.

## Repository Structure

This repository is an **npm workspace monorepo** containing three packages:

| Package | Path | Role |
|---|---|---|
| [`remark-nfm`](./packages/remark-nfm/) | `packages/remark-nfm/` | Pure remark plugin for Notion-flavored Markdown. Handles pre-parse normalization (10 fixes), `:::callout` directive syntax, and callout conversion. No Astro or Notion API dependencies — independently publishable to npm. |
| [`notro`](./packages/notro/) | `packages/notro/` | Astro + Notion API integration library. Provides the Content Loader, MDX compile pipeline (uses `remark-nfm` internally), and Astro components for all Notion block types. |
| `notro-tail` | `apps/notro-tail/` | Deployable Astro template app. A reference implementation that uses `notro` to build a blog/static site from Notion content. |

**Dependency graph:**
```
remark-nfm  ←  notro  ←  notro-tail
```

## Known Limitations

### Content truncation

The Notion API truncates page content at approximately **20,000 blocks**. There is no pagination API for this endpoint, so truncated content cannot be retrieved in full. notro logs a warning and builds with what is available.

**Workaround:** Split large Notion pages into smaller sub-pages.

### Unsupported block types

Some Notion block types cannot be converted to Markdown by the API. These blocks are silently omitted from the response. notro logs the affected block IDs so you can identify and update the content.

For details, see the [Notion API documentation](https://developers.notion.com/reference/retrieve-page-markdown) and the `notro` package [README](./packages/notro/README.md#notion-api-の制限事項).

## Contributing

Please create an issue for bug reports or feature requests. Any feedback is welcome in any language. Pull requests are also appreciated.

## Roadmap

[See the Github Projects roadmap](https://github.com/users/mosugi/projects/4)

## Special Thanks

NotroTail was inspired by the following repositories:

- [Next.js Notion Starter Kit](https://github.com/transitive-bullshit/nextjs-notion-starter-kit)
    - Used for creating a website based on Notion for the first time.
- [Astro Notion Blog](https://github.com/otoyo/astro-notion-blog)
    - Used for creating a blog based on Astro.
- [AstroWind](https://github.com/onwidget/astrowind)
    - Used as a design reference.

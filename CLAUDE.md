# notro-tail

## 言語設定

すべての返答は日本語で行うこと。ただし、コードのコメントは英語を使用する。

## Project Overview

**NotroTail** is a Notion-to-Astro static site generator. It fetches content from Notion via the Notion Public API (Markdown Content API), compiles it as MDX using `@mdx-js/mdx`'s `evaluate()`, and maps Notion block types to Astro components. Outputs a fast, SEO-optimized static site styled with TailwindCSS 4.

The repo is an **npm workspace monorepo** with two workspaces:

| Workspace | Path | Purpose |
|---|---|---|
| `notro-tail` | `apps/notro-tail/` | The deployable Astro 6 website (template / reference app) |
| `notro` | `packages/notro/` | The publishable npm library (Astro Content Loader + components) |

---

## Repository Structure

```
notro-tail/
├── apps/
│   └── notro-tail/          # Astro website template
│       ├── src/
│       │   ├── components/  # Header, Footer, BlogList
│       │   ├── layouts/     # Layout.astro (base HTML shell)
│       │   ├── lib/         # notionImageService.ts (custom Astro image service)
│       │   ├── pages/       # File-based routing
│       │   │   ├── index.astro              # Top page
│       │   │   └── blog/
│       │   │       ├── [...page].astro      # Paginated blog list
│       │   │       ├── [slug].astro         # Individual blog posts
│       │   │       └── tag/[tag]/[...page].astro
│       │   ├── styles/
│       │   │   └── global.css  # TailwindCSS 4 imports + nt-* utility classes
│       │   ├── content.config.ts  # Astro Content Collections (posts)
│       │   └── env.d.ts
│       ├── astro.config.mjs
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── notro/               # npm library ("notro" package)
│       ├── index.ts         # Public API exports
│       ├── src/
│       │   ├── components/  # Astro components (NotionMarkdownRenderer, OptimizedDatabaseCover, DatabaseProperty)
│       │   │   └── notion/  # Per-block-type Astro components (Callout, Toggle, H1–H4, TableBlock, etc.)
│       │   ├── loader/
│       │   │   ├── loader.ts    # Astro Content Loader implementation
│       │   │   └── schema.ts    # Zod schemas for Notion API response types
│       │   ├── markdown/
│       │   │   ├── transformer.ts         # preprocessNotionMarkdown() — fixes Notion markdown quirks
│       │   │   └── plugins/
│       │   │       └── callout.ts         # remark-directive plugin for :::callout blocks
│       │   └── utils/
│       │       ├── compile-mdx.ts         # compileMdxCached() — MDX evaluate + Astro component wiring
│       │       └── notion.ts              # getPlainText(), getNotionColor() helpers
│       └── package.json
├── docs/public/             # Documentation images
├── .changeset/              # Changesets config for versioning & publishing
├── netlify.toml             # Netlify deploy template (env var hints)
├── package.json             # Root workspace + changeset scripts
└── tsconfig.json
```

---

## Key Architecture

### Content Loading Flow

1. **Astro Content Collections** (`content.config.ts`) defines the `posts` collection (the template app; extend as needed for additional collections).
2. Each collection uses the `loader()` from `notro`, which calls the Notion Public API (`dataSources.query` + `pages.retrieveMarkdown`).
3. The loader caches pages by `last_edited_time` digest, and invalidates cache entries that are deleted, edited, or contain expired Notion pre-signed S3 URLs.
4. Each page's preprocessed Markdown is stored in the Content Collection store. Pages render it via `NotionMarkdownRenderer`, which calls `compileMdxCached()` to compile the markdown into an Astro component via `@mdx-js/mdx`'s `evaluate()`, then renders it with `<Content components={notionComponents} />`.

### MDX Compile Pipeline

Defined in `packages/notro/src/utils/compile-mdx.ts` via `@mdx-js/mdx`'s `evaluate()`. No `astro.config.mjs` configuration is required — the pipeline runs entirely at render time inside `NotionMarkdownRenderer`.

**Remark plugins** (parse Markdown → mdast):
- `remark-gfm` — GitHub Flavored Markdown (tables, strikethrough, etc.)
- `remark-math` — enables `$...$` inline and `$$...$$` block math syntax
- `remark-directive` — enables `:::callout` directive syntax
- `calloutPlugin` — converts `:::callout{...}` directives to `<callout icon="..." color="...">` HTML elements

**Rehype plugins** (transform hast → HTML):
- `rehypeKatex` — renders math nodes as KaTeX HTML
- `resolvePageLinksPlugin` — resolves Notion `notion.so` URLs in `<page>`, `<database>`, and `<a href>` elements using the `linkToPages` map

**Component mapping** (HTML elements → Astro components):
- After `evaluate()`, `<Content components={notionComponents} />` maps every Notion block type (callout, toggle, columns, images, table, TOC, etc.) and standard HTML element to an Astro component from `src/components/notion/`
- Custom overrides can be passed via the `components` prop on `NotionMarkdownRenderer`
- CSS class overrides can be passed via the `classMap` prop without replacing the component

### Image Handling

`apps/notro-tail/src/lib/notionImageService.ts` wraps Astro's Sharp image service to strip expiring `X-Amz-*` query parameters from Notion pre-signed S3 URLs before computing the cache key, so repeated builds reuse cached output.

### Markdown Rendering

Pages render Notion markdown via the `NotionMarkdownRenderer` component from `notro`. It accepts preprocessed markdown stored by the loader, compiles it via `compileMdxCached()`, and renders it with component mapping:

```astro
---
import { NotionMarkdownRenderer } from "notro";
const markdown = entry.data.markdown;
---

<div class="nt-markdown-content">
  <NotionMarkdownRenderer markdown={markdown} />
</div>
```

Optional props:
- `linkToPages` — `Record<string, { url: string; title: string }>` map for resolving internal Notion page links
- `classMap` — `Partial<Record<ClassMapKeys, string>>` for injecting Tailwind classes into default components without replacing them
- `components` — `Partial<NotionComponents>` for full component overrides (e.g. `{ callout: MyCallout }`)

### Markdown Preprocessing (`preprocessNotionMarkdown`)

`transformer.ts` exports `preprocessNotionMarkdown()`, which runs **before** MDX compilation (in the loader) to fix structural issues in Notion's markdown output. The fixes are numbered and documented in the source:

| Fix | Problem fixed |
|-----|---------------|
| 1 | `---` dividers without a preceding blank line are misread as setext H2 headings |
| 2 | Callout directive syntax `"::: callout {…}"` → `":::callout{…}"` |
| 3 | Block-level color annotations `{color="…"}` → raw `<p color="…">` HTML |
| 4 | `<table_of_contents/>` tag (underscore) wrapped in `<div>` for CommonMark HTML detection |
| 5 | Inline equation `$\`…\`$` → `$…$` for remark-math |
| 6 | `<synced_block>` wrapper stripped and content dedented |
| 7 | `<empty-block/>` isolated with blank lines so it becomes a block-level element |
| 8 | Closing tags `</table>`, `</details>`, `</columns>`, `</column>`, `</summary>` get a trailing blank line — without it, CommonMark HTML blocks swallow all following markdown as raw text |
| 9 | Markdown link syntax `[text](url)` inside raw HTML `<td>` cells converted to `<a href>` tags, because remark does not process inline markdown inside raw HTML blocks |

### Layout Props (`Layout.astro`)

`Layout.astro` accepts:

| Prop | Type | Purpose |
|------|------|---------|
| `title` | `string` | `<title>` and `og:title` |
| `description` | `string` (optional) | `<meta name="description">` and `og:description` |
| `bodyClass` | `string` (optional) | CSS class on `<body>` for per-page scoped styles |

Canonical URL and `og:url` are set automatically from `Astro.url`.

### Per-Page Scoped Styles (`bodyClass`)

Pages can request a unique visual theme by passing `bodyClass` to `<Layout>`:

- **Notion fixed pages** — set `bodyClass` in `src/config.ts` under `navPages[].bodyClass`; the `[slug].astro` route reads this map and injects it.
- **Static Astro pages** — pass `bodyClass` directly as a `<Layout>` prop.

Current themes defined in `global.css`:

| `bodyClass` | Theme |
|-------------|-------|
| `page-about` | Blue top border on `<body>`; `h2` has left border + blue tint; links are bold blue |
| `page-privacy` | Compact legal document feel — small `tracking-widest` uppercase `h2`s, `text-sm` body |
| `page-contact` | Indigo gradient on `<main>`; `h2` / links in indigo; section dividers |

All per-page rules are scoped under `main` or `.nt-markdown-content` so the shared `<header>` and `<footer>` are never affected.

### Navigation Features (`apps/notro-tail`)

- **Active nav link** — `Header.astro` reads `Astro.url.pathname` and applies `font-medium text-gray-900` to the current page's link. Blog is active for all `/blog/*` paths except fixed-page slugs. The Docs button darkens to `bg-blue-700` when on `/contact/`.
- **Prev/next article nav** — `blog/[slug].astro` builds a date-sorted list of blog posts (excluding `"page"`-tagged fixed pages) and passes `prevNav`/`nextNav` (slug + title) as props. A two-column card nav appears below each article body: "← 新しい記事" (newer) on the left, "古い記事 →" (older) on the right.
- **Tag page back link** — `blog/tag/[tag]/[...page].astro` shows "← ブログ一覧" above the heading.
- **Pinned posts hint** — `blog/[...page].astro` shows a "← ピン留め記事は1ページ目にあります" notice on pages 2+.

### CSS Conventions

All Notion-specific CSS classes use the `nt-` prefix (defined in `global.css`):
- Block types: `.nt-header-block`, `.nt-callout-block`, `.nt-toggle-block`, etc.
- Colors: `.nt-color-gray`, `.nt-color-blue_background`, etc.
- Annotations: `.nt-annotation-bold`, `.nt-annotation-italic`, etc.
- Collections: `.nt-collection-item`, `.nt-collection-cover`, `.nt-collection-property`

---

## Environment Variables

### Required for `apps/notro-tail`

| Variable | Description |
|---|---|
| `NOTION_TOKEN` | Notion Internal Integration Token (API key) |
| `NOTION_DATASOURCE_ID` | Notion data source ID for the `posts` collection |

### For Vercel Deployment (Claude Code on the Web)

Set these in Claude Code on the Web → Settings → Environment Variables:

| Variable | Source |
|---|---|
| `VERCEL_PROJECT_ID` | Vercel project Settings > General |
| `VERCEL_ORG_ID` | Vercel team Settings > General |
| `VERCEL_TOKEN` | vercel.com/account/tokens (Personal Access Token) |

> `VERCEL_OIDC_TOKEN` is set automatically by the Vercel platform and does **not** need to be set manually. It cannot be used for Vercel's own REST API (it is an external-service OIDC token); use `VERCEL_TOKEN` (PAT) for Vercel API calls.

---

## Development Workflow

### Prerequisites

- Node.js 22+
- Astro 6 (installed via npm)

### Install & Run

```bash
# Install all workspace dependencies from repo root
npm install

# Run the Astro dev server (from repo root)
npm run dev --workspace=notro-tail
# or from apps/notro-tail:
npm run dev
```

Dev server runs at http://localhost:4321

### Build

```bash
# Build from repo root (runs astro check + astro build)
npm run build

# Build from the app workspace directly
cd apps/notro-tail && npm run build
```

`npm run build` in the root delegates to `npm run build --workspace=notro-tail`.

### Format

```bash
# Format TypeScript and Astro files
npm run format --workspace=notro-tail
# or from packages/notro:
npm run format --workspace=notro
```

Uses Prettier with `prettier-plugin-astro`.

### Type-checking

Type checking runs as part of `astro build` via `astro check`. Run it separately:

```bash
cd apps/notro-tail && npx astro check
```

---

## Package Publishing (`packages/notro`)

The `notro` package is published to npm. It uses [Changesets](https://github.com/changesets/changesets) for versioning.

```bash
# Create a changeset for your changes
npx changeset

# Bump versions based on pending changesets
npm run changeset-version

# Build and publish to npm
npm run changeset-publish
```

Config: `.changeset/config.json` — base branch is `main`, access is `public`.

The package's `exports` map:
- `"notro"` → `index.ts` (components, loader, schemas, utils)

---

## Notion Database Schema Conventions

### `posts` collection

| Property | Type | Purpose |
|---|---|---|
| `Name` | title | Post title |
| `Description` | rich_text | Post description / excerpt |
| `Public` | checkbox | Whether to include in build |
| `Slug` | rich_text | URL slug |
| `Tags` | multi_select | Tags for filtering |
| `Category` | select | Category for filtering |
| `Date` | date | Publication date |

---

## Notion API Usage

`@notionhq/client` がルートの `node_modules` にインストール済み。`NOTION_TOKEN` と `NOTION_DATASOURCE_ID` で認証する。

### クライアント初期化

```js
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DATASOURCE_ID;
```

### データソース（データベース）のクエリ

```js
// 全ページ一覧（ページネーション自動）
import { iteratePaginatedAPI } from "@notionhq/client";

for await (const page of iteratePaginatedAPI(notion.dataSources.query, {
  data_source_id: DB_ID,
})) {
  console.log(page.id, page.properties.Name);
}
```

### ページの作成

```js
const page = await notion.pages.create({
  parent: { data_source_id: DB_ID, type: "data_source_id" },
  properties: {
    Name:        { title: [{ text: { content: "タイトル" } }] },
    Slug:        { rich_text: [{ text: { content: "my-slug" } }] },
    Description: { rich_text: [{ text: { content: "説明文" } }] },
    Public:      { checkbox: true },
    Tags:        { multi_select: [{ name: "TypeScript" }, { name: "Astro" }] },
    Category:    { select: { name: "Tutorial" } },
    Date:        { date: { start: "2026-01-15" } },
  },
  // markdown フィールドで本文を直接 Markdown で指定できる
  markdown: "# 見出し\n\n本文テキスト",
});
console.log(page.id);
```

### ページ内容の取得（Markdown）

```js
const md = await notion.pages.retrieveMarkdown({ page_id: PAGE_ID });
console.log(md.markdown);
console.log(md.truncated); // true なら内容が切り詰められている
```

### ページ内容の更新（Markdown）

```js
// 特定範囲を置換（content_range はブロックIDの範囲を指定）
await notion.pages.updateMarkdown({
  page_id: PAGE_ID,
  type: "replace_content_range",
  replace_content_range: {
    content: "# 新しい内容\n\n更新されたテキスト",
    content_range: "BLOCK_ID_START...BLOCK_ID_END",
    allow_deleting_content: true,
  },
});

// 指定ブロックの後に追記（after を省略すると先頭に挿入）
await notion.pages.updateMarkdown({
  page_id: PAGE_ID,
  type: "insert_content",
  insert_content: {
    content: "\n追記したテキスト",
    after: "BLOCK_ID", // 省略可
  },
});
```

### ページプロパティの更新

```js
await notion.pages.update({
  page_id: PAGE_ID,
  properties: {
    Public: { checkbox: false },
    Tags: { multi_select: [{ name: "Updated" }] },
  },
});
```

### よく使うスクリプト例

```bash
# データソースのページ一覧を確認
node -e "
import('@notionhq/client').then(async ({ Client, iteratePaginatedAPI }) => {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  for await (const p of iteratePaginatedAPI(notion.dataSources.query, { data_source_id: process.env.NOTION_DATASOURCE_ID })) {
    const name = p.properties.Name?.title?.[0]?.plain_text ?? '(no title)';
    const slug = p.properties.Slug?.rich_text?.[0]?.plain_text ?? '-';
    console.log(p.id, slug, name);
  }
});
"

# サンプルページを seed する
node scripts/seed-notion-pages.mjs
```

---

## Vercel API Usage

With environment variables configured:

```bash
# List recent deployments
curl -s "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT_ID&teamId=$VERCEL_ORG_ID&limit=5" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -m json.tool

# Get latest deploy ID and build logs
DEPLOY_ID=$(curl -s "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT_ID&teamId=$VERCEL_ORG_ID&limit=1" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['deployments'][0]['uid'])")

curl -s "https://api.vercel.com/v2/deployments/$DEPLOY_ID/events?teamId=$VERCEL_ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -m json.tool

# Check deployment status
curl -s "https://api.vercel.com/v13/deployments/$DEPLOY_ID?teamId=$VERCEL_ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('State:', d.get('readyState'))
print('URL:', d.get('url'))
print('Error:', d.get('errorMessage', 'none'))
"
```

---

## Known Issues / TODOs

- Truncated Notion markdown (`markdownResponse.truncated === true`) is logged as a warning but not handled with paginated retrieval yet.

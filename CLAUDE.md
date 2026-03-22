# notro-tail

## 言語設定

すべての返答は日本語で行うこと。ただし、コードのコメントは英語を使用する。

---

## Claude Code 作業ルール

### スタイリング規約

- スタイリングは **TailwindCSS 4 のユーティリティクラスのみ** で行うこと
- インラインスタイル（`style="..."` 属性）は使わない
- Astro コンポーネント内の `<style>` タグは使わない
- Notion ブロック固有のスタイルは `global.css` の `nt-*` クラスとして定義する（既存の CSS 規約に従うこと）
- クライアント側 `<script>` 内でも `element.style.*` でスタイルを直接操作しないこと
- 表示/非表示の制御は `element.classList.toggle("hidden")` など **クラス操作** で行うこと（`element.style.display` は使わない）

### ビルド確認・レイアウト確認

コードを変更したら必ず以下の手順で確認すること：

```bash
# 1. 型チェック + ビルド（ルートから実行）
npm run build

# 2. ビルド結果をブラウザで確認（レイアウト崩れがないか目視確認）
npm run preview --workspace=notro-tail
```

- `npm run build` が通らない状態で push しないこと
- スタイリング変更は必ず `npm run preview` で目視確認してからコミットすること

### サブエージェント・ブランチ管理

- サブエージェント（Agent ツール）で作業させたブランチは、呼び出し元のブランチに **マージしてから** push すること
- サブエージェントのブランチを直接 push してはならない
- マージ後に必ずビルドが通ることを確認してから push すること

### ブランチ命名規則

- Claude が作業するブランチは必ず `claude/` プレフィックスを付けること
- セッション ID をブランチ名末尾に含めること（`claude/feature-name-XXXXX` 形式）
- **`claude/` プレフィックスとセッション ID がないと push が 403 エラーになる**

### 実装方針が複数ある場合

- 実装方針が複数考えられる場合、**必ず作業前に `AskUserQuestion` ツールで選択肢を提示してユーザーに確認すること**
- 自分で方針を決めて進めてはならない
- 選択肢は具体的なトレードオフ（パフォーマンス・保守性・実装コスト等）とともに提示すること

### コミットメッセージ規約

- コミットメッセージは **必ず英語** で書くこと
- フォーマット: `<type>: <summary>` （例: `feat: add tag filter to blog list`）
- type は `feat` / `fix` / `refactor` / `docs` / `chore` / `style` / `test` のいずれか

### UI/UX の判断基準

- **多言語対応を前提** としたデザインを基本とすること（テキスト長・文字幅・RTL の考慮）
- ユーザーにとってわかりやすいか・使いやすいかを最優先の判断基準とすること
- 装飾よりも情報の明瞭さ・アクセシビリティを優先すること

### Astro 実装ベストプラクティス

#### ロジックは `.ts` ファイルに切り出す

- Astro ファイル（`.astro`）のフロントマター（`---` ブロック）には **最小限のコードのみ** 記述すること
- データ取得・変換・ビジネスロジックは `src/lib/` 配下の `.ts` ファイルに関数として切り出すこと
- 切り出した関数には必ずユニットテストを書くこと（`vitest` を使用）
- テスト対象の範囲：
  - `apps/notro-tail/src/lib/` 配下の関数（追加・変更時）
  - `packages/*/src/utils/` 配下の外部から呼び出される関数
  - Astro コンポーネント（`.astro`）自体はテスト不要。ロジックを `.ts` に切り出してその関数をテストすること

```astro
// Good: src/lib/posts.ts にロジックを切り出し、フロントマターはインポートと呼び出しのみ
---
import { getCollection } from "astro:content";
import { getSortedPosts, excludeFixedPages } from "@/lib/posts";

const allPosts = await getCollection("posts");
const posts = getSortedPosts(excludeFixedPages(allPosts));
---
<ul>{posts.map(p => <li>{p.data.title}</li>)}</ul>
```

```astro
// Bad: フロントマターに直接ロジックを書く
---
import { getCollection } from "astro:content";

const allPosts = await getCollection("posts");
const posts = allPosts
  .filter(p => !p.data.tags?.includes("page"))
  .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
---
<ul>{posts.map(p => <li>{p.data.title}</li>)}</ul>
```

#### コンポーネント設計

- コンポーネントは **単一責任** を持つよう小さく保つこと
- Props の型は必ず明示的に定義すること（`interface Props { ... }`）
- デフォルト値は Props の分割代入で設定すること

#### パフォーマンス

- 画像は必ず Astro の `<Image />` コンポーネントを使うこと（`<img>` タグを直接使わない）
- クライアント側 JavaScript は必要最小限にすること（`client:load` より `client:idle` / `client:visible` を優先）
- ページ単位のデータ取得は `Astro.glob()` や Content Collections API を使うこと

#### `<script>` タグの書き方

- Astro コンポーネント内の `<script>` タグのロジックは最小限にすること
- `<script>` 内のロジックが複雑な場合は `src/lib/` 配下の `.ts` ファイルに切り出してインポートすること
- `is:inline` は必要な場合のみ使用すること（通常は Astro がバンドル最適化するため不要）

```astro
<!-- Good: ロジックを .ts に切り出してインポート -->
<button id="menu-btn" aria-expanded="false">Menu</button>
<script>
  import { initMenu } from "@/lib/menu";
  initMenu();
</script>

<!-- Bad: <script> に直接ロジックを書く / style を直接操作する -->
<script>
  const btn = document.getElementById("menu-btn");
  const nav = document.getElementById("nav");
  btn?.addEventListener("click", () => {
    nav.style.display = nav.style.display === "none" ? "block" : "none"; // ❌ style 操作
  });
</script>

<!-- Good: クラス操作で表示を制御 -->
<script>
  const btn = document.getElementById("menu-btn");
  const nav = document.getElementById("nav");
  btn?.addEventListener("click", () => {
    nav.classList.toggle("hidden"); // ✅ classList 操作
    btn.setAttribute("aria-expanded", String(!nav.classList.contains("hidden")));
  });
</script>
```

#### アクセシビリティ

- インタラクティブ要素には適切な `aria-*` 属性を付けること
- 色のみで情報を伝えないこと（アイコンやテキストを併用する）
- フォーム要素には必ず `<label>` を関連付けること

---

## Project Overview

**NotroTail** is a Notion-to-Astro static site generator. It fetches content from Notion via the Notion Public API (Markdown Content API), compiles it as MDX using `@mdx-js/mdx`'s `evaluate()`, and maps Notion block types to Astro components. Outputs a fast, SEO-optimized static site styled with TailwindCSS 4.

The repo is an **npm workspace monorepo** with three packages:

| Package | Path | Purpose |
|---|---|---|
| `remark-nfm` | `packages/remark-nfm/` | Pure remark plugin for Notion-flavored Markdown — pre-parse normalization, `:::callout` directive syntax, and callout conversion. No Astro or Notion API dependencies; independently publishable to npm. |
| `notro` | `packages/notro/` | The publishable npm library (Astro Content Loader + MDX compile pipeline + Notion block components). Uses `remark-nfm` internally. |
| `notro-tail` | `apps/notro-tail/` | The deployable Astro 6 website (template / reference app) |

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
│       ├── src/
│       │   └── config.ts            # navPages (fixed pages map: slug → title/bodyClass)
│       ├── astro.config.mjs
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── remark-nfm/          # npm library ("remark-nfm" package)
│   │   ├── index.ts         # Public API exports
│   │   └── src/
│   │       ├── nfm.ts           # remarkNfm plugin (pre-parse + directive + callout)
│   │       ├── transformer.ts   # preprocessNotionMarkdown() — 10 fixes for Notion markdown quirks
│   │       └── callout.ts       # calloutPlugin — converts :::callout directives to <callout> elements
│   └── notro/               # npm library ("notro" package)
│       ├── index.ts         # Public API exports
│       ├── src/
│       │   ├── components/  # Astro components (NotionMarkdownRenderer, OptimizedDatabaseCover, DatabaseProperty)
│       │   │   └── notion/  # Per-block-type Astro components (Callout, Toggle, H1–H4, TableBlock, etc.)
│       │   ├── loader/
│       │   │   ├── loader.ts    # Astro Content Loader implementation
│       │   │   └── schema.ts    # Zod schemas for Notion API response types
│       │   └── utils/
│       │       ├── compile-mdx.ts         # compileMdxForAstro() — MDX evaluate + Astro component wiring
│       │       ├── mdx-pipeline.ts        # buildMdxPlugins() — remark/rehype plugin configuration
│       │       └── notion.ts              # getPlainText(), buildLinkToPages() helpers
│       └── package.json
├── docs/public/             # Documentation images
├── .changeset/              # Changesets config for versioning & publishing
├── netlify.toml             # Netlify deploy template (env var hints)
├── package.json             # Root workspace + changeset scripts
└── tsconfig.json
```

---

## Key Architecture

### `notro` Package Entry Points

The `notro` package exposes three entry points, each designed for a specific import context:

| Entry point | Import | Use case |
|---|---|---|
| `notro` | `import { NotionMarkdownRenderer, loader, ... } from "notro"` | Astro components and the Content Loader. **Cannot** be used in `astro.config.mjs` because Astro config is evaluated before the JSX renderer is registered. |
| `notro/utils` | `import { getPlainText, normalizeNotionPresignedUrl, ... } from "notro/utils"` | Pure TypeScript helpers with no Astro component imports. Safe to use anywhere: config files, Node scripts, image services. |
| `notro/integration` | `import { notro } from "notro/integration"` | The `notro()` Astro integration. Used in `astro.config.mjs` to inject `@astrojs/mdx` with the correct plugin pipeline. |

### `notro()` Astro Integration

`notro()` is an Astro integration that registers `@astrojs/mdx` with notro's plugin suite (remarkNfm, remarkGfm, remarkMath, rehypeKatex). It is required for two reasons:

1. **`astro:jsx` renderer** — `@astrojs/mdx` registers the `astro:jsx` renderer that `@mdx-js/mdx`'s `evaluate()` depends on to produce Astro VNodes. Without it, `NotionMarkdownRenderer` fails at runtime.
2. **Static `.mdx` files** — if the project uses `.mdx` files alongside Notion content, `notro()` ensures they are processed with the same plugin pipeline as dynamically compiled Notion markdown.

Usage in `astro.config.mjs`:
```js
import { notro } from "notro/integration";
export default defineConfig({ integrations: [notro(), sitemap()] });
```

### Content Loading Flow

1. **Astro Content Collections** (`content.config.ts`) defines the `posts` collection (the template app; extend as needed for additional collections).
2. Each collection uses the `loader()` from `notro`, which calls the Notion Public API (`dataSources.query` + `pages.retrieveMarkdown`).
3. The loader caches pages by `last_edited_time` digest, and invalidates cache entries that are deleted, edited, or contain expired Notion pre-signed S3 URLs.
4. Each page's preprocessed Markdown is stored in the Content Collection store. Pages render it via `NotionMarkdownRenderer`, which calls `compileMdxCached()` to compile the markdown into an Astro component via `@mdx-js/mdx`'s `evaluate()`, then renders it with `<Content components={notionComponents} />`.

### MDX Compile Pipeline

Defined in `packages/notro/src/utils/compile-mdx.ts` via `@mdx-js/mdx`'s `evaluate()`. No `astro.config.mjs` configuration is required — the pipeline runs entirely at render time inside `NotionMarkdownRenderer`.

**Remark plugins** (parse Markdown → mdast):
- `remarkNfm` (from `remark-nfm`) — bundles pre-parse normalization (`preprocessNotionMarkdown`), directive syntax support, and callout conversion in one plugin
- `remark-gfm` — GitHub Flavored Markdown (tables, strikethrough, etc.)
- `remark-math` — enables `$...$` inline and `$$...$$` block math syntax

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

`packages/remark-nfm/src/transformer.ts` exports `preprocessNotionMarkdown()`, which is called automatically by `remarkNfm` before each parse. It fixes structural issues in Notion's markdown output. The fixes are numbered and documented in the source:

| Fix | Problem fixed |
|-----|---------------|
| 0 | (Migration) Escaped inline math `\$…\$` from old preprocessing bugs converted back to `$…$` |
| 1 | `---` dividers without a preceding blank line are misread as setext H2 headings |
| 2 | Callout directive syntax `"::: callout {…}"` → `":::callout{…}"`; tab-indented content inside callout blocks is dedented |
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

### ローカル環境変数の設定

`apps/notro-tail/.env` ファイルを作成して環境変数を設定する（`.gitignore` 済み）:

```bash
NOTION_TOKEN=secret_xxxx
NOTION_DATASOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

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

### Preview（ビルド結果の確認）

```bash
# ビルド後にプレビューサーバーを起動してレイアウト崩れを確認する
npm run preview --workspace=notro-tail
```

プレビューサーバーは http://localhost:4321 で起動する。

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

> **重要:** この環境では `@notionhq/client` を Node.js スクリプトとして実行すると `Error: fetch failed` が発生する（undici の fetch が動作しない）。Notion API を操作する際は **必ず `curl` を使うこと**。

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

> **注意:** `node -e` / `node scripts/...` による Notion API 呼び出しは fetch 失敗のため動作しない。代わりに以下の `curl` コマンドを使うこと。

```bash
# データソースのページ一覧を確認（curl版）
curl -s "https://api.notion.com/v1/databases/$NOTION_DATASOURCE_ID/query" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2026-03-11" \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -c "
import sys, json
d = json.load(sys.stdin)
for p in d.get('results', []):
    pid = p['id']
    name = p['properties'].get('Name', {}).get('title', [{}])[0].get('plain_text', '(no title)')
    slug = (p['properties'].get('Slug', {}).get('rich_text', [{}]) or [{}])[0].get('plain_text', '-')
    print(pid, slug, name)
"

# ページを作成する（curl版）
curl -s "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2026-03-11" \
  -H "Content-Type: application/json" \
  -d "{
    \"parent\": { \"database_id\": \"$NOTION_DATASOURCE_ID\" },
    \"properties\": {
      \"Name\": { \"title\": [{ \"text\": { \"content\": \"タイトル\" } }] },
      \"Slug\": { \"rich_text\": [{ \"text\": { \"content\": \"my-slug\" } }] },
      \"Public\": { \"checkbox\": true }
    }
  }"
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

_以下はいずれも Notion API 側の制限に起因するもので、notro では警告ログを出力して処理を継続する。_

### `pages.retrieveMarkdown` API の制限事項

> 参照: https://developers.notion.com/reference/retrieve-page-markdown

#### truncated — コンテンツの切り詰め

`markdownResponse.truncated === true` の場合、ページのコンテンツが Notion API の上限（約 20,000 ブロック）を超えており、**残りのコンテンツは取得できない**。

- このエンドポイントにはカーソルやページネーションパラメータが存在しない（`@notionhq/client` v5.11.1 の型定義で確認済み）
- 切り詰められたコンテンツはそのままビルドに使用される
- **対処法**: 大きな Notion ページを複数のサブページに分割すること

#### unknown_block_ids — レンダリング不能なブロック

`markdownResponse.unknown_block_ids` に含まれるブロック ID は、Notion API が Markdown に変換できなかったブロック（未対応ブロック型など）を示す。

- これらのブロックはレスポンスの `markdown` から**無言で除外される**
- このエンドポイント経由でその内容を取得する方法はない
- notro では block ID の一覧を警告ログに出力して処理を継続する

#### エラーハンドリング方針

| エラーコード | 対応 |
|---|---|
| `429 rate_limited` / `500 internal_server_error` / `503 service_unavailable` | exponential backoff でリトライ（1s / 2s / 4s、最大3回） |
| `401 unauthorized` / `403 restricted_resource` / `404 object_not_found` | リトライなし。警告ログを出力してそのページをスキップ |
| その他の予期しないエラー | 警告ログを出力してそのページをスキップ（ビルド全体は継続） |

# Notro

![npm](https://img.shields.io/npm/v/notro)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

Notion の [Markdown Content API](https://developers.notion.com/) を使って Notion データベースのコンテンツを [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) に読み込む Astro Loader ライブラリです。

> [!TIP]
> サンプルプロジェクト: [NotroTail](https://github.com/mosugi/NotroTail)

## インストール

```sh
npm install notro
```

## セットアップ

### 1. `astro.config.mjs`

`notro/config` から `notroMarkdownConfig` をインポートして Markdown 設定に適用します。

```js
import { defineConfig } from "astro/config";
import { notroMarkdownConfig } from "notro/config";

export default defineConfig({
  markdown: notroMarkdownConfig(),
});
```

> `notroMarkdownConfig` は `"notro"` ではなく `"notro/config"` からインポートする必要があります。
> Vite の設定評価タイミングの制約により、メインエントリから分離されています。

### 2. `src/content.config.ts`

`loader` 関数でコレクションを定義します。スキーマは `pageWithMarkdownSchema` を `.extend()` してデータベースのプロパティを追加します。

```typescript
import { defineCollection } from "astro:content";
import {
  loader,
  pageWithMarkdownSchema,
  titlePropertyPageObjectResponseSchema,
  richTextPropertyPageObjectResponseSchema,
  checkboxPropertyPageObjectResponseSchema,
  multiSelectPropertyPageObjectResponseSchema,
  datePropertyPageObjectResponseSchema,
} from "notro";
import { z } from "zod";

const posts = defineCollection({
  loader: loader({
    queryParameters: {
      data_source_id: import.meta.env.NOTION_DATASOURCE_ID,
      filter: {
        property: "Public",
        checkbox: { equals: true },
      },
    },
    clientOptions: {
      auth: import.meta.env.NOTION_TOKEN,
    },
  }),
  schema: pageWithMarkdownSchema.extend({
    properties: z.object({
      Name: titlePropertyPageObjectResponseSchema,
      Description: richTextPropertyPageObjectResponseSchema,
      Public: checkboxPropertyPageObjectResponseSchema,
      Tags: multiSelectPropertyPageObjectResponseSchema,
      Date: datePropertyPageObjectResponseSchema,
    }),
  }),
});

export const collections = { posts };
```

### 3. ページコンポーネント

`NotionMarkdownRenderer` でマークダウンをレンダリングし、`getPlainText` でプロパティからテキストを取得します。

```astro
---
import { getCollection } from "astro:content";
import { NotionMarkdownRenderer, getPlainText } from "notro";

const posts = await getCollection("posts");
const { entry } = Astro.props;

const title = getPlainText(entry.data.properties.Name);
const markdown = entry.data.markdown;
---

<NotionMarkdownRenderer
  markdown={markdown}
  classMap={{
    h1:      "mb-3 mt-10 text-3xl font-bold text-gray-900",
    h2:      "mb-2 mt-8 text-2xl font-semibold text-gray-900",
    callout: "flex items-start gap-3 my-4 rounded-lg border p-4",
    toggle:  "my-1 rounded-md",
    columns: "grid grid-cols-1 gap-6 my-4 md:grid-cols-2",
    quote:   "my-4 border-l-4 border-gray-200 pl-4 italic text-gray-600",
  }}
/>
```

`components` prop でコンポーネントをフルオーバーライドすることもできます。

```astro
---
import MyCallout from "./MyCallout.astro";
---

<NotionMarkdownRenderer
  markdown={markdown}
  components={{ callout: MyCallout }}
/>
```

## スタイリング方式の比較

`NotionMarkdownRenderer` のスタイリングには 2 つの方式があります。

### 方式 A: `classMap` prop（推奨）

`classMap` でブロックごとに Tailwind クラスを直接指定する方式です。
`p`, `ul`, `li`, `a` 等の**標準 HTML 要素も含む**ほぼすべての要素を対象にできます。

```astro
<NotionMarkdownRenderer
  markdown={markdown}
  classMap={{
    // Notion 固有ブロック
    h1:      "mb-3 mt-10 text-3xl font-bold text-gray-900",
    callout: "flex items-start gap-3 my-4 rounded-lg border p-4",
    toggle:  "my-1 rounded-md",
    // 標準 HTML 要素
    p:       "mb-3 leading-7",
    ul:      "mb-3 list-disc pl-6",
    li:      "mb-1 leading-7",
    a:       "text-sky-600 underline underline-offset-2 hover:text-sky-700",
    strong:  "font-bold",
    pre:     "my-4 overflow-x-auto rounded-md bg-gray-50 p-4 font-mono text-sm",
  }}
/>
```

**classMap が対応する要素**

| キー | 要素 | 備考 |
|---|---|---|
| `h1`〜`h4` | `<h1>`〜`<h4>` | Notion 固有の color 属性も保持 |
| `callout` | Callout ブロック | icon 属性付き |
| `toggle` / `toggleTitle` | `<details>` / `<summary>` | |
| `columns` / `column` | カラムレイアウト | |
| `quote` | `<blockquote>` | |
| `image` | `<figure>` (画像ブロック) | |
| `tableWrapper` / `table` | テーブル外側 `<div>` / `<table>` | |
| `tableCell` / `tableRow` | `<td>` / `<tr>` | |
| `toc` | 目次ブロック | |
| `p` | `<p>` | |
| `ul` / `ol` / `li` | リスト | |
| `pre` | コードブロック外枠 | |
| `hr` | 水平線 | |
| `a` | リンク | |
| `strong` / `em` / `del` | 太字 / 斜体 / 取り消し線 | |
| `th` | テーブルヘッダーセル | |

> **`code`（インラインコード）について**
>
> `<code>` は `pre > code`（コードブロック内）とインラインコードで同じ要素を共有します。
> `classMap.code` は両方に同じクラスを適用するため、インライン/ブロックの外観を分けたい場合は
> グローバル CSS の `:not(pre) > code` セレクタが適しています（方式 B）。

**メリット**
- スタイルの定義がレンダリング箇所と同じファイルに集約され、見通しがよい
- コンポーネントごとに異なる `classMap` を渡すことで、**ページやセクションごとに異なるスタイル**を適用できる
- Tailwind の [Content Detection](https://tailwindcss.com/docs/content-configuration) がクラス名をスキャンできるため、不要なクラスが生成されない（CSS バンドルが最小）
- ブロックに `notion-*` クラスが残るため、CSS で個別に調整することも引き続き可能

**デメリット**
- 同じ `classMap` を複数ページで使う場合、定義を定数として切り出して共有する必要がある
- インラインコード（`code`）のインライン/ブロック区別は classMap のみでは表現できない（→ グローバル CSS で補う）

---

### 方式 B: グローバル CSS の `@apply`

`global.css` でノーションブロックを表す `notion-*` クラスや `.nt-markdown-content` 子孫セレクタにスタイルを当てる方式です。

```css
/* global.css */
.nt-markdown-content h1 { @apply mb-3 mt-10 text-3xl font-bold text-gray-900; }
.nt-markdown-content p  { @apply mb-3 leading-7; }

/* インラインコードのみ区別する場合 */
.nt-markdown-content :not(pre) > code {
  @apply rounded bg-gray-100 px-1 py-0.5 font-mono text-sm;
}
```

**メリット**
- `:not(pre) > code` のような**子孫セレクタが必要なケース**に対応できる
- Tailwind を使わず生の CSS で書く場合や、既存の CSS スタイルシートに組み込む場合に馴染みやすい
- サイト全体に一律のスタイルを適用したい場合はシンプル

**デメリット**
- スタイルとコンポーネントの定義が離れるため、どのクラスがどのブロックに対応するかを把握しにくい
- Tailwind の Content Detection が `@apply` 内のクラスをスキャンするためには `global.css` 自体がスキャン対象である必要がある（設定によっては CSS バンドルが肥大化することも）
- ページごとに見た目を変えたい場合は `bodyClass` 等の追加の仕組みが必要になる

---

### NotroTail での実装例

`classMap` のみでほぼすべてを管理し、インラインコードの区別のみグローバル CSS で補うパターンです。

```css
/* global.css — インラインコードの区別のみ（オプション） */
.nt-markdown-content :not(pre) > code {
  @apply rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-gray-800;
}
```

```astro
<!-- [slug].astro — すべての要素を classMap で管理 -->
<NotionMarkdownRenderer
  markdown={markdown}
  classMap={{
    h1: "mb-3 mt-10 text-3xl font-bold text-gray-900",
    p:  "mb-3 leading-7",
    ul: "mb-3 list-disc pl-6",
    li: "mb-1 leading-7",
    a:  "text-sky-600 underline underline-offset-2 hover:text-sky-700",
    pre:"my-4 overflow-x-auto rounded-md bg-gray-50 p-4 font-mono text-sm",
    callout: "flex items-start gap-3 my-4 rounded-lg border p-4",
    // ... その他のブロック
  }}
/>
```

## 環境変数

| 変数 | 説明 |
|---|---|
| `NOTION_TOKEN` | Notion Internal Integration Token |
| `NOTION_DATASOURCE_ID` | Notion データソース ID |

## API リファレンス

### `loader(options)`

Astro Content Loader。`queryParameters` には Notion API の `dataSources.query` に渡すパラメータを指定します。

### `pageWithMarkdownSchema`

ローダーが返す Zod スキーマのベース。`pageObjectResponseSchema` に `markdown: z.string()` を追加したもの。カスタムスキーマは `.extend()` で拡張します。

### プロパティスキーマ

`content.config.ts` でデータベースプロパティの型を定義するための Zod スキーマ群:

| スキーマ | Notion プロパティ型 |
|---|---|
| `titlePropertyPageObjectResponseSchema` | Title |
| `richTextPropertyPageObjectResponseSchema` | Rich Text |
| `checkboxPropertyPageObjectResponseSchema` | Checkbox |
| `multiSelectPropertyPageObjectResponseSchema` | Multi-select |
| `selectPropertyPageObjectResponseSchema` | Select |
| `statusPropertyPageObjectResponseSchema` | Status |
| `datePropertyPageObjectResponseSchema` | Date |
| `numberPropertyPageObjectResponseSchema` | Number |
| `urlPropertyPageObjectResponseSchema` | URL |
| `emailPropertyPageObjectResponseSchema` | Email |
| `phoneNumberPropertyPageObjectResponseSchema` | Phone number |
| `filesPropertyPageObjectResponseSchema` | Files & media |
| `peoplePropertyPageObjectResponseSchema` | Person |
| `relationPropertyPageObjectResponseSchema` | Relation |
| `rollupPropertyPageObjectResponseSchema` | Rollup |
| `formulaPropertyPageObjectResponseSchema` | Formula |
| `uniqueIdPropertyPageObjectResponseSchema` | Unique ID |
| `createdTimePropertyPageObjectResponseSchema` | Created time |
| `createdByPropertyPageObjectResponseSchema` | Created by |
| `lastEditedTimePropertyPageObjectResponseSchema` | Last edited time |
| `lastEditedByPropertyPageObjectResponseSchema` | Last edited by |
| `buttonPropertyPageObjectResponseSchema` | Button |
| `verificationPropertyPageObjectResponseSchema` | Verification |

### コンポーネント

| コンポーネント | 説明 |
|---|---|
| `NotionMarkdownRenderer` | Notion マークダウンを HTML にレンダリング |
| `OptimizedDatabaseCover` | Notion カバー画像を最適化表示 |
| `DatabaseProperty` | Notion プロパティを型に応じてレンダリング |

### ユーティリティ

| 関数 | 説明 |
|---|---|
| `getPlainText(property)` | Title / Rich Text プロパティからプレーンテキストを取得 |
| `getNotionColor(color)` | Notion カラー名を CSS クラス名に変換 |
| `colorToCSS(color)` | Notion カラー名をインライン CSS スタイル文字列に変換（カスタムコンポーネント内で利用） |

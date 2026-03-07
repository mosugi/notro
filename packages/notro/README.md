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

<div class="nt-markdown-content">
  <NotionMarkdownRenderer markdown={markdown} />
</div>
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

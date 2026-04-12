---
title: loader()
description: notro Content Loader の API リファレンス。
---

## Import

```ts
import { loader } from "notro";
```

`src/content.config.ts` で Astro Content Collection のローダーとして使用します。

## 使用例

```ts
// src/content.config.ts
import { defineCollection } from "astro:content";
import { loader } from "notro";

const posts = defineCollection({
  loader: loader({
    dataSources: [
      {
        type: "notion_database",
        databaseId: import.meta.env.NOTION_DATASOURCE_ID,
        token: import.meta.env.NOTION_TOKEN,
        filter: {
          property: "Public",
          checkbox: { equals: true },
        },
      },
    ],
  }),
});

export const collections = { posts };
```

## オプション

```ts
loader(options: {
  dataSources: DataSourceConfig[];
})
```

### dataSources

データソース設定の配列。現在は `notion_database` タイプをサポートします:

```ts
{
  type: "notion_database";
  databaseId: string;    // Notion データベース UUID
  token: string;         // Notion インテグレーションシークレット
  filter?: NotionFilter; // Notion API フィルターオブジェクト（任意）
  sorts?: NotionSort[];  // Notion API ソートオブジェクト（任意）
}
```

## キャッシュの仕組み

`last_edited_time` でページをキャッシュします。ビルドをまたいで同じディレクトリが使われる場合（Vercel の Build Cache など）に増分ビルドが有効です:

- 変更されていないページはキャッシュから返す
- 編集・追加されたページのみ再取得
- 削除されたページはストアから除去
- Notion プリサイン S3 URL の有効期限切れを検出して再取得

## エラーハンドリング

| エラーコード | 対応 |
|---|---|
| `429 / 500 / 503` | exponential backoff でリトライ（1s / 2s / 4s、最大3回） |
| `401 / 403 / 404` | リトライなし。警告ログを出力してそのページをスキップ |
| その他 | 警告ログを出力してそのページをスキップ（ビルド全体は継続） |

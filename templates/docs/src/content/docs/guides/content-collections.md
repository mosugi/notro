---
title: Content Collections
description: notro loader() を使った Astro Content Collections の設定方法。
---

## 基本セットアップ

`src/content.config.ts` でコレクションを定義します:

```ts
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

## コレクションの使用

```astro
---
import { getCollection } from "astro:content";

const allPosts = await getCollection("posts");
---
```

## 記事のレンダリング

```astro
---
import { NotroContent } from "notro";
const { entry } = Astro.props;
---

<div class="nt-markdown-content">
  <NotroContent markdown={entry.data.markdown} />
</div>
```

## エントリーデータのスキーマ

各エントリーは以下のデータを持ちます:

| フィールド | 型 | 説明 |
|---|---|---|
| `markdown` | `string` | Notion から取得した前処理済み Markdown |
| `properties.Name` | `TitleProperty` | ページタイトル |
| `properties.Slug` | `RichTextProperty` | URL スラッグ |
| `properties.Date` | `DateProperty` | 公開日 |
| `properties.Tags` | `MultiSelectProperty` | タグ |
| `properties.Description` | `RichTextProperty` | 説明文 |
| `properties.Public` | `CheckboxProperty` | 公開フラグ |

## キャッシュの仕組み

loader() は `last_edited_time` でページをキャッシュします:

- **初回ビルド**: 全ページを取得
- **2回目以降**: 変更・追加・削除されたページのみ差分取得
- **S3 URL 期限切れ**: Notion プリサイン URL が期限切れのページは自動再取得

## エラーハンドリング方針

| エラーコード | 対応 |
|---|---|
| `429 / 500 / 503` | exponential backoff でリトライ（1s / 2s / 4s、最大3回） |
| `401 / 403 / 404` | リトライなし。警告ログを出力してそのページをスキップ |
| その他 | 警告ログを出力してそのページをスキップ（ビルド全体は継続） |

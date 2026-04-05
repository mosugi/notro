---
title: タグとフィルタリング
description: タグの仕組み・内部タグ・タグページの生成方法。
---

## 内部タグ（システムタグ）

内部タグはフィルタリングロジックに影響し、訪問者には表示されません。`src/config.ts` で設定します:

```ts
blog: {
  internalTags: ["page", "pinned"],
},
```

| タグ | 動作 |
|---|---|
| `page` | 固定ページ — ブログ一覧・ページネーション・タグページから除外。日付・タグリンク・前後ナビなし。 |
| `pinned` | ピン留め — ブログ一覧1ページ目の「ピン留め」セクションに表示。通常リストからは除外。 |

## 公開タグ

`internalTags` に含まれないすべてのタグが公開タグとして扱われます。記事カードに表示され、タグアーカイブページ `/blog/tag/[tag]/` が自動生成されます。

## タグアーカイブページ

`src/pages/blog/tag/[tag]/[...page].astro` が全コレクション内のユニークな公開タグを列挙し、静的ページを生成します。

## コードからタグを扱う

```ts
import { getMultiSelect, hasTag } from "notro/utils";

// 特定のタグを持つか判定
const isPinned = hasTag(entry.data.properties.Tags, "pinned");

// タグオブジェクト配列を取得
const tags = getMultiSelect(entry.data.properties.Tags);
// → [{ id: "...", name: "TypeScript", color: "blue" }, ...]
```

## lib/blog.ts のユーティリティ関数

`src/lib/blog.ts` に用途別のフィルタリング関数が定義されています:

```ts
// page タグを除いたブログ記事を日付降順で返す
getSortedBlogPosts(allPosts)

// pinned タグの記事を返す
getPinnedPosts(blogPosts)

// 全記事から公開タグ名の一覧を返す
getAllPublicTags(posts, internalTags)
```

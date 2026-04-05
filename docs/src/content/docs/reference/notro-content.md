---
title: NotroContent
description: NotroContent Astro コンポーネントの API リファレンス。
---

## Import

```ts
import { NotroContent } from "notro";
```

ローダーが取得した Markdown を MDX にコンパイルし、Notion ブロックを Astro コンポーネントとしてレンダリングするコンポーネントです。

## 基本的な使い方

```astro
---
import { NotroContent } from "notro";
const { entry } = Astro.props;
---

<div class="nt-markdown-content">
  <NotroContent markdown={entry.data.markdown} />
</div>
```

## Props

```ts
interface Props {
  markdown: string;
  linkToPages?: Record<string, { url: string; title: string }>;
  classMap?: Partial<Record<ClassMapKeys, string>>;
  components?: Partial<NotionComponents>;
}
```

### markdown（必須）

`entry.data.markdown` から取得した前処理済み Markdown 文字列。

### linkToPages

Notion ページ ID から URL とタイトルへのマップ。コンテンツ内の Notion 内部リンクを解決するために使用します。

```astro
<NotroContent
  markdown={markdown}
  linkToPages={{
    "page-id-1": { url: "/blog/post-1/", title: "記事1のタイトル" },
  }}
/>
```

`buildLinkToPages()` ユーティリティでマップを生成できます:

```ts
import { buildLinkToPages } from "notro/utils";

const allPosts = await getCollection("posts");
const linkToPages = buildLinkToPages(allPosts, {
  slugProperty: "Slug",
  baseUrl: "/blog/",
});
```

### classMap

デフォルトコンポーネントを差し替えずに Tailwind クラスを追加したい場合:

```astro
<NotroContent
  markdown={markdown}
  classMap={{
    callout: "border-l-4 border-blue-500",
    toggle: "bg-gray-50 rounded-lg",
  }}
/>
```

### components

特定のブロックを独自コンポーネントに差し替えたい場合:

```astro
---
import MyCallout from "../components/MyCallout.astro";
---

<NotroContent
  markdown={markdown}
  components={{ callout: MyCallout }}
/>
```

## ユーティリティ関数（notro/utils）

| 関数 | 説明 |
|---|---|
| `getPlainText(richText)` | Notion Rich Text 配列からプレーンテキストを抽出 |
| `buildLinkToPages(entries, opts)` | Content Collection エントリーから内部リンク解決マップを生成 |
| `hasTag(tagsProperty, tagName)` | エントリーが特定のタグを持つか判定 |
| `getMultiSelect(property)` | multi_select プロパティからタグ配列を取得 |
| `normalizeNotionPresignedUrl(url)` | Notion S3 プリサイン URL から期限切れパラメーター（`X-Amz-*`）を除去 |

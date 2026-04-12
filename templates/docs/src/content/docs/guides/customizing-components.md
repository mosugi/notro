---
title: コンポーネントのカスタマイズ
description: Notion ブロックコンポーネントの差し替え・スタイル調整方法。
---

## ブログコンポーネント（src/components/blog/）

| ファイル | 役割 |
|---|---|
| `blog/PostCard.astro` | 記事カード（サムネイル・タイトル・日付・タグ） |
| `blog/BlogList.astro` | 記事カードのグリッドリスト |
| `blog/Pagination.astro` | 前へ / 次へ ページネーション |

これらはプロジェクト所有のファイルなので自由に編集できます。

## Notion ブロックコンポーネント（src/components/notro/）

Notion ブロックタイプ（Callout、Toggle、H1〜H4 など）に対応するコンポーネントが格納されています。これらも直接編集することでスタイルを変更できます。

```astro
<!-- src/components/notro/Callout.astro を直接編集する例 -->
---
const { color, class: className } = Astro.props;
---
<div class:list={["flex items-start gap-3 my-4 ...", className]}>
  <slot />
</div>
```

## NotroContent の components prop で差し替える

特定のブロックのみ独自コンポーネントに差し替えたい場合:

```astro
---
import { NotroContent } from "notro";
import MyCallout from "../components/MyCallout.astro";
---

<NotroContent
  markdown={markdown}
  components={{ callout: MyCallout }}
/>
```

## NotroContent の classMap prop でクラスを注入する

コンポーネントを差し替えずに Tailwind クラスを追加したい場合:

```astro
<NotroContent
  markdown={markdown}
  classMap={{
    callout: "border-l-4 border-blue-500",
    toggle: "bg-gray-50 rounded-lg",
  }}
/>
```

## CSS テーマ変数の変更（src/styles/notro-theme.css）

Notion ブロックの色アノテーション（コールアウト背景色・テキスト色）は `notro-theme.css` の CSS 変数で定義されています。

```css
/* src/styles/notro-theme.css */
:root {
  --notro-blue: oklch(0.45 0.15 250);
  --notro-blue-bg: oklch(0.95 0.04 250);
  /* ... */
}
```

ここを編集することでテーマ全体の色を変更できます。

## グローバルスタイル（src/styles/global.css）

`global.css` の `nt-*` クラスはページレイアウト用のデザイントークンです。ページ単位のテーマは `bodyClass` prop で適用します。

```astro
<!-- Layout.astro に bodyClass を渡すとページ固有スタイルを適用できる -->
<Layout title="About" bodyClass="page-about">
  ...
</Layout>
```

`global.css` でそのクラス下のスタイルを定義:

```css
.page-about main h2 {
  border-left: 4px solid theme(--color-blue-500);
  padding-left: 0.75rem;
}
```

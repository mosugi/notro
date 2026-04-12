---
title: 設定
description: config.ts と astro.config.mjs でサイトをカスタマイズする方法。
---

## src/config.ts

`src/config.ts` はサイト全体の設定ファイルです。サイト名・説明・ナビゲーション・ブログ設定を管理します。

```ts
const config = {
  site: {
    name: "My Site",
    description: "My site powered by Notion and Astro.",
    author: "Your Name",
    lang: "ja",       // BCP 47 言語タグ — <html lang="..."> に使用
    locale: "ja_JP",  // og:locale
  },
  analytics: {
    // Google Analytics 4 Measurement ID（例: "G-XXXXXXXXXX"）
    // undefined にするとアナリティクス無効
    gaMeasurementId: undefined as string | undefined,
  },
  blog: {
    postsPerPage: 10,
    // System tags — フィルタリングに使用する内部タグ（公開タグとしては表示しない）
    internalTags: ["page", "pinned"] as string[],
  },
  navigation: {
    nav: [
      { href: "/blog/", label: "ブログ" },
    ],
    footer: [
      {
        heading: "コンテンツ",
        links: [
          { href: "/blog/", label: "ブログ" },
          { href: "/blog/about/", label: "About" },
        ],
      },
    ],
    social: {
      github: "https://github.com/your-name/your-repo",
    },
  },
};
```

### ナビゲーションの追加

`navigation.nav` 配列に項目を追加するだけです:

```ts
nav: [
  { href: "/blog/", label: "ブログ" },
  { href: "/blog/about/", label: "About" },  // 追加
],
```

Notion の固定ページ（`page` タグ付き）を About や Privacy として使う場合は、Notion 上でその記事の Slug を設定し、対応する URL（`/blog/about/` など）を `nav` に追加してください。

## astro.config.mjs

```js
import { notro } from "notro/integration";

export default defineConfig({
  // Canonical URL — サイトマップ・og:url に使用（必須）
  site: "https://your-domain.com",

  integrations: [
    notro({
      // コードブロックのシンタックスハイライトテーマ
      shikiConfig: { theme: "github-dark" },
      // 追加の remark プラグイン
      remarkPlugins: [remarkMath],
      // 追加の rehype プラグイン
      rehypePlugins: [
        [rehypeMermaid, { theme: "github-dark" }],
        rehypeKatex,
      ],
    }),
    sitemap(),
    // Google Analytics を Web Worker にオフロード
    partytown({ config: { forward: ["dataLayer.push"] } }),
  ],
});
```

`notro()` インテグレーションは `@astrojs/mdx` を正しいプラグインパイプラインで登録します。`NotroContent` が動作するために必須です。

## Google Analytics の設定

`src/config.ts` で `gaMeasurementId` を設定します:

```ts
analytics: {
  gaMeasurementId: "G-XXXXXXXXXX",
},
```

Partytown によって gtag スクリプトが Web Worker にオフロードされ、メインスレッドのパフォーマンスへの影響を最小化します。

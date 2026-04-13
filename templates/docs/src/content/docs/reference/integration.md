---
title: notro() インテグレーション
description: notro() Astro インテグレーションの API リファレンス。
---

## Import

```js
import { notro } from "notro/integration";
```

`astro.config.mjs` で使用します。`@astrojs/mdx` を notro のプラグインパイプラインで登録する Astro インテグレーションです。

## なぜ必要か

`notro()` は `@astrojs/mdx` を注入し、`astro:jsx` レンダラーを登録します。これは `@mdx-js/mdx` の `evaluate()` が Astro VNode を生成するために必要です。これがないと `NotroContent` が実行時にエラーになります。

## 使用例

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import { notro } from "notro/integration";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { rehypeMermaid } from "rehype-beautiful-mermaid";

export default defineConfig({
  integrations: [
    notro({
      shikiConfig: { theme: "github-dark" },
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        [rehypeMermaid, { theme: "github-dark" }],
        rehypeKatex,
      ],
    }),
    sitemap(),
  ],
});
```

## オプション

```ts
notro(options?: {
  shikiConfig?: ShikiConfig;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
})
```

### shikiConfig

Shiki に渡す設定オブジェクト。デフォルトテーマは `github-dark`。

```js
notro({ shikiConfig: { theme: "github-light" } })
```

### remarkPlugins

MDX パイプラインに追加する remark プラグイン。`remarkNfm` と `remark-gfm` の後に実行されます。

```js
import remarkMath from "remark-math";
notro({ remarkPlugins: [remarkMath] })
```

### rehypePlugins

追加の rehype プラグイン。Shiki シンタックスハイライターの前に実行されます。

```js
import rehypeKatex from "rehype-katex";
notro({ rehypePlugins: [rehypeKatex] })
```

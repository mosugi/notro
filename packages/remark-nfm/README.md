# remark-nfm

![npm](https://img.shields.io/npm/v/remark-nfm)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

Notion-flavored Markdown (NFM) のための [remark](https://github.com/remarkjs/remark) プラグインです。Notion Public API が出力する Markdown 特有の構文と構造的問題を remark パイプラインで正しく処理できるようにします。

> [!TIP]
> このパッケージは [notro](https://www.npmjs.com/package/notro)（Astro Content Loader for Notion）から内部利用されています。Astro + Notion の統合には `notro` を使ってください。

## インストール

```sh
npm install remark-nfm
```

## 使い方

```ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { remarkNfm } from "remark-nfm";

const processor = unified()
  .use(remarkParse)
  .use(remarkNfm)   // remarkGfm より先に追加
  .use(remarkGfm);
```

> **注意**: `remarkNfm` は `remarkGfm` より**前**に追加してください。`remarkNfm` がパーサーをラップして前処理を実行してから、他の拡張機能が適用されます。

`@mdx-js/mdx` の `evaluate()` で使う場合:

```ts
import { evaluate } from "@mdx-js/mdx";
import { remarkNfm } from "remark-nfm";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const { default: Content } = await evaluate(markdown, {
  remarkPlugins: [remarkNfm, remarkGfm, remarkMath],
  // ...
});
```

## 機能

`remarkNfm` は以下の 3 つの機能を 1 つのプラグインに統合しています。

### 1. 前処理（`preprocessNotionMarkdown`）

remark がトークナイズする前に Notion Markdown の構造的問題を修正します。

| Fix | 修正内容 |
|-----|---------|
| 0 | （マイグレーション）旧バージョンで誤エスケープされた `\$...\$` を `$...$` に戻す |
| 1 | `---` 区切り線の直前に空行を挿入し、setext H2 見出しとして解釈されるのを防ぐ |
| 2 | `::: callout {…}` 構文 → `:::callout{…}`（remark-directive が要求する形式）に正規化。callout ブロック内のタブインデントも除去 |
| 3 | ブロックレベルの色注釈 `{color="…"}` を `<h1 color="…">` / `<p color="…">` の生 HTML に変換 |
| 4 | `<table_of_contents/>` を `<div>` でラップし CommonMark HTML ブロックとして認識させる |
| 5 | インライン数式 `$\`E=mc^2\`$` → `$E=mc^2$`（remark-math 向け）に変換 |
| 6 | `<synced_block>` ラッパータグを除去し、内容をデデント |
| 7 | `<empty-block/>` の前後に空行を挿入し、スタンドアロン HTML ブロックとして扱わせる |
| 8 | `</table>`, `</details>`, `</columns>`, `</column>`, `</summary>` の後に空行を挿入し、CommonMark HTML ブロックが後続の Markdown を飲み込まないようにする |
| 9 | `<td>` 内の Markdown リンク `[text](url)` を `<a href="url">text</a>` に変換（remark は生 HTML ブロック内の Markdown インライン構文を処理しないため） |

### 2. ディレクティブ構文サポート

[micromark-extension-directive](https://github.com/micromark/micromark-extension-directive) と [mdast-util-directive](https://github.com/syntax-tree/mdast-util-directive) を内部で統合し、`:::callout{...}` ブロック構文をパース可能にします。

```
:::callout{icon="💡" color="blue_background"}
このブロックは callout ブロックとして扱われます。
:::
```

### 3. Callout 変換（`calloutPlugin`）

ディレクティブノード（`containerDirective`）を `<callout icon="..." color="...">` カスタム HTML 要素に変換します。

## API

### `remarkNfm`

```ts
import { remarkNfm } from "remark-nfm";
import type { RemarkNfmOptions } from "remark-nfm";
```

remark プラグイン。現在、オプションは受け付けません（将来の拡張用）。

### `preprocessNotionMarkdown(markdown: string): string`

```ts
import { preprocessNotionMarkdown } from "remark-nfm";
```

Notion API の Markdown を remark に渡す前に前処理する純粋関数。上記の Fix 0–9 を適用します。

通常は `remarkNfm` を使えば自動的に呼び出されますが、remark パイプライン外で Markdown を処理する場合（キャッシュキー計算など）に個別に使用することもできます。

### `calloutPlugin`

```ts
import { calloutPlugin } from "remark-nfm";
```

`containerDirective` ノードを `<callout>` 要素に変換する remark トランスフォーマーです。`remarkNfm` に内包されているため、通常は直接使用する必要はありません。

## notro との関係

```
remark-nfm          純粋 remark プラグイン
   ↑ 依存
notro               Astro + Notion API 統合ライブラリ
                    （Content Loader / MDX compiler / Astro コンポーネント）
   ↑ 依存
notro-tail          デプロイ可能な Astro テンプレートアプリ
```

- `remark-nfm` は Astro や Notion API に**依存しない**独立したパッケージです
- `notro` は内部の MDX コンパイルパイプラインで `remarkNfm` を使用しています
- `remark-nfm` を直接 `unified` や `@mdx-js/mdx` パイプラインで使うことも可能です

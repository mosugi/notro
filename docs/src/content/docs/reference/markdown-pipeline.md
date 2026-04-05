---
title: Markdown パイプライン
description: notro が Notion Markdown を処理する remark/rehype プラグインの詳細。
---

## 概要

MDX コンパイルパイプラインは `packages/notro/src/utils/compile-mdx.ts` で定義されています。`NotroContent` 内でレンダリング時に実行されます。`astro.config.mjs` の設定は不要です。

## Remark プラグイン（Markdown → mdast）

| プラグイン | 役割 |
|---|---|
| `remarkNfm` | 前処理・ディレクティブ構文・コールアウト変換をまとめて実行 |
| `remark-gfm` | GitHub Flavored Markdown（テーブル・取り消し線等） |
| `remark-math` | インライン `$...$` とブロック `$$...$$` 数式構文 |

## Rehype プラグイン（hast → HTML）

| プラグイン | 役割 |
|---|---|
| `rehypeKatex` | 数式ノードを KaTeX HTML にレンダリング |
| `resolvePageLinksPlugin` | Notion 内部リンクを `linkToPages` マップで解決 |
| `@shikijs/rehype` | コードブロックのシンタックスハイライト |

## preprocessNotionMarkdown

`remarkNfm` は Markdown を parse する前に `preprocessNotionMarkdown()` を呼び出し、Notion Markdown 出力の10種類の構造的問題を修正します:

| Fix | 修正内容 |
|---|---|
| 0 | 旧前処理のエスケープ済みインライン数式 `\$…\$` を `$…$` に戻す |
| 1 | `---` 区切り線が setext H2 見出しとして誤認識される問題を修正 |
| 2 | コールアウトディレクティブ構文の正規化（`"::: callout {…}"` → `":::callout{…}"`）とタブインデントの除去 |
| 3 | ブロックレベルの色アノテーション `{color="…"}` を生 HTML に変換 |
| 4 | `<table_of_contents/>` タグを CommonMark HTML 検出のため `<div>` でラップ |
| 5 | インライン数式 `$\`…\`$` → `$…$` に変換 |
| 6 | `<synced_block>` ラッパーを削除してコンテンツをデデント |
| 7 | `<empty-block/>` を空行で囲んでブロックレベル要素として認識させる |
| 8 | `</table>`, `</details>`, `</columns>` 等の閉じタグの後に空行を追加（後続の Markdown が飲み込まれる問題の修正） |
| 9 | `<td>` 内の Markdown リンク構文 `[text](url)` を `<a href>` タグに変換 |

## remark-nfm をスタンドアロンで使う

`remark-nfm` は Astro なしで単独利用可能な純粋 remark プラグインです:

```ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import { remarkNfm } from "remark-nfm";

const result = await unified()
  .use(remarkParse)
  .use(remarkNfm)
  .process(notionMarkdown);
```

## 対応するブロックタイプ

| ブロックタイプ | Markdown 構文 | 出力要素 |
|---|---|---|
| Paragraph | 通常テキスト | `<p>` |
| Heading 1–4 | `# H1` 〜 `#### H4` | `<h1>`〜`<h4>` |
| Bulleted list | `- item` | `<ul><li>` |
| Numbered list | `1. item` | `<ol><li>` |
| To-do | `- [x] done` | チェックボックス付きリスト |
| Toggle | `<details><summary>...` | `<details>` |
| Quote | `> text` | `<blockquote>` |
| Code | ` ```lang ` | `<pre><code>` + Shiki ハイライト |
| Callout | `:::callout{color="..."}` | `<callout>` コンポーネント |
| Table | GFM テーブル記法 | `<table>` |
| Divider | `---` | `<hr>` |
| Columns | `<columns><column>...` | グリッドレイアウト |
| Math (inline) | `$E=mc^2$` | KaTeX インライン |
| Math (block) | `$$\int...$$` | KaTeX ブロック |
| Mermaid | ` ```mermaid ` | SVG（ビルド時レンダリング） |
| Table of Contents | `<table_of_contents/>` | 自動目次コンポーネント |

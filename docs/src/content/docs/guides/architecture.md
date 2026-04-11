---
title: アーキテクチャ
description: notro のシステム設計・コンテンツローディングフロー・MDX コンパイルパイプラインの解説。
---

## パッケージ構成

npm ワークスペースモノレポで複数のパッケージを管理しています。

| パッケージ | パス | 役割 |
|---|---|---|
| `remark-nfm` | `packages/remark-nfm/` | Notion Flavored Markdown 向け純粋 remark プラグイン。Astro 依存なし。 |
| `notro` | `packages/notro/` | 公開 npm ライブラリ。Astro Content Loader・MDX コンパイル・Notion ブロックコンポーネント。 |
| `create-notro` | `packages/create-notro/` | CLI スキャフォールドツール。 |
| `notro-blog` (blog) | `templates/blog/` | フル機能ブログテンプレート（リファレンス実装）。 |
| `notro-blank` (blank) | `templates/blank/` | 最小構成スターター。 |

## 3種類のページ

| 種類 | URL 例 | コンテンツソース | ブログ一覧表示 |
|---|---|---|---|
| 静的ページ | `/` | `src/pages/` 内の `.astro` ファイル | なし |
| 埋め込みページ | `/blog/about/` | Notion DB — `page` タグ付き | 非表示 |
| ブログ記事 | `/blog/my-post/` | Notion DB — `page` タグなし | 表示 |

## コンテンツローディングフロー

1. **Astro Content Collections の定義** — `content.config.ts` で `posts` コレクションを定義し、`loader()` を設定。

2. **Notion Public API からのデータ取得** — `loader()` が `dataSources.query` でページ一覧を取得し、`pages.retrieveMarkdown` で Markdown を取得。`last_edited_time` でキャッシュし、変更ページのみ再取得。

3. **前処理済み Markdown をストアに保存** — `preprocessNotionMarkdown()` で Notion Markdown の構造的な問題（10種類のフィックス）を修正し、Astro Content Collection ストアに保存。

4. **レンダリング時の MDX コンパイル** — `NotroContent` が `compileMdxCached()` で `@mdx-js/mdx` の `evaluate()` を呼び出し、`<Content components={notionComponents} />` でレンダリング。

5. **Notion ブロックコンポーネントへのマッピング** — コールアウト・トグル・カラム・数式（KaTeX）・目次など、各 Notion ブロックタイプが `src/components/notro/` の Astro コンポーネントにマッピングされる。

## MDX コンパイルパイプライン

`packages/notro/src/utils/compile-mdx.ts` 内で定義。`astro.config.mjs` の設定は不要で、レンダリング時に `NotroContent` 内で実行されます。

### Remark プラグイン（Markdown → mdast）

| プラグイン | 役割 |
|---|---|
| `remarkNfm` | 前処理・ディレクティブ・コールアウト変換をまとめて実行 |
| `remark-gfm` | GitHub Flavored Markdown（テーブル・取り消し線等） |
| `remark-math` | インライン・ブロック数式構文 |

### Rehype プラグイン（hast → HTML）

| プラグイン | 役割 |
|---|---|
| `rehypeKatex` | 数式ノードを KaTeX HTML にレンダリング |
| `resolvePageLinksPlugin` | Notion 内部リンクを `linkToPages` マップで解決 |
| `@shikijs/rehype` | コードブロックのシンタックスハイライト |

## 画像ハンドリング

`templates/blog/src/lib/notionImageService.ts` は Astro の Sharp 画像サービスをラップし、Notion S3 プリサイン URL から `X-Amz-*` クエリパラメーターを除去してキャッシュキーを計算します。これにより、同じ画像の URL が期限切れで変わっても、ビルドキャッシュが再利用されます。

---
title: 概要
description: notro とは何か、どのように動作するか。
---

**notro** は Notion をコンテンツ管理システムとして使う Astro 静的サイトジェネレーターです。
Notion の Public API（Markdown Content API）からコンテンツを取得し、`@mdx-js/mdx` でコンパイルし、Notion ブロックタイプを Astro コンポーネントにマッピングします。TailwindCSS 4 でスタイリングされた高速・SEO 最適化済みの静的サイトを出力します。

## パッケージ構成

| パッケージ | パス | 役割 |
|---|---|---|
| `remark-nfm` | `packages/remark-nfm/` | Notion Flavored Markdown 向け純粋 remark プラグイン。Astro 依存なしで独立して npm 公開可能。 |
| `notro` | `packages/notro/` | 公開 npm ライブラリ。Astro Content Loader・MDX コンパイルパイプライン・Notion ブロックコンポーネント。 |
| `create-notro` | `packages/create-notro/` | CLI スキャフォールドツール。`npm create notro@latest` で新しいサイトを作成。 |
| `notro-tail` | `apps/notro-tail/` | デプロイ可能な Astro 6 ウェブサイト（テンプレート実装）。 |

## 次のステップ

- [クイックスタート](/getting-started/quick-start) — 数分でサイトを立ち上げる
- [Notion セットアップ](/getting-started/notion-setup) — インテグレーションとデータベースの接続方法
- [アーキテクチャ](/guides/architecture) — システム全体の設計と動作の仕組み

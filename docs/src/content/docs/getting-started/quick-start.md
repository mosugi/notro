---
title: クイックスタート
description: npm create notro@latest で新しいサイトを数分で立ち上げる。
---

## 必要な環境

- Node.js 24 以上
- npm 10 以上
- Notion アカウント（インテグレーション作成のため）

## 1. プロジェクトを作成する

```sh
npm create notro@latest my-site
```

CLI が以下を実行します:

1. `github:mosugi/notro/templates/blog` または `github:mosugi/notro/templates/blank` からテンプレートをダウンロード
2. `.env.example` を `.env` にコピー
3. 依存関係のインストール（任意）

## 2. 環境変数を設定する

`.env` を編集して Notion の認証情報を設定します:

```sh
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATASOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

取得方法は [Notion セットアップ](/getting-started/notion-setup) を参照してください。

## 3. 開発サーバーを起動する

```sh
cd my-site
npm run dev
```

[http://localhost:4321](http://localhost:4321) でプレビューできます。

## 4. 本番ビルド

```sh
npm run build
npm run preview
```

## Astro テンプレートとして使う（別の方法）

`npm create astro@latest` のテンプレート機能でも使えます:

```sh
npm create astro@latest my-site -- --template mosugi/notro/templates/blog
```

---
title: Notion セットアップ
description: Notion インテグレーションの作成・データベースの設定・環境変数の設定方法。
---

notro は Notion の Internal Integration Token とデータソース（データベース）ID を使ってコンテンツを取得します。

## 1. Notion インテグレーションの作成

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) にアクセスし「New integration」をクリック
2. 名前を入力し（例: **My Site**）、ワークスペースを選択して作成
3. 「Internal Integration Token」をコピーして環境変数 `NOTION_TOKEN` に設定

:::caution
Integration Token は `secret_` で始まります。外部に公開しないでください。
:::

## 2. データベースの作成と共有

1. Notion で Full-page database を作成
2. データベース右上の「…」→「Connections」→ 作成したインテグレーションを選択して共有
3. データベースの URL から ID を取得:

```
https://www.notion.so/your-workspace/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...
                                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                     これが NOTION_DATASOURCE_ID（32文字）
```

## 3. データベーススキーマ

以下のプロパティをデータベースに追加してください。`Name`（title 型）はデフォルトで存在します。

| プロパティ名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `Name` | title | ✓ | 記事タイトル（デフォルト列） |
| `Slug` | rich_text | ✓ | URL スラッグ（例: `my-first-post`） |
| `Public` | checkbox | ✓ | チェックで公開・未チェックで非公開（下書き） |
| `Description` | rich_text | — | 説明文・meta description・OGP 説明 |
| `Tags` | multi_select | — | タグ（`page`・`pinned` は内部マーカー） |
| `Date` | date | — | 公開日（ブログ一覧の並び順に使用） |
| `Category` | select | — | カテゴリ |

## 4. 内部タグの仕様

| タグ | 動作 |
|---|---|
| `page` | ブログ一覧・タグページから非表示。固定ページ（About、Privacy Policy 等）に使用。URL は `/blog/slug/` のまま。 |
| `pinned` | ブログ一覧1ページ目の「ピン留め」セクションに表示。通常リストからは除外。 |

## 5. 環境変数の設定

`.env` ファイルを作成して以下を設定します（`.gitignore` で除外済み）:

```sh
NOTION_TOKEN=secret_xxxx
NOTION_DATASOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

| 変数 | 必須 | 説明 |
|---|---|---|
| `NOTION_TOKEN` | ✓ | Notion Internal Integration Token（`secret_` で始まる文字列） |
| `NOTION_DATASOURCE_ID` | ✓ | Notion データソース ID（32文字の UUID） |

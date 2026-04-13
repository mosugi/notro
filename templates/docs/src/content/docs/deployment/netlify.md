---
title: Netlify へのデプロイ
description: notro サイトを Netlify にデプロイする手順。
---

## ワンクリックデプロイ

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/mosugi/notro)

## 手動セットアップ

1. [netlify.com](https://app.netlify.com) で「Add new site」→「Import an existing project」→ リポジトリを選択

2. `netlify.toml` が設定済みのためビルド設定は自動（Base directory・Build command・Publish directory）

3. 「Site configuration」→「Environment variables」に以下を追加:

   | 変数 | 値 |
   |---|---|
   | `NOTION_TOKEN` | Notion Integration Token |
   | `NOTION_DATASOURCE_ID` | Notion データベース ID |

4. 「Trigger deploy」をクリック

## Notion 更新のトリガー

Netlify の Build Hooks を使って自動再デプロイを設定できます。

1. 「Site configuration」→「Build & deploy」→「Build hooks」で Hook URL を作成
2. その URL に POST リクエストを送ると再デプロイが始まります

```sh
# 手動トリガー例
curl -X POST "https://api.netlify.com/build_hooks/YOUR_HOOK_ID"
```

---
title: Vercel へのデプロイ
description: notro サイトを Vercel にデプロイする手順。
---

## ワンクリックデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmosugi%2Fnotro&root-directory=templates%2Fblog&env=NOTION_TOKEN,NOTION_DATASOURCE_ID&envDescription=Notion%20API%20credentials&project-name=notro-blog&repository-name=notro)

## 手動セットアップ

1. [vercel.com](https://vercel.com) で「Add New Project」→ リポジトリをインポート

2. フレームワークプリセットを「**Astro**」に設定

3. Environment Variables に以下を追加:

   | 変数 | 値 |
   |---|---|
   | `NOTION_TOKEN` | Notion Integration Token |
   | `NOTION_DATASOURCE_ID` | Notion データベース ID |

4. 「Deploy」をクリック — `vercel.json` がビルド設定を自動で処理します

:::tip
Vercel では「Redeploy」ボタンで手動再ビルドできます。Notion 記事を更新した後は再ビルドが必要です。
:::

## Notion 更新のトリガー

Vercel の [Deploy Hook](https://vercel.com/docs/deployments/deploy-hooks) を使って、Notion 更新時に自動で再デプロイできます。

1. Vercel プロジェクトの「Settings」→「Git」→「Deploy Hooks」で Hook URL を作成
2. その URL に POST リクエストを送ると再デプロイが始まります
3. GitHub Actions の schedule や Notion の自動化でトリガーできます

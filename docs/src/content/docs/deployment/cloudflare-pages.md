---
title: Cloudflare Pages へのデプロイ
description: notro サイトを Cloudflare Pages にデプロイする手順。
---

notro は Astro の静的出力モードを使用しています。アダプター不要で Cloudflare Pages にデプロイできます。

## ワンクリックデプロイ

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mosugi/notro-tail)

## 手動セットアップ

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com) で「Workers & Pages」→「Create」→「Pages」→「Connect to Git」をクリック

2. リポジトリを選択し、以下のビルド設定を入力:

   | 設定 | 値 |
   |---|---|
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `template/dist` |
   | Root directory | （空欄のまま） |
   | Node.js version | `22` |

3. 「Environment variables」に以下を追加:

   | 変数 | 値 |
   |---|---|
   | `NOTION_TOKEN` | Notion Integration Token |
   | `NOTION_DATASOURCE_ID` | Notion データベース ID |

4. 「Save and Deploy」をクリック

:::tip
リポジトリに含まれる `wrangler.toml` は Cloudflare Pages のビルド設定を補足しますが、ダッシュボードの設定が優先されます。
:::

## カスタムドメイン

デプロイ後、プロジェクトの「Custom domains」→「Set up a custom domain」からカスタムドメインを設定できます。

## Notion 更新後の再デプロイ

Notion でコンテンツを更新した後は、ダッシュボードから手動再デプロイしてください。
GitHub Actions で定期ビルドをスケジュールすることもできます。

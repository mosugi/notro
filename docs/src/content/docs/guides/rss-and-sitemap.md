---
title: RSS とサイトマップ
description: RSS フィードとサイトマップの設定方法。
---

## RSS フィード

テンプレートは `/rss.xml` に RSS フィードを生成します（`src/pages/rss.xml.ts`）。

`astro.config.mjs` に `site` を設定することが必須です:

```js
export default defineConfig({
  site: "https://your-domain.com",
  // ...
});
```

フィードのタイトルは `config.site.name` がデフォルトです。`src/pages/rss.xml.ts` を編集してフィードの説明や項目をカスタマイズできます。

## サイトマップ

`@astrojs/sitemap` インテグレーションが設定済みです。ビルド時に `sitemap-index.xml` と `sitemap-0.xml` が自動生成されます。

追加の設定は不要です。`astro.config.mjs` の `site` URL がすべてのサイトマップ URL のベースとして使われます。

## Notion 更新後の再ビルド

notro は静的サイトジェネレーターなので、Notion でコンテンツを更新した後は再ビルドが必要です。

各プラットフォームでの対応:

- **Vercel**: ダッシュボードの「Redeploy」ボタン、または [Deploy Hook](https://vercel.com/docs/deployments/deploy-hooks) を Notion の自動化でトリガー
- **Netlify**: ダッシュボードの「Trigger deploy」ボタン、または Build Hooks を使用
- **Cloudflare Pages**: ダッシュボードから手動再デプロイ

GitHub Actions などで定期的にビルドをスケジュールすることもできます。

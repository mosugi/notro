# TODO — notro-tail 調査結果

> 調査日: 2026-03-18
> 全10エージェントによるコードベース全域スキャン結果。優先度順に記載。

---

## 🔴 高優先度（バグ・機能欠落）

- [ ] **`evaluate()` に try-catch がない**
  MDXコンパイルエラー時にページ全体が500エラーになる
  → `packages/notro/src/utils/compile-mdx.ts`

- [ ] **`resolvePageLinksPlugin` の `includes()` 誤マッチ**
  `pageId "abc"` が `"abc123"` にも誤マッチしてリンク先が壊れる
  → `packages/notro/src/utils/mdx-pipeline.ts`

- [ ] **`markdownHasPresignedUrls` が `notro` からエクスポートされていない**
  `import` が失敗する
  → `packages/notro/index.ts`

- [ ] **`Video`/`Audio`/`FileBlock`/`PdfBlock` の `color` prop が未実装**
  props定義はあるが `colorToCSS()` を呼んでいないので色が反映されない
  → `packages/notro/src/components/notion/` 各コンポーネント

- [ ] **`StyledSpan` に `class` prop がない**
  `classMap.span` が機能しない
  → `packages/notro/src/components/notion/StyledSpan.astro`

- [ ] **`TableColgroup`/`TableCol`/`MentionDate` に `class` prop がない**
  スタイルカスタマイズ不可
  → `packages/notro/src/components/notion/` 各コンポーネント

- [ ] **`DatabaseProperty` の `nt-property-*` CSS が未定義**
  クラスがCSSに存在しないのでスタイルなし状態になる
  → `apps/notro-tail/src/styles/global.css`

- [ ] **Fix 9のURL括弧問題**
  `[text](https://example.com/path(with)parens)` のような括弧入りURLでURLが途中で切れる
  → `packages/remark-nfm/src/transformer.ts`（Fix 9の正規表現）

- [ ] **`dataSources.query` にリトライロジックなし**
  DBクエリ失敗でビルド全体が停止する（`pages.retrieveMarkdown` にはリトライあり）
  → `packages/notro/src/loader/loader.ts`

---

## 🟡 中優先度（品質・信頼性）

- [ ] **`icon` の presigned URL チェック漏れ**
  `icon.type === "file"` のページが期限切れのままキャッシュされる
  `hasNotionPresignedUrls()` がiconフィールドを検査していない
  → `packages/notro/src/loader/loader.ts`

- [ ] **ネストされた callout 未対応**
  callout内の `:::` で外側のcalloutが誤って閉じられる
  → `packages/remark-nfm/src/transformer.ts`（Fix 2）

- [ ] **`remarkNfm` の多重適用ガードなし**
  `notro()` integration と手動設定の両方でプラグインが適用されると `preprocessNotionMarkdown` が二重実行される
  → `packages/remark-nfm/src/nfm.ts`

- [ ] **`buildLinkToPages` の重複ID未検証**
  同一IDのエントリが後勝ちで上書きされリンクが壊れる可能性がある
  → `packages/notro/src/utils/notion.ts`

- [ ] **コンパイルキャッシュのメモリ上限なし**
  大規模サイトで `compilationCache` が無制限に増大する
  → `packages/notro/src/utils/compile-mdx.ts`

- [ ] **`og:image` / Twitter Card / `og:locale` 欠落**
  SEO最適化が不完全（CLAUDE.md では "SEO-optimized" を謳っている）
  → `apps/notro-tail/src/layouts/Layout.astro`

- [ ] **`aria-current` 未設定・skip link なし**
  スクリーンリーダーでアクティブナビが伝わらない
  → `apps/notro-tail/src/components/Header.astro`

- [ ] **Callout アイコンに `aria-hidden` なし**
  絵文字アイコンがスクリーンリーダーで読み上げられる
  → `packages/notro/src/components/notion/Callout.astro`

- [ ] **全 `package.json` に `engines` フィールドなし**
  Node.js 22+ 要件がpackage.jsonに反映されていない（CLAUDE.mdには記載あり）
  → `/package.json`, `packages/notro/package.json`, `packages/remark-nfm/package.json`, `apps/notro-tail/package.json`

- [ ] **CI の Node.js バージョンが 21.x**
  CLAUDE.md の「Node.js 22+」推奨と不一致
  → `.github/workflows/release.yml`

- [ ] **`astro.config.mjs` の `remotePatterns` が全HTTPS許可**
  `{ protocol: "https" }` ですべてのオリジンを許可しており広すぎる
  Notion S3ドメイン（`*.amazonaws.com` 等）に絞るべき
  → `apps/notro-tail/astro.config.mjs`

- [ ] **`content.config.ts` の `Slug` に必須バリデーションなし**
  空Slugのページが予期しないURLで生成される
  → `apps/notro-tail/src/content.config.ts`

- [ ] **Fix 1 でスペースのみの行が誤マッチ**
  `"   \n---"` のような行頭スペースのみの場合が setext H2 防止処理の対象外
  → `packages/remark-nfm/src/transformer.ts`（Fix 1の正規表現）

- [ ] **`.changeset/config.json` の `ignore` に `notro-tail` 未指定**
  privateアプリがchangeset のバージョン管理対象になっている
  → `.changeset/config.json`

---

## 🟢 低優先度（DX・一貫性）

- [ ] **ダークモード対応なし**
  全色がライトモード固定のhardcoded値で、`prefers-color-scheme: dark` が未対応
  → `apps/notro-tail/src/styles/global.css`

- [ ] **Notion色がすべてinline styleで出力される**
  CSS変数を使っていないため `classMap` での色指定ができない
  → `packages/notro/src/utils/colors.ts`

- [ ] **テーブルに `overflow-x-auto` なし**
  横幅が広いテーブルがモバイルでスクロールできない
  → `packages/notro/src/components/notion/TableBlock.astro`

- [ ] **クラス命名規約が不統一**
  コンポーネント内で `notion-*` と `nt-*` が混在している
  → `packages/notro/src/components/notion/` 各コンポーネント

- [ ] **`ClassMapKeys` に `mention-date` が欠落**
  MentionDate コンポーネントへのクラス注入ができない
  → `packages/notro/src/components/notion/types.ts`（または相当箇所）

- [ ] **`getPlainText` の `join()` に区切り文字なし**
  multi_select などで `"A,B"` でなく `"AB"` に結合される
  → `packages/notro/src/utils/notion.ts`

- [ ] **`calloutPlugin` が `remark-nfm` の public API として不要にエクスポートされている**
  外部から単独適用すると二重処理のリスク
  → `packages/remark-nfm/index.ts`

- [ ] **カスタム 404 ページなし**
  Astro デフォルトの404が表示される
  → `apps/notro-tail/src/pages/404.astro`（新規作成）

- [ ] **0件時のメッセージなし**
  タグ絞り込みなどで記事0件の場合に空白になる
  → `apps/notro-tail/src/components/BlogList.astro`

- [ ] **`packages/notro/tsconfig.json` が存在しない**
  パッケージ単独での型チェックが不正確になる
  → `packages/notro/tsconfig.json`（新規作成）

- [ ] **`markdownHasPresignedUrls` の false positive**
  本文に `X-Amz-Algorithm` という文字列が含まれるだけでキャッシュ無効化される
  → `packages/notro/src/utils/notion-url.ts`（またはloader内）

- [ ] **hover/Toggleのトランジションなし**
  `onmouseover` 直接変更によるちらつき
  → `apps/notro-tail/src/pages/blog/[slug].astro`

---

## 集計

| 優先度 | 件数 |
|--------|------|
| 🔴 高  | 9件  |
| 🟡 中  | 14件 |
| 🟢 低  | 12件 |
| **合計** | **35件** |

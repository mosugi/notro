# TODO — notro-tail 調査結果

> 調査日: 2026-03-18
> 全10エージェントによるコードベース全域スキャン結果。優先度順に記載。
> ✅ = 2026-03-18 修正済み

---

## 🔴 高優先度（バグ・機能欠落）

- [x] **`evaluate()` に try-catch がない** ✅
  MDXコンパイルエラー時にページ全体が500エラーになる
  → `packages/notro/src/utils/compile-mdx.ts`

- [x] **`resolvePageLinksPlugin` の `includes()` 誤マッチ** ✅
  `pageId "abc"` が `"abc123"` にも誤マッチしてリンク先が壊れる（`endsWith()` に変更）
  → `packages/notro/src/utils/mdx-pipeline.ts`

- [x] **`markdownHasPresignedUrls` が `notro` からエクスポートされていない** ✅
  → `packages/notro/index.ts`

- [x] **`Video`/`Audio`/`FileBlock`/`PdfBlock` の `color` prop が未実装** ✅
  props定義はあるが `colorToCSS()` を呼んでいないので色が反映されない
  → `packages/notro/src/components/notion/` 各コンポーネント

- [x] **`StyledSpan` に `class` prop がない** ✅
  `classMap.span` が機能しない
  → `packages/notro/src/components/notion/StyledSpan.astro`

- [x] **`TableColgroup`/`TableCol`/`MentionDate` に `class` prop がない** ✅
  スタイルカスタマイズ不可
  → `packages/notro/src/components/notion/` 各コンポーネント

- [x] **`DatabaseProperty` の `nt-property-*` CSS が未定義** ✅
  クラスがCSSに存在しないのでスタイルなし状態になる
  → `apps/notro-tail/src/styles/global.css`

- [x] **Fix 9のURL括弧問題** ✅
  `[text](https://example.com/path(with)parens)` のような括弧入りURLでURLが途中で切れる
  → `packages/remark-nfm/src/transformer.ts`（Fix 9の正規表現）

- [x] **`dataSources.query` にリトライロジックなし** ✅
  DBクエリ失敗でビルド全体が停止する（`pages.retrieveMarkdown` にはリトライあり）
  → `packages/notro/src/loader/loader.ts`

---

## 🟡 中優先度（品質・信頼性）

- [x] **`icon` の presigned URL チェック漏れ** ✅
  `icon.type === "file"` のページが期限切れのままキャッシュされる
  → `packages/notro/src/loader/loader.ts`

- [ ] **ネストされた callout 未対応**
  callout内の `:::` で外側のcalloutが誤って閉じられる（※現行APIは `<callout>` HTML形式を返すため影響範囲は旧形式のみ）
  → `packages/remark-nfm/src/transformer.ts`（Fix 2）

- [x] **`remarkNfm` の多重適用ガードなし** ✅
  `notro()` integration と手動設定の両方でプラグインが適用されると `preprocessNotionMarkdown` が二重実行される
  → `packages/remark-nfm/src/nfm.ts`

- [x] **`buildLinkToPages` の重複ID未検証** ✅
  同一IDのエントリが後勝ちで上書きされリンクが壊れる可能性がある（警告ログを追加）
  → `packages/notro/src/utils/notion.ts`

- [x] **コンパイルキャッシュのメモリ上限なし** ✅
  大規模サイトで `compilationCache` が無制限に増大する
  → `packages/notro/src/utils/compile-mdx.ts`

- [x] **`og:image` / Twitter Card / `og:locale` 欠落** ✅
  SEO最適化が不完全（CLAUDE.md では "SEO-optimized" を謳っている）
  → `apps/notro-tail/src/layouts/Layout.astro`

- [x] **`aria-current` 未設定・skip link なし** ✅
  スクリーンリーダーでアクティブナビが伝わらない
  → `apps/notro-tail/src/components/Header.astro`

- [x] **Callout アイコンに `aria-hidden` なし** ✅
  絵文字アイコンがスクリーンリーダーで読み上げられる
  → `packages/notro/src/components/notion/Callout.astro`

- [x] **全 `package.json` に `engines` フィールドなし** ✅
  Node.js 22+ 要件がpackage.jsonに反映されていない（CLAUDE.mdには記載あり）
  → `/package.json`, `packages/notro/package.json`, `packages/remark-nfm/package.json`, `apps/notro-tail/package.json`

- [x] **CI の Node.js バージョンが 21.x** ✅
  CLAUDE.md の「Node.js 22+」推奨と不一致
  → `.github/workflows/release.yml`（確認: すでに 22.x になっていた）

- [x] **`astro.config.mjs` の `remotePatterns` が全HTTPS許可** ✅
  `{ protocol: "https" }` ですべてのオリジンを許可しており広すぎる
  Notion S3ドメイン（`*.amazonaws.com` 等）に絞った
  → `apps/notro-tail/astro.config.mjs`

- [x] **`content.config.ts` の `Slug` に必須バリデーションなし** ✅
  空Slugのページが予期しないURLで生成される
  → `apps/notro-tail/src/content.config.ts`

- [ ] **Fix 1 でスペースのみの行が誤マッチ**
  `"   \n---"` のような行頭スペースのみの場合が setext H2 防止処理の対象外
  → `packages/remark-nfm/src/transformer.ts`（Fix 1の正規表現）

- [x] **`.changeset/config.json` の `ignore` に `notro-tail` 未指定** ✅
  privateアプリがchangeset のバージョン管理対象になっている
  → `.changeset/config.json`

---

## 🟢 低優先度（DX・一貫性）

- [x] **ダークモード対応なし** ✅
  全色がライトモード固定のhardcoded値で、`prefers-color-scheme: dark` が未対応
  → `apps/notro-tail/src/styles/global.css`

- [x] **Notion色がすべてinline styleで出力される** ✅
  CSS変数を使っていないため `classMap` での色指定ができない
  → `apps/notro-tail/src/styles/global.css`（`:root` に `--nt-color-*` 変数を定義し、`.nt-color-*` クラスがそれを参照するよう変更。ダークモードも変数の上書きで対応）

- [x] **テーブルに `overflow-x-auto` なし** ✅
  横幅が広いテーブルがモバイルでスクロールできない
  → `packages/notro/src/components/notion/TableBlock.astro`

- [x] **クラス命名規約が不統一** ✅
  コンポーネント内で `notion-*` と `nt-*` が混在している
  → `packages/notro/src/components/notion/` 各コンポーネント（調査の結果、すでに全コンポーネントが `nt-*` を使用しており変更不要）

- [x] **`ClassMapKeys` に `mention-date` が欠落** ✅
  MentionDate コンポーネントへのクラス注入ができない
  → `packages/notro/src/types.ts` および `component-resolver.ts` にすでに実装済みと確認

- [x] **`getPlainText` の `join()` に区切り文字なし** ✅
  multi_select などで `"A,B"` でなく `"AB"` に結合される（※Notionのrich_text配列は直接連結が正しい仕様。multi_selectのみ `", "` 区切りに修正）
  → `packages/notro/src/utils/notion.ts`

- [x] **`calloutPlugin` が `remark-nfm` の public API として不要にエクスポートされている** ✅
  外部から単独適用すると二重処理のリスク
  → `packages/remark-nfm/index.ts` にすでにエクスポートなし（内部実装として管理済みと確認）

- [x] **カスタム 404 ページなし** ✅
  Astro デフォルトの404が表示される
  → `apps/notro-tail/src/pages/404.astro`（新規作成）

- [x] **0件時のメッセージなし** ✅
  タグ絞り込みなどで記事0件の場合に空白になる
  → `apps/notro-tail/src/components/BlogList.astro`

- [x] **`packages/notro/tsconfig.json` が存在しない** ✅
  パッケージ単独での型チェックが不正確になる
  → `packages/notro/tsconfig.json`（新規作成）

- [x] **`markdownHasPresignedUrls` の false positive** ✅
  本文に `X-Amz-Algorithm` という文字列が含まれるだけでキャッシュ無効化される
  → `packages/notro/src/utils/notion-url.ts` — URLクエリパラメータコンテキスト内でのみ検出する正規表現に改善

- [x] **hover/Toggleのトランジションなし** ✅
  `onmouseover` 直接変更によるちらつき
  → `apps/notro-tail/src/pages/blog/[slug].astro`

---

## 集計

| 優先度 | 全件 | 修正済み | 残り |
|--------|------|----------|------|
| 🔴 高  | 9件  | 9件 ✅   | 0件  |
| 🟡 中  | 14件 | 12件 ✅  | 2件  |
| 🟢 低  | 12件 | 12件 ✅  | 0件  |
| **合計** | **35件** | **33件** | **2件** |

---

## 🚀 2026-03-19 セッション — 残り11件の対応計画（10エージェント並行）

> branch: `claude/identify-missing-features-JeNyS`

| Agent | 優先度 | 担当ファイル | タスク |
|-------|--------|-------------|--------|
| A1 | 🟡 中 | `packages/remark-nfm/src/transformer.ts` | Fix 1 スペースのみ行の誤マッチ修正 + Fix 2 ネストcallout対応 |
| A2 | 🟡 中 | `packages/notro/src/utils/compile-mdx.ts` | コンパイルキャッシュのメモリ上限実装（LRU or FIFO MAX_CACHE_SIZE） |
| A3 | 🟡 中 | `.github/workflows/release.yml` | CI の Node.js バージョンを 21.x → 22.x に修正 |
| A4 | 🟢 低 | `apps/notro-tail/src/styles/global.css` | ダークモード対応（`prefers-color-scheme: dark`） |
| A5 | 🟢 低 | `packages/notro/src/utils/colors.ts` + 関連コンポーネント | Notion色をCSS変数化（inline style → カスタムプロパティ） |
| A6 | 🟢 低 | `packages/notro/src/components/notion/` 各コンポーネント | クラス命名規約統一（`notion-*` → `nt-*`） |
| A7 | 🟢 低 | `packages/notro/src/types.ts` + `packages/remark-nfm/index.ts` | ClassMapKeys に `mention-date` 追加 + calloutPlugin を内部化 |
| A8 | 🟢 低 | `packages/notro/src/utils/notion.ts` + `packages/notro/src/utils/notion-url.ts` | getPlainText join 調査・修正 + markdownHasPresignedUrls false positive 修正 |
| A9 | 🟢 低 | `packages/notro/tsconfig.json`（新規） | packages/notro の tsconfig.json 作成 |
| A10 | 🟢 低 | `apps/notro-tail/src/pages/blog/[slug].astro` | Toggle/hover トランジション追加（CSS transition） |

## テストページ（Notion）

| スラッグ | 目的 |
|---------|------|
| `test-callout-edge-cases` | ネストcallout・三重ネスト・Callout内コード/リスト・連続Callout・URL括弧リンク |
| `test-markdown-edge-cases` | Fix 1-9各種エッジケース・Fix 9テーブルリンク・インライン装飾組み合わせ |

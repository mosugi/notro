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

- [x] **ネストされた callout 未対応** ✅
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

- [x] **Fix 1 でスペースのみの行が誤マッチ** ✅
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
| 🟡 中  | 14件 | 14件 ✅  | 0件  |
| 🟢 低  | 12件 | 12件 ✅  | 0件  |
| **合計** | **35件** | **35件** | **0件** |

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

---

## 🗓 2026-03-19 セッション — 全20ページ レンダリング確認調査（10エージェント並行）

> branch: `claude/test-notion-rendering-fn2Sm`
> 調査対象: Notionデータベース全20ページ

### 🔴 重大（機能が根本的に壊れている）

#### N-01: raw HTML ブロックがコンポーネントマッピングをバイパスする【最優先】

`@mdx-js/mdx` の `evaluate()` は raw HTML ブロック（`<table>`, `<h2 color="...">` 等）を
`_components` によるマッピングの対象にしない。
Notion API はテーブル・色付き見出し・色付き段落を raw HTML として出力するため、
`TableBlock.astro` / `H2.astro` / `ParagraphEl` に一切到達しない。

**症状:**
- テーブルがブラウザデフォルトスタイル（枠線なし・パディングなし）で表示される
- `header-row="true"` による先頭行スタイルが機能しない
- `nt-table-wrapper` / `nt-table` / `nt-table-cell` クラスが付与されない
- Fix 3 生成の `<h2 color="blue">` / `<p color="gray_bg">` の色が完全に無視される

**影響ページ:** 全テーブルページ（sample-04-tables 等）、色付きブロックを含む全ページ
**対処案:** `rehype-raw` をパイプライン（`packages/notro/src/utils/mdx-pipeline.ts`）に追加し、
raw HTML を hast element に変換してからコンポーネントマッピングを適用する

---

#### N-02: `<details>` / `<column>` 内コンテンツがタブインデントによりコードブロックとして誤レンダリングされる

Notion API は `<details>` / `<summary>` / `<column>` 内のコンテンツをタブ1つでインデントして出力する。
CommonMark ではタブ1つ（=4スペース相当）のインデントはコードブロックとして解釈される。

**症状:**
- トグルの本文テキスト・リスト・コードブロックがすべて `<pre><code>` として出力される
- ネストされたトグルの内側 `<details>` タグがエスケープされた文字列として表示される
- トグル内のフェンスコードブロック（` ``` `）がフェンスとして認識されない
- カラムレイアウト（`<column>`）内の見出し・リストが生テキストになる
- ネストされたリスト（`\t- item`）がコードブロックになる可能性がある

**影響ページ:** sample-08-toggles, sample-10-columns, sample-03-lists
**対処案:** `transformer.ts` に新 Fix を追加し、`<details>` / `<column>` / リストアイテムの
タブインデントを dedent する（callout の Fix 2 dedent ロジックを参考に適用）
**参照:** `packages/remark-nfm/src/transformer.ts`, `packages/notro/src/components/notion/Toggle.astro`, `packages/notro/src/components/notion/Column.astro`

---

#### N-03: Callout が API フォーマット不一致で icon・color が機能しない

Notion API は callout を `<callout>\n\t💡 **Tip:** ...\n</callout>` という属性なし raw HTML で出力する。
Fix 2 は `:::callout{icon="..." color="..."}` ディレクティブ形式のみ処理するため：
- アイコン用 `<span>` が描画されない（絵文字がインラインテキストとして本文先頭に混入）
- `color` が渡らないためデフォルトスタイルのみ

**影響ページ:** sample-16-mixed-blog-post、callout を含む全ページ
**対処案:** `transformer.ts` で raw HTML 形式の `<callout>` をディレクティブ形式に変換する
前処理を Fix 2 に追加する
**参照:** `packages/remark-nfm/src/transformer.ts` (Fix 2), `packages/notro/src/components/notion/Callout.astro`

---

#### N-04: インライン数式が KaTeX で正しくレンダリングされない

Notion API はインライン数式を `\$x = frac\{-b pm sqrt\{b\^2 - 4ac\}\}\{2a\}\$` のように出力する。
Fix 0 は `\$...\$` → `$...$` にデリミタを変換するが、内部の
`\^` / `\{` / `\}` のエスケープ解除と、`frac` / `sqrt` / `pm` → `\frac` / `\sqrt` / `\pm`
の LaTeX コマンド復元は行われないため、KaTeX が数式を解釈できない。
（ブロック数式 `$$...$$` は正常）

**影響ページ:** sample-09-math、インライン数式を含む全ページ
**参照:** `packages/remark-nfm/src/transformer.ts` (Fix 0, Fix 5)

---

#### N-05: blockquote 直後の段落テキストが誤って blockquote 内に取り込まれる

CommonMark の lazy continuation 規則により、blockquote の最後の段落が `>` なしで継続できる。
Notion API は `> last-quote-line\nRegular paragraph` の形式（空行なし）で出力するため、
`Regular paragraph` が blockquote 外の独立段落ではなく quote 内テキストとしてパースされる。

**影響ページ:** sample-06-blockquotes、blockquote を含む全ページ
**対処案:** `transformer.ts` に新 Fix を追加し、`> ...` で終わる行の直後に `>` で始まらない
テキスト行が続く場合、間に空行を挿入する
**参照:** `packages/remark-nfm/src/transformer.ts`

---

#### N-06: TableOfContents コンポーネントが静的プレースホルダーのみで目次を生成しない

`<table_of_contents/>` は自己閉鎖タグのため `<slot />` が空になり、
「📋 目次」というラベルのみが表示される。見出しへのジャンプリンクが一切生成されない。

**影響ページ:** sample-12-toc、TOC ブロックを含む全ページ
**対処案:** `rehype-slug` + `rehype-autolink-headings` をパイプラインに追加し、
クライアントサイド JS または Astro ビルド時処理で見出し一覧を動的収集する
**参照:** `packages/notro/src/components/notion/TableOfContents.astro`, `packages/notro/src/utils/mdx-pipeline.ts`

---

### 🟠 中程度（表示が崩れる・機能が一部欠損）

#### N-07: `<hr>` 要素に視覚的スタイルがない

`global.css` に `.nt-markdown-content hr` のスタイル定義が存在しない。
Tailwind 4 preflight のみが適用され、上下余白がなく divider が本文に張り付いて表示される。

**対処案:** `global.css` に `.nt-markdown-content hr` のマージン・ボーダー色を追加する

---

#### N-08: `.nt-quote-block` の CSS が未定義

`Quote.astro` が出力する `<blockquote class="nt-quote-block">` に対応する CSS が `global.css` に存在しない。
ブロッククォートが通常テキストと視覚的に区別できない（左ボーダー・インデント・背景色なし）。

---

#### N-09: 画像ブロックが Astro の画像最適化を受けない

`ImageBlock.astro` がネイティブ `<img>` タグを使用しており、WebP 変換・リサイズ・lazy loading が適用されない。
また画像の Alt テキストが常に `<figcaption>` として画面上に表示される。

**参照:** `packages/notro/src/components/notion/ImageBlock.astro`

---

#### N-10: `truncated` フラグがページデータに保存されず訪問者への通知手段がない

ビルドログに警告は出るが `schema.ts` に `truncated` フィールドがなく、
`[slug].astro` で切り捨て有無を判断できない。大容量ページで無言のコンテンツ欠損が起きうる。

**対処案:** `schema.ts` に `truncated: z.boolean().default(false)` を追加し、
`[slug].astro` で注意書きを表示する

---

#### N-11: タスクリストのチェックボックスにスタイル定義がない

remark-gfm が生成する `.contains-task-list` / `.task-list-item` / `input[type=checkbox]` に対する
CSS が `global.css` に存在せず、ブラウザ間で見た目が大きく異なる。

---

#### N-12: About・privacy・sample-fixed-page が Public=false でビルドから除外されている

- `about`: Public=false → `/blog/about/` が 404（静的 `/about/` とも設計が二重化）
- `privacy`: Public=false → `/blog/privacy/` が 404
- `sample-fixed-page`: Public=false かつ本文が空

**対処案:** Notion 上で `Public` プロパティを `true` に変更する。
About は静的 Astro ページとの実装方針統一も必要。

---

#### N-13: `config.ts` の `navPages` 設定が不完全

- `privacy` が未登録 → `page-privacy` bodyClass が適用されず法的文書スタイルが当たらない
- `about` が未登録 → `page-about` bodyClass が適用されない
- `blocks` ページが Notion 上に存在しない

**対処案:** `config.ts` に `{ slug: "privacy", bodyClass: "page-privacy" }` と
`{ slug: "about", bodyClass: "page-about" }` を追加する

---

#### N-14: ピン留め記事がページネーション件数の計算から除外される

`[...page].astro` が `paginate(regularPosts, ...)` に `pinnedPosts` を除いた件数を渡すため、
ピン留め記事が多い場合に総記事数とページネーション件数が一致しない。

---

### 🟡 軽微（視覚的な問題・将来リスク）

#### N-15: `.nt-toggle-block > details > summary` CSS セレクターがデッドコード

`Toggle.astro` は `<details class="nt-toggle-block">` と書いており、
`.nt-toggle-block` 自身が `<details>` のため `.nt-toggle-block > details` はマッチしない。
`global.css` 内の関連ルール群は未使用（デッドコード）。

---

#### N-16: Fix 4 が `<table_of_contents>` の `color` 属性を破棄する

`transformer.ts` Fix 4 が `<table_of_contents color="gray"/>` → `<div><table_of_contents/></div>` に
変換する際、`color` 属性が除去される。

---

#### N-17: `.nt-toc-block` / `.nt-toc-block__label` の CSS が未定義

`TableOfContents.astro` が使用するクラスに対応する CSS が `global.css` に存在しない。

---

#### N-18: KaTeX CSS を CDN から読み込んでいる

`Layout.astro` が `https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css` を外部 CDN から読み込んでいる。
オフライン環境・CDN 障害時に数式スタイルが崩れる。

---

#### N-19: About ページの Notion コンテンツに「Astro 5」の誤記（実際は Astro 6）

---

#### N-20: SyncedBlock フォールバック時に Notion 内部 URL が公開される

Fix 6 が失敗した場合に `<synced_block>` がそのまま通過し、
`SyncedBlock.astro` が `data-url` 属性に Notion 内部 URL を出力する。

---

### 集計（2026-03-19 追加分）

| 優先度 | 件数 |
|--------|------|
| 🔴 重大 | 6件（N-01〜N-06） |
| 🟠 中程度 | 8件（N-07〜N-14） |
| 🟡 軽微 | 6件（N-15〜N-20） |
| **合計** | **20件** |

### 根本原因サマリー

| 根本原因 | 影響する課題 |
|---|---|
| `@mdx-js/mdx` が raw HTML をコンポーネントマッピング対象にしない | N-01, N-02（一部）, N-03（一部） |
| タブインデントが CommonMark コードブロックとして解釈される | N-02（toggles, columns, lists） |
| Notion API のインライン数式フォーマットが壊れている | N-04 |
| `preprocessNotionMarkdown` に Fix 不足 | N-05（blockquote lazy continuation） |
| CSS 定義の欠落 | N-07, N-08, N-11, N-15, N-17 |
| Notion ページの `Public=false` 設定 | N-12 |
| `config.ts` の `navPages` 設定漏れ | N-13 |

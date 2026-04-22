# NotroTail ドキュメント整備 TODO

> 調査日: 2026-03-20
> 10エージェントによるコードベース・ビルド結果・Astro公式サイト構造の並列調査結果をもとに作成。
> 前提: NotroTail はテンプレートとして Vercel/Netlify へのデプロイを想定。notro・remark-nfm はオプション。

---

## 方針

### 対象オーディエンス（2種類）

| オーディエンス | 目的 | 主な動線 |
|---|---|---|
| **テンプレート利用者** | NotroTail をクローンして Notion ブログを立ち上げたい | トップ → クイックスタート → デプロイ |
| **パッケージ利用者** | 既存 Astro プロジェクトに `notro` / `remark-nfm` を追加したい | Docs → API リファレンス → npm |

### 現状の課題

1. **トップページ** — デプロイ CTA がない。GitHub とデモブログへの誘導しかなく、テンプレートとして使う入口がない。
2. **Docs ページ** (`/contact/`) — "How this site is built" という説明ページ止まり。クイックスタート・API リファレンス・デプロイガイドがない。
3. **チュートリアルがブログに埋もれている** — 優良な入門記事（setup, add-notro-to-astro 等）がブログ一覧に並んでいて、学習パスとして機能していない。
4. **notro がオプションであることが伝わらない** — テンプレートを Notion なしで使うパターンが示されていない。
5. **テスト記事が本番表示されている** — `test-callout-edge-cases`, `test-markdown-edge-cases` がブログ一覧に出ている。

---

## 1. トップページ（`index.astro`）の改善

### 1-1. ヒーローセクション

- [x] **「Deploy to Vercel」「Deploy to Netlify」ボタン**をヒーローに追加
  - Vercel: `[![Deploy with Vercel](...)](https://vercel.com/new/clone?...)` スタイル
  - Netlify: `[![Deploy to Netlify](...)](https://app.netlify.com/start/deploy?...)` スタイル
- [x] CTAの重複を解消 — ヒーローと最終CTAで「GitHub」「デモブログ」が2回出ている。ヒーローはデプロイ重視、最終CTAはGitHub重視に役割を分ける。
- [x] **クイックスタートコマンド**をテンプレート利用者向けに変更
  - 現状: `npm install notro`（パッケージ利用者向け）
  - 追加: `Use this template` → clone → deploy の3ステップ

### 1-2. 2つの使い方を明示するセクションを追加

```
┌──────────────────────────┐  ┌──────────────────────────┐
│  テンプレートとして使う     │  │  npm パッケージとして使う  │
│  Notion ブログを5分で     │  │  既存 Astro プロジェクトに │
│  Vercel/Netlify にデプロイ│  │  notro を追加する         │
└──────────────────────────┘  └──────────────────────────┘
```

- [ ] notro・remark-nfm が**オプション**であることを「機能」セクションで明記

### 1-3. 「3ステップ」セクションをテンプレート視点に変更

現在: 「Notionで書く → notroが変換 → Astroが生成」（パッケージ利用者視点）
変更後: テンプレート利用者向けの3ステップを追加または並記

1. このリポジトリをテンプレートとして使う（GitHub の "Use this template"）
2. Notion トークンとデータソース ID を環境変数に設定
3. Vercel / Netlify にデプロイ（ワンクリック）

### 1-4. CTA「ブログを見る」→「Docs を見る」に変更

- [ ] ヒーローの「ブログを見る →」ボタンを「ドキュメントを見る →」（`/contact/`）に変更
  ※ デモとしてのブログへのリンクは残す（セカンダリボタン）

---

## 2. Docs ページ（`/contact/`）の整備

### 2-1. ページ全体の再構成

`contact.astro` を **Docs ハブ**として再構成。現在の「3ページ種類の説明 + パイプライン説明」は「サイトの仕組み」セクションとして残しつつ、以下を追加:

- [ ] **クイックスタートセクション**（テンプレート利用者向け）
  ```
  1. リポジトリをクローン / GitHub の "Use this template" で作成
  2. npm install（ルートで実行）
  3. .env に NOTION_TOKEN, NOTION_DATASOURCE_ID を設定
  4. npm run dev（localhost:4321 で確認）
  5. Vercel / Netlify にデプロイ
  ```

- [ ] **Notion セットアップガイド**
  - Notion インテグレーション作成手順（notion.so/my-integrations へのリンク）
  - データソース ID の取得方法（URL から抽出）
  - データベーススキーマ必須プロパティ一覧

  | プロパティ | 型 | 必須 | 説明 |
  |---|---|---|---|
  | `Name` | title | ✓ | 記事タイトル |
  | `Slug` | rich_text | ✓ | URL スラッグ |
  | `Public` | checkbox | ✓ | 公開フラグ |
  | `Description` | rich_text | — | 説明文・meta description |
  | `Tags` | multi_select | — | タグ（`page`/`pinned` は内部マーカー） |
  | `Date` | date | — | 公開日 |

- [ ] **環境変数リファレンス**テーブル

  | 変数 | 必須 | 説明 |
  |---|---|---|
  | `NOTION_TOKEN` | ✓ | Notion Internal Integration Token |
  | `NOTION_DATASOURCE_ID` | ✓ | Notion データソース ID（DB ID） |

- [ ] **Vercel / Netlify デプロイガイド**
  - Vercel: `vercel.json` が `templates/blog/dist` を自動設定
  - Netlify: `netlify.toml` が設定済みのためそのままデプロイ可
  - 環境変数の設定箇所（各ダッシュボードのスクリーンショット or リンク）

- [ ] **`notro` パッケージ API リファレンス**セクション
  - 3つのエントリーポイント（`notro`, `notro/utils`, `notro/integration`）
  - `loader()` オプション（`queryParameters`, `clientOptions`）
  - `NotroContent` props（`markdown`, `linkToPages`, `classMap`, `components`）
  - `classMap` キー一覧（callout, toggle, h1–h4, p, ul, ol, li, a, pre, table, etc.）

- [ ] **`remark-nfm` スタンドアロン利用**セクション
  - `import { remarkNfm } from 'remark-nfm'` の基本使用例
  - 修正 Fix 0〜9 の簡易表

- [ ] **チュートリアルへの誘導リスト**

  ```
  📖 チュートリアル（ブログ記事）
  ├── セットアップガイド              → /blog/setup/
  ├── 既存 Astro プロジェクトへの追加  → /blog/add-notro-to-astro/
  ├── Notion でのコンテンツ管理        → /blog/content-management/
  ├── ビルドとデプロイ                → /blog/build-and-deploy/
  └── コンポーネントのカスタマイズ     → /blog/customize-components/
  ```

- [ ] **トラブルシューティングセクション**
  - `truncated === true` の対処（大きなページを分割）
  - `unknown_block_ids` の意味（Notion API が変換できなかったブロック）
  - Notion API レート制限（429）への対応（自動リトライあり）
  - 画像が表示されない（S3 プリサイン URL の有効期限切れ → 再ビルド）

### 2-2. URL のリネーム検討

- [ ] `/contact/` → `/docs/` へのリネームを検討（ファイル名が実体と乖離している）
  - `src/pages/contact.astro` → `src/pages/docs.astro`
  - `astro.config.mjs` に `redirects: { '/contact/': '/docs/' }` を追加（後方互換）
  - Header・Footer のリンク先を更新

---

## 3. チュートリアル（ブログ記事）の整理

### 3-1. 既存記事マッピング

| スラッグ | タグ | 学習段階 |
|---|---|---|
| `setup` | セットアップ, 入門 | ★ 入門1 |
| `add-notro-to-astro` | notro, Astro, 入門 | ★ 入門2 |
| `content-management` | Notion, コンテンツ管理 | ★★ 基礎 |
| `build-and-deploy` | デプロイ, Netlify, Vercel | ★★ 基礎 |
| `customize-components` | カスタマイズ, Tailwind | ★★★ 応用 |
| `blocks` | — | ★★★ リファレンス |
| `test-callout-edge-cases` | test, callout | テスト用（非公開推奨）|
| `test-markdown-edge-cases` | test, edge-cases | テスト用（非公開推奨）|

### 3-2. テスト記事の非公開化（Notion 側操作）

- [ ] Notion で `test-callout-edge-cases` と `test-markdown-edge-cases` の `Public` を **false** に変更
  ※ コード変更不要

### 3-3. ブログ一覧での「入門」記事の優遇

- [ ] `blog/[...page].astro` で `入門` タグの記事を「ピン留め」同様に1ページ目上部に表示するか検討
  - 現状: ピン留め（`pinned` タグ）と日付ソートのみ
  - 案: `入門` タグ記事を「はじめての方へ」セクションとして固定表示

### 3-4. 新規記事の執筆（Notion で作成）

- [ ] **テンプレートのフォルダ構成ガイド** — `src/` 各ディレクトリの役割説明（タグ: 入門）
- [ ] **remark-nfm スタンドアロン使用ガイド** — Astro なしで使いたい人向け（タグ: remark-nfm）
- [ ] **Notion ブロック対応状況リファレンス** — `blocks` 記事を拡充してコンポーネント + CSS クラス一覧（タグ: リファレンス）

---

## 4. 内部タグの仕様を README / Docs で明文化

- [ ] `page` タグ — ブログ一覧・タグページ非表示、日付/タグ/前後ナビ非表示。固定ページ（About, Privacy 等）に使用。
- [ ] `pinned` タグ — ブログ一覧1ページ目の「ピン留め」セクションに表示。通常リストからは除外。
- [ ] `入門` タグ — 入門者向け。チュートリアル序列の基準として使用。
- [ ] 上記を `content-management` 記事 または Docs ページで明記

---

## 5. 技術的な実装タスク（優先度順）

| # | タスク | ファイル | 優先度 |
|---|---|---|---|
| 1 | test記事を非公開（Notion操作） | Notion DB | 🔴 即時 |
| 2 | index.astro にデプロイボタン追加 | `src/pages/index.astro` | 🔴 高 |
| 3 | index.astro のCTA重複解消 + ボタン役割整理 | `src/pages/index.astro` | 🔴 高 |
| 4 | Docs ページにクイックスタート追加 | `src/pages/contact.astro` | 🔴 高 |
| 5 | Docs ページに Vercel/Netlify デプロイガイド追加 | `src/pages/contact.astro` | 🟠 中 |
| 6 | Docs ページに Notion セットアップガイド追加 | `src/pages/contact.astro` | 🟠 中 |
| 7 | Docs ページにチュートリアル誘導リスト追加 | `src/pages/contact.astro` | 🟠 中 |
| 8 | Docs ページに API リファレンス追加 | `src/pages/contact.astro` | 🟠 中 |
| 9 | Docs ページにトラブルシューティング追加 | `src/pages/contact.astro` | 🟡 低 |
| 10 | /contact/ → /docs/ リネーム + redirect | `astro.config.mjs`, `contact.astro` | 🟡 低 |
| 11 | index.astro「ブログを見る」→「Docs を見る」に変更 | `src/pages/index.astro` | 🟡 低 |
| 12 | ブログ一覧で「入門」記事を優先表示 | `src/pages/blog/[...page].astro` | 🟡 低 |
| 13 | OGP 画像（og-default.png）をテンプレート向けに更新 | `public/og-default.png` | 🟡 低 |

---

## サイト全体の情報設計（目標）

```
/                    トップ
                     └── テンプレートの価値提案 + デプロイ CTA（Vercel/Netlify）
                         2つの使い方（テンプレート / npm パッケージ）
                         3ステップ（テンプレート視点）+ 機能一覧

/docs/               Docs（現在の /contact/）
                     ├── クイックスタート（5分でデプロイ）
                     ├── Notion セットアップ
                     ├── 環境変数
                     ├── デプロイガイド（Vercel / Netlify）
                     ├── API リファレンス（loader, Renderer, classMap）
                     ├── remark-nfm スタンドアロン
                     ├── チュートリアル一覧（→ /blog/）
                     ├── サイトの仕組み（現在の内容）
                     └── トラブルシューティング

/blog/               ブログ（Notion 管理）
                     ├── 入門記事（setup, add-notro-to-astro, ...）
                     ├── 基礎・応用記事
                     └── リファレンス記事（blocks, ...）

/blog/about/         About（Notion 管理、page タグ）
/blog/privacy/       プライバシーポリシー（Notion 管理、page タグ）
/404                 404 ページ
```

---

# templates/blog × packages/ モノレポ利用の改善案

> 調査日: 2026-04-16
> `templates/blog` が `packages/` 配下 (notro-loader / notro-ui / rehype-beautiful-mermaid / remark-nfm / create-notro) をどう使っているかを確認し、改善ポイントを抽出。

## 要約

- import エントリポイントの使い分けが不徹底で、純粋 TS ヘルパーまで `notro-loader` メインから引っ張っており、Astro コンポーネント一式が不要な経路にも巻き込まれている。
- `notro-ui` の CLI (`notro-ui init/add/update`) 前提のワークフローに対し、テンプレート側に `notro.json` が無く、上流の更新を取り込む運用経路が閉じている。
- `notro-theme.css` と `packages/notro-ui/src/templates/theme.css` がドリフトしており、どちらが source of truth か曖昧。
- その他、CLAUDE.md のガイドとの整合性に欠ける箇所が散見（`<script>` 内ロジックの未抽出、`@/*` エイリアス不在、ドキュメント記載と実装の乖離）。

---

## 1. `notro-loader` の import エントリ誤用（優先度: 🔴 高）

純粋 TS ユーティリティ (`getPlainText` / `getMultiSelect` / `hasTag` / `buildLinkToPages`) は `notro-loader/utils` から import するのが正解だが、以下の箇所ではメインエントリ (`notro-loader`) から読んでいる。メインエントリは `NotroContent.astro` を含むため、利用しない経路まで Astro コンポーネントのロードパスに乗ってしまう。

| ファイル | 現状 | 修正案 |
|---|---|---|
| `src/pages/rss.xml.ts:4` | `import { getPlainText, hasTag } from "notro-loader";` | `"notro-loader/utils"` へ変更 |
| `src/pages/blog/[...page].astro:4` | `import { hasTag } from "notro-loader";` | `"notro-loader/utils"` へ変更 |
| `src/pages/blog/tag/[tag]/[...page].astro:4` | `import { hasTag } from "notro-loader";` | `"notro-loader/utils"` へ変更 |
| `src/pages/blog/[slug].astro:3` | `buildLinkToPages, getPlainText, hasTag, NotroContent` を混在 | `NotroContent` のみ `"notro-loader"`、残りは `"notro-loader/utils"` に分離 |
| `src/components/blog/PostCard.astro:3` | `getPlainText, getMultiSelect` from `"notro-loader"` | `"notro-loader/utils"` へ変更 |

- [x] 上記 5 箇所を `notro-loader/utils` 経由に書き換え
- [x] `src/lib/blog.ts` は既に `notro-loader/utils` を使えている（4 行目の `PropertyPageObjectResponseType` も `import type` 化済み）

---

## 2. `notro-ui` CLI 利用基盤の整備（優先度: 🔴 高）

CLAUDE.md では notro-ui の運用は `notro-ui init` → `notro.json` 生成 → `add/update/remove` という CLI ベースとされているが、

- `templates/blog/notro.json` が **存在しない**（`templates/blank/` も同様）
- `src/components/notro/` 配下はすでに 28 個の `.astro` + `colors.ts` + `index.ts` を抱えているが、`notro-ui update --all` の流入経路が無い

結果として、`packages/notro-ui/src/templates/` (source of truth) への修正がテンプレートへ自動的に反映されない。

- [x] `templates/blog/` と `templates/blank/` で `notro-ui init` 相当の `notro.json` を生成してコミット
  - `outDir`, `stylesDir`, installed components list を定義
- [ ] `src/components/notro/index.ts` に残っている「Site-customized components (differ from notro-ui defaults)」コメントを、`notro.json` 側の「update 除外リスト」or 各 `.astro` 先頭の `// notro-ui: customized` マーカーとして形式化する。CLI が差分を判別できるようにする。

---

## 3. `notro-theme.css` と `packages/notro-ui/src/templates/theme.css` のドリフト（優先度: 🟠 中）

`diff` 結果:

- `templates/blog/src/styles/notro-theme.css` はタスクリスト関連の CSS が `@utility` 層（111–127 行）に置かれており、コメントで「cascade precedence の説明」が追記されている。
- `packages/notro-ui/src/templates/theme.css` (source of truth) ではタスクリストが別の位置（182–192 行）に置かれ、コメントも簡素。

どちらが最新の意図かを決めずに差分が残っている。

- [ ] source of truth を `packages/notro-ui/src/templates/theme.css` と定め、ブログ側の修正（タスクリストの cascade 問題の fix）を上流に取り込む
- [ ] 取り込み後、`notro-ui update --all --yes` 相当の操作で下流を同期（`notro.json` 整備後に可能）
- [ ] 取り込み対象の差分:
  - タスクリスト規則の `@utility` 層配置
  - `.notro-markdown .contains-task-list` / `.task-list-item` / `input[type=checkbox]` のセレクタ詳細度に関するコメント

---

## 4. `package.json` 依存関係の点検（優先度: 🟠 中）

`templates/blog/package.json`:

```
"notro-loader": "^0.0.3",
"rehype-beautiful-mermaid": "^0.0.2",
"beautiful-mermaid": "^1.1.3",   ← ?
...
```

- [ ] **`beautiful-mermaid` の必要性**: `rehype-beautiful-mermaid` の peerDep ではない可能性がある（未確認）。直接 import している箇所が無ければ削除。
- [ ] **`remark-nfm` の扱い**: 現状 `remarkPlugins` に追加する形で独立利用していないので `notro-loader` 推移依存のままで OK。ただし CLAUDE.md の記載通り `preprocessNotionMarkdown` 等を直接呼ぶ場合は `packages/remark-nfm` を `dependencies` に昇格させる必要がある。要判断。
- [ ] **ルート `pnpm.overrides` による workspace 強制**: 意図は「テンプレートは公開版指定のまま、モノレポ開発時は workspace:* に解決」で合理的。ただし `notro-ui`・`remark-nfm`・`create-notro` は overrides に入っていない。必要に応じて拡張を検討。

---

## 5. CLAUDE.md 記載との乖離（優先度: 🟡 低）

- **`notro-loader` のコンポーネント**: CLAUDE.md は `components/ (NotroContent, DatabaseCover, DatabaseProperty)` と書いているが、実装は `packages/notro-loader/src/components/NotroContent.astro` のみ。`DatabaseCover` は `templates/blog/src/components/blog/DatabaseCover.astro` にテンプレート側で自前実装。
- [x] CLAUDE.md の該当記述を「`NotroContent` のみ」に訂正、または `notro-loader` 側に `DatabaseCover` / `DatabaseProperty` を復活させる（どちらを source にするかを決める）。
- **`@/*` path alias**: `src/components/notro/index.ts:6` のコメント例に `import { notroComponents } from '@/components/notro';` とあるが、`tsconfig.json` に `paths` が未定義で、実際の import は全て相対パス。
- [x] `tsconfig.json` に `compilerOptions.baseUrl` + `paths: { "@/*": ["src/*"] }` を追加して統一するか、コメント側を相対パスに直す。（コメント側を相対パスに修正済み）

---

## 6. Astro 実装ベストプラクティス（CLAUDE.md §Astro Implementation）との整合（優先度: 🟡 低）

- **`Header.astro` の `<script>` ロジック未抽出**: 89–102 行の DOM 操作 15 行。CLAUDE.md は「複雑な場合は `src/lib/` に `.ts` として抽出」と規定。
- [x] `src/lib/header-menu.ts` に `initHeaderMenu()` を切り出し、`Header.astro` からは `import { initHeaderMenu } from "@/lib/header-menu"; initHeaderMenu();` のみにする。併せて `vitest` で `aria-expanded`・`hidden` クラスのトグル挙動の単体テストを追加。
- **`src/lib/nav.ts` のテスト**: `isActive` は public export だが単体テスト不在（`blog.ts` だけが `blog.test.ts` を持つ）。
- [x] `src/lib/nav.test.ts` を追加（trailing slash 正規化のエッジケース）。

---

## 7. パッケージ境界の観点でのまとめ

`templates/blog` が期待する `packages/` API は以下。現状の実装と突き合わせた結果:

| パッケージ | エントリ | blog での利用 | 状態 |
|---|---|---|---|
| `notro-loader` | `.` | `NotroContent`, `loader`, `notroProperties`, `pageWithMarkdownSchema`, `buildLinkToPages`, `makeHtmlElement`, 型 | OK（ただし §1 の誤用あり） |
| `notro-loader` | `./utils` | `getPlainText`, `getMultiSelect`, `hasTag` | 一部のみ利用（§1） |
| `notro-loader` | `./integration` | `notro()` | OK |
| `notro-loader` | `./image-service` | `notionImageService` | OK |
| `notro-ui` | CLI | `notro-ui init/add/update` | **未運用**（§2） |
| `remark-nfm` | `.` | （`notro-loader` 経由の推移依存のみ） | OK |
| `rehype-beautiful-mermaid` | `.` | `rehypeMermaid` を `rehypePlugins` に追加 | OK |
| `create-notro` | CLI | （利用者向け、blog 内では未使用） | OK |

---

## 優先度付きアクションリスト

| # | タスク | ファイル | 優先度 | 状態 |
|---|---|---|---|---|
| M1 | `notro-loader` → `notro-loader/utils` への import 切替（5 ファイル） | §1 の表を参照 | 🔴 高 | ✅ 完了 |
| M2 | `templates/blog/notro.json` を生成 (`notro-ui init`) | `templates/blog/notro.json`（新規） | 🔴 高 | ✅ 完了 |
| M3 | `templates/blank/notro.json` を生成 | `templates/blank/notro.json`（新規） | 🔴 高 | ✅ 完了 |
| M4 | `notro-theme.css` のドリフトを上流に統合し下流同期 | `packages/notro-ui/src/templates/theme.css` ほか | 🟠 中 | ⏳ 未着手 |
| M5 | カスタマイズ済みコンポーネントのマーカー整備 | `src/components/notro/*.astro` | 🟠 中 | ⏳ 未着手 |
| M6 | `beautiful-mermaid` 依存の要否確認と削除検討 | `templates/blog/package.json` | 🟠 中 | ✅ 完了（調査の結果、`rehype-beautiful-mermaid` の peer として必要と判断し残置） |
| M7 | `blog.ts:4` の `PropertyPageObjectResponseType` を `import type` に | `src/lib/blog.ts` | 🟡 低 | ✅ 完了 |
| M8 | CLAUDE.md の components 記述を実装に合わせて訂正 | `CLAUDE.md` | 🟡 低 | ✅ 完了 |
| M9 | `tsconfig.json` に `@/*` path alias 追加（or コメント修正） | `templates/blog/tsconfig.json`, `src/components/notro/index.ts` | 🟡 低 | ✅ 完了（コメントを相対パスに修正） |
| M10 | `Header.astro` の `<script>` を `src/lib/header-menu.ts` へ抽出＋テスト | `src/components/Header.astro`, `src/lib/header-menu.ts` | 🟡 低 | ✅ 完了 |
| M11 | `src/lib/nav.ts` のテスト追加 | `src/lib/nav.test.ts`（新規） | 🟡 低 | ✅ 完了 |

---

# templates/blog UX / 初期導入 / カスタマイズ性の改善案

> 調査日: 2026-04-16
> 上記のモノレポ利用レビューを踏まえ、**テンプレート利用者視点**で気になる点を追加。
> 観点: (A) ユーザー体験, (B) テンプレートから始めたときのわかりやすさ, (C) カスタマイズしやすさ。

---

## A. ユーザー体験 (使いやすさ)

### A1. ブランド名・サイト URL のハードコード残り（🔴 高）

テンプレートを clone したユーザーが `config.ts` を編集しても、下記が変わらない。

| ファイル / 行 | 内容 | 修正案 |
|---|---|---|
| `astro.config.mjs:29` | `site: "https://example.com"` | README と `.env.example` で必ず変更するよう明示、または `SITE_URL` 環境変数から読む |
| `src/pages/404.astro:5` | `title="ページが見つかりません — Notro Tail"` | `config.site.name` を使う |
| `src/pages/blog/[...page].astro:41` | description に `notro の使い方を解説します。` がハードコード | `config.blog.description` 等に外出し |
| `src/pages/blog/tag/[tag]/[...page].astro:42` | `h1` の `text-gray-900` がダークモード未対応（nt-text 未使用） | `nt-*` トークンに統一 |

- [x] 各ハードコード箇所を `config.ts` 経由に統一し、**変更忘れ検知**のために `config.site.name === "My Site"` や `site: example.com` を残したままの場合に build で警告する `astro:build:start` フックを追加する案もあり。（`astro.config.mjs` の `warnPlaceholders` integration + `src/lib/placeholder-check.ts` として実装）

### A2. GA トラッキングタグが二重に仕込まれている（🔴 高）

`Layout.astro:28` は `import.meta.env.PUBLIC_GTAG_ID` を使い、
`SeoHead.astro:54` は `config.analytics.gaMeasurementId` を使っている。
両方設定した場合、**GA タグが 2 回挿入される**（Partytown 経由で重複計測）。

- [x] どちらか一方（推奨: `config.analytics.gaMeasurementId` — 設定が 1 箇所で済む）に統一し、`Layout.astro` の GA ブロックは削除
- [x] `env.d.ts` の `PUBLIC_GTAG_ID` 記述も整理

### A3. `Pagination.astro` のダークモード不対応（🟠 中）

`border-gray-200` / `text-gray-600` / `text-gray-500` / `text-gray-300` が直書きで、
`nt-border` / `nt-text-*` / `dark:` クラスが全くない。他コンポーネントと見た目が噛み合わない。

- [x] `nt-border` + `nt-text-60` などのトークンに置換し、他コンポーネントと同じ目線に揃える

### A4. セットアップ時の環境変数エラーが分かりにくい（🟠 中）

`NOTION_TOKEN` 未設定のまま `npm run dev` を実行すると、Notion API から 401 が返ってビルド失敗するが、メッセージが技術的。

- [x] `loader()` 呼び出し前に `import.meta.env.NOTION_TOKEN` / データソース ID 未設定時に **日本語/英語の分かりやすいエラー**を投げる（`content.config.ts` の冒頭でチェック）
- [x] `.env` ファイル自体が無い場合のメッセージも整備（`content.config.ts` で環境変数欠落時の actionable エラーに統合）

### A5. `.env.example` と環境変数仕様の乖離（🟠 中）

CLAUDE.md には `NOTION_DATASOURCE_ID_BLOG` が優先で、`NOTION_DATASOURCE_ID` は fallback と記載されているが、
`.env.example` には `NOTION_DATASOURCE_ID` しか書いていない。`content.config.ts:8` でも両方を読んでいる。

- [x] `.env.example` に `NOTION_DATASOURCE_ID_BLOG`（推奨）と `NOTION_DATASOURCE_ID`（fallback）の両方を記載し、使い分けをコメント
- [ ] README の環境変数セクションも合わせて更新

### A6. UI ラベルが日本語ハードコード（🟡 低）

`config.site.lang: "ja"` / `locale: "ja_JP"` が設定可能であるにもかかわらず、
UI 上の日本語ラベル（「ブログ」「ピン留め」「入門」「古い記事」「新しい記事」「ブログ一覧」「コンテンツへスキップ」「メニューを開く」「記事はまだありません。」「ページが見つかりません」など）は全てハードコード。

- [ ] `src/i18n/ja.ts` / `en.ts` のような辞書ファイルに切り出し、`config.site.lang` で切り替える
- [ ] 最低限、日本語/英語の 2 言語は公式サポート（i18n ライブラリを入れるほどの規模ではないので単純なオブジェクト辞書で十分）

### A7. 「入門」タグ名のハードコード（🟡 低）

`blog.ts:65` で `hasTag(..., "入門")` と直書き。`config.blog.internalTags` で "page" / "pinned" は管理されているのに、"入門" だけ別扱い。

- [x] `config.blog.beginnerTag: "入門"` のように設定可能にする。または `internalTags` の扱いを広げて pinned/beginner を区別した構造にする

---

## B. テンプレート起点のわかりやすさ（初期導入）

### B1. 初期値 “My Site / Your Name” の残存に気付きにくい（🔴 高）

`config.ts` の初期値:
```ts
name: "My Site", author: "Your Name", description: "My site powered by Notion and Astro."
```
これらを変更しないままビルドしても警告は出ず、本番サイトに "My Site" が表示される。OGP 画像のタイトルも "My Site" のまま公開される。

- [x] `config.ts` に `/** @required Replace this value before deploying. */` 的な JSDoc を付け、`astro:build:start` や `astro:build:done` で `name === "My Site"` 等なら警告（`warnPlaceholders` integration として実装）
- [ ] README / .env.example に「最初に必ず変更するもの」チェックリストを掲載

### B2. `README.md` がモノレポ内ドキュメントと利用者ドキュメントを兼任している（🟠 中）

冒頭: *"`template/` is the Astro 6 starter template and reference implementation that ships with the monorepo."*
この記述は `create-notro` 経由で clone した利用者にとっては混乱を招く（そこはもうモノレポではない）。

- [ ] テンプレート配布時は**利用者向けの README に置換**する仕組みにする（例: `README.template.md` を用意し `create-notro` 時にリネーム、またはモノレポ README を `README.internal.md` 名義にしてリリース時に除外）
- [ ] 利用者向け README には「Getting Started → Notion セットアップ → カスタマイズ → デプロイ」の 4 章立てで再構成

### B3. Notion DB スキーマの作成導線が無い（🔴 高）

現状、README とリポジトリ内に "Notion で DB を作成してください" とあるだけで、
**Notion テンプレート DB をワンクリックで複製できるリンクがない**。初見ユーザーはスキーマ定義を手入力する必要がある。

- [ ] Notion の共有テンプレート（notion.site/... の複製リンク）を用意し、README / Docs / create-notro の最終メッセージに記載
- [ ] スキーマ定義を `docs/notion-schema.md` で列・型・選択肢・サンプル値付きで提示

### B4. Notion Integration の接続手順が不足（🟠 中）

`.env.example` で `NOTION_TOKEN` の取得先 URL があるのみ。
**「Integration を DB に connect する」手順**（DB の右上メニュー → Connections → 自分の Integration を選ぶ）が書かれていないため、
token だけ設定して "404 object_not_found" に遭遇する利用者が多発する。

- [ ] README / Docs に手順付きスクリーンショット or 箇条書き手順を追加

### B5. `CHANGELOG.md` / `LICENSE` がテンプレートに入ったまま（🟠 中）

`templates/blog/CHANGELOG.md` はモノレポのリリース履歴、
`templates/blog/LICENSE` は mosugi 名義の MIT。clone した利用者の作業には不要 or ノイズ。

- [ ] `create-notro` 経由で scaffold する際、これらを**除外**または**利用者名に置換**する仕組みを入れる
- [ ] `packages/create-notro` のテンプレートコピー処理で `.gitignore`/`rename` 設定を検討

### B6. OGP デフォルト画像の生成フックが無い（🟡 低）

`public/og-default.png` が存在しない（`public/` は `favicon.svg` と `katex/` のみ）。
`SeoHead.astro:29` は `/og-default.png` を参照しており、404 が返る。

- [ ] `public/og-default.png` をプレースホルダ画像として同梱
- [ ] あるいは Astro の OG image 生成プラグイン（`astro-og-canvas` 等）を組み込み、`config.site.name` から自動生成する選択肢を提示

### B7. netlify / vercel のワンクリックデプロイ導線は README のみ（🟡 低）

README にはデプロイボタンがあるが、トップページ (`index.astro`) には無い（これは上位の TODO 1-1 でも触れられている）。

- [ ] 既存 TODO §1 と整合を取りつつ対応

---

## C. カスタマイズしやすさ

### C1. `src/components/notro/` のカスタム境界が曖昧（🔴 高）

`index.ts` のコメントで「Site-customized components」と「Default notro-ui components (unmodified)」を区別しているが、
実ファイルは同じディレクトリに混在。`notro-ui update` が（将来導入されても）どれを上書き可とみなすべきか判別できない。

- [ ] 各 `.astro` ファイルの先頭に `{/* notro-ui: customized */}` / `{/* notro-ui: default */}` のマーカー行を置き、`notro-ui update` が default のみ上書きする仕様にする
- [ ] または、`src/components/notro/customized/` と `src/components/notro/defaults/` でディレクトリ分離

### C2. `notroComponents` の一部差し替えパターンが分かりにくい（🟠 中）

利用者が「Callout だけ自作コンポーネントにしたい」と思ったとき、
`<NotroContent components={{ ...notroComponents, callout: MyCallout }} />` と spread する必要があるが、
この使い方は `index.ts` のコメント 10 行目にしか書かれていない。

- [ ] `src/components/notro/README.md`（または docs）で**最頻の上書きパターン 3 種**を例示
  - 1 つ差し替え（callout のみ）
  - 色だけ変えたい（classMap で対応可能なケース）
  - 全面置換（独自の components 辞書を作る）

### C3. `classMap` を使った軽量カスタマイズが使われていない（🟠 中）

`NotroContent` は `classMap` prop で「コンポーネントを差し替えずに Tailwind クラスだけ注入」できる仕組みを持っているが、blog テンプレートは全面的に自作 `.astro` を作っている。

- [ ] 「軽度カスタマイズは classMap、重度カスタマイズは components spread、全面は独自 index.ts」という**3 段階のカスタマイズパス**を Docs で明示
- [ ] `classMap` を使ったサンプルを 1 つ以上テンプレートに残す（`[slug].astro` で `<NotroContent classMap={{ p: "text-lg" }} ... />` 的な例）

### C4. ダークモードが `prefers-color-scheme` 固定でトグル無し（🟠 中）

`global.css` の `@media (prefers-color-scheme: dark)` のみ対応。`data-theme` 属性や `class="dark"` ベースの切替インフラが無いため、
「ダークモードボタンを付けたい」と思った利用者は CSS 設計から書き直す必要がある。

- [ ] Tailwind 4 の `@variant dark` を `[data-theme="dark"]` に切り替え、`Header.astro` にテーマトグルボタンを雛形として置く
- [ ] `localStorage` + システム設定フォールバックの最小実装を `src/lib/theme.ts` として用意

### C5. Pinned / Beginner のロジック散在（🟠 中）

`[...page].astro`（pinned + beginner の表示/非表示）、`index.astro`（pinned の抜粋）、`blog.ts`（pinned / beginner の判定）、`config.ts`（internalTags）、
4 箇所にロジックが広がっており、「pinned 表示を止めたい」のような単純な要求でも複数ファイル修正が必要。

- [x] 仕様を `src/lib/blog-sections.ts` に集約し、`getSections(posts, { pinnedTag, beginnerTag })` のような 1 関数で return する形にリファクタ（`blog.ts` の `getPinnedPosts` / `getBeginnerPosts` を tag 引数化し、`config.blog.pinnedTag` / `beginnerTag` で駆動する形に統合）
- [ ] `config.blog.sections: [{ tag: "pinned", label: "ピン留め", showOnFirstPageOnly: true }, ...]` のような**設定駆動**に寄せる

### C6. ナビゲーション設定が単層・external 非対応（🟡 低）

`config.navigation.nav: { href, label }[]` は平坦配列のみ。ドロップダウン、external（`target="_blank"`）、icon 指定ができない。

- [x] 型を `{ href: string; label: string; external?: boolean }` に拡張（external のみ対応、children は将来拡張のため保留）
- [ ] `children?` を使ったドロップダウン（ARIA menu / focus trap / モバイル折り畳み）対応

### C7. `notro-theme.css` のカラーパレット差し替え導線が無い（🟡 低）

224 行の `@theme`/`@utility` に Notion の色名（gray, brown, orange, ...）が直書きされている。
「ピンクだけ別の色にしたい」程度の調整でも CSS を直接編集しなければならない。

- [ ] 全色を CSS 変数（`--notro-color-pink-text`, `--notro-color-pink-bg`, ...）化し、
  変数上書きだけでテーマカラーが変えられるようにする
- [ ] `notro-ui` 側（source of truth）でも同じ変数化を行う

### C8. `<script>` をまたいだ State（ダークモード、メニュー開閉）の共有手段なし（🟡 低）

Header.astro のモバイルメニュー開閉ロジックも、将来のダークモードトグルも、Astro の `is:inline` スクリプトだけで実装されると共有しにくい。

- [ ] `src/lib/ui-state.ts` に小さなイベントバス（`CustomEvent` ベースで十分）を置き、各トグルがこれを介して状態をやりとりする設計パターンを示す

### C9. テンプレートの `colors.ts` / `notroColors` の使い方が非公開（🟡 低）

`src/components/notro/colors.ts` は `tailwind-variants` ベースのカラーバリアント定義だが、どこからどう呼ばれているか（`StyledSpan.astro`, `ColoredParagraph.astro` 経由）の説明が README に無く、カスタマイズ時の入口が見えない。

- [ ] `src/components/notro/README.md` にカラーシステムの overview を追加
- [ ] `notroColors` / `NotroColor` 型を `notro-ui` 側に export する選択肢も検討

---

## 追加アクション一覧（優先度順）

| # | タスク | ファイル | 観点 | 優先度 | 状態 |
|---|---|---|---|---|---|
| U1 | 404/astro.config/[...page] 等のハードコード箇所を config.ts 経由に | A1 の表 | A | 🔴 高 | ✅ 完了 |
| U2 | GA 二重計測の解消（PUBLIC_GTAG_ID or config のどちらかに統一） | `Layout.astro`, `SeoHead.astro`, `env.d.ts` | A | 🔴 高 | ✅ 完了 |
| U3 | 初期値 (My Site / Your Name / example.com) 残存時のビルド警告 | `astro.config.mjs`（integration hook） | B | 🔴 高 | ✅ 完了 |
| U4 | Notion テンプレート DB 共有リンクと接続手順のドキュメント化 | `README.md`, `docs/` | B | 🔴 高 | ⏳ 未着手 |
| U5 | `src/components/notro/` カスタム/デフォルトマーカー導入 | 各 `.astro` 先頭 | C | 🔴 高 | ⏳ 未着手（調査の結果、テンプレートは upstream と byte-identical のため仕様から再検討要） |
| U6 | `Pagination.astro` を `nt-*` トークン + dark mode 対応に統一 | `src/components/blog/Pagination.astro` | A | 🟠 中 | ✅ 完了 |
| U7 | 環境変数未設定時のエラーメッセージ改善 | `src/content.config.ts` 冒頭 | A | 🟠 中 | ✅ 完了 |
| U8 | `.env.example` に NOTION_DATASOURCE_ID_BLOG を明記 | `.env.example`, `README.md` | A | 🟠 中 | ✅ 完了（README は U9 でまとめて） |
| U9 | README をテンプレート利用者向けに再構成（モノレポ記述を分離） | `templates/blog/README.md` | B | 🟠 中 | ⏳ 未着手 |
| U10 | CHANGELOG/LICENSE をテンプレート scaffold 時に除外/置換 | `packages/create-notro/src/index.ts` | B | 🟠 中 | ⏳ 未着手 |
| U11 | カスタマイズパス 3 段階（classMap → spread → 独自 index）を Docs に記載 | `docs/`, `src/components/notro/` | C | 🟠 中 | ⏳ 未着手 |
| U12 | ダークモードトグル用インフラ（`data-theme` + `localStorage`）の雛形 | `global.css`, `src/lib/theme.ts`, `Header.astro` | C | 🟠 中 | ⏳ 未着手 |
| U13 | pinned/beginner ロジックを `src/lib/blog-sections.ts` に集約 | `src/lib/blog-sections.ts`（新規）他 | C | 🟠 中 | ✅ 完了（config.blog.pinnedTag/beginnerTag 引数化で集約） |
| U14 | UI ラベル i18n 辞書化 (ja.ts / en.ts) | `src/i18n/`（新規） | A | 🟡 低 | ⏳ 未着手 |
| U15 | "入門" タグ名を config に移動 | `src/config.ts`, `src/lib/blog.ts` | A | 🟡 低 | ✅ 完了 |
| U16 | `public/og-default.png` を同梱 or 自動生成 | `public/og-default.png` | B | 🟡 低 | ⏳ 未着手 |
| U17 | ナビゲーション型の拡張（external, children） | `src/config.ts`, `src/components/Header.astro` | C | 🟡 低 | 🟡 一部（external 対応済・children は保留） |
| U18 | `notro-theme.css` カラーパレットの CSS 変数化 | `packages/notro-ui/src/templates/theme.css`, ブログ側 | C | 🟡 低 | ⏳ 未着手 |
| U19 | `src/components/notro/README.md` 追加（カラー + カスタマイズ） | `src/components/notro/README.md`（新規） | C | 🟡 低 | ⏳ 未着手 |


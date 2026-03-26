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
  - Vercel: Root Directory を `apps/notro-tail` に設定
  - Netlify: `netlify.toml` が設定済みのためそのままデプロイ可
  - 環境変数の設定箇所（各ダッシュボードのスクリーンショット or リンク）

- [ ] **`notro` パッケージ API リファレンス**セクション
  - 3つのエントリーポイント（`notro`, `notro/utils`, `notro/integration`）
  - `loader()` オプション（`queryParameters`, `clientOptions`）
  - `NotroContents` props（`markdown`, `linkToPages`, `classMap`, `components`）
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

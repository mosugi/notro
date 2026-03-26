# Notro

![npm](https://img.shields.io/npm/v/notro)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

Notion の [Markdown Content API](https://developers.notion.com/) を使って Notion データベースのコンテンツを [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) に読み込む Astro Loader ライブラリです。

> [!TIP]
> サンプルプロジェクト: [NotroTail](https://github.com/mosugi/NotroTail)

## インストール

```sh
npm install notro
```

## セットアップ

### 1. `src/content.config.ts`

`loader` 関数でコレクションを定義します。スキーマは `pageWithMarkdownSchema` を `.extend()` してデータベースのプロパティを追加します。`notroProperties` ショートハンドを使うとプロパティスキーマを簡潔に書けます。

```typescript
import { defineCollection } from "astro:content";
import { loader, pageWithMarkdownSchema, notroProperties } from "notro";
import { z } from "zod";

const posts = defineCollection({
  loader: loader({
    queryParameters: {
      data_source_id: import.meta.env.NOTION_DATASOURCE_ID,
      filter: {
        property: "Public",
        checkbox: { equals: true },
      },
    },
    clientOptions: {
      auth: import.meta.env.NOTION_TOKEN,
    },
  }),
  schema: pageWithMarkdownSchema.extend({
    properties: z.object({
      Name: notroProperties.title,
      Description: notroProperties.richText,
      Public: notroProperties.checkbox,
      Tags: notroProperties.multiSelect,
      Date: notroProperties.date,
    }),
  }),
});

export const collections = { posts };
```

### 2. ページコンポーネント

`NotroContents` でマークダウンをレンダリングし、`getPlainText` でプロパティからテキストを取得します。
コンポーネントのスタイリングには [notro-ui](https://github.com/mosugi/notro-tail/tree/main/packages/notro-ui) を使用してください。

```sh
# notro-ui のコンポーネントを src/components/notro/ にコピー
npx notro-ui init
```

```astro
---
import { getCollection } from "astro:content";
import { getPlainText } from "notro";
import NotroContents from "../../components/notro/NotroContents.astro";

const posts = await getCollection("posts");
const { entry } = Astro.props;

const title = getPlainText(entry.data.properties.Name);
const markdown = entry.data.markdown;
---

<NotroContents markdown={markdown} />
```

コンポーネントは `src/components/notro/` に配置されるため、直接編集してスタイルをカスタマイズできます。

## Markdown 処理（remark-nfm）

`notro` は Notion Markdown の前処理とディレクティブ構文のサポートを [`remark-nfm`](https://www.npmjs.com/package/remark-nfm) パッケージに委譲しています。

`remark-nfm` は `notro` の内部の MDX コンパイルパイプラインで使用されており、`NotroContents` を使う場合は自動的に適用されます。

`remark-nfm` を直接使いたい場合（カスタム unified パイプラインや `@mdx-js/mdx` の `evaluate()` など）は、`notro` から取得するのではなく、`remark-nfm` パッケージから直接インポートしてください。

```ts
// ✅ remark-nfm から直接インポート
import { remarkNfm, preprocessNotionMarkdown } from "remark-nfm";

// ❌ notro からのインポートは不要（notro は内部利用のみ）
// import { remarkNfm } from "notro";
```

## Notion API の制限事項

> 参照: [Retrieve a page as Markdown – Notion API](https://developers.notion.com/reference/retrieve-page-markdown)

### コンテンツの切り詰め（`truncated`）

`GET /v1/pages/{page_id}/markdown` は約 **20,000 ブロック**を上限としてコンテンツを切り詰めて返す。

- レスポンスの `truncated: true` で検出できるが、**残りのコンテンツを取得するページネーション API は存在しない**
- notro は `truncated === true` のとき警告ログを出力し、取得できた範囲でビルドを継続する
- 対処法: 大きな Notion ページを複数のサブページに分割すること

```
⚠ Page abc123: markdown content was truncated by the Notion API (~20,000 block limit).
  No pagination is available for this endpoint.
  Consider splitting this Notion page into smaller pages to avoid truncation.
```

### レンダリング不能なブロック（`unknown_block_ids`）

レスポンスの `unknown_block_ids` には、Notion API が Markdown に変換できなかったブロックの ID が含まれる（未対応ブロック型など）。

- これらのブロックは `markdown` フィールドから**無言で除外される**
- このエンドポイント経由でその内容を取得する手段はない
- notro は対象ブロック ID の一覧を警告ログに出力してビルドを継続する

```
⚠ Page abc123: 2 block(s) could not be rendered to Markdown by the Notion API and were omitted.
  Block IDs: xxxxxxxx-..., yyyyyyyy-...
```

### API エラーと自動リトライ

| エラー | 対応 |
|---|---|
| `429 rate_limited` / `500 internal_server_error` / `503 service_unavailable` | exponential backoff でリトライ（1s / 2s / 4s、最大 3 回） |
| `401 unauthorized` / `403 restricted_resource` / `404 object_not_found` | リトライなし。警告ログを出力してそのページをスキップ |
| その他の予期しないエラー | 警告ログを出力してスキップ（ビルド全体は継続） |

---

## ロードマップ

現時点の実装に対するセルフレビューをもとに、今後の課題を優先度別に整理しています。

---

### 🔴 高優先度（ビルド安定性に影響）

#### ~~1. Notion API レート制限への対応~~ ✅ 解決済み

~~現状では `Promise.all()` で全ページを並行フェッチしており、Notion API の **3 req/s** 制限を超えると 429 エラーが発生する。~~

バッチサイズ 3・バッチ間 1 秒待機に変更し、3 req/s 制限を遵守するよう修正済み。

#### 2. 切り詰められた Markdown（`loader.ts`）

Notion API がページ内容を切り詰めて返す場合（`markdownResponse.truncated === true`）、残りのコンテンツを取得する手段が存在しない。

> **Notion API の制限:** `GET /v1/pages/{page_id}/markdown` はカーソルやオフセットパラメータを持たない（`@notionhq/client` v5.11.1 で確認）。分割取得は **API レベルで不可能**。

現在は詳細な警告ログを出力し、取得できた範囲のコンテンツでビルドを継続する。

**根本的な対処法**: 大きな Notion ページを複数のサブページに分割すること。

---

### 🟡 中優先度（品質・信頼性の改善）

#### ~~3. `classRegistry` の SSR 安全性~~ ✅ 解決済み

グローバル状態を廃止し、コンポーネントスタイリングは `notro-ui` でユーザープロジェクトにコピーされたファイルに移行した。

#### ~~4. `<code>` 要素のインライン/ブロック区別~~ ✅ 解決済み

`notro-ui` の `notro-theme.css` の `.notro-markdown :not(pre) > code` セレクタで対応する設計とした。

#### 5. Notion ページ URL 解析の堅牢化（`compile-mdx.ts`）

```ts
urlNoDash.includes(pageId.replace(/-/g, ''))
```

ダッシュ削除後の文字列包含チェックは、ID が別の ID の部分文字列になる場合に誤マッチする。Notion URL のフォーマット（`notion.so/Title-pageId`, `notion.so/pageId` など）に対して未検証のパターンが存在する可能性がある。

**対応方針**: URL をパースして末尾の 32 文字を UUID として抽出し、完全一致で比較する。

#### 6. `linkToPages` JSON シリアライズのキー順序依存（`compile-mdx.ts`）

```ts
.update(JSON.stringify(linkToPages))
```

`JSON.stringify` はオブジェクトのプロパティ順序に依存するため、プロパティ挿入順が異なる同一オブジェクトが別のキャッシュエントリを生成する。

**対応方針**: `JSON.stringify` 前にキーをソートする、または `fast-stable-stringify` のようなライブラリを使用する。

---

### 🟢 低優先度（パフォーマンス・DX の向上）

#### 7. MDX コンパイルキャッシュのビルド間永続化

現状のキャッシュはメモリのみで、ビルドを再起動するたびに全ページ再コンパイルが走る。コンテンツが変わっていないページでも毎回 MDX → Astro VNode の変換が発生する。

**対応方針**: ビルドキャッシュディレクトリ（`.astro/` など）に SHA256 キーで JSON シリアライズして永続化する。

#### ~~8. ページ単位のビルド失敗分離~~ ✅ 解決済み

~~現状では任意の 1 ページの MDX コンパイルエラーや API エラーがビルド全体を停止させる。~~

`loader.ts` で各ページの `retrieveMarkdown` 呼び出しを `try/catch` で保護し、失敗したページは警告ログを出力してスキップするよう修正済み。429 / 500 / 503 は exponential backoff でリトライ（1s / 2s / 4s、最大 3 回）。

#### 9. 大規模データベースのメモリ効率

```ts
const pages = await Array.fromAsync(iteratePaginatedAPI(...))
```

全ページをメモリに展開してから処理するため、数千ページ規模のデータベースではメモリ不足になる可能性がある。

**対応方針**: `iteratePaginatedAPI` をストリーミングで処理し、ページを一定数ずつバッチ処理する。

---

### 🔵 設計上のトレードオフ（方針検討が必要）

#### 11. `compile-mdx.ts` のキャッシュと SSR の整合性

`compileMdxCached` のキャッシュは静的ビルドに最適化されており、SSR では古いキャッシュが残り続ける可能性がある（ページ更新が反映されない）。SSR サポートを公式化するなら、キャッシュ無効化戦略の再設計が必要。

## 環境変数

| 変数 | 説明 |
|---|---|
| `NOTION_TOKEN` | Notion Internal Integration Token |
| `NOTION_DATASOURCE_ID` | Notion データソース ID |

## API リファレンス

### `loader(options)`

Astro Content Loader。`queryParameters` には Notion API の `dataSources.query` に渡すパラメータを指定します。

### `pageWithMarkdownSchema`

ローダーが返す Zod スキーマのベース。`pageObjectResponseSchema` に `markdown: z.string()` を追加したもの。カスタムスキーマは `.extend()` で拡張します。

### プロパティスキーマ

`content.config.ts` でデータベースプロパティの型を定義する Zod スキーマは `notroProperties` ショートハンドで参照するのが推奨です（[`notroProperties` の節を参照](#notroproperties)）。

個別のスキーマ（例: `titlePropertyPageObjectResponseSchema`）は後方互換のため引き続きエクスポートされています。

### コンポーネント

| コンポーネント | 説明 |
|---|---|
| `NotroContents` | Notion マークダウンを HTML にレンダリング（スタイルなし）。スタイル付き版は `notro-ui` を参照 |
| `OptimizedDatabaseCover` | Notion カバー画像を最適化表示 |
| `DatabaseProperty` | Notion プロパティを型に応じてレンダリング |
| `compileMdxCached` | MDX コンパイル低レベル API。独自の `NotroContents` を作成する場合に使用 |

### `notroProperties`

`content.config.ts` でプロパティスキーマを定義するための Zod スキーマショートハンド。各キーは Notion プロパティ型に対応します。

```typescript
import { notroProperties } from "notro";

// notroProperties.title       → titlePropertyPageObjectResponseSchema
// notroProperties.richText    → richTextPropertyPageObjectResponseSchema
// notroProperties.checkbox    → checkboxPropertyPageObjectResponseSchema
// notroProperties.multiSelect → multiSelectPropertyPageObjectResponseSchema
// notroProperties.select      → selectPropertyPageObjectResponseSchema
// notroProperties.date        → datePropertyPageObjectResponseSchema
// notroProperties.number      → numberPropertyPageObjectResponseSchema
// notroProperties.url         → urlPropertyPageObjectResponseSchema
// notroProperties.email       → emailPropertyPageObjectResponseSchema
// notroProperties.phoneNumber → phoneNumberPropertyPageObjectResponseSchema
// notroProperties.files       → filesPropertyPageObjectResponseSchema
// notroProperties.people      → peoplePropertyPageObjectResponseSchema
// notroProperties.relation    → relationPropertyPageObjectResponseSchema
// notroProperties.rollup      → rollupPropertyPageObjectResponseSchema
// notroProperties.formula     → formulaPropertyPageObjectResponseSchema
// notroProperties.uniqueId    → uniqueIdPropertyPageObjectResponseSchema
// notroProperties.status      → statusPropertyPageObjectResponseSchema
// notroProperties.createdTime → createdTimePropertyPageObjectResponseSchema
// notroProperties.createdBy   → createdByPropertyPageObjectResponseSchema
// notroProperties.lastEditedTime → lastEditedTimePropertyPageObjectResponseSchema
// notroProperties.lastEditedBy   → lastEditedByPropertyPageObjectResponseSchema
// notroProperties.button      → buttonPropertyPageObjectResponseSchema
// notroProperties.verification → verificationPropertyPageObjectResponseSchema
```

### ユーティリティ

| 関数 | 説明 |
|---|---|
| `getPlainText(property)` | Title, Rich Text, Select, Multi-select, Number, URL, Email, Phone, Date, Unique ID プロパティからプレーンテキストを取得 |
| `getMultiSelect(property)` | Multi-select プロパティのオプション配列を返す。対象外の型や `undefined` には空配列を返すため型ガード不要 |
| `hasTag(property, tagName)` | Multi-select プロパティに指定名のタグが含まれるか判定する。型ガード不要で安全に使用可能 |
| `buildLinkToPages(entries, options)` | コレクションエントリから `linkToPages` マップを構築する。`NotroContents` に渡す Notion ページ間リンク解決用 |
| `colorToCSS(color)` | Notion カラー名をインライン CSS スタイル文字列に変換（カスタムコンポーネント内で利用） |

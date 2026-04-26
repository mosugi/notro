# notro-loader

## 0.0.11

### Patch Changes

- Updated dependencies [[`c504849`](https://github.com/mosugi/notro/commit/c504849b2da26bc2872d24cce647ded89a2586cf)]:
  - remark-notro@0.0.10

## 0.0.10

### Patch Changes

- [#153](https://github.com/mosugi/notro/pull/153) [`f26a4c4`](https://github.com/mosugi/notro/commit/f26a4c4c836c742dc2bc7e33d80c7bf39035c18d) Thanks [@mosugi](https://github.com/mosugi)! - Add `isNotionPresignedUrl()` helper and unify S3 presigned URL detection
  - Export `isNotionPresignedUrl(url)` as a single source of truth for detecting Notion S3 presigned URLs (covers `X-Amz-Algorithm` query param and `prod-files-secure.s3` hostname)
  - Use it in `isPresignedUrlExpired`'s fallback path, replacing the previous overly-broad hostname check
  - Fix `isPresignedUrlExpiredInMarkdown` to check **all** presigned URLs in markdown (was only checking the first), so articles with multiple images are correctly invalidated when any URL expires
  - Align URL extraction regex in `isPresignedUrlExpiredInMarkdown` with `markdownHasPresignedUrls` for consistency

- Updated dependencies [[`2c67a6d`](https://github.com/mosugi/notro/commit/2c67a6da5d406e42e4259a6be13baf3606eb1ef7), [`f26a4c4`](https://github.com/mosugi/notro/commit/f26a4c4c836c742dc2bc7e33d80c7bf39035c18d), [`f26a4c4`](https://github.com/mosugi/notro/commit/f26a4c4c836c742dc2bc7e33d80c7bf39035c18d)]:
  - remark-notro@0.0.9

## 0.0.9

### Patch Changes

- [#151](https://github.com/mosugi/notro/pull/151) [`2cd9bec`](https://github.com/mosugi/notro/commit/2cd9becfe1953a096cb429f4f72a0622f709c51b) Thanks [@mosugi](https://github.com/mosugi)! - Add `isNotionPresignedUrl()` helper and unify S3 presigned URL detection
  - Export `isNotionPresignedUrl(url)` as a single source of truth for detecting Notion S3 presigned URLs (covers `X-Amz-Algorithm` query param and `prod-files-secure.s3` hostname)
  - Use it in `isPresignedUrlExpired`'s fallback path, replacing the previous overly-broad hostname check
  - Fix `isPresignedUrlExpiredInMarkdown` to check **all** presigned URLs in markdown (was only checking the first), so articles with multiple images are correctly invalidated when any URL expires
  - Align URL extraction regex in `isPresignedUrlExpiredInMarkdown` with `markdownHasPresignedUrls` for consistency

- Updated dependencies [[`2cd9bec`](https://github.com/mosugi/notro/commit/2cd9becfe1953a096cb429f4f72a0622f709c51b), [`2cd9bec`](https://github.com/mosugi/notro/commit/2cd9becfe1953a096cb429f4f72a0622f709c51b)]:
  - remark-notro@0.0.8

## 0.0.8

### Patch Changes

- [#149](https://github.com/mosugi/notro/pull/149) [`7e00c19`](https://github.com/mosugi/notro/commit/7e00c193f7971790526729628ab9bc9d98ef44d7) Thanks [@mosugi](https://github.com/mosugi)! - Add `isNotionPresignedUrl()` helper and unify S3 presigned URL detection
  - Export `isNotionPresignedUrl(url)` as a single source of truth for detecting Notion S3 presigned URLs (covers `X-Amz-Algorithm` query param and `prod-files-secure.s3` hostname)
  - Use it in `isPresignedUrlExpired`'s fallback path, replacing the previous overly-broad hostname check
  - Fix `isPresignedUrlExpiredInMarkdown` to check **all** presigned URLs in markdown (was only checking the first), so articles with multiple images are correctly invalidated when any URL expires
  - Align URL extraction regex in `isPresignedUrlExpiredInMarkdown` with `markdownHasPresignedUrls` for consistency

- Updated dependencies [[`7e00c19`](https://github.com/mosugi/notro/commit/7e00c193f7971790526729628ab9bc9d98ef44d7)]:
  - remark-notro@0.0.7

## 0.0.7

### Patch Changes

- [#143](https://github.com/mosugi/notro/pull/143) [`c18342c`](https://github.com/mosugi/notro/commit/c18342c41dbd1b19b09d823a97430f3c669d95ca) Thanks [@mosugi](https://github.com/mosugi)! - fix: include src/ root files in published package

  The `files` field listed only subdirectories (`src/components`, `src/loader`, `src/utils`), so files directly under `src/` (`integration.ts`, `types.ts`, `env.d.ts`) were missing from the published package. Changed to `"src"` to include all files under it.

  This caused `notro-loader/integration` to fail resolving `./src/integration.ts` at build time.

- [#143](https://github.com/mosugi/notro/pull/143) [`c18342c`](https://github.com/mosugi/notro/commit/c18342c41dbd1b19b09d823a97430f3c669d95ca) Thanks [@mosugi](https://github.com/mosugi)! - fix: detect presigned URLs in `files` type properties (e.g. FeaturedImage)

  `hasNotionPresignedUrl` only checked `cover` and `icon` for file-type presigned
  URLs. Properties of type `files` (e.g. a FeaturedImage column) also contain
  expiring S3 presigned URLs but were not detected, causing stale entries to
  remain in the store indefinitely.

  Now all `files` type properties are checked, so entries with expired presigned
  file URLs are evicted and re-fetched on the next build — consistent with the
  existing handling for `cover` and `icon`.

- [#143](https://github.com/mosugi/notro/pull/143) [`c18342c`](https://github.com/mosugi/notro/commit/c18342c41dbd1b19b09d823a97430f3c669d95ca) Thanks [@mosugi](https://github.com/mosugi)! - fix: presigned URLの有効期限を実際に確認してから再取得するよう変更

  従来の実装では `hasNotionPresignedUrl()` がファイル型のカバー・アイコン・プロパティを
  含むページを「常に期限切れ」と判断し、毎ビルドで全ページを削除・再取得していた。

  新しい実装では S3 presigned URL の `X-Amz-Date` と `X-Amz-Expires` パラメータを
  解析して実際の有効期限を計算し、本当に期限切れのページだけを再取得する。

  これにより、ビルド間でページが変更・期限切れでない限りキャッシュが有効になり、
  2回目以降のビルドでの Notion API コール数と所要時間が大幅に削減される。

- Updated dependencies [[`c18342c`](https://github.com/mosugi/notro/commit/c18342c41dbd1b19b09d823a97430f3c669d95ca)]:
  - remark-notro@0.0.6

## 0.0.6

### Patch Changes

- [#140](https://github.com/mosugi/notro/pull/140) [`c2b0670`](https://github.com/mosugi/notro/commit/c2b067077c05c5b1dd2712e0bc7b4f705fc71b57) Thanks [@mosugi](https://github.com/mosugi)! - fix: include src/ root files in published package

  The `files` field listed only subdirectories (`src/components`, `src/loader`, `src/utils`), so files directly under `src/` (`integration.ts`, `types.ts`, `env.d.ts`) were missing from the published package. Changed to `"src"` to include all files under it.

  This caused `notro-loader/integration` to fail resolving `./src/integration.ts` at build time.

- [#140](https://github.com/mosugi/notro/pull/140) [`c2b0670`](https://github.com/mosugi/notro/commit/c2b067077c05c5b1dd2712e0bc7b4f705fc71b57) Thanks [@mosugi](https://github.com/mosugi)! - fix: detect presigned URLs in `files` type properties (e.g. FeaturedImage)

  `hasNotionPresignedUrl` only checked `cover` and `icon` for file-type presigned
  URLs. Properties of type `files` (e.g. a FeaturedImage column) also contain
  expiring S3 presigned URLs but were not detected, causing stale entries to
  remain in the store indefinitely.

  Now all `files` type properties are checked, so entries with expired presigned
  file URLs are evicted and re-fetched on the next build — consistent with the
  existing handling for `cover` and `icon`.

- Updated dependencies [[`c2b0670`](https://github.com/mosugi/notro/commit/c2b067077c05c5b1dd2712e0bc7b4f705fc71b57)]:
  - remark-notro@0.0.5

## 0.0.5

### Patch Changes

- [#137](https://github.com/mosugi/notro/pull/137) [`186d8c3`](https://github.com/mosugi/notro/commit/186d8c3f7ff8027f12c2e1a0074ede6ac7daaa10) Thanks [@mosugi](https://github.com/mosugi)! - fix: include src/ root files in published package

  The `files` field listed only subdirectories (`src/components`, `src/loader`, `src/utils`), so files directly under `src/` (`integration.ts`, `types.ts`, `env.d.ts`) were missing from the published package. Changed to `"src"` to include all files under it.

  This caused `notro-loader/integration` to fail resolving `./src/integration.ts` at build time.

- Updated dependencies [[`186d8c3`](https://github.com/mosugi/notro/commit/186d8c3f7ff8027f12c2e1a0074ede6ac7daaa10)]:
  - remark-notro@0.0.4

## 0.0.4

### Patch Changes

- [#135](https://github.com/mosugi/notro/pull/135) [`5ca895f`](https://github.com/mosugi/notro/commit/5ca895f03f6d91c28ada4628783227f2ea9a5cae) Thanks [@mosugi](https://github.com/mosugi)! - fix: include src/ root files in published package

  The `files` field listed only subdirectories (`src/components`, `src/loader`, `src/utils`), so files directly under `src/` (`integration.ts`, `types.ts`, `env.d.ts`) were missing from the published package. Changed to `"src"` to include all files under it.

  This caused `notro-loader/integration` to fail resolving `./src/integration.ts` at build time.

## 0.0.3

### Patch Changes

- [#121](https://github.com/mosugi/notro/pull/121) [`53ac64a`](https://github.com/mosugi/notro/commit/53ac64a0c54af0cfab5b5630a2057b118f14a24e) Thanks [@mosugi](https://github.com/mosugi)! - Fix package name inconsistencies and broken links in README files
  - Fix language selector links in root README.md and README.ja.md
  - Fix broken reference to non-existent `packages/notro/README.md`
  - Correct `notro` references to `notro-loader` in notro-ui README
  - Correct `remark-nfm` npm package name to `remark-notro` in notro-loader README
  - Fix import path `notro/integration` → `notro-loader/integration` in rehype-beautiful-mermaid README
  - Update relationship diagram in remark-nfm README to reference `notro-loader`

- Updated dependencies [[`53ac64a`](https://github.com/mosugi/notro/commit/53ac64a0c54af0cfab5b5630a2057b118f14a24e)]:
  - remark-notro@0.0.3

## 0.0.2

### Patch Changes

- Updated dependencies [[`9f30d3d`](https://github.com/mosugi/notro/commit/9f30d3d31408ebc678b4257fe9aad51abd4e6de8)]:
  - remark-notro@0.0.2

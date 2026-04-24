# notro-loader

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

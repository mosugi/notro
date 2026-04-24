# remark-notro

## 0.0.5

### Patch Changes

- [#140](https://github.com/mosugi/notro/pull/140) [`c2b0670`](https://github.com/mosugi/notro/commit/c2b067077c05c5b1dd2712e0bc7b4f705fc71b57) Thanks [@mosugi](https://github.com/mosugi)! - fix: convert bare <br> to self-closing <br/> before MDX parsing

  MDX treats `<br>` as a JSX element and requires a closing tag, causing a
  compilation error when Notion markdown contains inline `<br>` tags. Added
  Fix 13 to `preprocessNotionMarkdown` to replace all `<br>` with `<br/>`
  before the MDX pipeline runs.

## 0.0.4

### Patch Changes

- [#137](https://github.com/mosugi/notro/pull/137) [`186d8c3`](https://github.com/mosugi/notro/commit/186d8c3f7ff8027f12c2e1a0074ede6ac7daaa10) Thanks [@mosugi](https://github.com/mosugi)! - fix: convert bare <br> to self-closing <br/> before MDX parsing

  MDX treats `<br>` as a JSX element and requires a closing tag, causing a
  compilation error when Notion markdown contains inline `<br>` tags. Added
  Fix 13 to `preprocessNotionMarkdown` to replace all `<br>` with `<br/>`
  before the MDX pipeline runs.

## 0.0.3

### Patch Changes

- [#121](https://github.com/mosugi/notro/pull/121) [`53ac64a`](https://github.com/mosugi/notro/commit/53ac64a0c54af0cfab5b5630a2057b118f14a24e) Thanks [@mosugi](https://github.com/mosugi)! - Fix package name inconsistencies and broken links in README files
  - Fix language selector links in root README.md and README.ja.md
  - Fix broken reference to non-existent `packages/notro/README.md`
  - Correct `notro` references to `notro-loader` in notro-ui README
  - Correct `remark-nfm` npm package name to `remark-notro` in notro-loader README
  - Fix import path `notro/integration` → `notro-loader/integration` in rehype-beautiful-mermaid README
  - Update relationship diagram in remark-nfm README to reference `notro-loader`

## 0.0.2

### Patch Changes

- [#112](https://github.com/mosugi/notro/pull/112) [`9f30d3d`](https://github.com/mosugi/notro/commit/9f30d3d31408ebc678b4257fe9aad51abd4e6de8) Thanks [@mosugi](https://github.com/mosugi)! - Update README to use remark-notro package name

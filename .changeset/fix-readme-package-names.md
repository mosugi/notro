---
"remark-notro": patch
"notro-loader": patch
"notro-ui": patch
"rehype-beautiful-mermaid": patch
---

Fix package name inconsistencies and broken links in README files

- Fix language selector links in root README.md and README.ja.md
- Fix broken reference to non-existent `packages/notro/README.md`
- Correct `notro` references to `notro-loader` in notro-ui README
- Correct `remark-nfm` npm package name to `remark-notro` in notro-loader README
- Fix import path `notro/integration` → `notro-loader/integration` in rehype-beautiful-mermaid README
- Update relationship diagram in remark-nfm README to reference `notro-loader`

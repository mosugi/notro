---
"remark-notro": patch
---

Remove `<br>` normalization from `preprocessNotionMarkdown` (Fix 13).

Previously the preprocessor converted `<br>` to `<br/>` before parsing. This is unnecessary because `rehype-raw` (via parse5, an HTML5-compliant parser) treats both forms identically as void elements. Delegating to `rehype-raw` keeps the preprocessor minimal and avoids redundant string manipulation.

No behavior change when used with the standard `notro-loader` pipeline, which always includes `rehype-raw`.

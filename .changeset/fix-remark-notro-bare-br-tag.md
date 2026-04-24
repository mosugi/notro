---
"remark-notro": patch
---

fix: convert bare <br> to self-closing <br/> before MDX parsing

MDX treats `<br>` as a JSX element and requires a closing tag, causing a
compilation error when Notion markdown contains inline `<br>` tags. Added
Fix 13 to `preprocessNotionMarkdown` to replace all `<br>` with `<br/>`
before the MDX pipeline runs.

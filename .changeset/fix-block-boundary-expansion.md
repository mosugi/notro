---
"remark-notro": patch
---

Fix: Notion block boundaries now render as separate paragraphs

**Fix 13 (revised): Block boundary expansion (`\n` → `\n\n`)**
Notion's Markdown API outputs each block (paragraph, heading, etc.) separated by a
single `\n`. CommonMark treats a lone `\n` between text lines as a soft break,
collapsing all consecutive blocks into one `<p>`. This fix expands every single `\n`
between non-blank lines to `\n\n` so remark produces separate block-level elements,
matching Notion's intended structure. Fenced code blocks and directive blocks (`:::`)
are excluded from the expansion. `<br>` (intra-block Shift+Enter) is normalized to
`<br/>` for correct rehype-raw handling.

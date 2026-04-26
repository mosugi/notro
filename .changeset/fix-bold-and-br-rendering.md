---
"remark-notro": patch
---

Fix: bold markers and line breaks now render correctly in Notion content

**Fix 13: `<br>` normalized to `<br/>`**
Notion's Markdown API uses `<br>` (without slash) for inline line breaks
(e.g. `月曜日<br>10:00～18:00`). Normalized to self-closing `<br/>` for
correct inline rendering by rehype-raw.

**Fix 15: `**bold**` converted to `<strong>bold</strong>` in pre-processing**
CommonMark delimiter run rules silently break `**bold**` rendering when `**`
is adjacent to CJK close punctuation (e.g. `**『曜日時間固定』**` fails
because `』` is Unicode category Pf). The Notion API also sometimes outputs
trailing spaces before the closing `**` (e.g. `**text **`). Pre-converting
bold markers to `<strong>` tags bypasses both issues. Code spans and fenced
code blocks are excluded from the conversion.

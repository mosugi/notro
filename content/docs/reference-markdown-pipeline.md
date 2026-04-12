---
slug: reference/markdown-pipeline
title: Markdown Pipeline
---

# Markdown Pipeline

This page documents every step of the markdown processing pipeline — from raw Notion API output to rendered HTML.

## Overview

```
Raw Notion markdown (pages.retrieveMarkdown)
  ↓  preprocessNotionMarkdown()   fix structural issues
  ↓  remarkNfm                    directive + GFM + callout
  ↓  (user remarkPlugins)
  ↓  rehypeRaw                    HTML string → hast nodes
  ↓  rehypeNotionColor            color="gray" → notro-* classes
  ↓  rehypeBlockElements          video → Video (PascalCase)
  ↓  rehypeInlineMentions         mention-user → MentionUser
  ↓  (user rehypePlugins)
  ↓  rehypeShiki                  syntax highlighting
  ↓  rehypeSlug                   id attributes on headings
  ↓  rehypeToc                    populate <TableOfContents>
  ↓  resolvePageLinks             notion.so → site-relative URL
  ↓  @mdx-js/mdx evaluate()
  ↓  <Content components={notionComponents} />
Rendered HTML
```

---

## preprocessNotionMarkdown

`preprocessNotionMarkdown()` is a string pre-processor (not a remark plugin) that fixes structural issues in Notion's raw markdown output before the AST parse. It is called automatically by `remarkNfm`.

### Fix 0 — Escaped inline math migration

Old notro versions escaped inline math to `\$…\$` to prevent remark from treating it as text. This fix converts those back to `$…$` for compatibility.

### Fix 1 — Setext heading false positive

A `---` divider without a preceding blank line is misread as a setext H2 underline. Fix 1 inserts a blank line before bare `---` dividers.

**Before:**
```md
Some text
---
Next section
```

**After:**
```md
Some text

---
Next section
```

### Fix 2 — Callout directive normalization

Notion exports callout blocks as `"::: callout {…}"`. Fix 2 normalizes the spacing to `":::callout{…}"` for the `remark-directive` parser, and dedents tab-indented content inside callout blocks.

### Fix 3 — Block-level color annotations

Notion color annotations on paragraphs and headings are exported as `{color="gray_bg"}` at the end of the block. Fix 3 converts these to raw HTML `<p color="gray_bg">` which `rehypeNotionColor` later translates to CSS classes.

### Fix 4 — Table of contents tag

`<table_of_contents/>` (with an underscore) is not recognized as a block-level HTML element by CommonMark parsers. Fix 4 wraps it in a `<div>` to ensure it is treated as a block.

### Fix 5 — Inline equation format

Notion exports inline equations as `$\`…\`$`. Fix 5 converts this to `$…$` for `remark-math`.

### Fix 6 — Synced block wrapper

`<synced_block>` wrappers are stripped, and the content inside is dedented to the document level.

### Fix 7 — Empty block isolation

`<empty-block/>` inline elements are surrounded by blank lines so remark treats them as block-level elements (required for correct MDX component routing).

### Fix 8 — Closing tag blank lines

Closing tags `</table>`, `</details>`, `</columns>`, `</column>`, `</summary>` get a trailing blank line. Without it, CommonMark's HTML block detection mode swallows all following content as raw text, preventing remark from parsing subsequent markdown.

### Fix 9 — Markdown links in table cells

`[text](url)` syntax inside raw HTML `<td>` cells is not processed by remark (it treats the entire `<table>` block as raw HTML). Fix 9 converts these to `<a href="url">text</a>` tags before the AST parse.

---

## remarkNfm

`remarkNfm` is the core remark plugin from the `remark-nfm` package. It bundles three operations in one plugin:

1. **`preprocessNotionMarkdown`** — runs the string fixes above before parsing
2. **`remark-directive`** — enables `:::callout{…}` directive syntax
3. **`remark-gfm`** — GFM strikethrough (`~~text~~`) and task list (`- [x]`) support
4. **Callout conversion** — converts `:::callout` directive AST nodes to raw `<callout icon="…" color="…">` HTML elements

### Callout syntax

Notion exports callout blocks in this directive format after Fix 2:

```md
:::callout{icon="💡" color="blue"}
This is the callout content.
:::
```

`remarkNfm` converts this to:

```html
<callout icon="💡" color="blue">
This is the callout content.
</callout>
```

---

## rehype plugins

### rehypeRaw

Converts raw HTML strings embedded in the markdown AST into proper hast nodes, allowing subsequent rehype plugins to traverse and transform them. Custom Notion elements (`<callout>`, `<columns>`, `<video>`, etc.) pass through as unknown elements.

### rehypeNotionColor

Converts Notion color attributes to notro CSS classes:

| Input attribute | Output class |
|---|---|
| `color="gray"` | `notro-text-gray` |
| `color="gray_background"` | `notro-bg-gray` |
| `underline="true"` | `notro-underline` |

Applies to `<p>`, `<h1>`–`<h6>`, and `<span>` elements.

### rehypeBlockElements

Renames lowercase Notion block element names to PascalCase so MDX routes them through the `components` map:

| From | To |
|---|---|
| `<video>` | `<Video>` |
| `<columns>` | `<Columns>` |
| `<column>` | `<Column>` |
| `<table_of_contents>` | `<TableOfContents>` |
| `<callout>` | `<Callout>` |
| `<empty-block>` | `<EmptyBlock>` |

### rehypeInlineMentions

Same rename for inline Notion mention elements:

| From | To |
|---|---|
| `<mention-user>` | `<MentionUser>` |
| `<mention-page>` | `<MentionPage>` |
| `<mention-date>` | `<MentionDate>` |

### rehypeSlug

Adds `id` attributes to `<h1>`–`<h4>` headings based on their text content, enabling anchor links.

### rehypeToc

Collects all headings with `id` attributes and populates the `<TableOfContents>` element (if present on the page) with an anchor link list. Generates a nested structure mirroring the heading hierarchy.

### resolvePageLinks

Replaces `notion.so/PAGE_ID` URLs in `<a href>`, `<PageRef>`, `<DatabaseRef>`, and mention elements with site-relative URLs from the `linkToPages` map passed to `NotroContent`.

---

## remark-nfm package

`remark-nfm` is published as a standalone npm package. It has no Astro or Notion API dependencies and can be used in any remark pipeline:

```ts
import { remarkNfm } from "remark-nfm";
import { remark } from "remark";

const result = await remark()
  .use(remarkNfm)
  .process(notionMarkdown);
```

The `preprocessNotionMarkdown` function is also exported for use outside remark:

```ts
import { preprocessNotionMarkdown } from "remark-nfm";

const fixed = preprocessNotionMarkdown(rawMarkdown);
```

# Miscellaneous NFM Features

## Table of Contents

The TOC block is inserted by Notion and renders a navigable list of headings on the page.

<table_of_contents/>

---

## Dividers (Horizontal Rules)

The `---` syntax is used for dividers. The preprocessor ensures they are not misread as setext H2 headings by inserting a blank line before them.

Content before the divider.

---

Content after the divider.

Another paragraph before a divider.

---

## Empty Blocks

Empty blocks in Notion create vertical spacing. They must be isolated with blank lines so remark treats them as block-level elements rather than inline content.

<empty-block/>

Text after an empty block.

Text before an empty block.

<empty-block/>

## Blockquotes

> This is a blockquote with a single paragraph.

Regular paragraph that should NOT be absorbed into the blockquote (Fix 12 prevents lazy continuation).

> Multi-line quote:
> Line two of the same blockquote.
> Line three.

This paragraph follows the blockquote and should be separate.

> Nested blockquotes:
>
> > This is a nested blockquote inside the outer one.
> >
> > It can have multiple paragraphs.

## Synced Blocks

Synced blocks share content across multiple pages. The preprocessor strips the wrapper tags and exposes the content directly.

<synced_block>
	This content comes from a synced block.

	It can contain any markdown content including **bold**, *italic*, and `code`.
</synced_block>

Synced block references contain the same content:

<synced_block_reference url="https://www.notion.so/example-block-id">
	The same shared content appears here via a reference.

	Both the original and all references render identically.
</synced_block_reference>

## Standard Markdown Features

### Text Formatting

Regular paragraph with **bold text**, *italic text*, ~~strikethrough~~, and `inline code`.

A paragraph with a [hyperlink](https://notrotail.mosugi.com) and an auto-link.

### Lists

Unordered list:

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

Ordered list:

1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

Task list:

- [x] Completed task
- [ ] Pending task
- [x] Another completed task

### Images

Notion inline images are handled via the `<Image />` Astro component through the component mapping.

### Headings at All Levels

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

Text under Heading 4.

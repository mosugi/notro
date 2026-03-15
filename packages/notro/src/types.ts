/**
 * Valid keys for the `classMap` prop of `NotionMarkdownRenderer`.
 *
 * Notion block types:
 * - `callout`       — Notion callout block
 * - `toggle`        — Toggle block outer `<details>` element
 * - `toggleTitle`   — Toggle block `<summary>` element
 * - `quote`         — Block quote
 * - `image`         — Image block `<img>` element
 * - `tableWrapper`  — Outer `<div>` wrapping the table (for overflow scroll etc.)
 * - `table`         — `<table>` element
 * - `tableRow`      — `<tr>` element
 * - `tableCell`     — `<td>` element
 * - `audio`         — Audio embed
 * - `video`         — Video embed
 * - `file`          — File attachment block
 * - `pdf`           — PDF embed block
 * - `pageRef`       — Notion page link
 * - `databaseRef`   — Notion database link
 * - `toc`           — Table of contents block
 * - `syncedBlock`   — Synced block wrapper
 * - `column`        — Single column inside a column layout
 * - `columns`       — Columns layout wrapper
 * - `emptyBlock`    — Empty block spacer
 * - `mention`       — Inline mention (user / page / database / date)
 *
 * Heading levels:
 * - `h1` `h2` `h3` `h4`
 *
 * Standard HTML elements:
 * - `p` `ul` `ol` `li` `pre` `hr` `a` `strong` `em` `del` `th`
 */
export type ClassMapKeys =
  | 'callout' | 'toggle' | 'toggleTitle' | 'quote'
  | 'image' | 'tableWrapper' | 'table' | 'tableRow' | 'tableCell'
  | 'audio' | 'video' | 'file' | 'pdf'
  | 'pageRef' | 'databaseRef' | 'toc' | 'syncedBlock'
  | 'column' | 'columns' | 'emptyBlock' | 'mention'
  | 'h1' | 'h2' | 'h3' | 'h4'
  | 'p' | 'ul' | 'ol' | 'li' | 'pre' | 'hr' | 'a' | 'strong' | 'em' | 'del' | 'th';

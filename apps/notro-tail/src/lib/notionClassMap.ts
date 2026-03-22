/**
 * Default Tailwind CSS class map for NotionMarkdownRenderer.
 *
 * Pass this to the `classMap` prop of <NotionMarkdownRenderer> to apply
 * Notion-style typography. Customize any key here to change the appearance
 * of a specific block type across the entire site.
 *
 * Usage in a page or layout:
 *   import { notionClassMap } from "../lib/notionClassMap";
 *   <NotionMarkdownRenderer markdown={markdown} classMap={notionClassMap} />
 *
 * Override individual keys by spreading:
 *   classMap={{ ...notionClassMap, h1: "my-custom-h1-class" }}
 */
export const notionClassMap = {
  // ── Notion-specific blocks ───────────────────────────
  callout:     "flex items-start gap-3 my-4 rounded-md p-4",
  toggle:      "my-1",
  toggleTitle: "cursor-pointer select-none py-1 font-medium",
  columns:     "grid grid-cols-1 gap-8 my-4 md:grid-cols-2",
  column:      "min-w-0",
  quote:       "my-4 border-l-[3px] pl-4 italic",
  h1:          "mb-3 mt-10 text-[1.875rem] font-bold tracking-tight",
  h2:          "mb-2 mt-8 text-2xl font-semibold tracking-tight",
  h3:          "mb-2 mt-6 text-xl font-semibold",
  h4:          "mb-1 mt-4 text-base font-semibold",
  image:       "my-4",
  tableWrapper:"my-4 w-full overflow-x-auto",
  table:       "w-full border-collapse text-sm",
  tableCell:   "px-3 py-2 text-sm",
  toc:         "my-4 rounded-md p-4 text-sm",
  // ── Standard HTML block elements ─────────────────────
  p:           "mb-4 leading-7",
  ul:          "mb-4 list-disc pl-6 space-y-1",
  ol:          "mb-4 list-decimal pl-6 space-y-1",
  li:          "leading-7",
  pre:         "my-4 overflow-x-auto rounded-md p-4 font-mono text-sm",
  hr:          "my-8",
  // ── Standard HTML inline elements ────────────────────
  a:           "underline underline-offset-2 hover:opacity-70",
  strong:      "font-semibold",
  em:          "italic",
  del:         "line-through",
  // ── Table header cell ─────────────────────────────────
  th:          "px-3 py-2 text-left text-sm font-semibold",
} as const;

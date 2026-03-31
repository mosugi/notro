import { makeHtmlElement } from "./HtmlElements.ts";

/**
 * Default headless component map for NotroContent.
 *
 * Maps all Notion block types and standard HTML elements to semantic HTML
 * equivalents with no Tailwind classes. Spread and override to customize:
 *
 * @example
 * ```ts
 * import { defaultComponents, NotroContent } from 'notro';
 * // Use as-is for unstyled output:
 * <NotroContent markdown={md} components={defaultComponents} />
 * // Or extend with your own components:
 * <NotroContent markdown={md} components={{ ...defaultComponents, callout: MyCallout }} />
 * ```
 */
export const defaultComponents = {
  // ── Notion block elements (PascalCase) ────────────────────────────────────
  // These use PascalCase keys because MDX only generates a components-map
  // lookup (_jsx(Video, ...)) for PascalCase names. Lowercase names compile
  // as plain HTML string literals (_jsx("video", ...)), which bypass the
  // `components` prop entirely. rehypeBlockElementsPlugin renames the
  // mdxJsxFlowElement nodes to these PascalCase names before MDX compiles.
  TableOfContents:        makeHtmlElement("nav"),
  Video:                  makeHtmlElement("figure"),
  Audio:                  makeHtmlElement("figure"),
  FileBlock:              makeHtmlElement("div"),
  PdfBlock:               makeHtmlElement("figure"),
  Columns:                makeHtmlElement("div"),
  Column:                 makeHtmlElement("div"),
  PageRef:                makeHtmlElement("a"),
  DatabaseRef:            makeHtmlElement("a"),
  Details:                makeHtmlElement("details"),
  Summary:                makeHtmlElement("summary"),
  EmptyBlock:             makeHtmlElement("div"),
  // callout is created by remarkNfm (a remark-level plugin via data.hName),
  // not from raw HTML, so MDX tracks it in _components and lowercase works.
  callout:                makeHtmlElement("aside"),
  // ── Inline mention components (PascalCase) ────────────────────────────────
  // Same PascalCase requirement — rehypeInlineMentionsPlugin renames these.
  MentionUser:            makeHtmlElement("span"),
  MentionPage:            makeHtmlElement("span"),
  MentionDatabase:        makeHtmlElement("span"),
  MentionDataSource:      makeHtmlElement("span"),
  MentionAgent:           makeHtmlElement("span"),
  MentionDate:            makeHtmlElement("time"),

  // ── Notion table elements (PascalCase) ───────────────────────────────────
  // Notion raw HTML tables have custom attributes (header-row, header-column),
  // so MDX parses them as mdxJsxFlowElement nodes. rehypeBlockElementsPlugin
  // renames them to PascalCase so MDX generates a components-map lookup.
  // Lowercase keys (table, tr, td…) remain for GFM tables (hast element nodes).
  Table:    makeHtmlElement("table"),
  Tr:       makeHtmlElement("tr"),
  Td:       makeHtmlElement("td"),
  Th:       makeHtmlElement("th"),
  Colgroup: makeHtmlElement("colgroup"),
  Col:      makeHtmlElement("col"),

  // ── Standard HTML element pass-throughs ──────────────────────────────────
  span:   makeHtmlElement("span"),
  p:      makeHtmlElement("p"),
  ul:     makeHtmlElement("ul"),
  ol:     makeHtmlElement("ol"),
  li:     makeHtmlElement("li"),
  pre:    makeHtmlElement("pre"),
  hr:     makeHtmlElement("hr"),
  th:     makeHtmlElement("th"),
  a:      makeHtmlElement("a"),
  strong: makeHtmlElement("strong"),
  em:     makeHtmlElement("em"),
  del:    makeHtmlElement("del"),
} as const;

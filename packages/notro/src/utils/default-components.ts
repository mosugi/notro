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
  // ── Notion block types → semantic HTML ───────────────────────────────────
  callout:                makeHtmlElement("aside"),
  details:                makeHtmlElement("details"),
  summary:                makeHtmlElement("summary"),
  columns:                makeHtmlElement("div"),
  column:                 makeHtmlElement("div"),
  audio:                  makeHtmlElement("figure"),
  video:                  makeHtmlElement("figure"),
  file:                   makeHtmlElement("div"),
  pdf:                    makeHtmlElement("figure"),
  page:                   makeHtmlElement("a"),
  database:               makeHtmlElement("a"),
  table_of_contents:      makeHtmlElement("nav"),
  synced_block:           makeHtmlElement("div"),
  synced_block_reference: makeHtmlElement("div"),
  "empty-block":          makeHtmlElement("div"),
  "mention-user":         makeHtmlElement("span"),
  "mention-page":         makeHtmlElement("span"),
  "mention-database":     makeHtmlElement("span"),
  "mention-data-source":  makeHtmlElement("span"),
  "mention-agent":        makeHtmlElement("span"),
  "mention-date":         makeHtmlElement("time"),

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

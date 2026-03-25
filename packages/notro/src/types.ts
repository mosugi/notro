/**
 * Map from Notion page IDs to resolved URL and title.
 * Passed to `NotionMarkdownRenderer` as `linkToPages` to resolve
 * inter-page Notion links (notion.so/...) to internal site URLs.
 *
 * Build this map with `buildLinkToPages()` from `notro`.
 */
export type LinkToPages = Record<string, { url: string; title: string }>;

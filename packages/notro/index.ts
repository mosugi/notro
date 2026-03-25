export { default as NotionMarkdownRenderer } from "./src/components/NotionMarkdownRenderer.astro";
export type { LinkToPages } from "./src/types.ts";
export { default as OptimizedDatabaseCover } from "./src/components/OptimizedDatabaseCover.astro";

export { notionComponents } from "./src/components/notion/index.ts";
export type { NotionComponents } from "./src/components/notion/index.ts";

export * from "./src/utils/notion";
export { normalizeNotionPresignedUrl, markdownHasPresignedUrls } from "./src/utils/notion-url.ts";
export { colorToClass } from "./src/components/notion/colors.ts";

// Low-level MDX compile API — for use in custom .astro renderers (e.g. notro-ui).
export { compileMdxCached } from "./src/utils/compile-mdx.ts";

// Astro JSX component factory — wrap any HTML tag with optional default classes.
export { makeHtmlElement } from "./src/components/notion/HtmlElements.ts";

export * from "./src/loader/loader";
export * from "./src/loader/live-loader";
export * from "./src/loader/schema";

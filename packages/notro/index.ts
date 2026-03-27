export { default as NotroContent } from "./src/NotroContent.astro";
export type { LinkToPages } from "./src/types.ts";
export { default as OptimizedDatabaseCover } from "./src/OptimizedDatabaseCover.astro";

export * from "./src/utils/notion";
export { normalizeNotionPresignedUrl, markdownHasPresignedUrls } from "./src/utils/notion-url.ts";

// Low-level MDX compile API — for use in custom .astro renderers (e.g. notro-ui).
export { compileMdxCached } from "./src/utils/compile-mdx.ts";

// Astro JSX component factory — wrap any HTML tag with optional default classes.
export { makeHtmlElement } from "./src/utils/HtmlElements.ts";

// Default headless component map (all Notion block types → semantic HTML, no Tailwind).
export { defaultComponents } from "./src/utils/default-components.ts";

export * from "./src/loader/loader";
export * from "./src/loader/live-loader";
export * from "./src/loader/schema";

export { default as NotionMarkdownRenderer } from "./src/components/NotionMarkdownRenderer.astro";
export { default as OptimizedDatabaseCover } from "./src/components/OptimizedDatabaseCover.astro";
export { default as DatabaseProperty } from "./src/components/DatabaseProperty.astro";

// Notion component mapping targets for use with entry.render() + <Content components={...} />
export { default as NotionImage } from "./src/components/notion/NotionImage.astro";
export { default as NotionH1 } from "./src/components/notion/NotionH1.astro";
export { default as NotionH2 } from "./src/components/notion/NotionH2.astro";
export { default as NotionH3 } from "./src/components/notion/NotionH3.astro";
export { default as NotionBlockquote } from "./src/components/notion/NotionBlockquote.astro";
export { default as NotionTable } from "./src/components/notion/NotionTable.astro";

export * from "./src/utils/notion";
export * from "./src/loader/loader";
export * from "./src/loader/schema";
export { notroMarkdownConfig } from "./src/markdown/notroMarkdownConfig";

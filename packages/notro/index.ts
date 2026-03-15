export { default as NotionMarkdownRenderer } from "./src/components/NotionMarkdownRenderer.astro";
export { default as OptimizedDatabaseCover } from "./src/components/OptimizedDatabaseCover.astro";
export { default as DatabaseProperty } from "./src/components/DatabaseProperty.astro";

export { notionComponents } from "./src/components/notion/index.ts";
export type { NotionComponents } from "./src/components/notion/index.ts";

export * from "./src/utils/notion";
export { colorToCSS } from "./src/components/notion/colors";
export * from "./src/loader/loader";
export * from "./src/loader/schema";
// notroMarkdownConfig is intentionally NOT exported from here.
//
// Why two entry points?
//   "notro"        → used in src/ files (content.config.ts, .astro pages)
//   "notro/config" → used ONLY in astro.config.mjs
//
// Astro components (.astro) re-exported above use the Astro JSX runtime,
// which Vite cannot evaluate during config loading. Keeping markdown plugins
// in a separate entry point ("notro/config") prevents this import from
// being bundled into the config evaluation path and breaking the build.

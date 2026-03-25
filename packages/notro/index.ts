export { default as NotionMarkdownRenderer } from "./src/components/NotionMarkdownRenderer.astro";
export type { LinkToPages } from "./src/types.ts";
export { default as OptimizedDatabaseCover } from "./src/components/OptimizedDatabaseCover.astro";

export { notionComponents } from "./src/components/notion/index.ts";
export type { NotionComponents } from "./src/components/notion/index.ts";

// Individual Notion block components — import to override in your renderer.
export { default as Callout }        from "./src/components/notion/Callout.astro";
export { default as Toggle }         from "./src/components/notion/Toggle.astro";
export { default as ToggleTitle }    from "./src/components/notion/ToggleTitle.astro";
export { default as Columns }        from "./src/components/notion/Columns.astro";
export { default as Column }         from "./src/components/notion/Column.astro";
export { default as Audio }          from "./src/components/notion/Audio.astro";
export { default as Video }          from "./src/components/notion/Video.astro";
export { default as FileBlock }      from "./src/components/notion/FileBlock.astro";
export { default as PdfBlock }       from "./src/components/notion/PdfBlock.astro";
export { default as PageRef }        from "./src/components/notion/PageRef.astro";
export { default as DatabaseRef }    from "./src/components/notion/DatabaseRef.astro";
export { default as TableOfContents } from "./src/components/notion/TableOfContents.astro";
export { default as SyncedBlock }    from "./src/components/notion/SyncedBlock.astro";
export { default as EmptyBlock }     from "./src/components/notion/EmptyBlock.astro";
export { default as Mention }        from "./src/components/notion/Mention.astro";
export { default as MentionDate }    from "./src/components/notion/MentionDate.astro";
export { default as H1 }             from "./src/components/notion/H1.astro";
export { default as H2 }             from "./src/components/notion/H2.astro";
export { default as H3 }             from "./src/components/notion/H3.astro";
export { default as H4 }             from "./src/components/notion/H4.astro";
export { default as Quote }          from "./src/components/notion/Quote.astro";
export { default as StyledSpan }     from "./src/components/notion/StyledSpan.astro";
export { default as ImageBlock }     from "./src/components/notion/ImageBlock.astro";
export { default as TableBlock }     from "./src/components/notion/TableBlock.astro";
export { default as TableRow }       from "./src/components/notion/TableRow.astro";
export { default as TableCell }      from "./src/components/notion/TableCell.astro";
export { default as TableColgroup }  from "./src/components/notion/TableColgroup.astro";
export { default as TableCol }       from "./src/components/notion/TableCol.astro";

export * from "./src/utils/notion";
export { normalizeNotionPresignedUrl, markdownHasPresignedUrls } from "./src/utils/notion-url.ts";
export { colorToClass, notroColorVariants } from "./src/components/notion/colors.ts";
export type { NotroColor } from "./src/components/notion/colors.ts";

// Low-level MDX compile API — for use in custom .astro renderers (e.g. notro-ui).
export { compileMdxCached } from "./src/utils/compile-mdx.ts";

// Astro JSX component factory — wrap any HTML tag with optional default classes.
export { makeHtmlElement } from "./src/components/notion/HtmlElements.ts";

export * from "./src/loader/loader";
export * from "./src/loader/live-loader";
export * from "./src/loader/schema";

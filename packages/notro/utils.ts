/**
 * Pure TypeScript utilities — safe to import anywhere, including astro.config.mjs.
 *
 * Use this entry point (`notro/utils`) when you need notro helpers in contexts
 * where Astro components cannot be loaded (config files, Node scripts, etc.).
 *
 * For Astro components and the Content Loader, use the main `notro` entry instead.
 */
export { normalizeNotionPresignedUrl, markdownHasPresignedUrls } from './src/utils/notion-url.ts';
export { getPlainText, getMultiSelect, hasTag, buildLinkToPages } from './src/utils/notion.ts';
export { colorToClass } from './src/components/notion/colors.ts';
export type { LinkToPages } from './src/types.ts';

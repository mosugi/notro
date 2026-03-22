/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  // Notion API credentials (required)
  readonly NOTION_TOKEN: string;
  readonly NOTION_DATASOURCE_ID: string;

  // Site identity overrides (optional — all have defaults in src/config.ts)
  readonly PUBLIC_SITE_NAME?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SITE_DESCRIPTION?: string;
  readonly PUBLIC_BLOG_POSTS_PER_PAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

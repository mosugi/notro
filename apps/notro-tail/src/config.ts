/**
 * Site-wide configuration for notro-tail.
 *
 * navPages defines which Notion pages appear in the header navigation
 * and in what order. Each entry matches a page by its Notion Slug property.
 * An optional label overrides the page title shown in the nav.
 */
export type NavPageConfig = {
  /** Matches the Slug property of the Notion page */
  slug: string;
  /** Optional display label; falls back to the page's Name property */
  label?: string;
};

export const navPages: NavPageConfig[] = [
  { slug: "about" },
  { slug: "privacy" },
];

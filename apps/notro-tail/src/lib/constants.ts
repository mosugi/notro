/**
 * Internal tag names used as system markers in the Notion database.
 * These tags are not shown as public tags on the site.
 *
 * - "page": marks a post as a fixed embedded page (excluded from blog listing)
 * - "pinned": marks a post to appear at the top of the blog list (page 1 only)
 */
export const INTERNAL_TAGS: string[] = ["page", "pinned"];

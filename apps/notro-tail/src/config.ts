// ---------------------------------------------------------------------------
// Site configuration — edit these values for your site
// ---------------------------------------------------------------------------

export const SITE_NAME = "NotroTail";
export const SITE_URL = "https://notrotail.mosugi.com";
export const SITE_DESCRIPTION = "Notion を CMS として使う Astro 静的サイトジェネレーター。";

// Number of posts shown per page in blog listing
export const BLOG_POSTS_PER_PAGE = 10;

// ---------------------------------------------------------------------------
// System tags — these affect post filtering logic (not shown as public tags)
// "page"   — marks a Notion post as a fixed page (excluded from blog listing)
// "pinned" — marks a post to appear at the top of the blog list (page 1 only)
// ---------------------------------------------------------------------------
export const INTERNAL_TAGS: string[] = ["page", "pinned"];

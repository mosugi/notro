/**
 * Site-wide configuration.
 *
 * All string values can be overridden via environment variables.
 * Set them in your .env file or deployment platform (Vercel / Netlify).
 *
 * Environment variables (PUBLIC_ prefix makes them available in the browser):
 *   PUBLIC_SITE_NAME           — site name shown in header, footer, <title>
 *   PUBLIC_SITE_URL            — canonical origin (must match astro.config.mjs `site`)
 *   PUBLIC_SITE_DESCRIPTION    — default meta description
 *   PUBLIC_BLOG_POSTS_PER_PAGE — number of posts per page (integer string)
 */

// ---------------------------------------------------------------------------
// Site identity
// ---------------------------------------------------------------------------

export const SITE_NAME =
  import.meta.env.PUBLIC_SITE_NAME ?? "NotroTail";

export const SITE_URL =
  import.meta.env.PUBLIC_SITE_URL ?? "https://notrotail.mosugi.com";

export const SITE_DESCRIPTION =
  import.meta.env.PUBLIC_SITE_DESCRIPTION ??
  "Notion を CMS として使う Astro 静的サイトジェネレーター。";

// ---------------------------------------------------------------------------
// Blog settings
// ---------------------------------------------------------------------------

export const BLOG_POSTS_PER_PAGE: number = (() => {
  const v = import.meta.env.PUBLIC_BLOG_POSTS_PER_PAGE;
  const n = v ? parseInt(v, 10) : NaN;
  return isNaN(n) ? 10 : n;
})();

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

/** Links rendered in the site header and mobile menu. */
export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/blog/", label: "ブログ" },
  { href: "/docs/", label: "Docs" },
];

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export const FOOTER_LINKS: {
  heading: string;
  links: { href: string; label: string; external?: boolean }[];
}[] = [
  {
    heading: "コンテンツ",
    links: [
      { href: "/blog/", label: "ブログ" },
      { href: "/blog/about/", label: "About" },
    ],
  },
  {
    heading: "ドキュメント",
    links: [
      { href: "/docs/", label: "Docs" },
      { href: "https://www.npmjs.com/package/notro", label: "npm", external: true },
    ],
  },
  {
    heading: "法的情報",
    links: [{ href: "/blog/privacy/", label: "プライバシーポリシー" }],
  },
];

// ---------------------------------------------------------------------------
// Internal tag names (system markers — not shown as public tags)
// ---------------------------------------------------------------------------

/**
 * "page"   — marks a Notion post as a fixed embedded page (excluded from blog listing)
 * "pinned" — marks a post to appear at the top of the blog list (page 1 only)
 */
export const INTERNAL_TAGS: string[] = ["page", "pinned"];

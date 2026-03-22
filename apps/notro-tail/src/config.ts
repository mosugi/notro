/**
 * Site-wide configuration.
 *
 * This is the single file to edit when customizing the template for your site.
 * All hardcoded strings (UI labels, nav, social links, etc.) live here.
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
// Social links
// ---------------------------------------------------------------------------

export const GITHUB_URL = "https://github.com/mosugi/notro-tail";
export const NPM_URL = "https://www.npmjs.com/package/notro";

// ---------------------------------------------------------------------------
// Blog settings
// ---------------------------------------------------------------------------

export const BLOG_POSTS_PER_PAGE: number = (() => {
  const v = import.meta.env.PUBLIC_BLOG_POSTS_PER_PAGE;
  const n = v ? parseInt(v, 10) : NaN;
  return isNaN(n) ? 10 : n;
})();

/** Title shown on the blog list page. */
export const BLOG_TITLE = "Blog";

/** Description used in <meta> and og:description for the blog list page. */
export const BLOG_DESCRIPTION =
  "Notion × Astro で作られたブログ。セットアップ・カスタマイズ・デプロイまで、notro の使い方を解説します。";

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
      { href: NPM_URL, label: "npm", external: true },
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

// ---------------------------------------------------------------------------
// Featured sections (shown at the top of blog list page 1)
// ---------------------------------------------------------------------------

/**
 * Each section collects posts matching the given Notion tag and renders them
 * in a dedicated section above the paginated list on page 1.
 * Posts already claimed by an earlier section are excluded from later ones.
 * Posts in any featured section are excluded from the regular paginated list.
 */
export const FEATURED_SECTIONS: {
  /** Notion tag name that triggers this section. */
  tag: string;
  /** Section heading rendered on the page. */
  heading: string;
  /** Link text shown on pages 2+ pointing back to page 1. */
  pageHint: string;
}[] = [
  {
    tag: "pinned",
    heading: "ピン留め",
    pageHint: "← ピン留め記事は1ページ目にあります",
  },
  {
    tag: "入門",
    heading: "入門",
    pageHint: "← 入門記事は1ページ目にあります",
  },
];

// ---------------------------------------------------------------------------
// UI text  (localize these strings for non-Japanese sites)
// ---------------------------------------------------------------------------

export const UI_TEXT = {
  // Accessibility
  skipToContent: "コンテンツへスキップ",
  openMenu: "メニューを開く",
  mainNav: "メインナビゲーション",
  mobileNav: "モバイルナビゲーション",
  docsMenuButton: "ドキュメントメニュー",

  // Blog list
  blogEmptyState: "記事はまだありません。",

  // Blog post prev/next navigation
  blogPostNewer: "← 新しい記事",
  blogPostOlder: "古い記事 →",

  // Blog post truncation warning
  blogPostTruncated:
    "このページのコンテンツは Notion API の制限により一部省略されています。",

  // Tag page
  tagPageBackLink: "← ブログ一覧",
  tagPageTitle: (tag: string) => `タグ: ${tag}`,
  tagPageDescription: (tag: string) => `「${tag}」タグの記事一覧`,
};

// ---------------------------------------------------------------------------
// Docs sidebar navigation (used by DocsLayout.astro)
// ---------------------------------------------------------------------------

/**
 * Edit this array to add, remove, or reorder docs pages in the sidebar.
 * Each group has a title and a list of { label, href } items.
 */
export const DOCS_NAV: {
  title: string;
  items: { label: string; href: string }[];
}[] = [
  {
    title: "はじめに",
    items: [{ label: "概要・クイックスタート", href: "/docs/" }],
  },
  {
    title: "セットアップ",
    items: [
      { label: "Notion セットアップ", href: "/docs/notion-setup/" },
      { label: "カスタマイズ", href: "/docs/customization/" },
      { label: "デプロイガイド", href: "/docs/deploy/" },
    ],
  },
  {
    title: "リファレンス",
    items: [
      { label: "API リファレンス", href: "/docs/api-reference/" },
      { label: "アーキテクチャ", href: "/docs/architecture/" },
    ],
  },
  {
    title: "レンダリング検証",
    items: [{ label: "ブロックタイプ一覧", href: "/docs/rendering/" }],
  },
];

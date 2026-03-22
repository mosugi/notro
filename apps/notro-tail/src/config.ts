// Edit these values for your site
const config = {
  site: {
    name: "NotroTail",
    description: "Notion を CMS として使う Astro 静的サイトジェネレーター。",
    /** BCP 47 language tag — used in <html lang="..."> */
    lang: "ja",
    /** og:locale — typically lang + region, e.g. "ja_JP", "en_US" */
    locale: "ja_JP",
  },
  blog: {
    postsPerPage: 10,
    // System tags — affect post filtering logic (not shown as public tags)
    // "page"   — marks a Notion post as a fixed page (excluded from blog listing)
    // "pinned" — marks a post to appear at the top of the blog list (page 1 only)
    internalTags: ["page", "pinned"] as string[],
  },
  navigation: {
    // Edit these links for your site header navigation
    nav: [
      { href: "/blog/", label: "ブログ" },
      { href: "/docs/", label: "Docs" },
    ] as { href: string; label: string }[],
    // Edit these link groups for your site footer
    footer: [
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
    ] as { heading: string; links: { href: string; label: string; external?: boolean }[] }[],
    // Social links shown in the header and footer
    social: {
      github: "https://github.com/mosugi/notro-tail",
      npm: "https://www.npmjs.com/package/notro",
    },
    // Per-page settings for Notion fixed pages (tagged "page").
    // Key = Notion page slug. bodyClass is injected into <body> for per-page theming.
    navPages: {
      about:   { bodyClass: "page-about" },
      privacy: { bodyClass: "page-privacy" },
      contact: { bodyClass: "page-contact" },
    } as Record<string, { bodyClass?: string }>,
  },
};

export default config;

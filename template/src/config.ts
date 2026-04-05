// Edit these values for your site
const config = {
  site: {
    // Your site name — shown in <title> and og:title
    name: "My Site",
    // Your site description — shown in <meta description> and og:description
    description: "My site powered by Notion and Astro.",
    /** Author name — used in JSON-LD structured data */
    author: "Your Name",
    /** BCP 47 language tag — used in <html lang="..."> */
    lang: "ja",
    /** og:locale — typically lang + region, e.g. "ja_JP", "en_US" */
    locale: "ja_JP",
  },
  analytics: {
    /**
     * Google Analytics 4 Measurement ID (e.g. "G-XXXXXXXXXX").
     * Set to undefined to disable analytics entirely.
     * Uses Partytown to offload gtag to a web worker.
     */
    gaMeasurementId: undefined as string | undefined,
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
        heading: "法的情報",
        links: [{ href: "/blog/privacy/", label: "プライバシーポリシー" }],
      },
    ] as { heading: string; links: { href: string; label: string; external?: boolean }[] }[],
    // Social links shown in the header and footer
    social: {
      github: "https://github.com/mosugi/notro-tail",
      npm: "https://www.npmjs.com/package/notro",
    },
  },
};

export default config;

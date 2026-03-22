// Edit these values for your site
const config = {
  site: {
    name: "NotroTail",
    // Keep in sync with astro.config.mjs `site`
    url: "https://notrotail.mosugi.com",
    description: "Notion を CMS として使う Astro 静的サイトジェネレーター。",
  },
  blog: {
    postsPerPage: 10,
    // System tags — affect post filtering logic (not shown as public tags)
    // "page"   — marks a Notion post as a fixed page (excluded from blog listing)
    // "pinned" — marks a post to appear at the top of the blog list (page 1 only)
    internalTags: ["page", "pinned"] as string[],
  },
};

export default config;

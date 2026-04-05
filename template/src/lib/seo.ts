// Builds JSON-LD structured data objects conforming to schema.org

export interface BlogPostingJsonLdParams {
  title: string;
  description?: string;
  datePublished?: string;
  image: string;
  url: string;
  /** Author display name */
  author: string;
  /** Publisher / site name */
  publisher: string;
}

/** Returns a schema.org BlogPosting JSON-LD object for individual blog posts. */
export function buildBlogPostingJsonLd(p: BlogPostingJsonLdParams): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    ...(p.description && { description: p.description }),
    ...(p.datePublished && { datePublished: p.datePublished }),
    image: p.image,
    url: p.url,
    author: { "@type": "Person", name: p.author },
    publisher: { "@type": "Organization", name: p.publisher },
  };
}

/** Returns a schema.org WebSite JSON-LD object for top-level / list pages. */
export function buildWebSiteJsonLd(name: string, url: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
  };
}

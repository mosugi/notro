/**
 * Returns true if the given href matches the current pathname.
 *
 * Normalizes trailing slashes before comparing so that "/docs" and "/docs/"
 * are treated as the same path. This is more accurate than a simple startsWith
 * check, which would incorrectly match "/docs" against "/docs-extra/".
 */
export function isActive(pathname: string, href: string): boolean {
  const normalizedPath = pathname.endsWith("/") ? pathname : pathname + "/";
  const normalizedHref = href.endsWith("/") ? href : href + "/";
  return normalizedPath === normalizedHref;
}

export interface ExternalLinkAttrs {
  target?: "_blank";
  rel?: "noopener noreferrer";
}

/**
 * Returns the `target` / `rel` attribute pair for a nav link.
 * Empty object for in-site links so Astro omits both attributes entirely.
 */
export function externalLinkAttrs(external: boolean | undefined): ExternalLinkAttrs {
  return external ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

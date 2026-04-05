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

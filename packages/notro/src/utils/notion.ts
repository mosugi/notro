import type { PropertyPageObjectResponseType } from "../loader/schema.ts";
import type { LinkToPages } from "../markdown/transformer.ts";

export const getPlainText = (
  property: PropertyPageObjectResponseType,
): string | undefined => {
  if (property?.type === "rich_text" && property.rich_text.length > 0) {
    return property.rich_text.map((t) => t.plain_text).join("");
  }
  if (property?.type === "title" && property.title.length > 0) {
    return property.title.map((t) => t.plain_text).join("");
  }
  if (property?.type === "select" && property.select?.name !== undefined) {
    return property.select.name;
  }
  if (
    property?.type === "multi_select" &&
    property.multi_select !== undefined
  ) {
    return property.multi_select.map((option) => option.name).join();
  }
  return undefined;
};

/**
 * Builds a `linkToPages` map from a collection of entries so that
 * `NotionMarkdownRenderer` can resolve inter-page Notion links.
 *
 * @param entries - Array of content collection entries (from `getCollection`)
 * @param options - Accessor functions that return the URL and title for each entry
 *
 * @example
 * ```ts
 * import { getCollection } from "astro:content";
 * import { buildLinkToPages, getPlainText } from "notro";
 *
 * const posts = await getCollection("posts");
 * const linkToPages = buildLinkToPages(posts, {
 *   url: (e) => `blog/${getPlainText(e.data.properties.Slug) || e.id}/`,
 *   title: (e) => getPlainText(e.data.properties.Name) ?? e.id,
 * });
 * ```
 */
export function buildLinkToPages<T extends { id: string; data: Record<string, unknown> }>(
  entries: T[],
  options: {
    url: (entry: T) => string;
    title: (entry: T) => string;
  },
): LinkToPages {
  return Object.fromEntries(
    entries.map((entry) => [
      entry.id,
      {
        url: options.url(entry),
        title: options.title(entry),
      },
    ]),
  );
}

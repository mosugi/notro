import type { PropertyPageObjectResponseType } from "../loader/schema.ts";
import type { LinkToPages } from "../types.ts";

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
    return property.multi_select.map((option) => option.name).join(", ");
  }
  if (property?.type === "number" && property.number !== null) {
    return String(property.number);
  }
  if (property?.type === "url") {
    return property.url ?? undefined;
  }
  if (property?.type === "email") {
    return property.email ?? undefined;
  }
  if (property?.type === "phone_number") {
    return property.phone_number ?? undefined;
  }
  if (property?.type === "date" && property.date !== null) {
    return property.date.start;
  }
  if (property?.type === "unique_id" && property.unique_id.number !== null) {
    return property.unique_id.prefix
      ? `${property.unique_id.prefix}-${property.unique_id.number}`
      : String(property.unique_id.number);
  }
  return undefined;
};

/**
 * Returns the multi-select options array from a multi_select property,
 * or an empty array if the property is not a multi_select or is undefined.
 *
 * @example
 * ```ts
 * const tags = getMultiSelect(entry.data.properties.Tags);
 * // Array<{ id: string; name: string; color: string }>
 * tags.forEach(t => console.log(t.name));
 * ```
 */
export const getMultiSelect = (
  property: PropertyPageObjectResponseType | undefined,
): { id: string; name: string; color: string }[] => {
  if (property?.type === "multi_select") {
    return property.multi_select;
  }
  return [];
};

/**
 * Returns true if a multi_select property contains a tag with the given name.
 * Returns false if the property is not a multi_select or is undefined.
 *
 * @example
 * ```ts
 * if (hasTag(entry.data.properties.Tags, "pinned")) {
 *   // show pinned badge
 * }
 * ```
 */
export const hasTag = (
  property: PropertyPageObjectResponseType | undefined,
  tagName: string,
): boolean => {
  if (property?.type !== "multi_select") return false;
  return property.multi_select.some((t) => t.name === tagName);
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
  const result: LinkToPages = {};
  for (const entry of entries) {
    if (entry.id in result) {
      // Warn when two entries share the same Notion page ID; the later entry wins.
      console.warn(
        `[notro] buildLinkToPages: duplicate entry id "${entry.id}" — the later entry will overwrite the earlier one.`,
      );
    }
    result[entry.id] = {
      url: options.url(entry),
      title: options.title(entry),
    };
  }
  return result;
}

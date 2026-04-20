import type { CollectionEntry } from "astro:content";
// Use notro-loader/utils (no .astro component deps) for pure utility functions
import { getPlainText, getMultiSelect, hasTag } from "notro-loader/utils";
import type { PropertyPageObjectResponseType } from "notro-loader";

type PostEntry = CollectionEntry<"posts">;

/** Returns blog posts (no "page" tag), sorted newest first by Date property. */
export function getSortedBlogPosts(posts: PostEntry[]): PostEntry[] {
  return posts
    .filter((entry) => !hasTag(entry.data.properties.Tags, "page"))
    .sort((a, b) => {
      const dateA = a.data.properties.Date.date?.start ?? "";
      const dateB = b.data.properties.Date.date?.start ?? "";
      return dateB.localeCompare(dateA);
    });
}

/** Converts a post entry to a minimal nav object { slug, title }. */
export function toNavEntry(entry: PostEntry): { slug: string; title: string } {
  return {
    slug: getPlainText(entry.data.properties.Slug) || entry.id,
    title: getPlainText(entry.data.properties.Name) ?? entry.id,
  };
}

/**
 * Returns prev (newer) and next (older) nav entries for a post in a date-sorted list.
 * Assumes sortedPosts is sorted newest-first (descending).
 */
export function getAdjacentPosts(
  sortedPosts: PostEntry[],
  currentId: string,
): {
  prevNav: { slug: string; title: string } | undefined;
  nextNav: { slug: string; title: string } | undefined;
} {
  const idx = sortedPosts.findIndex((p) => p.id === currentId);
  return {
    prevNav: idx > 0 ? toNavEntry(sortedPosts[idx - 1]!) : undefined,
    nextNav:
      idx >= 0 && idx < sortedPosts.length - 1
        ? toNavEntry(sortedPosts[idx + 1]!)
        : undefined,
  };
}

/** Returns multi-select tags, excluding internal system tags. */
export function getPublicTags(
  tagsProperty: PropertyPageObjectResponseType | undefined,
  internalTags: string[],
): { id: string; name: string; color: string }[] {
  return getMultiSelect(tagsProperty).filter((t) => !internalTags.includes(t.name));
}

/** Returns posts tagged "pinned". */
export function getPinnedPosts(blogPosts: PostEntry[]): PostEntry[] {
  return blogPosts.filter((entry) => hasTag(entry.data.properties.Tags, "pinned"));
}

/** Returns posts with the given beginner tag, excluding pinned ones. */
export function getBeginnerPosts(
  blogPosts: PostEntry[],
  beginnerTag: string,
): PostEntry[] {
  return blogPosts.filter(
    (entry) =>
      hasTag(entry.data.properties.Tags, beginnerTag) &&
      !hasTag(entry.data.properties.Tags, "pinned"),
  );
}

/** Returns all unique public tag names across a set of posts, excluding internal tags. */
export function getAllPublicTags(posts: PostEntry[], internalTags: string[]): string[] {
  return [
    ...new Set(
      posts.flatMap((entry) =>
        getMultiSelect(entry.data.properties.Tags)
          .map((t) => t.name)
          .filter((name) => !internalTags.includes(name)),
      ),
    ),
  ];
}

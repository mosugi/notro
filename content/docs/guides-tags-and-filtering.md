---
slug: guides/tags-and-filtering
title: Tags and Filtering
---

# Tags and Filtering

The blog template supports tag-based and category-based filtering out of the box. This page explains the data model and how to extend it.

## Notion properties

The blog template uses two filtering properties:

| Property | Notion type | Purpose |
|---|---|---|
| `Tags` | Multi-select | Multiple labels per post (e.g. `TypeScript`, `Astro`) |
| `Category` | Select | Single primary category per post (e.g. `Tutorial`) |
| `Public` | Checkbox | Controls whether a page is included in the build |

## Filtering at the API level

The most efficient way to filter is in the `loader()` query, so only matching pages are fetched:

```ts
// content.config.ts
loader({
  queryParameters: {
    data_source_id: import.meta.env.NOTION_DATASOURCE_ID,
    // Only fetch public pages
    filter: { property: "Public", checkbox: { equals: true } },
  },
  clientOptions: { auth: import.meta.env.NOTION_TOKEN },
})
```

This reduces API calls and build time compared to fetching all pages and filtering client-side.

## Filtering in page components

After the collection is loaded, you can filter the entries further in your Astro page components.

### Filter by tag

```ts
// src/lib/posts.ts
import type { CollectionEntry } from "astro:content";

export function getPostsByTag(
  posts: CollectionEntry<"posts">[],
  tag: string,
): CollectionEntry<"posts">[] {
  return posts.filter((post) => post.data.tags?.includes(tag));
}
```

```astro
---
// src/pages/blog/tag/[tag]/[...page].astro
import { getCollection } from "astro:content";
import { getPostsByTag, getSortedPosts } from "@/lib/posts";

export async function getStaticPaths({ paginate }) {
  const allPosts = await getCollection("posts");
  const allTags = [...new Set(allPosts.flatMap((p) => p.data.tags ?? []))];

  return allTags.flatMap((tag) => {
    const tagPosts = getSortedPosts(getPostsByTag(allPosts, tag));
    return paginate(tagPosts, { params: { tag }, pageSize: 10 });
  });
}

const { page, params } = Astro.props;
---
<h1>Posts tagged: {params.tag}</h1>
<ul>
  {page.data.map((post) => <li>{post.data.title}</li>)}
</ul>
```

### Filter by category

```ts
export function getPostsByCategory(
  posts: CollectionEntry<"posts">[],
  category: string,
): CollectionEntry<"posts">[] {
  return posts.filter((post) => post.data.category === category);
}
```

### Get all tags with counts

```ts
export function getTagCounts(
  posts: CollectionEntry<"posts">[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}
```

## Sorting posts

```ts
export function getSortedPosts(
  posts: CollectionEntry<"posts">[],
): CollectionEntry<"posts">[] {
  return [...posts].sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
    const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
    return dateB - dateA;
  });
}
```

## Pinned posts

The blog template supports pinned posts via a special `Tags` value. Mark a page with the tag `pinned` in Notion, then filter in your page component:

```ts
export function getPinnedPosts(
  posts: CollectionEntry<"posts">[],
): CollectionEntry<"posts">[] {
  return posts.filter((post) => post.data.tags?.includes("pinned"));
}

export function excludePinnedPosts(
  posts: CollectionEntry<"posts">[],
): CollectionEntry<"posts">[] {
  return posts.filter((post) => !post.data.tags?.includes("pinned"));
}
```

## Fixed pages

Some pages (like an About page) should appear in the top navigation but not in the blog listing. The convention is to use a `page` tag:

```ts
export function excludeFixedPages(
  posts: CollectionEntry<"posts">[],
): CollectionEntry<"posts">[] {
  return posts.filter((post) => !post.data.tags?.includes("page"));
}
```

## Advanced Notion filters

You can compose complex filters in `queryParameters` using Notion's filter API:

```ts
// Posts with a specific category AND a specific tag
filter: {
  and: [
    { property: "Category", select: { equals: "Tutorial" } },
    { property: "Tags", multi_select: { contains: "TypeScript" } },
  ],
}

// Posts with either tag
filter: {
  or: [
    { property: "Tags", multi_select: { contains: "Astro" } },
    { property: "Tags", multi_select: { contains: "notro" } },
  ],
}
```

Refer to the [Notion API filter documentation](https://developers.notion.com/reference/post-database-query-filter) for the full filter syntax.

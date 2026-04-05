---
title: Tags & Filtering
description: How tags work in notro — public vs internal tags, filtering, and tag pages.
---

## Internal tags

Internal tags affect post filtering logic and are not shown to visitors. Configure them in `src/config.ts`:

```ts
blog: {
  internalTags: ["page", "pinned"],
}
```

| Tag | Behavior |
|---|---|
| `page` | Fixed page — excluded from blog listing and pagination |
| `pinned` | Pinned post — shown at the top of the blog list (page 1 only) |

## Public tags

All tags not in `internalTags` are treated as public and shown on post cards. Tag archive pages are automatically generated at `/blog/tag/[tag]/`.

## Tag archive pages

Tag pages are at `src/pages/blog/tag/[tag]/[...page].astro` and are generated statically for every unique public tag in your collection.

## Filtering by tag

```ts
import { getMultiSelect, hasTag } from "notro/utils";

// Check if a post has a specific tag
const isPinned = hasTag(entry.data.properties.Tags, "pinned");

// Get all tag objects
const tags = getMultiSelect(entry.data.properties.Tags);
// → [{ id: "...", name: "TypeScript", color: "blue" }, ...]
```

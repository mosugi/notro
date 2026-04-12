---
slug: reference/loader
title: loader()
---

# loader()

The `loader()` function is a custom [Astro Content Loader](https://docs.astro.build/en/reference/content-loader-reference/) that fetches pages from a Notion data source and stores them in the Content Collection store.

## Import

```ts
import { loader } from "notro-loader";
```

## Usage

```ts
// src/content.config.ts
import { defineCollection } from "astro:content";
import { loader } from "notro-loader";

export const collections = {
  posts: defineCollection({
    loader: loader({
      queryParameters: {
        data_source_id: import.meta.env.NOTION_DATASOURCE_ID,
        filter: { property: "Public", checkbox: { equals: true } },
      },
      clientOptions: { auth: import.meta.env.NOTION_TOKEN },
    }),
  }),
};
```

## Options

```ts
interface LoaderOptions {
  queryParameters: DataSourceQueryParameters;
  clientOptions: ClientOptions;
}
```

### queryParameters

Parameters passed to `notion.dataSources.query`. The `data_source_id` is required; all other keys are optional.

```ts
queryParameters: {
  data_source_id: string;       // Required: Notion database UUID
  filter?: FilterObject;        // Optional: Notion filter
  sorts?: SortObject[];         // Optional: sort order
  page_size?: number;           // Optional: results per page (max 100)
}
```

**Filter examples:**

```ts
// Simple checkbox filter
filter: { property: "Public", checkbox: { equals: true } }

// AND filter
filter: {
  and: [
    { property: "Public", checkbox: { equals: true } },
    { property: "Tags", multi_select: { contains: "featured" } },
  ],
}
```

**Sort examples:**

```ts
// Sort by Date descending
sorts: [{ property: "Date", direction: "descending" }]

// Sort by last edited time
sorts: [{ timestamp: "last_edited_time", direction: "descending" }]
```

### clientOptions

Options passed to the `@notionhq/client` `Client` constructor.

```ts
clientOptions: {
  auth: string;               // Required: Notion API token
  notionVersion?: string;     // Optional: API version (default: latest)
  timeoutMs?: number;         // Optional: request timeout in ms
}
```

## What the loader stores

For each Notion page, the loader stores an entry with:

```ts
{
  id: string;              // Notion page UUID
  markdown: string;        // Preprocessed markdown content
  last_edited_time: string; // ISO 8601 timestamp
  properties: {
    // Raw Notion property objects — shape depends on your database schema
    Name: { title: [...] },
    Slug: { rich_text: [...] },
    // ...
  };
}
```

Use `pageWithMarkdownSchema` from `notro-loader` as the base Zod schema to type these fields, then extend it with your database's specific properties.

## Cache behavior

The loader caches pages between builds using Astro's Content Layer store. An entry is refreshed when:

- The Notion `last_edited_time` has advanced since the last build
- The cached markdown contains expired Notion pre-signed S3 URLs (detected by `X-Amz-Expires` in image URLs)
- The page no longer exists in Notion (entry is deleted from the store)

Pages whose `last_edited_time` has not changed are not re-fetched, making incremental builds fast.

## Error handling

| Situation | Behavior |
|---|---|
| `429 rate_limited` | Retry with exponential backoff (1 s, 2 s, 4 s; max 3 retries) |
| `500 / 503` server error | Retry with exponential backoff |
| `401 unauthorized` | Log warning, skip page |
| `403 restricted_resource` | Log warning, skip page |
| `404 object_not_found` | Log warning, remove from store |
| Content truncated | Log warning, use truncated content |
| Unknown block IDs | Log warning with block ID list, continue |

The build continues even when individual pages fail.

## Live loader (dev only)

For development environments that require real-time content updates without a server restart, use `liveLoader()`:

```ts
import { liveLoader } from "notro-loader";

export const collections = {
  posts: defineCollection({
    loader: liveLoader({
      queryParameters: { data_source_id: import.meta.env.NOTION_DATASOURCE_ID },
      clientOptions: { auth: import.meta.env.NOTION_TOKEN },
    }),
  }),
};
```

`liveLoader()` re-fetches content on every request during `astro dev`. It is not recommended for production builds.

## Type reference

```ts
function loader(options: LoaderOptions): AstroContentLoader;
function liveLoader(options: LoaderOptions): AstroContentLoader;

interface LoaderOptions {
  queryParameters: {
    data_source_id: string;
    filter?: unknown;
    sorts?: unknown[];
    page_size?: number;
  };
  clientOptions: {
    auth: string;
    notionVersion?: string;
    timeoutMs?: number;
  };
}
```

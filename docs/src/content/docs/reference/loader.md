---
title: loader()
description: API reference for the notro Content Loader.
---

## Import

```ts
import { loader } from "notro";
```

Used in `src/content.config.ts` as the loader for an Astro Content Collection.

## Options

```ts
loader({
  dataSources: DataSourceConfig[];
})
```

### dataSources

An array of data source configurations. Currently supports `notion_database`:

```ts
{
  type: "notion_database";
  databaseId: string;    // Notion database UUID
  token: string;         // Notion integration token
  filter?: NotionFilter; // Notion API filter object
  sorts?: NotionSort[];  // Notion API sort objects
}
```

## Caching

The loader caches pages by `last_edited_time`. On subsequent builds:
- Pages with unchanged `last_edited_time` are served from cache
- Edited pages are re-fetched from the Notion API
- Deleted pages are removed from the store
- Pages with expired Notion pre-signed S3 image URLs are re-fetched

## Error handling

| Error | Behavior |
|---|---|
| `429 / 500 / 503` | Retried with exponential backoff (1s / 2s / 4s, max 3 times) |
| `401 / 403 / 404` | Page is skipped; warning logged |
| Other errors | Page is skipped; warning logged; build continues |

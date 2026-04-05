---
title: Content Collections
description: How to configure Astro Content Collections with the notro loader.
---

## Basic setup

Define your collection in `src/content.config.ts`:

```ts
import { defineCollection } from "astro:content";
import { loader } from "notro";

const posts = defineCollection({
  loader: loader({
    dataSources: [
      {
        type: "notion_database",
        databaseId: import.meta.env.NOTION_DATASOURCE_ID,
        token: import.meta.env.NOTION_TOKEN,
        filter: {
          property: "Public",
          checkbox: { equals: true },
        },
      },
    ],
  }),
});

export const collections = { posts };
```

## Using the collection

```astro
---
import { getCollection } from "astro:content";

const allPosts = await getCollection("posts");
---
```

## Rendering a post

```astro
---
import { NotroContent } from "notro";
const { entry } = Astro.props;
---

<div class="prose">
  <NotroContent markdown={entry.data.markdown} />
</div>
```

## Entry data schema

Each entry exposes:

| Field | Type | Description |
|---|---|---|
| `markdown` | `string` | Preprocessed Markdown from Notion |
| `properties.Name` | `TitleProperty` | Page title |
| `properties.Slug` | `RichTextProperty` | URL slug |
| `properties.Date` | `DateProperty` | Publication date |
| `properties.Tags` | `MultiSelectProperty` | Tags |
| `properties.Description` | `RichTextProperty` | Excerpt |

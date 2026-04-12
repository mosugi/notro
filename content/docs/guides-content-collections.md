---
slug: guides/content-collections
title: Content Collections
---

# Content Collections

notro uses [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) to manage Notion pages. This page explains how to configure the collection schema and loader.

## Basic setup

`src/content.config.ts` defines your collections. The blog template ships with a `posts` collection:

```ts
import { defineCollection } from "astro:content";
import { loader, pageWithMarkdownSchema, notroProperties } from "notro-loader";
import { getPlainText } from "notro-loader/utils";
import { z } from "zod";

const postsSchema = pageWithMarkdownSchema
  .extend({
    properties: z.object({
      Name:        notroProperties.title,
      Description: notroProperties.richText.optional(),
      Slug:        notroProperties.richText,
      Public:      notroProperties.checkbox,
      Date:        notroProperties.date.optional(),
      Tags:        notroProperties.multiSelect.optional(),
      Category:    notroProperties.select.optional(),
    }),
  })
  .transform((data) => ({
    ...data,
    title:       getPlainText(data.properties.Name) ?? "Untitled",
    description: getPlainText(data.properties.Description) ?? undefined,
    slug:        getPlainText(data.properties.Slug) ?? data.id,
    date:        data.properties.Date?.date?.start,
    tags:        data.properties.Tags?.multi_select.map((t) => t.name) ?? [],
    category:    data.properties.Category?.select?.name,
    isPublic:    data.properties.Public.checkbox,
  }));

export const collections = {
  posts: defineCollection({
    loader: loader({
      queryParameters: {
        data_source_id: import.meta.env.NOTION_DATASOURCE_ID,
        filter: { property: "Public", checkbox: { equals: true } },
      },
      clientOptions: { auth: import.meta.env.NOTION_TOKEN },
    }),
    schema: postsSchema,
  }),
};
```

## pageWithMarkdownSchema

`pageWithMarkdownSchema` is the base Zod schema for a Notion page returned by the loader. It includes:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Notion page UUID |
| `markdown` | `string` | Preprocessed markdown content |
| `last_edited_time` | `string` | ISO 8601 timestamp |
| `properties` | `Record<string, unknown>` | Raw Notion properties (extend with `.extend()`) |

## notroProperties helpers

`notroProperties` provides Zod schemas that match the shape of each Notion property type:

| Helper | Notion type | Access pattern |
|---|---|---|
| `notroProperties.title` | Title | `prop.title[0]?.plain_text` via `getPlainText()` |
| `notroProperties.richText` | Rich text | `prop.rich_text[0]?.plain_text` via `getPlainText()` |
| `notroProperties.checkbox` | Checkbox | `prop.checkbox` → `boolean` |
| `notroProperties.date` | Date | `prop.date?.start` → `string \| undefined` |
| `notroProperties.select` | Select | `prop.select?.name` → `string \| undefined` |
| `notroProperties.multiSelect` | Multi-select | `prop.multi_select.map(o => o.name)` |
| `notroProperties.number` | Number | `prop.number` → `number \| null` |
| `notroProperties.url` | URL | `prop.url` → `string \| null` |

## loader() options

```ts
loader({
  queryParameters: {
    data_source_id: import.meta.env.NOTION_DATASOURCE_ID,
    // Optional: filter pages at the API level
    filter: { property: "Public", checkbox: { equals: true } },
    // Optional: sort pages
    sorts: [{ property: "Date", direction: "descending" }],
  },
  clientOptions: {
    auth: import.meta.env.NOTION_TOKEN,
  },
})
```

### queryParameters

Passed directly to `notion.dataSources.query`. Supports all Notion filter and sort options.

**Filter examples:**

```ts
// Only public pages
filter: { property: "Public", checkbox: { equals: true } }

// Pages with a specific tag
filter: { property: "Tags", multi_select: { contains: "tutorial" } }

// Combined filter
filter: {
  and: [
    { property: "Public", checkbox: { equals: true } },
    { property: "Category", select: { equals: "blog" } },
  ],
}
```

**Sort examples:**

```ts
// Sort by date descending
sorts: [{ property: "Date", direction: "descending" }]

// Sort by last edited time
sorts: [{ timestamp: "last_edited_time", direction: "descending" }]
```

### clientOptions

Passed to `new Client(clientOptions)` from `@notionhq/client`. Set `auth` to your Notion token. You can also configure `notionVersion` here if needed.

## Multiple collections

You can define multiple collections pointing to different Notion databases:

```ts
export const collections = {
  posts: defineCollection({
    loader: loader({
      queryParameters: { data_source_id: import.meta.env.NOTION_BLOG_DB_ID },
      clientOptions: { auth: import.meta.env.NOTION_TOKEN },
    }),
    schema: postsSchema,
  }),
  projects: defineCollection({
    loader: loader({
      queryParameters: { data_source_id: import.meta.env.NOTION_PROJECTS_DB_ID },
      clientOptions: { auth: import.meta.env.NOTION_TOKEN },
    }),
    schema: projectsSchema,
  }),
};
```

## Using collection data in pages

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from "astro:content";
import { NotroContent } from "notro-loader";

export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    params: { slug: post.data.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
---
<article>
  <h1>{post.data.title}</h1>
  <NotroContent markdown={post.data.markdown} />
</article>
```

## getPlainText utility

`getPlainText` extracts the plain text string from a Notion rich text or title property value:

```ts
import { getPlainText } from "notro-loader/utils";

getPlainText(properties.Name)        // "My Post Title"
getPlainText(properties.Description) // "A short description" | undefined
```

It safely returns `undefined` if the property is absent or has no text content.

# Notro

![npm](https://img.shields.io/npm/v/notro)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

An Astro Content Loader library that fetches Notion database content via the [Markdown Content API](https://developers.notion.com/) into [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/).

> [!TIP]
> Sample project: [NotroTail](https://github.com/mosugi/NotroTail)

## Installation

```sh
npm install notro
```

## Setup

### 1. `src/content.config.ts`

Define your collection using the `loader` function. Extend `pageWithMarkdownSchema` with your database properties. Use the `notroProperties` shorthand for concise property schemas.

```typescript
import { defineCollection } from "astro:content";
import { loader, pageWithMarkdownSchema, notroProperties } from "notro";
import { z } from "zod";

const posts = defineCollection({
  loader: loader({
    queryParameters: {
      data_source_id: import.meta.env.NOTION_DATASOURCE_ID,
      filter: {
        property: "Public",
        checkbox: { equals: true },
      },
    },
    clientOptions: {
      auth: import.meta.env.NOTION_TOKEN,
    },
  }),
  schema: pageWithMarkdownSchema.extend({
    properties: z.object({
      Name: notroProperties.title,
      Description: notroProperties.richText,
      Public: notroProperties.checkbox,
      Tags: notroProperties.multiSelect,
      Date: notroProperties.date,
    }),
  }),
});

export const collections = { posts };
```

### 2. Page component

Render Markdown with `NotroContent` and extract text from properties with `getPlainText`.
For component styling, use [notro-ui](https://github.com/mosugi/notro-tail/tree/main/packages/notro-ui).

```sh
# Copy notro-ui components into src/components/notro/
npx notro-ui init
```

```astro
---
import { getCollection } from "astro:content";
import { getPlainText } from "notro";
import NotroContent from "../../components/notro/NotroContent.astro";

const posts = await getCollection("posts");
const { entry } = Astro.props;

const title = getPlainText(entry.data.properties.Name);
const markdown = entry.data.markdown;
---

<NotroContent markdown={markdown} />
```

Components are placed in `src/components/notro/` so you can edit them directly to customize styles.

## Markdown processing (remark-nfm)

`notro` delegates Notion Markdown preprocessing and directive syntax support to the [`remark-nfm`](https://www.npmjs.com/package/remark-nfm) package.

`remark-nfm` is used inside notro's MDX compile pipeline and is applied automatically when using `NotroContent`.

If you want to use `remark-nfm` directly (in a custom unified pipeline or `@mdx-js/mdx`'s `evaluate()`), import it from the `remark-nfm` package directly rather than from `notro`.

```ts
// ✅ Import directly from remark-nfm
import { remarkNfm, preprocessNotionMarkdown } from "remark-nfm";

// ❌ Not needed from notro (internal use only)
// import { remarkNfm } from "notro";
```

## Notion API limitations

> Reference: [Retrieve a page as Markdown – Notion API](https://developers.notion.com/reference/retrieve-page-markdown)

### Content truncation (`truncated`)

`GET /v1/pages/{page_id}/markdown` truncates content at approximately **20,000 blocks**.

- Detectable via `truncated: true` in the response, but **there is no pagination API to fetch the rest**
- notro logs a warning when `truncated === true` and continues the build with the available content
- Workaround: split large Notion pages into multiple smaller pages

```
⚠ Page abc123: markdown content was truncated by the Notion API (~20,000 block limit).
  No pagination is available for this endpoint.
  Consider splitting this Notion page into smaller pages to avoid truncation.
```

### Unrenderable blocks (`unknown_block_ids`)

`unknown_block_ids` in the response lists block IDs that the Notion API could not convert to Markdown (unsupported block types, etc.).

- These blocks are **silently omitted** from the `markdown` field
- There is no way to retrieve their content via this endpoint
- notro logs the block IDs as a warning and continues the build

```
⚠ Page abc123: 2 block(s) could not be rendered to Markdown by the Notion API and were omitted.
  Block IDs: xxxxxxxx-..., yyyyyyyy-...
```

### API errors and automatic retries

| Error | Handling |
|---|---|
| `429 rate_limited` / `500 internal_server_error` / `503 service_unavailable` | Retry with exponential backoff (1s / 2s / 4s, up to 3 times) |
| `401 unauthorized` / `403 restricted_resource` / `404 object_not_found` | No retry. Logs a warning and skips the page |
| Other unexpected errors | Logs a warning and skips the page (build continues) |

## Environment variables

| Variable | Description |
|---|---|
| `NOTION_TOKEN` | Notion Internal Integration Token |
| `NOTION_DATASOURCE_ID` | Notion data source ID |

## API Reference

### `loader(options)`

Astro Content Loader. Pass Notion API `dataSources.query` parameters via `queryParameters`.

### `pageWithMarkdownSchema`

Base Zod schema returned by the loader. Extends `pageObjectResponseSchema` with `markdown: z.string()`. Extend with `.extend()` for custom schemas.

### Property schemas

Use the `notroProperties` shorthand to define database property types in `content.config.ts` (see [`notroProperties`](#notroproperties)).

Individual schemas (e.g. `titlePropertyPageObjectResponseSchema`) remain exported for backwards compatibility.

### Components

| Component | Description |
|---|---|
| `NotroContent` | Renders Notion Markdown to HTML (unstyled). For styled output, see `notro-ui` |
| `DatabaseCover` | Renders a Notion cover image with optimization |
| `DatabaseProperty` | Renders a Notion property value by type |
| `compileMdxCached` | Low-level MDX compile API. Use when building a custom `NotroContent` |

### `notroProperties`

Zod schema shorthands for defining property schemas in `content.config.ts`. Each key maps to a Notion property type.

```typescript
import { notroProperties } from "notro";

// notroProperties.title       → titlePropertyPageObjectResponseSchema
// notroProperties.richText    → richTextPropertyPageObjectResponseSchema
// notroProperties.checkbox    → checkboxPropertyPageObjectResponseSchema
// notroProperties.multiSelect → multiSelectPropertyPageObjectResponseSchema
// notroProperties.select      → selectPropertyPageObjectResponseSchema
// notroProperties.date        → datePropertyPageObjectResponseSchema
// notroProperties.number      → numberPropertyPageObjectResponseSchema
// notroProperties.url         → urlPropertyPageObjectResponseSchema
// notroProperties.email       → emailPropertyPageObjectResponseSchema
// notroProperties.phoneNumber → phoneNumberPropertyPageObjectResponseSchema
// notroProperties.files       → filesPropertyPageObjectResponseSchema
// notroProperties.people      → peoplePropertyPageObjectResponseSchema
// notroProperties.relation    → relationPropertyPageObjectResponseSchema
// notroProperties.rollup      → rollupPropertyPageObjectResponseSchema
// notroProperties.formula     → formulaPropertyPageObjectResponseSchema
// notroProperties.uniqueId    → uniqueIdPropertyPageObjectResponseSchema
// notroProperties.status      → statusPropertyPageObjectResponseSchema
// notroProperties.createdTime → createdTimePropertyPageObjectResponseSchema
// notroProperties.createdBy   → createdByPropertyPageObjectResponseSchema
// notroProperties.lastEditedTime → lastEditedTimePropertyPageObjectResponseSchema
// notroProperties.lastEditedBy   → lastEditedByPropertyPageObjectResponseSchema
// notroProperties.button      → buttonPropertyPageObjectResponseSchema
// notroProperties.verification → verificationPropertyPageObjectResponseSchema
```

### Utilities

| Function | Description |
|---|---|
| `getPlainText(property)` | Extracts plain text from Title, Rich Text, Select, Multi-select, Number, URL, Email, Phone, Date, and Unique ID properties |
| `getMultiSelect(property)` | Returns the options array for a multi-select property. Returns an empty array for unsupported types or `undefined` — no type guard needed |
| `hasTag(property, tagName)` | Returns whether a multi-select property contains the given tag name. Safe to call without a type guard |
| `buildLinkToPages(entries, options)` | Builds a `linkToPages` map from collection entries. Pass to `NotroContent` for resolving inter-page Notion links |
| `colorToCSS(color)` | Converts a Notion color name to an inline CSS style string (for use in custom components) |

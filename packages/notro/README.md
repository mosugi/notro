# Notro

![npm](https://img.shields.io/npm/v/notro)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

This package is a simple loader to load data from a [Notion Public API](https://developers.notion.com/) into Astro using the [Astro Loader API](https://docs.astro.build/en/reference/content-loader-reference/) introduced in Astro 5.

> [!TIP]
> Example project using Notro: [NotroTail](https://github.com/mosugi/NotroTail)

## Installation

```sh
npm install notro
```

## Usage

Create `src/content.config.ts` and define a collection using the `loader` function from `notro`.

```typescript
import { defineCollection } from "astro:content";
import { loader } from "notro";

const database = defineCollection({
  loader: loader({
    queryParameters: {
      database_id: import.meta.env.NOTION_DATABASE_ID
    },
    clientOptions: {
      auth: import.meta.env.NOTION_TOKEN
    },
  })
});

export const collections = { database };
```

Then, use the collection in your `.astro` files.

```astro
---
import { getCollection } from "astro:content";
import { NotionBlocks } from "notro";

const collection = await getCollection("database");
const { entry } = Astro.props;
---
<html>
  <body>
    <NotionBlocks blocks={entry[0].data.blocks} />
  </body>
</html>
```

This example gets the first entry from the `database` collection and passes the blocks to the `<NotionBlocks>` component.
Each entry in the collection will have a `data` property with the response from the Notion API.
`<NotionBlocks>` is a component that renders the blocks from the Notion API response.

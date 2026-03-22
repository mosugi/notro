/**
 * Reference implementation: Live Content Collections configuration.
 *
 * This file REPLACES src/content.config.ts in SSR projects.
 * Do NOT use both files simultaneously — they conflict.
 *
 * Setup:
 *   1. Copy this file to src/live.config.ts
 *   2. Delete (or rename) src/content.config.ts
 *   3. Add an SSR adapter and set output: 'server' in astro.config.mjs
 *   4. In pages, use `getLiveCollection` / `getLiveEntry` instead of
 *      `getCollection` / `getEntry`
 *
 * The collection name ("posts") matches the build-time config so all
 * imports using "posts" continue to work after the switch.
 */
import { defineLiveCollection } from "astro:content";
import { liveLoader, notroProperties, pageWithMarkdownSchema } from "notro";
import { z } from "zod";

export const posts = defineLiveCollection({
  loader: liveLoader({
    queryParameters: {
      data_source_id: import.meta.env.NOTION_DATASOURCE_ID,
      sorts: [
        {
          timestamp: "last_edited_time",
          direction: "descending",
        },
      ],
      filter: {
        property: "Public",
        checkbox: {
          equals: true,
        },
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
      Slug: notroProperties.richText.extend({
        rich_text: notroProperties.richText.shape.rich_text.min(1),
      }),
      Tags: notroProperties.multiSelect,
      Date: notroProperties.date,
    }),
  }),
});

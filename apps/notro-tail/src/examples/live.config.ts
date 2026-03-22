/**
 * Reference implementation: Live Content Collections configuration.
 *
 * Copy this file to src/live.config.ts to enable live collections.
 * Defines collections fetched on every request (SSR), unlike build-time content.config.ts.
 *
 * Requirements:
 *   - SSR adapter (e.g. @astrojs/netlify or @astrojs/node)
 *   - output: 'server' in astro.config.mjs (or per-page `prerender = false`)
 *   - Do NOT use the same collection name ("posts") in both content.config.ts
 *     and live.config.ts — they must be distinct to avoid store conflicts.
 *
 * Usage: use getLiveCollection / getLiveEntry in pages with `prerender = false`.
 *
 * See page examples: apps/notro-tail/src/examples/live/
 */
import { defineLiveCollection } from "astro:content";
import { liveLoader, notroProperties, pageWithMarkdownSchema } from "notro";
import { z } from "zod";

// Use a different name from the build-time "posts" collection in content.config.ts
// to avoid conflicts when both configs are present in the same project.
export const livePosts = defineLiveCollection({
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
  // Optional: same Zod schema as the build-time collection for type safety
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

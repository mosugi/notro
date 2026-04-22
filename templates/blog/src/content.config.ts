import { defineCollection } from "astro:content";
import {
  fileLoader,
  loader,
  notroProperties,
  pageWithMarkdownSchema,
} from "notro-loader";
import { z } from "zod";

// Shared schema used by both the Notion and filesystem loaders so that
// downstream pages (`getPlainText(entry.data.properties.Name)` etc.) work
// identically regardless of source.
const postsSchema = pageWithMarkdownSchema.extend({
  properties: z.object({
    Name: notroProperties.title,
    Description: notroProperties.richText,
    Public: notroProperties.checkbox,
    // Require at least one rich_text item so empty slugs are rejected at build time.
    Slug: notroProperties.richText.extend({
      rich_text: notroProperties.richText.shape.rich_text.min(1),
    }),
    Tags: notroProperties.multiSelect,
    Date: notroProperties.date,
  }),
});

// Choose one of the two loaders below. They produce the same shape, so
// the rest of the template (pages, getPlainText, etc.) works unchanged
// regardless of source.
//
// (A) Notion loader — fetches pages from a Notion database.
//     Requires NOTION_TOKEN and NOTION_DATASOURCE_ID(_BLOG) to be set.
// const postsLoader = loader({
//   queryParameters: {
//     data_source_id:
//       import.meta.env.NOTION_DATASOURCE_ID_BLOG ??
//       import.meta.env.NOTION_DATASOURCE_ID,
//     sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
//     filter: { property: "Public", checkbox: { equals: true } },
//   },
//   clientOptions: { auth: import.meta.env.NOTION_TOKEN },
// });
//
// (B) File loader — reads Notion-flavored markdown files from
//     `src/content/posts/`. Each file becomes one entry; frontmatter
//     keys (`title`, `slug`, `description`, `public`, `tags`, `date`,
//     `category`) are mapped to Notion-style properties so the schema
//     above accepts them unchanged.
const postsLoader = fileLoader({ base: "src/content/posts" });

// Silence unused-import warnings for the loader not currently selected.
// Remove the unused import + alias when you pick one for your project.
void loader;

const postsCollection = defineCollection({
  loader: postsLoader,
  schema: postsSchema,
});

export const collections = {
  posts: postsCollection,
};

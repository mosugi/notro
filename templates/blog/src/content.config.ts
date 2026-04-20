import { defineCollection } from "astro:content";
import { loader, notroProperties, pageWithMarkdownSchema } from "notro-loader";
import { z } from "zod";

const NOTION_TOKEN = import.meta.env.NOTION_TOKEN;
const NOTION_DATASOURCE_ID =
  import.meta.env.NOTION_DATASOURCE_ID_BLOG ?? import.meta.env.NOTION_DATASOURCE_ID;

if (!NOTION_TOKEN) {
  throw new Error(
    "NOTION_TOKEN is not set. Copy templates/blog/.env.example to .env and " +
      "fill in your Notion Internal Integration Token " +
      "(https://www.notion.so/my-integrations).",
  );
}
if (!NOTION_DATASOURCE_ID) {
  throw new Error(
    "NOTION_DATASOURCE_ID_BLOG (or NOTION_DATASOURCE_ID) is not set. Set it " +
      "to the data source ID of your Notion database — you can find it in " +
      "the database URL. See templates/blog/.env.example for a template.",
  );
}

const postsCollection = defineCollection({
  loader: loader({
    queryParameters: {
      data_source_id: NOTION_DATASOURCE_ID,
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
      auth: NOTION_TOKEN,
    },
  }),
  schema: pageWithMarkdownSchema.extend({
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
  }),
});

export const collections = {
  posts: postsCollection,
};

import { defineCollection } from "astro:content";
import { loader, notroProperties, pageWithMarkdownSchema } from "notro";
import { z } from "zod";

const postsCollection = defineCollection({
  loader: loader({
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
      Slug: notroProperties.richText,
      Tags: notroProperties.multiSelect,
      Date: notroProperties.date,
    }),
  }),
});

export const collections = {
  posts: postsCollection,
};

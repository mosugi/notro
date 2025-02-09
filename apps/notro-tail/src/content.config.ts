import { defineCollection } from "astro:content";
import { loader, pageObjectSchema } from "notro";
import { LogLevel } from "@notionhq/client";
import { z } from "zod";

const pagesCollection = defineCollection({
  loader: loader({
    queryParameters: {
      database_id: import.meta.env.NOTION_PAGES_ID,
      sorts: [
        {
          property: "Order",
          direction: "ascending",
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
      logLevel: LogLevel.DEBUG,
    },
  }),
  schema: pageObjectSchema.extend({
    properties: z.object({
      Name: z.any(),
      Public: z.any(),
      Slug: z.any(),
      Placement: z.any(),
      Order: z.any(),
    }),
  }),
});

const postsCollection = defineCollection({
  loader: loader({
    queryParameters: {
      database_id: import.meta.env.NOTION_POSTS_ID,
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
      logLevel: LogLevel.DEBUG,
    },
  }),
  schema: pageObjectSchema.extend({
    properties: z.object({
      Name: z.any(),
      Description: z.any(),
      Public: z.any(),
      Slug: z.any(),
      Tags: z.any(),
      Category: z.any(),
      Date: z.any(),
    }),
  }),
});

export const collections = {
  pages: pagesCollection,
  posts: postsCollection,
};

import { defineCollection } from "astro:content";
import {
  checkboxPropertyPageObjectResponseSchema,
  datePropertyPageObjectResponseSchema,
  loader,
  multiSelectPropertyPageObjectResponseSchema,
  numberPropertyPageObjectResponseSchema,
  pageWithMarkdownSchema,
  richTextPropertyPageObjectResponseSchema,
  selectPropertyPageObjectResponseSchema,
  titlePropertyPageObjectResponseSchema,
} from "notro";
import { z } from "zod";

const pagesCollection = defineCollection({
  loader: loader({
    queryParameters: {
      data_source_id: import.meta.env.NOTION_PAGES_ID,
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
    },
  }),
  schema: pageWithMarkdownSchema.extend({
    properties: z.object({
      Page: titlePropertyPageObjectResponseSchema,
      Public: checkboxPropertyPageObjectResponseSchema,
      Slug: richTextPropertyPageObjectResponseSchema,
      Type: multiSelectPropertyPageObjectResponseSchema,
      Order: numberPropertyPageObjectResponseSchema,
      Description: richTextPropertyPageObjectResponseSchema,
    }),
  }),
});

const postsCollection = defineCollection({
  loader: loader({
    queryParameters: {
      data_source_id: import.meta.env.NOTION_POSTS_ID,
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
      Name: titlePropertyPageObjectResponseSchema,
      Description: richTextPropertyPageObjectResponseSchema,
      Public: checkboxPropertyPageObjectResponseSchema,
      Slug: richTextPropertyPageObjectResponseSchema,
      Tags: multiSelectPropertyPageObjectResponseSchema,
      Category: selectPropertyPageObjectResponseSchema,
      Date: datePropertyPageObjectResponseSchema,
    }),
  }),
});

export const collections = {
  pages: pagesCollection,
  posts: postsCollection,
};

import { defineCollection } from "astro:content";
import { loader } from "notro/src/loader/loader.ts";
import { LogLevel } from "@notionhq/client";
import { z } from "astro/zod";

const database = defineCollection({
  loader: loader({
    queryParameters: {
      database_id: import.meta.env.NOTION_ID,
      sorts: [
        {
          timestamp: "last_edited_time",
          direction: "descending",
        },
      ],
    },
    clientOptions: {
      auth: import.meta.env.NOTION_TOKEN,
      logLevel: LogLevel.DEBUG,
    },
  }),
  schema: z.object({
    icon: z.any(),
    cover: z.any(),
    archived: z.boolean(),
    in_trash: z.boolean(),
    url: z.string(),
    public_url: z.string(),
    properties: z.object({
      Page: z.any(),
      Description: z.any(),
      Slug: z.any(),
      Public: z.any(),
      Date: z.any(),
      Type: z.any(),
      Order: z.any(),
    }),
    blocks: z.any(),
  }),
});

export const collections = { database };

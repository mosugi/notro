import { defineCollection } from "astro:content";
import { loader } from "notro/src/loader/loader.ts";
import { LogLevel } from "@notionhq/client";

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
});

export const collections = { database };

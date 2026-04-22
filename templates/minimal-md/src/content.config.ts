import { defineCollection, z } from "astro:content";
import { fileLoader } from "notro-loader";

const pagesCollection = defineCollection({
  loader: fileLoader({ base: "src/content/pages" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().min(1),
    markdown: z.string(),
  }),
});

export const collections = {
  pages: pagesCollection,
};

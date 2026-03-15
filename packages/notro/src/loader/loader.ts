import type { Loader } from "astro/loaders";
import {
  Client,
  isFullPage,
  iteratePaginatedAPI,
} from "@notionhq/client";
import type { QueryDataSourceParameters } from "@notionhq/client";
import {
  type PageWithMarkdownType,
  pageWithMarkdownSchema,
} from "./schema.ts";
import { preprocessNotionMarkdown } from "../markdown/transformer.ts";
import { markdownHasPresignedUrls } from "../utils/notion-url.ts";

type LoaderOptions = {
  queryParameters: QueryDataSourceParameters;
  // Derive from Client constructor to avoid importing from internal paths
  clientOptions: ConstructorParameters<typeof Client>[0];
};

// Notion file-type covers and inline images use pre-signed S3 URLs that expire after ~1 hour.
// If any are present in a cached entry, it must be re-fetched to get fresh URLs.
function hasNotionPresignedUrl(data: PageWithMarkdownType): boolean {
  if (data.cover?.type === "file") return true;
  return markdownHasPresignedUrls(data.markdown);
}

// Define any options that the loader needs
export function loader({
  queryParameters,
  clientOptions,
}: LoaderOptions): Loader {
  const client = new Client(clientOptions);

  // Return a loader object
  return {
    name: "notro-loader",
    load: async ({ store, parseData, logger }): Promise<void> => {
      // Load data and update the store
      const pageOrDatabases = await Array.fromAsync(
        iteratePaginatedAPI(client.dataSources.query, queryParameters),
      );

      const pages = pageOrDatabases.filter((page) => isFullPage(page));

      // Build a lookup map for O(1) access when checking store entries
      const pageById = new Map(pages.map((page) => [page.id, page]));

      // Delete entries that are removed, edited, or contain expired pre-signed URLs
      store.entries().forEach(([id, { digest, data }]) => {
        const page = pageById.get(id);
        const isDeleted = page === undefined;
        const isEdited = page !== undefined && digest !== page.last_edited_time;
        const hasExpiredUrls = hasNotionPresignedUrl(
          data as PageWithMarkdownType,
        );
        if (isDeleted || isEdited || hasExpiredUrls) {
          logger.info(`Deleting page ${id} from store`);
          store.delete(id);
        }
      });

      // Load new or updated pages, respecting Notion's 3 requests/second rate limit.
      // Pages are processed in batches of 3 with a 1-second pause between batches.
      const pagesToLoad = pages.filter((page) => !store.has(page.id));
      const BATCH_SIZE = 3;

      for (let i = 0; i < pagesToLoad.length; i += BATCH_SIZE) {
        const batch = pagesToLoad.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (page) => {
            logger.info(`Loading page ${page.id} into store`);

            const markdownResponse = await client.pages.retrieveMarkdown({
              page_id: page.id,
            });

            if (markdownResponse.truncated) {
              // TODO: handle truncated markdown (paginated retrieval)
              logger.warn(`Page ${page.id} markdown was truncated`);
            }

            // Preprocess the markdown to fix Notion-specific syntax issues before
            // storing. NotionMarkdownRenderer calls compileMdxCached() which runs
            // evaluate() on this already-preprocessed markdown.
            const preprocessedMarkdown = preprocessNotionMarkdown(
              markdownResponse.markdown
            );

            const data = await parseData<PageWithMarkdownType>({
              id: page.id,
              data: {
                parent: page.parent,
                properties: page.properties,
                icon: page.icon,
                cover: page.cover,
                created_by: page.created_by,
                last_edited_by: page.last_edited_by,
                object: page.object,
                id: page.id,
                created_time: page.created_time,
                last_edited_time: page.last_edited_time,
                archived: page.archived,
                in_trash: page.in_trash,
                url: page.url,
                public_url: page.public_url,
                markdown: preprocessedMarkdown,
              } as PageWithMarkdownType,
            });

            store.set({
              id: page.id,
              digest: page.last_edited_time,
              data: data,
              body: preprocessedMarkdown,
            });
          })
        );

        // Wait 1 second between batches to stay within the 3 req/s rate limit
        if (i + BATCH_SIZE < pagesToLoad.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    },
    // It will be overridden by user-defined schema.
    schema: pageWithMarkdownSchema,
  };
}

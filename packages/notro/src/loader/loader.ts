import type { Loader } from "astro/loaders";
import {
  Client,
  isFullPage,
  iteratePaginatedAPI,
  APIErrorCode,
  APIResponseError,
} from "@notionhq/client";
import type { QueryDataSourceParameters } from "@notionhq/client";
import {
  type PageWithMarkdownType,
  pageWithMarkdownSchema,
} from "./schema.ts";
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

// Error codes that are safe to retry (rate limit, server errors).
const RETRYABLE_API_ERROR_CODES: ReadonlySet<string> = new Set([
  APIErrorCode.RateLimited,
  APIErrorCode.InternalServerError,
  APIErrorCode.ServiceUnavailable,
]);

// Retry delays in milliseconds for each attempt (exponential backoff: 1s, 2s, 4s).
const RETRY_DELAYS_MS = [1000, 2000, 4000];

/**
 * Calls client.pages.retrieveMarkdown with retry logic for transient errors.
 * - 429 (RateLimited), 500 (InternalServerError), 503 (ServiceUnavailable): retry up to 3 times
 *   with exponential backoff (1s / 2s / 4s).
 * - Other errors: re-thrown immediately.
 */
async function retrieveMarkdownWithRetry(
  client: Client,
  pageId: string,
  logger: { warn: (msg: string) => void },
): Promise<Awaited<ReturnType<typeof client.pages.retrieveMarkdown>>> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await client.pages.retrieveMarkdown({ page_id: pageId });
    } catch (error) {
      lastError = error;

      const isRetryable =
        error instanceof APIResponseError &&
        RETRYABLE_API_ERROR_CODES.has(error.code);

      if (!isRetryable || attempt === RETRY_DELAYS_MS.length) {
        throw error;
      }

      const delayMs = RETRY_DELAYS_MS[attempt];
      logger.warn(
        `Page ${pageId}: API error "${error.code}" (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length + 1}), retrying in ${delayMs}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Unreachable, but required for TypeScript exhaustiveness.
  throw lastError;
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

            let markdownResponse: Awaited<
              ReturnType<typeof client.pages.retrieveMarkdown>
            >;

            try {
              markdownResponse = await retrieveMarkdownWithRetry(
                client,
                page.id,
                logger,
              );
            } catch (error) {
              // Skip this page rather than aborting the entire build.
              if (error instanceof APIResponseError) {
                logger.warn(
                  `Page ${page.id}: failed to retrieve markdown (${error.code}, status ${error.status}). Skipping.`,
                );
              } else {
                logger.warn(
                  `Page ${page.id}: unexpected error while retrieving markdown: ${String(error)}. Skipping.`,
                );
              }
              return;
            }

            if (markdownResponse.truncated) {
              // The Notion pages.retrieveMarkdown API does not support cursor-based
              // pagination, so the full content cannot be retrieved in multiple requests.
              // The page will be loaded with the truncated content available.
              // Consider splitting large Notion pages into smaller ones to avoid truncation.
              logger.warn(
                `Page ${page.id}: markdown content was truncated by the Notion API. ` +
                  `The page content may be too large. ` +
                  `Consider splitting this Notion page into smaller pages to avoid truncation.`,
              );
            }

            // Store raw markdown from the Notion API.
            // remarkNfm in the MDX compile pipeline (compile-mdx.ts) runs
            // preprocessNotionMarkdown() at parse time, so preprocessing
            // does not need to happen here.
            const rawMarkdown = markdownResponse.markdown;

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
                markdown: rawMarkdown,
              } as PageWithMarkdownType,
            });

            store.set({
              id: page.id,
              // digest is used by the loader to detect edits between builds.
              // We use last_edited_time as a stable, string-comparable digest.
              digest: page.last_edited_time,
              data: data,
              // body is the raw text exposed by Astro's Content Layer API for
              // full-text search integrations. It is separate from data.markdown
              // (which is also the raw markdown) because Astro's store.set()
              // requires body to be a top-level field distinct from the schema data.
              body: rawMarkdown,
            });
          }),
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

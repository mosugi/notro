import type { LiveLoader } from "astro/loaders";
import {
  Client,
  isFullPage,
  iteratePaginatedAPI,
  APIErrorCode,
  APIResponseError,
} from "@notionhq/client";
import type { QueryDataSourceParameters } from "@notionhq/client";
import { type PageWithMarkdownType } from "./schema.ts";

type LiveLoaderOptions = {
  queryParameters: QueryDataSourceParameters;
  // Derive from Client constructor to avoid importing from internal paths
  clientOptions: ConstructorParameters<typeof Client>[0];
};

// Error codes that are safe to retry (rate limit, server errors).
const RETRYABLE_API_ERROR_CODES: ReadonlySet<string> = new Set([
  APIErrorCode.RateLimited,
  APIErrorCode.InternalServerError,
  APIErrorCode.ServiceUnavailable,
]);

// Retry delays in milliseconds for each attempt (exponential backoff: 1s, 2s, 4s).
const RETRY_DELAYS_MS = [1000, 2000, 4000];

/**
 * Generic retry wrapper for Notion API calls.
 * Retries on 429/500/503 up to 3 times with exponential backoff.
 * Other errors are re-thrown immediately.
 */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isRetryable =
        error instanceof APIResponseError &&
        RETRYABLE_API_ERROR_CODES.has(error.code);

      if (!isRetryable || attempt === RETRY_DELAYS_MS.length) {
        throw error;
      }

      const delayMs = RETRY_DELAYS_MS[attempt];
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

/**
 * Fetches the markdown for a page and maps it onto the page object.
 * Returns null if the page could not be retrieved.
 */
async function fetchPageWithMarkdown(
  client: Client,
  page: Awaited<ReturnType<typeof client.pages.retrieve>>,
): Promise<PageWithMarkdownType | null> {
  if (!isFullPage(page)) {
    return null;
  }

  let markdownResponse: Awaited<ReturnType<typeof client.pages.retrieveMarkdown>>;
  try {
    markdownResponse = await withRetry(() =>
      client.pages.retrieveMarkdown({ page_id: page.id }),
    );
  } catch {
    return null;
  }

  return {
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
    archived: page.archived ?? false,
    in_trash: page.in_trash ?? false,
    url: page.url,
    public_url: page.public_url,
    markdown: markdownResponse.markdown,
    truncated: markdownResponse.truncated,
  };
}

/**
 * Live content loader for Notion pages.
 *
 * Unlike the build-time `loader`, this loader fetches content on every request.
 * Use it with `defineLiveCollection()` in `src/live.config.ts` for SSR pages
 * that need up-to-date Notion content without rebuilding.
 *
 * @example
 * ```ts
 * // src/live.config.ts
 * import { defineLiveCollection } from "astro:content";
 * import { liveLoader } from "notro";
 *
 * export const posts = defineLiveCollection({
 *   loader: liveLoader({
 *     queryParameters: { data_source_id: import.meta.env.NOTION_DATASOURCE_ID },
 *     clientOptions: { auth: import.meta.env.NOTION_TOKEN },
 *   }),
 * });
 * ```
 */
export function liveLoader({
  queryParameters,
  clientOptions,
}: LiveLoaderOptions): LiveLoader<PageWithMarkdownType> {
  const client = new Client({ notionVersion: "2026-03-11", ...clientOptions });

  return {
    name: "notro-live-loader",

    async loadCollection() {
      let pages: Awaited<ReturnType<typeof client.pages.retrieve>>[];
      try {
        const results = await withRetry(() =>
          Array.fromAsync(
            iteratePaginatedAPI(client.dataSources.query, queryParameters),
          ),
        );
        pages = results.filter((p) => isFullPage(p));
      } catch (error) {
        return { error: error instanceof Error ? error : new Error(String(error)) };
      }

      const entries = (
        await Promise.all(pages.map((page) => fetchPageWithMarkdown(client, page)))
      ).filter((entry): entry is PageWithMarkdownType => entry !== null);

      return {
        entries: entries.map((data) => ({
          id: data.id,
          data,
          cacheHint: {
            lastModified: new Date(data.last_edited_time),
            tags: [data.id],
          },
        })),
      };
    },

    async loadEntry({ filter: { id } }) {
      let page: Awaited<ReturnType<typeof client.pages.retrieve>>;
      try {
        page = await withRetry(() => client.pages.retrieve({ page_id: id }));
      } catch (error) {
        return { error: error instanceof Error ? error : new Error(String(error)) };
      }

      const data = await fetchPageWithMarkdown(client, page);
      if (!data) {
        return undefined;
      }

      return {
        id: data.id,
        data,
        cacheHint: {
          lastModified: new Date(data.last_edited_time),
          tags: [data.id],
        },
      };
    },
  };
}

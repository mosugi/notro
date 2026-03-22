import type { LiveLoader } from "astro/loaders";
import {
  Client,
  isFullPage,
  iteratePaginatedAPI,
  APIErrorCode,
  APIResponseError,
} from "@notionhq/client";
import type { QueryDataSourceParameters } from "@notionhq/client";
import type { PageWithMarkdownType } from "./schema.ts";

type LiveLoaderOptions = {
  queryParameters: QueryDataSourceParameters;
  clientOptions: ConstructorParameters<typeof Client>[0];
};

// Error codes that are safe to retry (rate limit, server errors).
const RETRYABLE_API_ERROR_CODES: ReadonlySet<string> = new Set([
  APIErrorCode.RateLimited,
  APIErrorCode.InternalServerError,
  APIErrorCode.ServiceUnavailable,
]);

const RETRY_DELAYS_MS = [1000, 2000, 4000];

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
      if (!isRetryable || attempt === RETRY_DELAYS_MS.length) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAYS_MS[attempt]),
      );
    }
  }
  throw lastError;
}

function pageToData(
  page: ReturnType<typeof isFullPage> extends boolean
    ? Parameters<typeof isFullPage>[0]
    : never,
  markdown: string,
  truncated: boolean,
): PageWithMarkdownType | undefined {
  if (!isFullPage(page)) return undefined;
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
    archived: page.archived,
    in_trash: page.in_trash,
    url: page.url,
    public_url: page.public_url,
    markdown,
    truncated,
  } as PageWithMarkdownType;
}

/**
 * Astro LiveLoader for Notion — fetches content from the Notion API at
 * request time instead of build time. Use this in `src/live.config.ts`
 * with `defineLiveCollection`. Requires a server adapter (e.g. @astrojs/vercel).
 *
 * Performance design:
 * - `loadCollection` fetches page metadata only (no markdown) for fast list views.
 *   The `markdown` field is set to `""` on collection entries.
 * - `loadEntry` fetches a single page with its full markdown content.
 */
export function liveLoader({
  queryParameters,
  clientOptions,
}: LiveLoaderOptions): LiveLoader<PageWithMarkdownType> {
  const client = new Client({ notionVersion: "2026-03-11", ...clientOptions });

  return {
    name: "notro-live-loader",

    // Fetches one page with full markdown content.
    async loadEntry({ filter }) {
      const page = await withRetry(() =>
        client.pages.retrieve({ page_id: filter.id }),
      );
      if (!isFullPage(page)) return undefined;

      const mdResponse = await withRetry(() =>
        client.pages.retrieveMarkdown({ page_id: filter.id }),
      );

      const data = pageToData(page, mdResponse.markdown, mdResponse.truncated);
      if (!data) return undefined;
      return { id: page.id, data };
    },

    // Fetches page metadata for all entries — no markdown to stay fast.
    // Use loadEntry to get the full content of an individual page.
    async loadCollection() {
      const pagesOrDatabases = await withRetry(() =>
        Array.fromAsync(
          iteratePaginatedAPI(client.dataSources.query, queryParameters),
        ),
      );

      const entries = pagesOrDatabases
        .filter(isFullPage)
        .map((page) => {
          const data = pageToData(page, "", false);
          if (!data) return null;
          return { id: page.id, data };
        })
        .filter((e): e is { id: string; data: PageWithMarkdownType } => e !== null);

      return { entries };
    },
  };
}

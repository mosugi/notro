import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Loader, ParseDataOptions } from "astro/loaders";
import {
  Client,
  isFullPage,
  iteratePaginatedAPI,
} from "@notionhq/client";
import type { ClientOptions } from "@notionhq/client/build/src/Client";
import type {
  QueryDataSourceParameters,
} from "@notionhq/client/build/src/api-endpoints";
import {
  type PageWithMarkdownType,
  pageWithMarkdownSchema,
} from "./schema.ts";
import { preprocessNotionMarkdown } from "../markdown/transformer.ts";

type LoaderOptions = {
  queryParameters: QueryDataSourceParameters;
  clientOptions: ClientOptions;
};

// Notion file-type covers and inline images use pre-signed S3 URLs that expire after ~1 hour.
// If any are present in a cached entry, it must be re-fetched to get fresh URLs.
function hasNotionPresignedUrl(data: PageWithMarkdownType): boolean {
  if (data.cover?.type === "file") return true;
  return /X-Amz-Algorithm|prod-files-secure\.s3/.test(data.markdown);
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
    load: async ({ store, parseData, logger, config }): Promise<void> => {
      // Load data and update the store
      const pageOrDatabases = await Array.fromAsync(
        iteratePaginatedAPI(client.dataSources.query, queryParameters),
      );

      const pages = pageOrDatabases.filter((page) => isFullPage(page));

      // Delete entries that are removed, edited, or contain expired pre-signed URLs
      store.entries().forEach(([id, { digest, data }]) => {
        const isDeleted = !pages.some((page) => page.id === id);
        const isEdited = pages.some(
          (page) => page.id === id && digest !== page.last_edited_time,
        );
        const hasExpiredUrls = hasNotionPresignedUrl(
          data as PageWithMarkdownType,
        );
        if (isDeleted || isEdited || hasExpiredUrls) {
          logger.info(`Deleting page ${id} from store`);
          store.delete(id);
        }
      });

      // Prepare cache directory for preprocessed markdown files.
      // Using .md extension so Astro routes them through the standard markdown
      // pipeline (notroMarkdownConfig) rather than MDX, which would parse
      // Notion's raw HTML output (columns, toggles, page links, etc.) as JSX
      // and break the custom rehype plugins that rely on hast element nodes.
      const cacheDir = join(
        fileURLToPath(new URL(".astro/cache/notro-md", config.root)),
      );
      mkdirSync(cacheDir, { recursive: true });

      // Load new or updated pages
      const loadPageMarkdownPromises = pages
        .filter((page) => !store.has(page.id))
        .map(async (page) => {
          // Skip if digest is unchanged (should not happen due to the delete step above,
          // but kept as a safety net in case of concurrent builds or race conditions)
          const existing = store.get(page.id);
          if (existing?.digest === page.last_edited_time) return;

          logger.info(`Loading page ${page.id} into store`);

          const markdownResponse = await client.pages.retrieveMarkdown({
            page_id: page.id,
          });

          if (markdownResponse.truncated) {
            // TODO: handle truncated markdown (paginated retrieval)
            logger.warn(`Page ${page.id} markdown was truncated`);
          }

          // Preprocess the markdown to fix Notion-specific syntax issues before
          // storing. This ensures both entry.render() (via notroMarkdownConfig)
          // and NotionMarkdownRenderer see corrected markdown.
          // Note: transformNotionMarkdown() also calls preprocessNotionMarkdown()
          // internally, but each transformation is idempotent so double-processing
          // is safe. The markdown stored here is already preprocessed.
          const preprocessedMarkdown = preprocessNotionMarkdown(
            markdownResponse.markdown
          );

          // Write preprocessed markdown to a .md file in the build cache directory.
          // This enables deferredRender so Astro processes it through the standard
          // markdown pipeline (notroMarkdownConfig), which allows Vercel to cache
          // the rendered output across builds.
          const mdPath = join(cacheDir, `${page.id}.md`);
          writeFileSync(mdPath, preprocessedMarkdown, "utf-8");

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
            filePath: `.astro/cache/notro-md/${page.id}.md`,
            deferredRender: true,
          });
        });

      //FIXME use p-queue and Retry for 3rps limit
      await Promise.all(loadPageMarkdownPromises);
    },
    // It will be overridden by user-defined schema.
    schema: pageWithMarkdownSchema,
  };
}

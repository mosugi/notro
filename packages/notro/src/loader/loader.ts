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
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
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

      // Prepare the cache directory for MDX files
      const rootDir = fileURLToPath(config.root);
      const cacheDir = join(rootDir, ".astro/cache/notro-mdx");
      mkdirSync(cacheDir, { recursive: true });

      // The in-memory moduleImports map is rebuilt from scratch on each build.
      // Re-register module imports for all cached entries so that Astro can
      // resolve deferred renders even when store.set() is skipped (digest match).
      store.entries().forEach(([, entry]) => {
        if (entry.deferredRender && entry.filePath) {
          store.addModuleImport(entry.filePath);
        }
      });

      // Load new or updated pages (also re-fetch if the MDX file is missing on disk)
      const loadPageMarkdownPromises = pages
        .filter((page) => {
          if (!store.has(page.id)) return true;
          // MDX file may be missing if the cache dir was cleared without clearing
          // the data store. Re-fetch so the file exists for deferred rendering.
          const mdxPath = join(cacheDir, `${page.id}.mdx`);
          return !existsSync(mdxPath);
        })
        .map(async (page) => {
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

          // Write the preprocessed markdown as an MDX file so Astro can use
          // deferredRender: true (enabling Vercel build cache for MDX output).
          const mdxPath = join(cacheDir, `${page.id}.mdx`);
          writeFileSync(mdxPath, preprocessedMarkdown, "utf-8");

          // Store the file path relative to the site root (posix separators)
          // as required by Astro's content store API.
          const relativeMdxPath = relative(rootDir, mdxPath).replace(/\\/g, "/");

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
            filePath: relativeMdxPath,
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

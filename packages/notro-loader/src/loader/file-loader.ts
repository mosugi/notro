import type { Loader, LoaderContext } from "astro/loaders";
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, relative, resolve, sep, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import {
  type PageWithMarkdownType,
  type PropertyPageObjectResponseType,
  pageWithMarkdownSchema,
} from "./schema.ts";

/**
 * Frontmatter keys with built-in mapping to Notion-like properties.
 * Any other keys are ignored by the default mapper; use `transform`
 * to project them into `properties` explicitly.
 */
interface StandardFrontmatter {
  title?: string;
  slug?: string;
  description?: string;
  public?: boolean;
  tags?: string[];
  category?: string;
  date?: string;
}

type Frontmatter = StandardFrontmatter & Record<string, unknown>;

interface FileLoaderOptions {
  /**
   * Base directory (relative to the Astro project root) containing
   * `.md` / `.mdx` files to load. Scanned recursively.
   */
  base: string;
  /**
   * File extensions to include (leading dot required).
   * @default [".md", ".mdx"]
   */
  extensions?: string[];
  /**
   * Custom entry ID generator. Defaults to the frontmatter `slug`,
   * or the filename (without extension) if no slug is defined.
   */
  generateId?: (args: {
    filePath: string;
    relativePath: string;
    frontmatter: Frontmatter;
  }) => string;
  /**
   * Optional hook to customize the Notion-style `properties` record
   * built from frontmatter. The default mapper covers title/slug/
   * description/public/tags/category/date; return a merged record
   * to add your own properties.
   *
   * @example
   * transform: ({ frontmatter, defaultProperties }) => ({
   *   ...defaultProperties,
   *   Author: {
   *     type: "rich_text",
   *     id: "Author",
   *     rich_text: [richText(String(frontmatter.author ?? ""))],
   *   },
   * })
   */
  transform?: (args: {
    filePath: string;
    relativePath: string;
    frontmatter: Frontmatter;
    defaultProperties: Record<string, PropertyPageObjectResponseType>;
  }) => Record<string, PropertyPageObjectResponseType>;
}

const DEFAULT_EXTENSIONS = [".md", ".mdx"] as const;

/**
 * Parses YAML frontmatter at the start of a markdown document.
 * Returns `{ frontmatter: {}, body: contents }` if no frontmatter block is present.
 */
function parseFrontmatter(contents: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: contents };

  const parsed = parseYaml(match[1]) as unknown;
  const frontmatter =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Frontmatter)
      : {};
  return { frontmatter, body: match[2] };
}

function toTitleCase(stem: string): string {
  return stem
    .replace(/^\d+[-_]/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function richTextItem(content: string): {
  type: "text";
  text: { content: string; link: null };
  annotations: {
    bold: false;
    italic: false;
    strikethrough: false;
    underline: false;
    code: false;
    color: "default";
  };
  plain_text: string;
  href: null;
} {
  return {
    type: "text",
    text: { content, link: null },
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
    },
    plain_text: content,
    href: null,
  };
}

function titleProperty(
  value: string,
): Extract<PropertyPageObjectResponseType, { type: "title" }> {
  return {
    type: "title",
    id: "Name",
    title: value ? [richTextItem(value)] : [],
  };
}

function richTextProperty(
  id: string,
  value: string | undefined,
): Extract<PropertyPageObjectResponseType, { type: "rich_text" }> {
  return {
    type: "rich_text",
    id,
    rich_text: value ? [richTextItem(value)] : [],
  };
}

function checkboxProperty(
  id: string,
  value: boolean,
): Extract<PropertyPageObjectResponseType, { type: "checkbox" }> {
  return { type: "checkbox", id, checkbox: value };
}

function multiSelectProperty(
  id: string,
  values: readonly string[],
): Extract<PropertyPageObjectResponseType, { type: "multi_select" }> {
  return {
    type: "multi_select",
    id,
    multi_select: values.map((name) => ({
      id: name,
      name,
      color: "default",
    })),
  };
}

function selectProperty(
  id: string,
  value: string | undefined,
): Extract<PropertyPageObjectResponseType, { type: "select" }> {
  return {
    type: "select",
    id,
    select: value ? { id: value, name: value, color: "default" } : null,
  };
}

function dateProperty(
  id: string,
  value: string | undefined,
): Extract<PropertyPageObjectResponseType, { type: "date" }> {
  return {
    type: "date",
    id,
    date: value ? { start: value, end: null, time_zone: null } : null,
  };
}

/**
 * Builds the default `properties` record from standard frontmatter keys.
 * Only keys present in the frontmatter are materialized, except for
 * `Name` (always present so the title property is well-formed) and
 * `Public` (defaults to `true` when omitted so opt-out is explicit).
 */
function buildDefaultProperties(
  frontmatter: Frontmatter,
  fallbackTitle: string,
): Record<string, PropertyPageObjectResponseType> {
  const properties: Record<string, PropertyPageObjectResponseType> = {};

  const title =
    typeof frontmatter.title === "string" ? frontmatter.title : fallbackTitle;
  properties.Name = titleProperty(title);

  if (typeof frontmatter.slug === "string") {
    properties.Slug = richTextProperty("Slug", frontmatter.slug);
  }

  if (typeof frontmatter.description === "string") {
    properties.Description = richTextProperty(
      "Description",
      frontmatter.description,
    );
  }

  const publicValue =
    typeof frontmatter.public === "boolean" ? frontmatter.public : true;
  properties.Public = checkboxProperty("Public", publicValue);

  if (Array.isArray(frontmatter.tags)) {
    const names = frontmatter.tags.filter(
      (t): t is string => typeof t === "string",
    );
    properties.Tags = multiSelectProperty("Tags", names);
  }

  if (typeof frontmatter.category === "string") {
    properties.Category = selectProperty("Category", frontmatter.category);
  }

  if (typeof frontmatter.date === "string") {
    properties.Date = dateProperty("Date", frontmatter.date);
  }

  return properties;
}

async function collectMarkdownFiles(
  absBase: string,
  extensions: readonly string[],
): Promise<string[]> {
  const results: string[] = [];
  const extSet = new Set(extensions.map((e) => e.toLowerCase()));

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && extSet.has(extname(entry.name).toLowerCase())) {
        results.push(full);
      }
    }
  }

  if (!existsSync(absBase)) return results;
  await walk(absBase);
  return results.sort();
}

/**
 * Astro Content Loader that reads Notion-flavored markdown files from
 * the local filesystem. Each `.md` / `.mdx` file becomes one collection
 * entry; the file body is stored as the `markdown` field so that
 * `<NotroContent>` can render it through the same MDX pipeline as
 * Notion-sourced entries.
 *
 * The loader builds a Notion-style `properties` record from standard
 * frontmatter keys (`title`, `slug`, `description`, `public`, `tags`,
 * `category`, `date`), making it schema-compatible with the Notion
 * `loader()` so the same templates and pages work for both sources.
 *
 * @example
 * ```ts
 * // src/content.config.ts
 * import { defineCollection } from "astro:content";
 * import { fileLoader, pageWithMarkdownSchema, notroProperties } from "notro-loader";
 * import { z } from "zod";
 *
 * export const collections = {
 *   posts: defineCollection({
 *     loader: fileLoader({ base: "src/content/posts" }),
 *     schema: pageWithMarkdownSchema.extend({
 *       properties: z.object({
 *         Name: notroProperties.title,
 *         Slug: notroProperties.richText,
 *         Public: notroProperties.checkbox,
 *         Tags: notroProperties.multiSelect,
 *         Date: notroProperties.date,
 *       }),
 *     }),
 *   }),
 * };
 * ```
 */
export function fileLoader({
  base,
  extensions = [...DEFAULT_EXTENSIONS],
  generateId,
  transform,
}: FileLoaderOptions): Loader {
  const fileToIdMap = new Map<string, string>();

  return {
    name: "notro-file-loader",
    load: async ({
      store,
      parseData,
      logger,
      watcher,
      config,
      generateDigest,
    }: LoaderContext): Promise<void> => {
      const rootPath = fileURLToPath(config.root);
      const absBase = resolve(rootPath, base);

      if (!existsSync(absBase)) {
        logger.warn(
          `fileLoader: base directory "${base}" does not exist (resolved to ${absBase}).`,
        );
      }

      const untouchedEntries = new Set(store.keys());

      const processFile = async (filePath: string): Promise<void> => {
        let contents: string;
        try {
          contents = await readFile(filePath, "utf-8");
        } catch (error) {
          logger.warn(
            `fileLoader: failed to read ${filePath}: ${String(error)}`,
          );
          return;
        }

        let frontmatter: Frontmatter;
        let body: string;
        try {
          ({ frontmatter, body } = parseFrontmatter(contents));
        } catch (error) {
          logger.warn(
            `fileLoader: failed to parse frontmatter in ${filePath}: ${String(error)}`,
          );
          return;
        }

        const relPath = relative(rootPath, filePath).split(sep).join(posix.sep);
        const stem = filePath
          .split(sep)
          .pop()!
          .replace(/\.(md|mdx)$/i, "");

        const fallbackTitle = toTitleCase(stem);
        const defaultProperties = buildDefaultProperties(
          frontmatter,
          fallbackTitle,
        );
        const properties = transform
          ? transform({
              filePath,
              relativePath: relPath,
              frontmatter,
              defaultProperties,
            })
          : defaultProperties;

        const id = generateId
          ? generateId({
              filePath,
              relativePath: relPath,
              frontmatter,
            })
          : typeof frontmatter.slug === "string" && frontmatter.slug.length > 0
            ? frontmatter.slug
            : stem;

        let fileStat: Awaited<ReturnType<typeof stat>>;
        try {
          fileStat = await stat(filePath);
        } catch (error) {
          logger.warn(
            `fileLoader: failed to stat ${filePath}: ${String(error)}`,
          );
          return;
        }

        const createdTime = fileStat.birthtime.toISOString();
        const lastEditedTime = fileStat.mtime.toISOString();
        const digest = generateDigest(contents);

        // Skip re-writing unchanged entries.
        const existing = store.get(id);
        untouchedEntries.delete(id);
        const previousPath = fileToIdMap.get(filePath);
        if (previousPath && previousPath !== id) {
          store.delete(previousPath);
        }
        fileToIdMap.set(filePath, id);

        if (existing && existing.digest === digest) {
          return;
        }

        const data: PageWithMarkdownType = {
          parent: { type: "workspace", workspace: true },
          properties,
          icon: null,
          cover: null,
          created_by: { id, object: "user" },
          last_edited_by: { id, object: "user" },
          object: "page",
          id,
          created_time: createdTime,
          last_edited_time: lastEditedTime,
          archived: false,
          in_trash: false,
          url: `file://${filePath}`,
          public_url: null,
          markdown: body,
          truncated: false,
        };

        let parsedData: PageWithMarkdownType;
        try {
          parsedData = await parseData<PageWithMarkdownType>({
            id,
            data,
            filePath,
          });
        } catch (error) {
          logger.warn(
            `fileLoader: schema validation failed for ${relPath}: ${String(error)}`,
          );
          return;
        }

        store.set({
          id,
          digest,
          data: parsedData,
          body,
          filePath: relPath,
        });
      };

      const files = await collectMarkdownFiles(absBase, extensions);
      await Promise.all(files.map((f) => processFile(f)));

      // Remove entries that no longer have a backing file.
      untouchedEntries.forEach((id) => {
        store.delete(id);
        for (const [path, storedId] of fileToIdMap) {
          if (storedId === id) {
            fileToIdMap.delete(path);
            break;
          }
        }
      });

      if (!watcher) return;

      watcher.add(absBase);

      const shouldWatch = (changedPath: string): boolean => {
        if (!changedPath.startsWith(absBase + sep) && changedPath !== absBase) {
          return false;
        }
        return extensions.some((ext) =>
          changedPath.toLowerCase().endsWith(ext.toLowerCase()),
        );
      };

      const onChange = async (changedPath: string): Promise<void> => {
        if (!shouldWatch(changedPath)) return;
        try {
          await processFile(changedPath);
          const relPath = relative(rootPath, changedPath)
            .split(sep)
            .join(posix.sep);
          logger.info(`Reloaded ${relPath}`);
        } catch (error) {
          logger.error(
            `fileLoader: failed to reload ${changedPath}: ${String(error)}`,
          );
        }
      };

      watcher.on("change", onChange);
      watcher.on("add", onChange);
      watcher.on("unlink", (deletedPath: string) => {
        if (!shouldWatch(deletedPath)) return;
        const id = fileToIdMap.get(deletedPath);
        if (id) {
          store.delete(id);
          fileToIdMap.delete(deletedPath);
        }
      });
    },
    schema: pageWithMarkdownSchema,
  };
}

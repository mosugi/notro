import type { Loader, LoaderContext } from "astro/loaders";
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, relative, resolve, sep, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { z } from "astro/zod";

/**
 * Frontmatter is parsed as an arbitrary record; the loader does not
 * interpret any specific keys. Use the collection `schema` to narrow
 * the shape, mirroring Astro's built-in `glob` loader.
 */
type Frontmatter = Record<string, unknown>;

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
    stem: string;
  }) => string;
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
 * Astro Content Loader that reads markdown (and MDX) files from the
 * local filesystem. Each `.md` / `.mdx` file under the configured
 * `base` directory becomes one collection entry.
 *
 * The data for each entry is the parsed YAML frontmatter spread as-is,
 * plus a `markdown` field containing the body so that `<NotroContent>`
 * can render it through the same MDX pipeline as Notion-sourced entries.
 * No frontmatter keys are interpreted specially — define the shape you
 * want via the collection's `schema`, same as Astro's built-in `glob`
 * loader.
 *
 * @example
 * ```ts
 * // src/content.config.ts
 * import { defineCollection, z } from "astro:content";
 * import { fileLoader } from "notro-loader";
 *
 * export const collections = {
 *   posts: defineCollection({
 *     loader: fileLoader({ base: "src/content/posts" }),
 *     schema: z.object({
 *       title: z.string(),
 *       slug: z.string(),
 *       date: z.coerce.date().optional(),
 *       markdown: z.string(),
 *     }),
 *   }),
 * };
 * ```
 */
export function fileLoader({
  base,
  extensions = [...DEFAULT_EXTENSIONS],
  generateId,
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

        const id = generateId
          ? generateId({
              filePath,
              relativePath: relPath,
              frontmatter,
              stem,
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

        // Expose a couple of filesystem-derived timestamps so schemas
        // that want them (e.g. for sorting) can pick them up without
        // parsing the frontmatter themselves. These are overridable if
        // the frontmatter already defines the same keys.
        const data: Frontmatter = {
          createdTime: fileStat.birthtime.toISOString(),
          lastEditedTime: fileStat.mtime.toISOString(),
          ...frontmatter,
          markdown: body,
        };

        let parsedData: Record<string, unknown>;
        try {
          parsedData = await parseData<Record<string, unknown>>({
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
    // Default schema: require `markdown`, allow any other frontmatter keys
    // through. Override by setting `schema` on the collection.
    schema: z.object({ markdown: z.string() }).passthrough(),
  };
}

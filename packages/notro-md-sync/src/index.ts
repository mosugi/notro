#!/usr/bin/env node
/**
 * notro-md-sync
 *
 * Syncs local markdown files to a Notion data source.
 * Reads YAML frontmatter (slug, title) from each .md file;
 * falls back to filename-derived values if frontmatter is absent.
 * The frontmatter block is stripped before sending content to Notion.
 *
 * Usage:
 *   notro-md-sync <dir> [options]
 *
 * Arguments:
 *   <dir>              Directory containing .md files to sync
 *
 * Options:
 *   --token <token>    Notion API token (default: NOTION_TOKEN env var)
 *   --db <id>          Notion data source ID (default: NOTION_DATASOURCE_ID env var)
 *   --dry-run          Preview changes without making any API calls
 *   --force            Archive existing pages and recreate from source
 *   --filter <prefix>  Process only files whose name starts with <prefix>
 *   -h, --help         Show this help message
 *
 * Page properties set for each file:
 *   Name     — title from frontmatter, or "[title-cased filename]"
 *   Slug     — slug from frontmatter, or filename-without-ext
 *   Public   — false (pages are not published automatically)
 *   Tags     — ["md-sync"]
 *   Date     — today's date (ISO 8601)
 */

import { Client, iteratePaginatedAPI } from "@notionhq/client";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, basename, extname } from "node:path";

// ---------------------------------------------------------------------------
// HTTPS proxy support
// Node.js does not honor the system https_proxy env var by default; undici
// (the HTTP client used by @notionhq/client) requires explicit dispatcher
// configuration.
// ---------------------------------------------------------------------------
const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
if (httpsProxy) {
  const { ProxyAgent, setGlobalDispatcher } = await import("undici");
  setGlobalDispatcher(new ProxyAgent(httpsProxy));
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MarkdownFile {
  /** Slug for the Notion page's Slug property */
  slug: string;
  /** Title for the Notion page's Name property */
  title: string;
  /** Markdown content with frontmatter stripped */
  markdown: string;
  /** Original filename without extension */
  name: string;
}

interface Frontmatter {
  slug?: string;
  title?: string;
  [key: string]: string | undefined;
}

// ---------------------------------------------------------------------------
// Frontmatter parsing
// ---------------------------------------------------------------------------

function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const fm: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (m) fm[m[1]] = m[2];
  }
  return { frontmatter: fm, body: match[2] };
}

function toTitleCase(str: string): string {
  return str
    .replace(/^\d+-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Load markdown files from disk
// ---------------------------------------------------------------------------

function loadFiles(dir: string, filter?: string): MarkdownFile[] {
  const absDir = resolve(dir);
  const files = readdirSync(absDir)
    .filter((f) => extname(f) === ".md")
    .filter((f) => !filter || basename(f, ".md").startsWith(filter))
    .sort();

  if (files.length === 0) {
    throw new Error(
      filter
        ? `No .md files matching "${filter}" found in ${absDir}`
        : `No .md files found in ${absDir}`,
    );
  }

  return files.map((file) => {
    const name = basename(file, ".md");
    const raw = readFileSync(`${absDir}/${file}`, "utf-8");
    const { frontmatter, body } = parseFrontmatter(raw);
    const slug = frontmatter.slug ?? name;
    const title = frontmatter.title ?? toTitleCase(name);
    return { slug, title, markdown: body, name };
  });
}

// ---------------------------------------------------------------------------
// Notion API helpers
// ---------------------------------------------------------------------------

function makeClient(token: string): Client {
  return new Client({
    auth: token,
    notionVersion: "2026-03-11",
  } as ConstructorParameters<typeof Client>[0]);
}

async function findPageBySlug(
  notion: Client,
  dbId: string,
  slug: string,
): Promise<string | undefined> {
  for await (const page of iteratePaginatedAPI(notion.dataSources.query, {
    data_source_id: dbId,
  })) {
    const props = (page as { properties?: Record<string, unknown> }).properties;
    const slugProp = props?.["Slug"] as
      | { rich_text?: Array<{ plain_text: string }> }
      | undefined;
    if (slugProp?.rich_text?.[0]?.plain_text === slug) return page.id;
  }
  return undefined;
}

async function archivePage(notion: Client, pageId: string): Promise<void> {
  await (notion.pages as unknown as {
    update: (p: unknown) => Promise<void>;
  }).update({ page_id: pageId, archived: true });
}

async function createPage(
  notion: Client,
  dbId: string,
  file: MarkdownFile,
): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  const page = await (notion.pages as unknown as {
    create: (p: unknown) => Promise<{ id: string }>;
  }).create({
    parent: { data_source_id: dbId, type: "data_source_id" },
    properties: {
      Name:   { title:      [{ text: { content: file.title } }] },
      Slug:   { rich_text:  [{ text: { content: file.slug  } }] },
      Public: { checkbox: false },
      Tags:   { multi_select: [{ name: "md-sync" }] },
      Date:   { date: { start: today } },
    },
    markdown: file.markdown,
  });
  return page.id;
}

// ---------------------------------------------------------------------------
// Core sync logic
// ---------------------------------------------------------------------------

interface SyncOptions {
  dir: string;
  token: string;
  db: string;
  dryRun?: boolean;
  force?: boolean;
  filter?: string;
}

export async function sync(options: SyncOptions): Promise<void> {
  const { dir, token, db, dryRun = false, force = false, filter } = options;

  const files = loadFiles(dir, filter);
  console.log(
    `Found ${files.length} file(s)${filter ? ` matching "${filter}"` : ""} in ${resolve(dir)}`,
  );

  if (dryRun) {
    console.log("\n[dry-run] No changes will be made.\n");
    for (const f of files) {
      console.log(`  [dry-run] ${f.name}  →  slug: ${f.slug}  title: ${f.title}`);
    }
    return;
  }

  const notion = makeClient(token);

  for (const file of files) {
    try {
      const existingId = await findPageBySlug(notion, db, file.slug);

      if (existingId) {
        if (!force) {
          console.log(`  skip     ${file.name}  (exists: ${existingId}; use --force to replace)`);
          continue;
        }
        await archivePage(notion, existingId);
        console.log(`  archived ${existingId}`);
      }

      const newId = await createPage(notion, db, file);
      console.log(`  created  ${file.title}  →  ${newId}`);
    } catch (err) {
      console.error(
        `  error    ${file.name}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  console.log("\nDone.");
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface CliOptions {
  dir?: string;
  token?: string;
  db?: string;
  dryRun: boolean;
  force: boolean;
  filter?: string;
  help: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2).filter((a) => a !== "--");
  const opts: CliOptions = { dryRun: false, force: false, help: false };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    switch (a) {
      case "--dry-run":  opts.dryRun  = true; break;
      case "--force":    opts.force   = true; break;
      case "--token":    opts.token   = args[++i]; break;
      case "--db":       opts.db      = args[++i]; break;
      case "--filter":   opts.filter  = args[++i]; break;
      case "-h":
      case "--help":     opts.help    = true; break;
      default:
        if (!a.startsWith("-")) opts.dir = a;
        else console.warn(`Unknown option: ${a}`);
    }
  }

  return opts;
}

function printHelp(): void {
  console.log(`
notro-md-sync — Sync local markdown files to a Notion data source

Usage:
  notro-md-sync <dir> [options]

Arguments:
  <dir>              Directory containing .md files to sync

Options:
  --token <token>    Notion API token          (default: NOTION_TOKEN env var)
  --db <id>          Notion data source ID     (default: NOTION_DATASOURCE_ID env var)
  --dry-run          Preview without API calls
  --force            Archive existing pages and recreate from source
  --filter <prefix>  Process only files whose name starts with <prefix>
  -h, --help         Show this help message

Frontmatter:
  Each .md file may include a YAML frontmatter block to override the slug and title:

    ---
    slug: my-page-slug
    title: "My Page Title"
    ---

  Without frontmatter, slug defaults to the filename (without extension)
  and title defaults to the title-cased filename.
`);
}

const opts = parseArgs(process.argv);

if (opts.help) {
  printHelp();
  process.exit(0);
}

if (!opts.dir) {
  console.error("Error: <dir> argument is required.\n");
  printHelp();
  process.exit(1);
}

const token = opts.token ?? process.env.NOTION_TOKEN;
const db    = opts.db    ?? process.env.NOTION_DATASOURCE_ID;

if (!token) {
  console.error("Error: --token or NOTION_TOKEN environment variable is required.");
  process.exit(1);
}
if (!db) {
  console.error("Error: --db or NOTION_DATASOURCE_ID environment variable is required.");
  process.exit(1);
}

sync({ dir: opts.dir, token, db, dryRun: opts.dryRun, force: opts.force, filter: opts.filter })
  .catch((err) => {
    console.error("Fatal:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  });

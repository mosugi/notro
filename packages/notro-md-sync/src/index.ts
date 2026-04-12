#!/usr/bin/env node
/**
 * notro-md-sync
 *
 * Bidirectional sync between local markdown files and a Notion data source.
 *
 * Usage:
 *   notro-md-sync sync <dir> [options]   Push local .md files to Notion
 *   notro-md-sync get  <dir> [options]   Pull Notion pages to local .md files
 *
 * Arguments:
 *   <dir>              Directory for .md files
 *
 * Options:
 *   --token <token>    Notion API token (default: NOTION_TOKEN env var)
 *   --db <id>          Notion data source ID (default: NOTION_DATASOURCE_ID env var)
 *   --dry-run          Preview changes without making any API calls
 *   --force            sync: archive existing and recreate; get: overwrite existing files
 *   --filter <prefix>  sync: process only files whose name starts with <prefix>
 *                      get: process only pages whose slug starts with <prefix>
 *   -h, --help         Show this help message
 *
 * sync — page properties set for each file:
 *   Name     — title from frontmatter, or "[title-cased filename]"
 *   Slug     — slug from frontmatter, or filename-without-ext
 *   Public   — false (pages are not published automatically)
 *   Tags     — ["md-sync"]
 *   Date     — today's date (ISO 8601)
 *
 * get — writes <dir>/<slug>.md with YAML frontmatter:
 *   ---
 *   slug: <slug>
 *   title: "<title>"
 *   ---
 */

import { Client, iteratePaginatedAPI } from "@notionhq/client";
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, basename, extname } from "node:path";

// ---------------------------------------------------------------------------
// HTTPS proxy support
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
  slug: string;
  title: string;
  markdown: string;
  name: string;
}

interface Frontmatter {
  slug?: string;
  title?: string;
  [key: string]: string | undefined;
}

interface NotionPage {
  id: string;
  properties?: Record<string, unknown>;
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

function buildFrontmatter(slug: string, title: string): string {
  // Escape title if it contains special YAML characters
  const needsQuotes = /[:#\[\]{}&*!|>'"%@`]/.test(title) || title.startsWith("-");
  const titleValue = needsQuotes ? `"${title.replace(/"/g, '\\"')}"` : title;
  return `---\nslug: ${slug}\ntitle: ${titleValue}\n---\n\n`;
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
    const props = (page as NotionPage).properties;
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

function getSlugFromPage(page: NotionPage): string | undefined {
  const slugProp = page.properties?.["Slug"] as
    | { rich_text?: Array<{ plain_text: string }> }
    | undefined;
  return slugProp?.rich_text?.[0]?.plain_text;
}

function getTitleFromPage(page: NotionPage): string | undefined {
  const nameProp = page.properties?.["Name"] as
    | { title?: Array<{ plain_text: string }> }
    | undefined;
  return nameProp?.title?.[0]?.plain_text;
}

// ---------------------------------------------------------------------------
// sync: local .md → Notion
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
// get: Notion → local .md files
// ---------------------------------------------------------------------------

interface GetOptions {
  dir: string;
  token: string;
  db: string;
  dryRun?: boolean;
  force?: boolean;
  filter?: string;
}

export async function get(options: GetOptions): Promise<void> {
  const { dir, token, db, dryRun = false, force = false, filter } = options;

  const absDir = resolve(dir);

  if (!dryRun) {
    mkdirSync(absDir, { recursive: true });
  }

  const notion = makeClient(token);

  const pages: NotionPage[] = [];
  for await (const page of iteratePaginatedAPI(notion.dataSources.query, {
    data_source_id: db,
  })) {
    pages.push(page as NotionPage);
  }

  console.log(`Found ${pages.length} page(s) in data source ${db}`);

  let written = 0;
  let skipped = 0;
  let errors = 0;

  for (const page of pages) {
    const slug = getSlugFromPage(page);
    const title = getTitleFromPage(page) ?? "Untitled";

    if (!slug) {
      console.warn(`  warn     ${page.id}: no Slug property, skipping`);
      continue;
    }

    if (filter && !slug.startsWith(filter)) {
      continue;
    }

    const filePath = `${absDir}/${slug}.md`;

    if (dryRun) {
      console.log(`  [dry-run] ${slug}  →  ${filePath}  (title: ${title})`);
      written++;
      continue;
    }

    if (existsSync(filePath) && !force) {
      console.log(`  skip     ${slug}  (file exists: ${filePath}; use --force to overwrite)`);
      skipped++;
      continue;
    }

    try {
      const md = await (notion.pages as unknown as {
        retrieveMarkdown: (p: { page_id: string }) => Promise<{ markdown: string; truncated?: boolean }>;
      }).retrieveMarkdown({ page_id: page.id });

      if (md.truncated) {
        console.warn(`  warn     ${slug}: content was truncated by the Notion API`);
      }

      const content = buildFrontmatter(slug, title) + md.markdown;
      writeFileSync(filePath, content, "utf-8");
      console.log(`  wrote    ${slug}  →  ${filePath}`);
      written++;
    } catch (err) {
      console.error(
        `  error    ${slug}: ${err instanceof Error ? err.message : String(err)}`,
      );
      errors++;
    }
  }

  console.log(`\nDone. ${written} written, ${skipped} skipped, ${errors} errors.`);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

type Subcommand = "sync" | "get";

interface CliOptions {
  subcommand?: Subcommand;
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
        if (!a.startsWith("-")) {
          if (!opts.subcommand && (a === "sync" || a === "get")) {
            opts.subcommand = a as Subcommand;
          } else if (!opts.dir) {
            opts.dir = a;
          } else {
            console.warn(`Unexpected argument: ${a}`);
          }
        } else {
          console.warn(`Unknown option: ${a}`);
        }
    }
  }

  return opts;
}

function printHelp(): void {
  console.log(`
notro-md-sync — Bidirectional sync between local markdown and a Notion data source

Usage:
  notro-md-sync sync <dir> [options]   Push local .md files to Notion
  notro-md-sync get  <dir> [options]   Pull Notion pages to local .md files

Arguments:
  <dir>              Directory for .md files

Options:
  --token <token>    Notion API token          (default: NOTION_TOKEN env var)
  --db <id>          Notion data source ID     (default: NOTION_DATASOURCE_ID env var)
  --dry-run          Preview without API calls
  --force            sync: archive existing and recreate; get: overwrite existing files
  --filter <prefix>  sync: files whose name starts with <prefix>
                     get:  pages whose slug starts with <prefix>
  -h, --help         Show this help message

Frontmatter (sync):
  Each .md file may include a YAML frontmatter block to override the slug and title:

    ---
    slug: my-page-slug
    title: "My Page Title"
    ---

  Without frontmatter, slug defaults to the filename (without extension)
  and title defaults to the title-cased filename.

Output files (get):
  Each Notion page is written to <dir>/<slug>.md with YAML frontmatter prepended.
`);
}

const opts = parseArgs(process.argv);

if (opts.help) {
  printHelp();
  process.exit(0);
}

if (!opts.subcommand) {
  console.error("Error: subcommand required: sync | get\n");
  printHelp();
  process.exit(1);
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

const commonOpts = { dir: opts.dir, token, db, dryRun: opts.dryRun, force: opts.force, filter: opts.filter };

const runner = opts.subcommand === "get" ? get(commonOpts) : sync(commonOpts);

runner.catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});

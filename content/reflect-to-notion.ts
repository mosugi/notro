/**
 * reflect-to-notion.ts
 *
 * Batch-reflects markdown files from a content sub-directory to Notion.
 * For each .md file in the target directory, creates a new Notion page (or
 * replaces an existing one when --force is given) in the database specified by
 * NOTION_DATASOURCE_ID.
 *
 * Usage:
 *   node --experimental-strip-types content/reflect-to-notion.ts [options]
 *   # or via pnpm script:
 *   pnpm run reflect [-- --options]
 *
 * Options:
 *   --dry-run        Print what would happen without making any API calls.
 *   --force          Archive the existing page (if any) and create a fresh one.
 *   --fixture <name> Process only the fixture whose filename starts with <name>.
 *                    Example: --fixture 01-callout
 *
 * Required environment variables:
 *   NOTION_TOKEN          Notion Internal Integration Token
 *   NOTION_DATASOURCE_ID  Target Notion database ID
 *
 * Page properties set for each fixture:
 *   Name     — "[Fixture] <human-readable title>"
 *   Slug     — "notro-fixture-<filename-without-ext>"
 *   Public   — false  (fixtures are not published)
 *   Tags     — ["fixture"]
 *   Date     — today's date (ISO 8601)
 */

import { Client, iteratePaginatedAPI } from "@notionhq/client";
import { readFileSync, readdirSync } from "node:fs";
import { join, basename, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Apply HTTPS proxy for corporate networks or CI environments.
// Node.js does not honor the system https_proxy env var by default; undici
// (the HTTP client used by @notionhq/client under the hood) requires explicit
// dispatcher configuration.
const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
if (httpsProxy) {
  const { ProxyAgent, setGlobalDispatcher } = await import("undici");
  setGlobalDispatcher(new ProxyAgent(httpsProxy));
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FixtureFile {
  /** Slug used as the Notion page's Slug property, e.g. "notro-fixture-01-callout" */
  slug: string;
  /** Human-readable title for the Notion page Name property */
  title: string;
  /** Raw markdown content */
  markdown: string;
  /** Original filename without extension, e.g. "01-callout" */
  name: string;
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

// ---------------------------------------------------------------------------
// Load fixtures from disk
// ---------------------------------------------------------------------------

interface Frontmatter {
  slug?: string;
  title?: string;
  [key: string]: unknown;
}

/**
 * Parses YAML frontmatter from a markdown string.
 * Returns { frontmatter, body } where body has the frontmatter block stripped.
 */
function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const fm: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const [, key, val] = line.match(/^(\w+):\s*"?(.*?)"?\s*$/) ?? [];
    if (key) fm[key] = val;
  }
  return { frontmatter: fm, body: match[2] };
}

function toTitleCase(str: string): string {
  return str
    .replace(/^\d+-/, "") // strip leading "01-" numbering
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Reads all .md files from fixtureDir, sorted by filename.
 * slug and title are read from frontmatter if present; otherwise derived from filename.
 * The body sent to Notion has the frontmatter block stripped.
 */
function loadFixtures(fixtureDir: string, filter?: string): FixtureFile[] {
  const files = readdirSync(fixtureDir)
    .filter((f) => extname(f) === ".md")
    .filter((f) => !filter || basename(f, ".md").startsWith(filter))
    .sort();

  if (files.length === 0) {
    throw new Error(
      filter
        ? `No fixture files matching "${filter}" found in ${fixtureDir}`
        : `No .md files found in ${fixtureDir}`,
    );
  }

  return files.map((file) => {
    const name = basename(file, ".md");
    const raw = readFileSync(join(fixtureDir, file), "utf-8");
    const { frontmatter, body } = parseFrontmatter(raw);
    const slug = (frontmatter.slug as string | undefined) ?? `notro-fixture-${name}`;
    const title = (frontmatter.title as string | undefined) ?? `[Fixture] ${toTitleCase(name)}`;
    return { slug, title, markdown: body, name };
  });
}

// ---------------------------------------------------------------------------
// Notion API helpers
// ---------------------------------------------------------------------------

/**
 * Searches the data source for a page whose Slug property matches the given slug.
 * Returns the page ID if found, or undefined.
 */
async function findPageIdBySlug(
  notion: Client,
  dbId: string,
  slug: string,
): Promise<string | undefined> {
  for await (const page of iteratePaginatedAPI(notion.dataSources.query, {
    data_source_id: dbId,
  })) {
    const props = (page as { properties?: Record<string, unknown> }).properties;
    if (!props) continue;
    const slugProp = props["Slug"] as
      | { rich_text?: Array<{ plain_text: string }> }
      | undefined;
    if (slugProp?.rich_text?.[0]?.plain_text === slug) return page.id;
  }
  return undefined;
}

/**
 * Archives (soft-deletes) an existing Notion page.
 */
async function archivePage(notion: Client, pageId: string): Promise<void> {
  await (notion.pages as unknown as { update: (p: unknown) => Promise<void> }).update({
    page_id: pageId,
    archived: true,
  });
}

/**
 * Creates a new Notion page in the given data source with markdown body content.
 */
async function createPage(
  notion: Client,
  dbId: string,
  fixture: FixtureFile,
): Promise<string> {
  const today = new Date().toISOString().split("T")[0];

  const page = await (
    notion.pages as unknown as {
      create: (p: unknown) => Promise<{ id: string }>;
    }
  ).create({
    parent: { data_source_id: dbId, type: "data_source_id" },
    properties: {
      Name: { title: [{ text: { content: fixture.title } }] },
      Slug: { rich_text: [{ text: { content: fixture.slug } }] },
      Public: { checkbox: false },
      Tags: { multi_select: [{ name: "fixture" }] },
      Date: { date: { start: today } },
    },
    markdown: fixture.markdown,
  });

  return page.id;
}

// ---------------------------------------------------------------------------
// Main reflect logic
// ---------------------------------------------------------------------------

interface ReflectOptions {
  dryRun?: boolean;
  force?: boolean;
  fixtureFilter?: string;
}

export async function reflectFixturesToNotion(
  options: ReflectOptions = {},
): Promise<void> {
  const { dryRun = false, force = false, fixtureFilter } = options;

  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DATASOURCE_ID;

  if (!token) throw new Error("NOTION_TOKEN environment variable is not set.");
  if (!dbId) throw new Error("NOTION_DATASOURCE_ID environment variable is not set.");

  const notion = makeClient(token);
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const fixtureDir = join(scriptDir, "docs");

  const fixtures = loadFixtures(fixtureDir, fixtureFilter);
  console.log(
    `Found ${fixtures.length} fixture file(s)${fixtureFilter ? ` matching "${fixtureFilter}"` : ""}.`,
  );

  if (dryRun) {
    console.log("\n[dry-run] No changes will be made.\n");
    for (const f of fixtures) {
      console.log(`  [dry-run] Would process: ${f.name}  →  slug: ${f.slug}`);
    }
    return;
  }

  for (const fixture of fixtures) {
    try {
      const existingId = await findPageIdBySlug(notion, dbId, fixture.slug);

      if (existingId) {
        if (!force) {
          console.log(
            `  skip  ${fixture.name}  (page already exists: ${existingId}; use --force to replace)`,
          );
          continue;
        }
        await archivePage(notion, existingId);
        console.log(`  archived existing  ${existingId}`);
      }

      const newId = await createPage(notion, dbId, fixture);
      console.log(`  created  ${fixture.title}  →  ${newId}`);
    } catch (err) {
      console.error(
        `  error   ${fixture.name}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  console.log("\nDone.");
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): ReflectOptions & { help?: boolean } {
  const args = argv.slice(2).filter((a) => a !== "--"); // strip pnpm's "--" separator
  const opts: ReflectOptions & { help?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--force":
        opts.force = true;
        break;
      case "--fixture":
        opts.fixtureFilter = args[++i];
        break;
      case "--help":
      case "-h":
        opts.help = true;
        break;
      default:
        console.warn(`Unknown argument: ${args[i]}`);
    }
  }

  return opts;
}

function printHelp(): void {
  console.log(`
reflect-to-notion — Reflect content files to Notion

Usage:
  node --experimental-strip-types content/reflect-to-notion.ts [options]
  pnpm run reflect [-- options]

Options:
  --dry-run          Preview what would happen without making API calls.
  --force            Archive existing pages and create fresh ones.
  --fixture <name>   Process only fixtures whose filename starts with <name>.
  -h, --help         Show this help message.

Required environment variables:
  NOTION_TOKEN          Notion Internal Integration Token
  NOTION_DATASOURCE_ID  Target Notion database ID
`);
}

const opts = parseArgs(process.argv);

if (opts.help) {
  printHelp();
  process.exit(0);
}

reflectFixturesToNotion(opts).catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});

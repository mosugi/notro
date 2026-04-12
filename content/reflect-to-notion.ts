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

import { request as httpRequest } from "node:http";
import { request as httpsRequest, Agent } from "node:https";
import { connect as tlsConnect } from "node:tls";
import { readFileSync, readdirSync } from "node:fs";
import { join, basename, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { URL } from "node:url";

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
// Proxy-aware HTTPS agent
// HTTPS_PROXY / https_proxy env var is respected via HTTP CONNECT tunnel.
// (fetch/undici does not work in this environment)
// ---------------------------------------------------------------------------

class ProxyAgent extends Agent {
  private proxyHost: string;
  private proxyPort: number;
  private proxyAuth: string;

  constructor(proxyUrl: string) {
    super();
    const u = new URL(proxyUrl);
    this.proxyHost = u.hostname;
    this.proxyPort = parseInt(u.port, 10);
    this.proxyAuth = Buffer.from(
      `${decodeURIComponent(u.username)}:${decodeURIComponent(u.password)}`,
    ).toString("base64");
  }

  createConnection(
    options: { host?: string; port?: number; servername?: string },
    callback: (err: Error | null, socket?: import("node:net").Socket) => void,
  ): void {
    const targetHost = options.host ?? "api.notion.com";
    const targetPort = options.port ?? 443;

    // Step 1: open TCP connection to proxy and send HTTP CONNECT
    const connectReq = httpRequest({
      host: this.proxyHost,
      port: this.proxyPort,
      method: "CONNECT",
      path: `${targetHost}:${targetPort}`,
      headers: {
        Host: `${targetHost}:${targetPort}`,
        "Proxy-Authorization": `Basic ${this.proxyAuth}`,
      },
    });

    connectReq.on("connect", (_res, socket) => {
      // Step 2: upgrade the raw socket to TLS
      const tlsSocket = tlsConnect({
        socket,
        servername: targetHost,
      });
      tlsSocket.once("secureConnect", () => callback(null, tlsSocket));
      tlsSocket.once("error", (err) => callback(err));
    });

    connectReq.on("error", (err) => callback(err));
    connectReq.end();
  }
}

function buildAgent(): Agent | undefined {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
  return proxyUrl ? new ProxyAgent(proxyUrl) : undefined;
}

const _agent = buildAgent();

function notionRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const bodyStr = body !== undefined ? JSON.stringify(body) : "";

    const req = httpsRequest(
      {
        hostname: "api.notion.com",
        path: `/v1${path}`,
        method,
        agent: _agent,
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
          "Notion-Version": "2026-03-11",
          "Content-Type": "application/json",
          ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.object === "error") {
              reject(
                new Error(`Notion API error ${parsed.status}: ${parsed.message}`),
              );
            } else {
              resolve(parsed);
            }
          } catch (e) {
            reject(e);
          }
        });
      },
    );

    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Load fixtures from disk
// ---------------------------------------------------------------------------

function toTitleCase(str: string): string {
  return str
    .replace(/^\d+-/, "") // strip leading "01-" numbering
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Reads all .md files from fixtureDir, sorted by filename.
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
    const slug = `notro-fixture-${name}`;
    const title = `[Fixture] ${toTitleCase(name)}`;
    const markdown = readFileSync(join(fixtureDir, file), "utf-8");
    return { slug, title, markdown, name };
  });
}

// ---------------------------------------------------------------------------
// Notion API helpers
// ---------------------------------------------------------------------------

/**
 * Searches the database for a page whose Slug property matches the given slug.
 * Returns the page ID if found, or undefined.
 */
async function findPageIdBySlug(
  dbId: string,
  slug: string,
): Promise<string | undefined> {
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = {
      filter: { property: "Slug", rich_text: { equals: slug } },
      page_size: 10,
    };
    if (cursor) body.start_cursor = cursor;

    const res = (await notionRequest("POST", `/data_sources/${dbId}/query`, body)) as {
      results: Array<{ id: string }>;
      has_more: boolean;
      next_cursor: string | null;
    };

    if (res.results.length > 0) return res.results[0].id;
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);

  return undefined;
}

/**
 * Archives (soft-deletes) an existing Notion page.
 */
async function archivePage(pageId: string): Promise<void> {
  await notionRequest("PATCH", `/pages/${pageId}`, { archived: true });
}

/**
 * Creates a new Notion page in the given database with markdown body content.
 */
async function createPage(dbId: string, fixture: FixtureFile): Promise<string> {
  const today = new Date().toISOString().split("T")[0];

  const res = (await notionRequest("POST", "/pages", {
    parent: { data_source_id: dbId, type: "data_source_id" },
    properties: {
      Name: { title: [{ text: { content: fixture.title } }] },
      Slug: { rich_text: [{ text: { content: fixture.slug } }] },
      Public: { checkbox: false },
      Tags: { multi_select: [{ name: "fixture" }] },
      Date: { date: { start: today } },
    },
    markdown: fixture.markdown,
  })) as { id: string };

  return res.id;
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
      const existingId = await findPageIdBySlug(dbId, fixture.slug);

      if (existingId) {
        if (!force) {
          console.log(
            `  skip  ${fixture.name}  (page already exists: ${existingId}; use --force to replace)`,
          );
          continue;
        }
        await archivePage(existingId);
        console.log(`  archived existing  ${existingId}`);
      }

      const newId = await createPage(dbId, fixture);
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

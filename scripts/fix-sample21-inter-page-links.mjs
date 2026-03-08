/**
 * Fixes Sample 21 (Inter-Page Links) by:
 * 1. Archiving any existing broken Sample 21 page
 * 2. Creating a fresh page with only properties (no markdown in create)
 * 3. Using pages.updateMarkdown (insert_content) to set content with proper page links
 *
 * Usage:
 *   NOTION_TOKEN=... NOTION_DATASOURCE_ID=... node scripts/fix-sample21-inter-page-links.mjs
 */

import { ProxyAgent, setGlobalDispatcher } from "undici";
if (process.env.https_proxy) setGlobalDispatcher(new ProxyAgent(process.env.https_proxy));
import { Client, iteratePaginatedAPI } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DATASOURCE_ID;

if (!process.env.NOTION_TOKEN || !DB_ID) {
  console.error("Missing NOTION_TOKEN or NOTION_DATASOURCE_ID");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Step 1: Fetch all pages to find IDs dynamically
console.log("Fetching pages from database...");
const allPages = await Array.fromAsync(
  iteratePaginatedAPI(notion.dataSources.query, { data_source_id: DB_ID })
);

function findBySlug(slug) {
  return allPages.find(
    (p) => p.properties?.Slug?.rich_text?.[0]?.plain_text === slug
  );
}

// Step 2: Find referenced pages for internal link resolution
const aboutPage = findBySlug("about");
const sample01Page = findBySlug("sample-01-headings");
const sample02Page = findBySlug("sample-02-inline-formatting");

if (!aboutPage || !sample01Page || !sample02Page) {
  console.error(
    "Required pages not found. Run seed-notion-pages.mjs first.\n" +
      `  about: ${aboutPage ? "✓" : "✗"}\n` +
      `  sample-01-headings: ${sample01Page ? "✓" : "✗"}\n` +
      `  sample-02-inline-formatting: ${sample02Page ? "✓" : "✗"}`
  );
  process.exit(1);
}

const aboutUrl = "https://www.notion.so/" + aboutPage.id.replace(/-/g, "");
const s01Url = "https://www.notion.so/" + sample01Page.id.replace(/-/g, "");
const s02Url = "https://www.notion.so/" + sample02Page.id.replace(/-/g, "");

console.log("Resolved page IDs:");
console.log(`  about:               ${aboutPage.id}`);
console.log(`  sample-01-headings:  ${sample01Page.id}`);
console.log(`  sample-02-...:       ${sample02Page.id}`);

// Step 3: Archive any existing broken Sample 21 pages
const existingPages = allPages.filter(
  (p) => p.properties?.Slug?.rich_text?.[0]?.plain_text === "sample-21-inter-page-links"
);
for (const existing of existingPages) {
  console.log(`\nArchiving broken Sample 21: ${existing.id}`);
  await notion.pages.update({ page_id: existing.id, archived: true });
  console.log("Archived.");
  await sleep(400);
}

// Step 4: Create a new page with properties only (no markdown body)
console.log("\nCreating new Sample 21 page (properties only)...");
const page = await notion.pages.create({
  parent: { data_source_id: DB_ID, type: "data_source_id" },
  properties: {
    Name: {
      title: [{ text: { content: "Sample 21: Inter-Page Links" } }],
    },
    Slug: {
      rich_text: [{ text: { content: "sample-21-inter-page-links" } }],
    },
    Description: {
      rich_text: [
        {
          text: {
            content:
              "ページ間リンク（ページメンション）のレンダリングテスト。",
          },
        },
      ],
    },
    Public: { checkbox: true },
    Tags: {
      multi_select: [{ name: "sample" }, { name: "links" }],
    },
    Date: { date: { start: "2026-01-21" } },
  },
  // Intentionally omit 'markdown' here — content is set via updateMarkdown below
});
console.log("Created page:", page.id);
await sleep(400);

// Step 5: Set page content via updateMarkdown (insert_content at beginning)
// Using this API instead of the 'markdown' param in pages.create so that
// Notion can properly resolve the <page url="..."> mentions to real page links.
const markdown = `# Sample 21: Inter-Page Links

このページでは、Notionページ間リンク（ページメンション）の動作を確認できます。

## 内部リンク

Notionの「ページメンション」は、ビルド時に同サイト内のURLへ解決されます。

- サイト概要: <page url="${aboutUrl}">About</page>
- 見出しサンプル: <page url="${s01Url}">Sample 01: Headings & Paragraphs</page>
- 書式サンプル: <page url="${s02Url}">Sample 02: Inline Formatting</page>

## まとめ

\`NotionMarkdownRenderer\` に \`linkToPages\` プロップを渡すことで、
ページID → サイト内パスの解決が自動的に行われます。
`;

console.log("\nSetting content via pages.updateMarkdown (insert_content)...");
await notion.pages.updateMarkdown({
  page_id: page.id,
  type: "insert_content",
  insert_content: {
    content: markdown,
    // 'after' omitted → inserts at the beginning of the (empty) page
  },
});

console.log("\nDone!");
console.log(`Sample 21 page ID: ${page.id}`);
console.log("Run the Astro build to verify inter-page link rendering.");

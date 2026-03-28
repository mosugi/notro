import { ProxyAgent, setGlobalDispatcher } from "undici";
if (process.env.https_proxy) setGlobalDispatcher(new ProxyAgent(process.env.https_proxy));
import { Client, iteratePaginatedAPI } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DATASOURCE_ID;

if (!process.env.NOTION_TOKEN || !DB_ID) {
  console.error("Missing NOTION_TOKEN or NOTION_DATASOURCE_ID");
  process.exit(1);
}

// Fetch all pages from the database and look up by slug
console.log("Fetching page IDs from database...");
const allPages = await Array.fromAsync(
  iteratePaginatedAPI(notion.dataSources.query, { data_source_id: DB_ID })
);

function findBySlug(slug) {
  return allPages.find(
    (p) => p.properties?.Slug?.rich_text?.[0]?.plain_text === slug
  );
}

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

// Notion page link format uses the page ID without dashes
const aboutUrl = "https://www.notion.so/" + aboutPage.id.replace(/-/g, "");
const s01Url = "https://www.notion.so/" + sample01Page.id.replace(/-/g, "");
const s02Url = "https://www.notion.so/" + sample02Page.id.replace(/-/g, "");

console.log(`  about: ${aboutPage.id}`);
console.log(`  sample-01-headings: ${sample01Page.id}`);
console.log(`  sample-02-inline-formatting: ${sample02Page.id}`);

const markdown = `# Sample 21: Inter-Page Links

このページでは、Notionページ間リンク（ページメンション）の動作を確認できます。

## 内部リンク

Notionの「ページメンション」は、ビルド時に同サイト内のURLへ解決されます。

- サイト概要: <page url="${aboutUrl}">About</page>
- 見出しサンプル: <page url="${s01Url}">Sample 01: Headings & Paragraphs</page>
- 書式サンプル: <page url="${s02Url}">Sample 02: Inline Formatting</page>

## まとめ

\`NotroContent\` に \`linkToPages\` プロップを渡すことで、
ページID → サイト内パスの解決が自動的に行われます。
`;

const page = await notion.pages.create({
  parent: { data_source_id: DB_ID, type: "data_source_id" },
  properties: {
    Name: { title: [{ text: { content: "Sample 21: Inter-Page Links" } }] },
    Slug: { rich_text: [{ text: { content: "sample-21-inter-page-links" } }] },
    Description: { rich_text: [{ text: { content: "ページ間リンク（ページメンション）のレンダリングテスト。" } }] },
    Public: { checkbox: true },
    Tags: { multi_select: [{ name: "sample" }, { name: "links" }] },
    Date: { date: { start: "2026-01-21" } },
  },
  markdown,
});
console.log("Created:", page.id);

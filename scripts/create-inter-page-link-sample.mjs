import { ProxyAgent, setGlobalDispatcher } from "undici";
if (process.env.https_proxy) setGlobalDispatcher(new ProxyAgent(process.env.https_proxy));
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DATASOURCE_ID;

// Page IDs from the database (fetched in a prior step)
const aboutId = "31d6b8b6-8958-812a-9e16-d676ccd44d24";
const sample01Id = "31d6b8b6-8958-81ae-9b72-c764d0dec367";
const sample02Id = "31d6b8b6-8958-8105-ae8a-ea5f0bea3e06";

// Notion page link format uses the ID without dashes
const aboutUrl = "https://www.notion.so/" + aboutId.replace(/-/g, "");
const s01Url = "https://www.notion.so/" + sample01Id.replace(/-/g, "");
const s02Url = "https://www.notion.so/" + sample02Id.replace(/-/g, "");

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

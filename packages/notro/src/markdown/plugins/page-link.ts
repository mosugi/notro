import type { Plugin } from "unified";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";
import type { LinkToPages } from "../transformer.ts";

type Options = {
  linkToPages: LinkToPages;
};

// Resolves a Notion page/database URL to an internal path or external URL.
function resolveNotionUrl(
  url: string,
  linkToPages: LinkToPages,
): { href: string; title?: string; isExternal: boolean } {
  // Notion URLs can appear with or without dashes in the page ID portion
  // (e.g. "https://www.notion.so/abc123" or "https://www.notion.so/abc-123").
  // Strip dashes from the URL before matching so both formats are handled.
  const urlNoDash = url.replace(/-/g, "");
  for (const [pageId, info] of Object.entries(linkToPages)) {
    if (urlNoDash.includes(pageId.replace(/-/g, ""))) {
      return { href: `/${info.url}`, title: info.title, isExternal: false };
    }
  }
  return { href: url, isExternal: true };
}

// Transforms Notion link and mention tags into standard <a> or <span> elements:
// - <page url="..."> → <a class="nt-page-link">
// - <database url="..."> → <a class="nt-database-link">
// - <mention-page url="..."> → <a class="nt-mention-page">
// - <mention-database url="..."> → <a class="nt-mention-database">
// - <mention-date>, <mention-user>, <mention-*> → <span class="nt-mention-...">
// - <a href="https://www.notion.so/..."> → resolved to internal URL if matched
export const pageLinkPlugin: Plugin<[Options], Root> = (options) => {
  const { linkToPages } = options;

  return (tree) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "page" || node.tagName === "database") {
        const cssClass = `nt-${node.tagName}-link`;
        const url = node.properties?.url as string | undefined;

        if (!url) {
          node.tagName = "span";
          node.properties = { class: `${cssClass}-broken` };
          return;
        }

        const { href, title, isExternal } = resolveNotionUrl(url, linkToPages);
        node.tagName = "a";
        node.properties = {
          href,
          class: cssClass,
          ...(title ? { title } : {}),
          ...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {}),
        };
        return;
      }

      // Resolve plain markdown links pointing to notion.so to internal site URLs.
      // This handles [text](https://www.notion.so/PAGE_ID) links in seed/test pages
      // where native Notion page mentions are not available via the API.
      if (node.tagName === "a") {
        const href = node.properties?.href as string | undefined;
        if (!href?.includes("notion.so")) return;

        const { href: resolved, isExternal } = resolveNotionUrl(href, linkToPages);
        if (!isExternal) {
          node.properties = {
            ...node.properties,
            href: resolved,
            class: "nt-page-link",
          };
        }
        return;
      }

      if (node.tagName.startsWith("mention-")) {
        const mentionType = node.tagName.slice("mention-".length);
        const url = node.properties?.url as string | undefined;

        if (
          (mentionType === "page" || mentionType === "database") &&
          url
        ) {
          const { href, isExternal } = resolveNotionUrl(url, linkToPages);
          node.tagName = "a";
          node.properties = {
            href,
            class: `nt-mention-${mentionType}`,
            ...(isExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {}),
          };
        } else {
          node.tagName = "span";
          node.properties = {
            ...node.properties,
            class: `nt-mention-${mentionType}`,
          };
        }
      }
    });
  };
};

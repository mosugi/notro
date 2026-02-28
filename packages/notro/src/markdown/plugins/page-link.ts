import type { Plugin } from "unified";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";
import type { LinkToPages } from "../transformer.ts";

type Options = {
  linkToPages: LinkToPages;
};

// Transforms <page url="notion-page-id-or-url"> tags into <a href="..."> links.
// Applies linkToPages mapping to resolve Notion page IDs to site URLs.
export const pageLinkPlugin: Plugin<[Options], Root> = (options) => {
  const { linkToPages } = options;

  return (tree) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "page") return;

      const url = node.properties?.url as string | undefined;
      if (!url) {
        node.tagName = "span";
        node.properties = { class: "nt-page-link-broken" };
        return;
      }

      // Try to resolve via linkToPages mapping (match by page ID in URL)
      let href = url;
      let title: string | undefined;

      for (const [pageId, info] of Object.entries(linkToPages)) {
        if (url.includes(pageId.replace(/-/g, ""))) {
          href = `/${info.url}`;
          title = info.title;
          break;
        }
      }

      node.tagName = "a";
      node.properties = {
        href,
        class: "nt-page-link",
        ...(title ? { title } : {}),
      };
    });
  };
};

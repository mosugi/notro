import type { Plugin } from "unified";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

function addClass(node: Element, ...names: string[]) {
  const existing = (node.properties?.class as string) ?? "";
  const classes = [existing, ...names].filter(Boolean).join(" ");
  node.properties = { ...node.properties, class: classes };
}

// Adds nt-* classes to standard HTML elements produced by remark-rehype,
// mirroring the block-level class names used in Notion's block renderer.
export const notroBlocksPlugin: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "element", (node: Element, _index, parent) => {
      switch (node.tagName) {
        case "p":
          addClass(node, "nt-text-block");
          break;

        case "h2":
          addClass(node, "nt-header-block");
          break;

        case "h3":
          addClass(node, "nt-sub_header-block");
          break;

        case "h4":
          addClass(node, "nt-sub_sub_header-block");
          break;

        case "ul":
          addClass(node, "nt-bulleted_list-block-container");
          break;

        case "ol":
          addClass(node, "nt-numbered_list-block-container");
          break;

        case "li": {
          const parentTag = (parent as Element | undefined)?.tagName;
          if (parentTag === "ul") {
            addClass(node, "nt-bulleted_list-block");
          } else if (parentTag === "ol") {
            addClass(node, "nt-numbered_list-block");
          }
          break;
        }

        case "blockquote":
          addClass(node, "nt-quote-block");
          break;

        case "hr":
          addClass(node, "nt-divider-block");
          break;

        case "img":
          addClass(node, "nt-image-block");
          break;

        case "code": {
          const parentTag = (parent as Element | undefined)?.tagName;
          if (parentTag === "pre") {
            addClass(node, "nt-code-block");
          }
          break;
        }

        case "a": {
          const classes = (node.properties?.class as string) ?? "";
          // Skip page-link and broken page-link (already handled by pageLinkPlugin)
          if (!classes.includes("nt-page-link")) {
            addClass(node, "nt-bookmark-block");
          }
          break;
        }
      }
    });
  };
};

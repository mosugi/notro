import type { Plugin } from "unified";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

// Adds nt-toggle-block class to <details> elements (Notion toggle blocks).
export const togglePlugin: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "details") return;

      const existing = node.properties?.class ?? "";
      const classes = [existing, "nt-toggle-block"].filter(Boolean).join(" ");
      node.properties = { ...node.properties, class: classes };
    });
  };
};

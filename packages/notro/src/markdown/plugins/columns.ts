import type { Plugin } from "unified";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

// Transforms <columns><column> HTML tags in hast into
// <div class="nt-column-list"><div class="nt-column">
export const columnsPlugin: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "columns") {
        node.tagName = "div";
        node.properties = { ...node.properties, class: "nt-column-list" };
      } else if (node.tagName === "column") {
        node.tagName = "div";
        node.properties = { ...node.properties, class: "nt-column" };
      }
    });
  };
};

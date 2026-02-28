import type { Plugin } from "unified";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

// Transforms color attributes on span and block elements:
// - <span color="blue"> → <span class="nt-color-blue">
// - Block elements with color attribute → class="nt-color-..."
export const colorPlugin: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "element", (node: Element) => {
      const color = node.properties?.color as string | undefined;
      if (!color) return;

      const existing = node.properties?.class ?? "";
      const classes = [existing, `nt-color-${color}`].filter(Boolean).join(" ");
      node.properties = { ...node.properties, class: classes };
      delete node.properties.color;
    });
  };
};

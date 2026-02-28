import type { Plugin } from "unified";
import type { Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import { visit } from "unist-util-visit";

// Transforms :::callout{icon="💡" color="gray_bg"} container directives
// into HTML div elements before remark-rehype runs.
export const calloutPlugin: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "containerDirective", (node: ContainerDirective) => {
      if (node.name !== "callout") return;

      const attrs = node.attributes ?? {};
      const color = attrs.color ?? "";
      const icon = attrs.icon ?? "";

      const colorClass = color ? ` nt-color-${color}` : "";
      const classes = `nt-callout${colorClass}`;

      // Convert to HTML using hast-compatible data
      node.data = {
        ...node.data,
        hName: "div",
        hProperties: {
          class: classes,
          "data-callout-icon": icon || undefined,
        },
      };
    });
  };
};

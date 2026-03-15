import type { Plugin } from "unified";
import type { Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import { visit } from "unist-util-visit";

// Transforms :::callout{icon="💡" color="gray_bg"} container directives
// into <callout icon="..." color="..."> elements for the component mapping.
//
// Note: Notion's API outputs "::: callout {icon=...}" with spaces.
// The preprocessNotionMarkdown() function in transformer.ts normalizes
// this to ":::callout{...}" before remark parsing.
export const calloutPlugin: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "containerDirective", (node: ContainerDirective) => {
      if (node.name !== "callout") return;

      const attrs = node.attributes ?? {};
      const color = attrs.color ?? "";
      const icon = attrs.icon ?? "";

      // Output as <callout> custom element so the component mapping
      // (notionComponents.callout = Callout.astro) can handle rendering.
      // Pass color as-is (e.g. "gray_bg") — Callout.astro's colorToCSS()
      // handles both _bg and _background suffix formats.
      node.data = {
        ...node.data,
        hName: "callout",
        hProperties: {
          color: color || undefined,
          icon: icon || undefined,
        },
      };
    });
  };
};

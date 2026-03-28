/**
 * rehypeMermaid — renders ```mermaid code blocks to inline SVG at build time.
 *
 * Requires beautiful-mermaid (optional dependency):
 *   npm install beautiful-mermaid
 *
 * If beautiful-mermaid is not installed, mermaid code blocks are left as-is
 * so downstream plugins (e.g. @shikijs/rehype) can process them as code.
 *
 * Usage in astro.config.mjs:
 *   import { rehypeMermaid } from 'notro/utils';
 *   notro({
 *     rehypePlugins: [
 *       [rehypeMermaid, { theme: 'github-dark' }],  // must come before @shikijs/rehype
 *       rehypeKatex,
 *       [rehypeShiki, { theme: 'github-dark' }],
 *     ],
 *   })
 */

import type { Plugin } from 'unified';
import type { Root, Element, ElementContent } from 'hast';
import { visit } from 'unist-util-visit';
import { toString as hastToString } from 'hast-util-to-string';

export interface RehypeMermaidOptions {
  /** beautiful-mermaid theme key (e.g. 'github-dark', 'default'). */
  theme?: string;
}

export const rehypeMermaid: Plugin<[RehypeMermaidOptions?], Root> = (options = {}) => {
  return async (tree) => {
    // Collect all mermaid <pre><code class="language-mermaid"> nodes.
    // Must be collected before tree mutation to avoid visit index corruption.
    const nodes: Array<{ node: Element; index: number; parent: { children: ElementContent[] } }> =
      [];

    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'pre' || index === null || !parent) return;
      const codeEl = node.children[0];
      if (!codeEl || codeEl.type !== 'element' || codeEl.tagName !== 'code') return;
      const cls = codeEl.properties?.className;
      if (!Array.isArray(cls) || !cls.includes('language-mermaid')) return;
      nodes.push({ node, index, parent: parent as { children: ElementContent[] } });
    });

    if (nodes.length === 0) return;

    // Try to load beautiful-mermaid (optional — graceful fallback if absent).
    let renderFn: ((code: string) => string) | null = null;
    try {
      const mod = await import('beautiful-mermaid');
      const theme = options.theme != null ? mod.THEMES[options.theme] : undefined;
      renderFn = (code: string) => mod.renderMermaidSVG(code, theme);
    } catch {
      // beautiful-mermaid not installed; leave code blocks unchanged.
      return;
    }

    // Replace each mermaid block with a rendered SVG wrapped in a div.
    // Iterate in reverse so index values remain valid after splicing.
    for (const { node, index, parent } of nodes.reverse()) {
      const code = hastToString(node.children[0] as Element).trim();
      const svg = renderFn(code);
      const divNode: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['notro-mermaid'] },
        // Use a 'raw' node so rehype-raw forwards the SVG string as-is.
        children: [{ type: 'raw', value: svg } as unknown as ElementContent],
      };
      parent.children.splice(index, 1, divNode);
    }
  };
};

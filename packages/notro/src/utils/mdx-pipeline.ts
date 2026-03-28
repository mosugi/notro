/**
 * MDX plugin pipeline for Notion Enhanced Markdown.
 *
 * Parser layer — configures the remark (markdown → mdast) and rehype
 * (hast → HTML) plugin chains. Astro runtime binding lives in compile-mdx.ts.
 *
 * Responsibility layers:
 *   - NOTION_CORE_REMARK_PLUGINS: always active, required for Notion content
 *   - NOTION_CORE_REHYPE_PLUGINS (internal): always active, Notion-specific
 *   - User-provided plugins via notro({ remarkPlugins, rehypePlugins }):
 *       math (remark-math + rehype-katex), syntax highlighting (@shikijs/rehype),
 *       and any other plugins the user wants to add
 */

import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { remarkNfm } from 'remark-nfm';
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
import { getNotroPlugins } from './notro-config.ts';

import type { Plugin, PluggableList } from 'unified';
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';
import { toString as hastToString } from 'hast-util-to-string';
import type { LinkToPages } from '../types.ts';

// Notion-specific custom element names that rehype-raw must pass through
// without stripping. These are mapped to Astro components in notionComponents.
const NOTION_CUSTOM_ELEMENTS = [
	// MDX AST node types — must be passed through rehype-raw or it throws
	// "Cannot compile mdxJsxFlowElement node" at build time.
	'mdxJsxFlowElement',
	'mdxJsxTextElement',
	'mdxFlowExpression',
	'mdxTextExpression',
	'mdxJsImport',
	'mdxJsExport',
	'callout',
	'columns',
	'column',
	'audio',
	'video',
	'file',
	'pdf',
	'page',
	'database',
	'table_of_contents',
	'synced_block',
	'synced_block_reference',
	'empty-block',
	'mention-user',
	'mention-page',
	'mention-database',
	'mention-data-source',
	'mention-agent',
	'mention-date',
	'mermaid',
];

// ── URL resolution ─────────────────────────────────────────────────────────

function resolveNotionUrl(
	url: string,
	linkToPages: LinkToPages,
): { href: string; isExternal: boolean } {
	// Notion URLs end with the page ID (32-char hex, with or without dashes).
	// Example: https://www.notion.so/My-Page-Title-abc123def456...
	// Strip dashes from both the URL and the ID, then check whether the URL
	// ends with the normalised ID. Using endsWith() instead of includes()
	// prevents a shorter ID from matching a different longer ID that happens
	// to contain it as a substring (e.g. "abc" matching "abc123").
	const urlNoDash = url.replace(/-/g, '');
	for (const [pageId, info] of Object.entries(linkToPages)) {
		const idNoDash = pageId.replace(/-/g, '');
		if (urlNoDash === idNoDash || urlNoDash.endsWith(idNoDash)) {
			return { href: `/${info.url}`, isExternal: false };
		}
	}
	return { href: url, isExternal: true };
}

type ResolveOptions = { linkToPages: LinkToPages };

/**
 * Rehype plugin: resolves Notion page/database URLs in hast elements.
 * Handles <page>, <database>, <mention-page>, <mention-database>, and <a href>.
 * Does not rename elements — component mapping in NotionMarkdownRenderer handles rendering.
 */
const resolvePageLinksPlugin: Plugin<[ResolveOptions], Root> = (options) => {
	const { linkToPages } = options;
	return (tree) => {
		visit(tree, 'element', (node: Element) => {
			if (node.tagName === 'page' || node.tagName === 'database') {
				const raw = node.properties?.url;
				const url = typeof raw === 'string' ? raw : undefined;
				if (url) {
					const { href } = resolveNotionUrl(url, linkToPages);
					node.properties = { ...node.properties, url: href };
				}
				return;
			}

			if (node.tagName === 'mention-page' || node.tagName === 'mention-database') {
				const raw = node.properties?.url;
				const url = typeof raw === 'string' ? raw : undefined;
				if (url) {
					const { href } = resolveNotionUrl(url, linkToPages);
					node.properties = { ...node.properties, url: href };
				}
				return;
			}

			if (node.tagName === 'a') {
				const rawHref = node.properties?.href;
				const href = typeof rawHref === 'string' ? rawHref : undefined;
				if (href?.includes('notion.so')) {
					const { href: resolved, isExternal } = resolveNotionUrl(href, linkToPages);
					if (!isExternal) {
						node.properties = { ...node.properties, href: resolved };
					}
				}
			}
		});
	};
};

// ── Mermaid extraction ─────────────────────────────────────────────────────

/**
 * Rehype plugin: extracts ```mermaid code blocks into <mermaid> custom elements.
 *
 * Transforms:
 *   <pre><code class="language-mermaid">CODE</code></pre>
 * Into:
 *   <mermaid code="url-encoded-CODE">
 *     <pre><code class="language-mermaid">CODE</code></pre>
 *   </mermaid>
 *
 * The original <pre><code> is kept as fallback content inside <mermaid>.
 * - With MermaidBlock component (notro-ui): renders SVG, ignores children
 * - With defaultComponents (headless): inner <pre><code> is displayed as-is
 *
 * Rendering is intentionally NOT done here — it belongs to the UI layer
 * (notro-ui's MermaidBlock.astro). This plugin only marks and extracts.
 */
const rehypeExtractMermaid: Plugin<[], Root> = () => {
	return (tree) => {
		visit(tree, 'element', (node: Element, index, parent) => {
			if (node.tagName !== 'pre' || !parent || index === null) return;
			const codeEl = node.children[0];
			if (!codeEl || codeEl.type !== 'element' || codeEl.tagName !== 'code') return;
			const cls = codeEl.properties?.className;
			if (!Array.isArray(cls) || !cls.includes('language-mermaid')) return;

			const code = hastToString(codeEl).trim();
			// Wrap the original <pre><code> as fallback content inside <mermaid>.
			// MermaidBlock.astro will render SVG and ignore fallback children.
			// defaultComponents['mermaid'] (makeHtmlElement('div')) will display
			// the fallback <pre><code> when no MermaidBlock is configured.
			const mermaidNode = fromHtmlIsomorphic(
				`<mermaid code="${encodeURIComponent(code)}"></mermaid>`,
				{ fragment: true },
			).children[0] as Element;
			mermaidNode.children = [node]; // keep original <pre><code> as fallback
			parent.children.splice(index, 1, mermaidNode);
		});
	};
};

// ── TOC population ─────────────────────────────────────────────────────────

/**
 * Rehype plugin: populates <table_of_contents> elements with anchor links
 * generated from all h1–h4 headings in the document.
 *
 * Must run AFTER rehype-slug so that headings already have id attributes.
 * Performs a two-pass traversal:
 *  1. Collect every h1–h4 that has an id (added by rehype-slug).
 *  2. Replace the children of each <table_of_contents> with a <ul> list
 *     of <li><a href="#id"> entries, preserving heading level as a
 *     data-level attribute for CSS indentation.
 */
const rehypeTocPlugin: Plugin<[], Root> = () => {
	return (tree) => {
		// Pass 1: collect headings with IDs
		const headings: Array<{ level: number; id: string; text: string }> = [];
		visit(tree, 'element', (node: Element) => {
			const match = /^h([1-4])$/.exec(node.tagName);
			if (!match) return;
			const id = node.properties?.id;
			if (typeof id !== 'string' || !id) return;
			headings.push({
				level: parseInt(match[1], 10),
				id,
				text: hastToString(node),
			});
		});

		if (headings.length === 0) return;

		// Pass 2: inject heading links into <table_of_contents> elements
		const listItems = headings.map((h) => ({
			type: 'element' as const,
			tagName: 'li',
			properties: { className: [`notro-toc-item`, `notro-toc-level-${h.level}`] },
			children: [
				{
					type: 'element' as const,
					tagName: 'a',
					properties: { href: `#${h.id}` },
					children: [{ type: 'text' as const, value: h.text }],
				},
			],
		}));

		visit(tree, 'element', (node: Element) => {
			if (node.tagName !== 'table_of_contents') return;
			node.children = [
				{
					type: 'element',
					tagName: 'ul',
					properties: { className: ['notro-toc-list'] },
					children: listItems,
				},
			];
		});
	};
};

// ── Plugin bundle factory ──────────────────────────────────────────────────

export type MdxPlugins = {
	remarkPlugins: PluggableList;
	rehypePlugins: PluggableList;
};

/**
 * Core remark plugins required for Notion content.
 * Exported so integration.ts can reference them without duplication.
 */
export const NOTION_CORE_REMARK_PLUGINS: PluggableList = [
	// remarkNfm bundles: preprocessNotionMarkdown (pre-parse), remarkDirective,
	// and calloutPlugin — everything specific to Notion-flavored Markdown.
	remarkNfm,
	remarkGfm,
];

/**
 * @deprecated Use NOTION_CORE_REMARK_PLUGINS instead.
 * Kept for backwards compatibility; will be removed in a future release.
 */
export const BASE_REMARK_PLUGINS: PluggableList = NOTION_CORE_REMARK_PLUGINS;

/** Returns the remark and rehype plugin configuration for Notion MDX. */
export function buildMdxPlugins(linkToPages: LinkToPages): MdxPlugins {
	const { remarkPlugins: userRemarkPlugins, rehypePlugins: userRehypePlugins } = getNotroPlugins();

	return {
		remarkPlugins: [
			...NOTION_CORE_REMARK_PLUGINS,
			...userRemarkPlugins,
		],
		rehypePlugins: [
			// rehypeRaw must come first: converts raw HTML strings in mdast into
			// hast element nodes so that subsequent plugins and component mapping
			// can process them (e.g. <table>, <h2 color="...">, etc.).
			// passThrough preserves Notion-specific custom elements that are not
			// valid HTML and would otherwise be stripped by the HTML parser.
			[rehypeRaw, { passThrough: NOTION_CUSTOM_ELEMENTS }],
			// rehypeExtractMermaid converts ```mermaid blocks to <mermaid code="...">
			// custom elements before user plugins run (so shiki doesn't highlight them).
			rehypeExtractMermaid,
			// User-provided plugins: math rendering, syntax highlighting, etc.
			// e.g. notro({ rehypePlugins: [rehypeKatex, [rehypeShiki, { theme: 'github-dark' }]] })
			...userRehypePlugins,
			// rehype-slug adds id attributes to h1–h4 elements.
			// Must run before rehypeTocPlugin, which reads those ids.
			rehypeSlug,
			// Populates <table_of_contents> with anchor links to all headings.
			rehypeTocPlugin,
			[resolvePageLinksPlugin, { linkToPages }] as const,
		],
	};
}

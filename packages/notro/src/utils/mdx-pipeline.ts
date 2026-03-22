/**
 * MDX plugin pipeline for Notion Enhanced Markdown.
 *
 * Parser layer — configures the remark (markdown → mdast) and rehype
 * (hast → HTML) plugin chains. Astro runtime binding lives in compile-mdx.ts.
 */

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeShiki from '@shikijs/rehype';
import { remarkNfm } from 'remark-nfm';
import { renderMermaidSVG, THEMES } from 'beautiful-mermaid';
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
import type { Plugin, PluggableList } from 'unified';
import type { Root, Element, ElementContent } from 'hast';
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

// ── Mermaid diagram rendering ──────────────────────────────────────────────

/**
 * Rehype plugin: converts ```mermaid code blocks to inline SVG diagrams.
 * Runs before rehypeShiki so that Shiki does not try to highlight mermaid code.
 * Uses beautiful-mermaid for synchronous SSG-friendly rendering (no DOM/browser required).
 */
const rehypeMermaid: Plugin<[], Root> = () => {
	return (tree) => {
		visit(tree, 'element', (node: Element, index, parent) => {
			if (node.tagName !== 'pre' || !parent || index === null) return;
			const codeEl = node.children[0];
			if (!codeEl || codeEl.type !== 'element' || codeEl.tagName !== 'code') return;
			const cls = codeEl.properties?.className;
			if (!Array.isArray(cls) || !cls.includes('language-mermaid')) return;

			const code = hastToString(codeEl).trim();
			try {
				const svg = renderMermaidSVG(code, THEMES['github-dark']);
				// Keep the SVG's natural pixel dimensions (width/height attributes).
				// The .nt-mermaid-block container has overflow-x:auto, so diagrams wider than
				// the viewport scroll horizontally rather than being clipped or scaled down.
				// Scaling via width:100% causes content outside the viewBox to be clipped by
				// the scroll container even with overflow:visible on the SVG element.
				const fragment = fromHtmlIsomorphic(
					`<div class="nt-mermaid-block">${svg}</div>`,
					{ fragment: true },
				);
				parent.children.splice(index, 1, ...fragment.children);
			} catch (err) {
				console.warn('[notro] Mermaid rendering failed:', err);
			}
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
		const listItems: ElementContent[] = headings.map((h) => ({
			type: 'element',
			tagName: 'li',
			properties: { className: [`nt-toc-item`, `nt-toc-level-${h.level}`] },
			children: [
				{
					type: 'element',
					tagName: 'a',
					properties: { href: `#${h.id}` },
					children: [{ type: 'text', value: h.text }],
				},
			],
		}));

		visit(tree, 'element', (node: Element) => {
			if (node.tagName !== 'table_of_contents') return;
			node.children = [
				{
					type: 'element',
					tagName: 'ul',
					properties: { className: ['nt-toc-block__list'] },
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
 * Base remark plugins shared between the runtime MDX pipeline and the
 * static @astrojs/mdx integration. Exported so integration.ts can import
 * them directly instead of duplicating the list.
 */
export const BASE_REMARK_PLUGINS: PluggableList = [
	// remarkNfm bundles: preprocessNotionMarkdown (pre-parse), remarkDirective,
	// and calloutPlugin — everything specific to Notion-flavored Markdown.
	remarkNfm,
	remarkGfm,
	remarkMath,
];

/** Returns the remark and rehype plugin configuration for Notion MDX. */
export function buildMdxPlugins(linkToPages: LinkToPages): MdxPlugins {
	return {
		remarkPlugins: BASE_REMARK_PLUGINS,
		rehypePlugins: [
			// rehypeRaw must come first: converts raw HTML strings in mdast into
			// hast element nodes so that subsequent plugins and component mapping
			// can process them (e.g. <table>, <h2 color="...">, etc.).
			// passThrough preserves Notion-specific custom elements that are not
			// valid HTML and would otherwise be stripped by the HTML parser.
			[rehypeRaw, { passThrough: NOTION_CUSTOM_ELEMENTS }],
			rehypeKatex,
			// rehypeMermaid must run before rehypeShiki so Shiki does not
			// attempt to highlight mermaid code blocks.
			rehypeMermaid,
			[rehypeShiki, { theme: 'github-dark' }],
			// rehype-slug adds id attributes to h1–h4 elements.
			// Must run before rehypeTocPlugin, which reads those ids.
			rehypeSlug,
			// Populates <table_of_contents> with anchor links to all headings.
			rehypeTocPlugin,
			[resolvePageLinksPlugin, { linkToPages }] as const,
		],
	};
}

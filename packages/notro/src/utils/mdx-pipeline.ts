/**
 * MDX plugin pipeline for Notion Enhanced Markdown.
 *
 * Parser layer — configures the remark (markdown → mdast) and rehype
 * (hast → HTML) plugin chains. Astro runtime binding lives in compile-mdx.ts.
 */

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkNfm } from '../markdown/plugins/nfm.ts';
import type { Plugin, PluggableList } from 'unified';
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';
import type { LinkToPages } from '../types.ts';

// ── URL resolution ─────────────────────────────────────────────────────────

function resolveNotionUrl(
	url: string,
	linkToPages: LinkToPages,
): { href: string; isExternal: boolean } {
	const urlNoDash = url.replace(/-/g, '');
	for (const [pageId, info] of Object.entries(linkToPages)) {
		if (urlNoDash.includes(pageId.replace(/-/g, ''))) {
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

// ── Plugin bundle factory ──────────────────────────────────────────────────

export type MdxPlugins = {
	remarkPlugins: PluggableList;
	rehypePlugins: PluggableList;
};

/** Returns the remark and rehype plugin configuration for Notion MDX. */
export function buildMdxPlugins(linkToPages: LinkToPages): MdxPlugins {
	return {
		remarkPlugins: [
			// remarkNfm bundles: preprocessNotionMarkdown (pre-parse), remarkDirective,
			// and calloutPlugin — everything specific to Notion-flavored Markdown.
			remarkNfm,
			remarkGfm,
			remarkMath,
		],
		rehypePlugins: [
			rehypeKatex,
			[resolvePageLinksPlugin, { linkToPages }] as const,
		],
	};
}

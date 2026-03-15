/**
 * Remote MDX → Astro component conversion utility
 *
 * Uses @mdx-js/mdx's evaluate() to compile a preprocessed Notion markdown
 * string into an Astro component that accepts <Content components={...} />.
 *
 * Reference implementation:
 *   - packages/integrations/mdx/src/vite-plugin-mdx-postprocess.ts
 *   - packages/integrations/mdx/src/plugins.ts (createMdxProcessor)
 *   - packages/astro/src/jsx-runtime/index.ts (createVNode = jsx/jsxs)
 */

import { evaluate, type EvaluateOptions } from '@mdx-js/mdx';
import { createHash } from 'node:crypto';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import rehypeKatex from 'rehype-katex';
import { calloutPlugin } from '../markdown/plugins/callout.ts';
import type { Plugin } from 'unified';
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

// Import Astro's jsx-runtime so evaluate() produces Astro VNodes.
// (astro/src/jsx-runtime/index.ts:94)
import { Fragment, jsx, jsxs } from 'astro/jsx-runtime';

// Required to register Content as an 'astro:jsx' renderer.
// Equivalent to annotateContentExport() in vite-plugin-mdx-postprocess.ts.
import { __astro_tag_component__ } from 'astro/runtime/server/index.js';

import type { LinkToPages } from '../markdown/transformer.ts';

// ── URL resolution plugin ──────────────────────────────────────────────────
// Resolves notion.so URLs in <page>, <database>, and <a href="..."> elements
// without changing element names, so the component mapping can handle rendering.

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

/** Resolves Notion URLs in url/href attributes without changing element names */
const resolvePageLinksPlugin: Plugin<[ResolveOptions], Root> = (options) => {
	const { linkToPages } = options;
	return (tree) => {
		visit(tree, 'element', (node: Element) => {
			// <page url="..."> and <database url="..."> — resolve url prop only
			if (node.tagName === 'page' || node.tagName === 'database') {
				const url = node.properties?.url as string | undefined;
				if (url) {
					const { href } = resolveNotionUrl(url, linkToPages);
					node.properties = { ...node.properties, url: href };
				}
				return;
			}

			// <mention-page url="..."> and <mention-database url="...">
			if (node.tagName === 'mention-page' || node.tagName === 'mention-database') {
				const url = node.properties?.url as string | undefined;
				if (url) {
					const { href } = resolveNotionUrl(url, linkToPages);
					node.properties = { ...node.properties, url: href };
				}
				return;
			}

			// Plain <a href="https://notion.so/..."> links
			if (node.tagName === 'a') {
				const href = node.properties?.href as string | undefined;
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

// ── Compile options factory ────────────────────────────────────────────────

function buildEvaluateOptions(linkToPages: LinkToPages): EvaluateOptions {
	return {
		// Use Astro's jsx-runtime (same as local MDX integration)
		jsx,
		jsxs,
		Fragment,
		remarkPlugins: [
			remarkGfm,
			remarkMath,
			remarkDirective,
			// Converts :::callout{...} directives to <callout icon="..." color="...">
			calloutPlugin,
		],
		rehypePlugins: [
			rehypeKatex,
			[resolvePageLinksPlugin, { linkToPages }] as const,
		],
	};
}

// ── Core compile function ──────────────────────────────────────────────────

/**
 * Compiles a preprocessed Notion markdown string into an Astro component
 * that can be rendered with <Content components={notionComponents} />.
 *
 * @param mdxSource - Preprocessed markdown string (from loader store)
 * @param options.linkToPages - Optional map for resolving Notion page URLs
 *
 * @example
 * ```astro
 * ---
 * const Content = await compileMdxForAstro(entry.data.markdown, { linkToPages });
 * ---
 * <Content components={notionComponents} />
 * ```
 */
export async function compileMdxForAstro(
	mdxSource: string,
	options: { linkToPages?: LinkToPages } = {},
) {
	const { linkToPages = {} } = options;
	const evaluateOptions = buildEvaluateOptions(linkToPages);

	// evaluate() compiles + executes the MDX using Astro's jsx-runtime,
	// producing a function that returns Astro VNodes.
	const mod = await evaluate(mdxSource, evaluateOptions);
	const MDXContent = mod.default;

	// Pick up any `export const components = {...}` defined inside the MDX source.
	const mdxInternalComponents = (mod as Record<string, unknown>).components ?? {};

	// Wraps MDXContent so props.components are merged in priority order:
	//   1. Caller's <Content components={{...}} />
	//   2. MDX-internal `export const components`
	//   3. Fragment (required)
	// Equivalent to transformContentExport() in vite-plugin-mdx-postprocess.ts.
	const Content = (props: Record<string, unknown> = {}) =>
		MDXContent({
			...props,
			components: {
				Fragment,
				...(mdxInternalComponents as Record<string, unknown>),
				...(props.components as Record<string, unknown> | undefined),
			},
		});

	// Tag the component so Astro's rendering pipeline handles it correctly.
	// Equivalent to annotateContentExport() in vite-plugin-mdx-postprocess.ts.
	Content[Symbol.for('mdx-component')] = true;
	Content[Symbol.for('astro.needsHeadRendering')] = true;
	__astro_tag_component__(Content, 'astro:jsx');

	return Content;
}

// ── Cached variant ─────────────────────────────────────────────────────────

// Cache compilation results by content hash + linkToPages hash.
// Prevents redundant recompilation of the same content during a build.
const compilationCache = new Map<string, ReturnType<typeof compileMdxForAstro>>();

export async function compileMdxCached(
	mdxSource: string,
	options: { linkToPages?: LinkToPages } = {},
) {
	const linkToPages = options.linkToPages ?? {};
	const key = createHash('sha256')
		.update(mdxSource)
		.update(JSON.stringify(linkToPages))
		.digest('hex');

	if (!compilationCache.has(key)) {
		compilationCache.set(key, compileMdxForAstro(mdxSource, options));
	}

	return compilationCache.get(key)!;
}

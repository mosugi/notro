/**
 * MDX → Astro component compiler.
 *
 * Astro integration layer: wires the MDX plugin pipeline from mdx-pipeline.ts
 * into Astro's jsx-runtime, registers the result with Astro's component
 * renderer, and caches compiled output by content hash.
 */

import { evaluate } from '@mdx-js/mdx';
import { createHash } from 'node:crypto';
import { buildMdxPlugins } from './mdx-pipeline.ts';
import type { LinkToPages } from '../types.ts';

// Import Astro's jsx-runtime so evaluate() produces Astro VNodes.
// (astro/src/jsx-runtime/index.ts:94)
import { Fragment, jsx, jsxs } from 'astro/jsx-runtime';

// Required to register Content as an 'astro:jsx' renderer.
// Equivalent to annotateContentExport() in vite-plugin-mdx-postprocess.ts.
import { __astro_tag_component__ } from 'astro/runtime/server/index.js';

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
	const { remarkPlugins, rehypePlugins } = buildMdxPlugins(linkToPages);

	// evaluate() compiles + executes the MDX using Astro's jsx-runtime,
	// producing a function that returns Astro VNodes.
	const mod = await evaluate(mdxSource, {
		jsx,
		jsxs,
		Fragment,
		remarkPlugins,
		rehypePlugins,
	});
	const MDXContent = mod.default;

	// Pick up any `export const components = {...}` defined inside the MDX source.
	const mdxInternalComponents = (mod as Record<string, unknown>).components ?? {};

	// Wraps MDXContent so props.components are merged in priority order:
	//   1. Caller's <Content components={{...}} />
	//   2. MDX-internal `export const components`
	//   3. Fragment (required)
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
	// Symbol.for("astro.needsHeadRendering") is checked by Astro's component renderer.
	// __astro_tag_component__ sets Symbol.for("astro:renderer") = 'astro:jsx',
	// which routes rendering through Astro's built-in JSX renderer.
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

	let entry = compilationCache.get(key);
	if (!entry) {
		entry = compileMdxForAstro(mdxSource, options);
		compilationCache.set(key, entry);
	}
	return entry;
}

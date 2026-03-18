/**
 * Astro integration for notro.
 *
 * Injects `@astrojs/mdx` with notro's plugin suite, which:
 * 1. Registers the `astro:jsx` renderer — required for `@mdx-js/mdx`'s `evaluate()`
 *    to work in Astro's SSG prerender pipeline.
 * 2. Configures any `.mdx` files in the project with the same remark/rehype
 *    plugins used by notro's runtime MDX compilation (see mdx-pipeline.ts).
 *
 * Usage in astro.config.mjs:
 * ```js
 * import { notro } from 'notro/integration';
 * export default defineConfig({ integrations: [notro()] });
 * ```
 */

import type { AstroIntegration } from 'astro';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeShiki from '@shikijs/rehype';
import { remarkNfm } from 'remark-nfm';

export function notro(): AstroIntegration {
	return {
		name: 'notro',
		hooks: {
			'astro:config:setup'({ updateConfig }) {
				// Inject @astrojs/mdx by appending to the integrations array via
				// updateConfig(). Astro's config setup loop re-checks the array length
				// each iteration, so the injected MDX integration is picked up and its
				// own astro:config:setup hook runs immediately after notro's hook.
				updateConfig({
					integrations: [mdx({
						// Mirror buildMdxPlugins() from mdx-pipeline.ts so static .mdx
						// files and the runtime evaluate() path share the same plugin
						// pipeline (same remark and rehype plugins in the same order).
						remarkPlugins: [remarkNfm, remarkGfm, remarkMath],
						rehypePlugins: [rehypeKatex, [rehypeShiki, { theme: 'github-dark' }]],
						// Do not inherit Astro's default markdown config.
						// Astro adds remarkGfm and other plugins by default; allowing
						// inheritance would register them twice alongside our explicit list.
						extendMarkdownConfig: false,
					// `as any` is needed because Astro's TypeScript types for updateConfig
					// only accept AstroIntegration[], but @astrojs/mdx returns its own
					// subtype that is structurally compatible but not assignable. This is
					// a limitation in Astro's type definitions, not a runtime issue.
					})] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
				});
			},
		},
	};
}

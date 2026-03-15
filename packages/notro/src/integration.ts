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
import { remarkNfm } from 'remark-nfm';

export function notro(): AstroIntegration {
	return {
		name: 'notro',
		hooks: {
			'astro:config:setup'({ updateConfig }) {
				// Append @astrojs/mdx into the integrations list via updateConfig.
				// Astro's runHookConfigSetup loop re-checks .length each iteration,
				// so this integration is processed immediately after notro's own hook.
				updateConfig({
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					integrations: [mdx({
						// Mirror buildMdxPlugins() from mdx-pipeline.ts so static .mdx files
						// and runtime evaluate() share the same plugin pipeline.
						remarkPlugins: [remarkNfm, remarkGfm, remarkMath],
						rehypePlugins: [rehypeKatex],
						// Do not inherit Astro's default markdown config to prevent
						// duplicate plugin registration.
						extendMarkdownConfig: false,
					})] as any,
				});
			},
		},
	};
}

/**
 * Astro integration for notro.
 *
 * Injects `@astrojs/mdx` with notro's plugin suite, which:
 * 1. Registers the `astro:jsx` renderer — required for `@mdx-js/mdx`'s `evaluate()`
 *    to work in Astro's SSG prerender pipeline.
 * 2. Configures any `.mdx` files in the project with the same remark/rehype
 *    plugins used by notro's runtime MDX compilation (see mdx-pipeline.ts).
 *
 * The interface mirrors `@astrojs/mdx` so that Astro users can configure
 * notro with the same patterns documented in:
 * https://docs.astro.build/ja/guides/integrations-guide/mdx/
 *
 * Usage in astro.config.mjs:
 * ```js
 * import { notro } from 'notro/integration';
 * import remarkMath from 'remark-math';
 * import rehypeKatex from 'rehype-katex';
 * import rehypeShiki from '@shikijs/rehype';
 *
 * export default defineConfig({
 *   integrations: [
 *     notro({
 *       remarkPlugins: [remarkMath],
 *       rehypePlugins: [rehypeKatex, [rehypeShiki, { theme: 'github-dark' }]],
 *     }),
 *   ],
 * });
 * ```
 *
 * When no options are provided, notro only applies its Notion-core plugins
 * (remarkNfm, remarkGfm, rehypeRaw, rehypeSlug, etc.). Rich rendering features
 * like math, syntax highlighting, and diagrams are opt-in via the options above.
 */

import type { AstroIntegration } from 'astro';
import type { PluggableList } from 'unified';
import mdx from '@astrojs/mdx';
import { NOTION_CORE_REMARK_PLUGINS } from './utils/mdx-pipeline.ts';
import { setNotroPlugins } from './utils/notro-config.ts';

/**
 * Options for the notro() Astro integration.
 * Mirrors the @astrojs/mdx interface for familiarity.
 */
export interface NotroOptions {
	/**
	 * Remark plugins to add on top of notro's core Notion plugins.
	 * Same as @astrojs/mdx's remarkPlugins option.
	 * Applied to both the runtime Notion content path and static .mdx files.
	 *
	 * @example [remarkMath]
	 */
	remarkPlugins?: PluggableList;

	/**
	 * Rehype plugins to add after notro's core Notion plugins.
	 * Same as @astrojs/mdx's rehypePlugins option.
	 * Applied to both the runtime Notion content path and static .mdx files.
	 *
	 * @example [rehypeKatex, [rehypeShiki, { theme: 'github-dark' }]]
	 */
	rehypePlugins?: PluggableList;

	/**
	 * Whether to extend Astro's base markdown config.
	 * Same as @astrojs/mdx's extendMarkdownConfig option.
	 * Defaults to false to avoid duplicate plugin registration.
	 */
	extendMarkdownConfig?: boolean;
}

export function notro(options: NotroOptions = {}): AstroIntegration {
	const {
		remarkPlugins = [],
		rehypePlugins = [],
		extendMarkdownConfig = false,
	} = options;

	return {
		name: 'notro',
		hooks: {
			'astro:config:setup'({ updateConfig }) {
				// Share user-provided plugins with the runtime compileMdxCached() path
				// via the module-level config store in notro-config.ts.
				// Both the static .mdx path (via @astrojs/mdx below) and the runtime
				// Notion content path (via buildMdxPlugins → getNotroPlugins) will
				// use the same plugin configuration.
				setNotroPlugins(remarkPlugins, rehypePlugins);

				// Inject @astrojs/mdx by appending to the integrations array via
				// updateConfig(). Astro's config setup loop re-checks the array length
				// each iteration, so the injected MDX integration is picked up and its
				// own astro:config:setup hook runs immediately after notro's hook.
				updateConfig({
					integrations: [mdx({
						// Combine notro's core Notion remark plugins with user-provided ones.
						remarkPlugins: [...NOTION_CORE_REMARK_PLUGINS, ...remarkPlugins],
						// User-provided rehype plugins (math, syntax highlighting, etc.).
						rehypePlugins,
						extendMarkdownConfig,
					// `as any` is needed because Astro's TypeScript types for updateConfig
					// only accept AstroIntegration[], but @astrojs/mdx returns its own
					// subtype that is structurally compatible but not assignable.
					})] as any, // eslint-disable-line @typescript-eslint/no-explicit-any

					vite: {
						ssr: {
							// Externalize optional rehype/remark plugin dependencies so that
							// dynamic import() calls in rehype transformers (e.g. rehypeMermaid
							// importing beautiful-mermaid) use Node.js's native ESM loader
							// rather than Vite's module runner.
							//
							// Without this, import('beautiful-mermaid') inside a rehype
							// transformer fails with "Vite module runner has been closed"
							// because transformers run during Astro's SSG prerender phase,
							// after the Vite module runner has already been shut down.
							external: ['beautiful-mermaid'],
						},
					},
				});
			},
		},
	};
}

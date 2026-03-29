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
 * import { rehypeMermaid } from 'rehype-mermaid';
 * import remarkMath from 'remark-math';
 * import rehypeKatex from 'rehype-katex';
 *
 * export default defineConfig({
 *   integrations: [
 *     notro({
 *       shikiConfig: { theme: 'github-dark' },
 *       remarkPlugins: [remarkMath],
 *       rehypePlugins: [
 *         [rehypeMermaid, { theme: 'github-dark' }],
 *         rehypeKatex,
 *       ],
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
import rehypeShiki from '@shikijs/rehype';
import type { RehypeShikiOptions } from '@shikijs/rehype';
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
	 * @example [remarkMath]  // from 'notro-math'
	 */
	remarkPlugins?: PluggableList;

	/**
	 * Rehype plugins to add after notro's core Notion plugins.
	 * Same as @astrojs/mdx's rehypePlugins option.
	 * Applied to both the runtime Notion content path and static .mdx files.
	 *
	 * @example [[rehypeMermaid, { theme: 'github-dark' }], rehypeKatex]
	 */
	rehypePlugins?: PluggableList;

	/**
	 * Shiki syntax highlighting configuration.
	 * When provided, @shikijs/rehype is automatically injected as the last rehype
	 * plugin so that other plugins (rehypeMermaid, rehypeKatex) run first.
	 * Equivalent to appending `[rehypeShiki, shikiConfig]` to rehypePlugins.
	 *
	 * @example { theme: 'github-dark' }
	 * @example { themes: { light: 'github-light', dark: 'github-dark' } }
	 */
	shikiConfig?: RehypeShikiOptions;

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
		shikiConfig,
		extendMarkdownConfig = false,
	} = options;

	// When shikiConfig is provided, inject @shikijs/rehype as the last rehype
	// plugin so diagram/math plugins (rehypeMermaid, rehypeKatex) run first.
	const allRehypePlugins: PluggableList = shikiConfig != null
		? [...rehypePlugins, [rehypeShiki, shikiConfig]]
		: rehypePlugins;

	return {
		name: 'notro',
		hooks: {
			'astro:config:setup'({ updateConfig }) {
				// Share user-provided plugins with the runtime compileMdxCached() path
				// via the module-level config store in notro-config.ts.
				// Both the static .mdx path (via @astrojs/mdx below) and the runtime
				// Notion content path (via buildMdxPlugins → getNotroPlugins) will
				// use the same plugin configuration.
				setNotroPlugins(remarkPlugins, allRehypePlugins);

				// Inject @astrojs/mdx by appending to the integrations array via
				// updateConfig(). Astro's config setup loop re-checks the array length
				// each iteration, so the injected MDX integration is picked up and its
				// own astro:config:setup hook runs immediately after notro's hook.
				updateConfig({
					integrations: [mdx({
						// Combine notro's core Notion remark plugins with user-provided ones.
						remarkPlugins: [...NOTION_CORE_REMARK_PLUGINS, ...remarkPlugins],
						// User and built-in rehype plugins (math, diagrams, shiki, etc.).
						rehypePlugins: allRehypePlugins,
						extendMarkdownConfig,
					// `as any` is needed because Astro's TypeScript types for updateConfig
					// only accept AstroIntegration[], but @astrojs/mdx returns its own
					// subtype that is structurally compatible but not assignable.
					})] as any, // eslint-disable-line @typescript-eslint/no-explicit-any

					vite: {
						ssr: {
							// Externalize optional rehype plugin dependencies so that
							// dynamic import() calls in rehype transformers use Node.js's
							// native ESM loader rather than Vite's module runner.
							//
							// Without this, a dynamic import inside a rehype transformer
							// may fail with "Vite module runner has been closed" during
							// Astro's SSG prerender phase. rehypeMermaid (from rehype-mermaid)
							// uses new Function('return import(s)') to escape Vite's analysis,
							// but this external setting provides belt-and-suspenders safety.
							external: ['beautiful-mermaid'],
						},
					},
				});
			},
		},
	};
}

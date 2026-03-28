/**
 * Module-level configuration store for notro's MDX plugin pipeline.
 *
 * The notro() Astro integration stores the user-provided remark/rehype plugins
 * here during astro:config:setup. buildMdxPlugins() reads them at render time
 * so that both the runtime Notion path (compileMdxCached) and the static .mdx
 * path (@astrojs/mdx) use the same plugin configuration.
 */
import type { PluggableList } from 'unified';

let _remarkPlugins: PluggableList = [];
let _rehypePlugins: PluggableList = [];

export function setNotroPlugins(remarkPlugins: PluggableList, rehypePlugins: PluggableList): void {
	_remarkPlugins = remarkPlugins;
	_rehypePlugins = rehypePlugins;
}

export function getNotroPlugins(): { remarkPlugins: PluggableList; rehypePlugins: PluggableList } {
	return { remarkPlugins: _remarkPlugins, rehypePlugins: _rehypePlugins };
}

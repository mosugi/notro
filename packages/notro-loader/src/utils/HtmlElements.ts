/**
 * Passthrough components for standard HTML elements.
 *
 * Uses astro/jsx-runtime to create lightweight wrappers that inject
 * an optional class string without requiring individual .astro files.
 *
 * makeHtmlElement(tag, cls?) bakes the class in at creation time.
 * The headless notro package uses this with no default classes;
 * notro-ui's NotionMarkdownRenderer passes Tailwind classes at creation time.
 *
 * Note on <code>:
 *   The `code` element is intentionally omitted here. Both inline `code` and
 *   code-block `pre > code` share the same element, so distinguishing them
 *   requires the `:not(pre) > code` CSS selector — handled in notro-theme.css.
 */
import { jsx } from 'astro/jsx-runtime';
import { __astro_tag_component__ } from 'astro/runtime/server/index.js';

export function makeHtmlElement(tag: string, cls?: string) {
	function HtmlElement({ class: className, ...rest }: Record<string, unknown>) {
		const combined = [cls, className].filter(Boolean).join(' ') || undefined;
		return jsx(tag, combined !== undefined ? { ...rest, class: combined } : rest);
	}
	__astro_tag_component__(HtmlElement, 'astro:jsx');
	return HtmlElement;
}


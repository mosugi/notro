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
	// Accept both `class` (from MDX JSX elements / Astro convention) and
	// `className` (from hast-derived elements compiled by hast-util-to-estree,
	// e.g. rehype-katex output uses {className: "katex"} as the prop name).
	function HtmlElement({ class: classProp, className: classNameProp, ...rest }: Record<string, unknown>) {
		const userClass = [classProp as string | undefined, classNameProp as string | undefined]
			.filter(Boolean).join(' ') || undefined;
		const combined = [cls, userClass].filter(Boolean).join(' ') || undefined;
		return jsx(tag, combined !== undefined ? { ...rest, class: combined } : rest);
	}
	__astro_tag_component__(HtmlElement, 'astro:jsx');
	return HtmlElement;
}

// ── Block elements ─────────────────────────────────────────────
export const ParagraphEl     = makeHtmlElement('p');
export const UnorderedListEl = makeHtmlElement('ul');
export const OrderedListEl   = makeHtmlElement('ol');
export const ListItemEl      = makeHtmlElement('li');
export const PreEl           = makeHtmlElement('pre');
export const HrEl            = makeHtmlElement('hr');

// ── Inline elements ────────────────────────────────────────────
export const AnchorEl        = makeHtmlElement('a');
export const StrongEl        = makeHtmlElement('strong');
export const EmEl            = makeHtmlElement('em');
export const DelEl           = makeHtmlElement('del');

// ── Table header cell ──────────────────────────────────────────
export const ThEl            = makeHtmlElement('th');

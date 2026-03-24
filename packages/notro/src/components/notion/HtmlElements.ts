/**
 * Passthrough components for standard HTML elements.
 *
 * Uses astro/jsx-runtime to create lightweight wrappers that inject
 * an optional class string without requiring individual .astro files.
 *
 * makeHtmlElement(tag, cls?) bakes the class in at creation time.
 * NotionMarkdownRenderer calls this per-render when classMap has an entry
 * for the element, so each render gets its own fresh component instance.
 *
 * Note on <code>:
 *   The `code` key is intentionally omitted here. Both inline `code` and
 *   code-block `pre > code` share the same element, so distinguishing them
 *   requires the `:not(pre) > code` CSS selector — which global CSS handles
 *   more precisely than a flat classMap entry can.
 */
import { jsx } from 'astro/jsx-runtime';
import { __astro_tag_component__ } from 'astro/runtime/server/index.js';

export function makeHtmlElement(
	tag: string,
	cls?: string,
	defaultAttrs?: Record<string, string>,
) {
	function HtmlElement({ class: className, ...rest }: Record<string, unknown>) {
		const combined = [cls, className].filter(Boolean).join(' ') || undefined;
		// Caller-supplied props override defaultAttrs (e.g. explicit scope overrides default)
		const attrs = defaultAttrs ? { ...defaultAttrs, ...rest } : rest;
		return jsx(tag, combined !== undefined ? { ...attrs, class: combined } : attrs);
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
// scope="col" is the correct default for GFM tables where <th> elements
// always appear in <thead> as column headers. Callers may override with scope="row".
export const ThEl            = makeHtmlElement('th', undefined, { scope: 'col' });

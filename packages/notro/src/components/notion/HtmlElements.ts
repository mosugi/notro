/**
 * Passthrough components for standard HTML elements.
 *
 * Uses astro/jsx-runtime to create lightweight wrappers that inject
 * classMap-assigned classes without requiring individual .astro files.
 *
 * Each component:
 *   1. Reads its class string from classRegistry via the element's key
 *   2. Merges it with any class already on the element
 *   3. Passes all other props through unchanged
 *
 * Note on <code>:
 *   The `code` key is intentionally omitted here. Both inline `code` and
 *   code-block `pre > code` share the same element, so distinguishing them
 *   requires the `:not(pre) > code` CSS selector — which global CSS handles
 *   more precisely than a flat classMap entry can.
 */
import { jsx } from 'astro/jsx-runtime';
import { __astro_tag_component__ } from 'astro/runtime/server/index.js';
import { getClass } from '../../utils/classRegistry';

function makeHtmlElement(tag: string, registryKey: string) {
	function HtmlElement({ class: className, ...rest }: Record<string, unknown>) {
		const registryClass = getClass(registryKey);
		const combined = [registryClass, className].filter(Boolean).join(' ') || undefined;
		return jsx(tag, combined !== undefined ? { ...rest, class: combined } : rest);
	}
	__astro_tag_component__(HtmlElement, 'astro:jsx');
	return HtmlElement;
}

// ── Block elements ─────────────────────────────────────────────
export const ParagraphEl     = makeHtmlElement('p',      'p');
export const UnorderedListEl = makeHtmlElement('ul',     'ul');
export const OrderedListEl   = makeHtmlElement('ol',     'ol');
export const ListItemEl      = makeHtmlElement('li',     'li');
export const PreEl           = makeHtmlElement('pre',    'pre');
export const HrEl            = makeHtmlElement('hr',     'hr');

// ── Inline elements ────────────────────────────────────────────
export const AnchorEl        = makeHtmlElement('a',      'a');
export const StrongEl        = makeHtmlElement('strong', 'strong');
export const EmEl            = makeHtmlElement('em',     'em');
export const DelEl           = makeHtmlElement('del',    'del');

// ── Table header cell ──────────────────────────────────────────
export const ThEl            = makeHtmlElement('th',     'th');

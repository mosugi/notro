/**
 * Component resolution utilities for NotionMarkdownRenderer.
 *
 * Display layer: maps NotionComponents keys to classMap keys, applies
 * class overrides via withClass(), and merges the final component map
 * passed to <Content components={...} />.
 */

import { jsx } from 'astro/jsx-runtime';
import { __astro_tag_component__ } from 'astro/runtime/server/index.js';
import { makeHtmlElement } from '../components/notion/HtmlElements.ts';
import type { NotionComponents } from '../components/notion/index.ts';
import type { ClassMapKeys } from '../types.ts';

// ── Mapping tables ─────────────────────────────────────────────────────────

/**
 * Maps notionComponents keys to their corresponding classMap keys.
 * Format: [notionComponents key, classMap key]
 *
 * Keep in sync with ClassMapKeys in types.ts.
 */
export const COMPONENT_CLASS_MAP = [
	['callout',                'callout'],
	['details',                'toggle'],
	['summary',                'toggleTitle'],
	['h1', 'h1'], ['h2', 'h2'], ['h3', 'h3'], ['h4', 'h4'],
	['blockquote',             'quote'],
	['img',                    'image'],
	['tr',                     'tableRow'],
	['td',                     'tableCell'],
	['audio',                  'audio'],
	['video',                  'video'],
	['file',                   'file'],
	['pdf',                    'pdf'],
	['page',                   'pageRef'],
	['database',               'databaseRef'],
	['table_of_contents',      'toc'],
	['synced_block',           'syncedBlock'],
	['synced_block_reference', 'syncedBlock'],
	['column',                 'column'],
	['columns',                'columns'],
	['empty-block',            'emptyBlock'],
	['mention-user',           'mention'],
	['mention-page',           'mention'],
	['mention-database',       'mention'],
	['mention-data-source',    'mention'],
	['mention-agent',          'mention'],
] as const;

/** Standard HTML tags that support classMap overrides. */
export const HTML_TAGS = ['p', 'ul', 'ol', 'li', 'pre', 'hr', 'a', 'strong', 'em', 'del', 'th'] as const;

// ── Component wrappers ─────────────────────────────────────────────────────

/**
 * Wraps a component to inject a CSS class via the `class` prop.
 * The injected class is prepended; any existing `class` prop from MDX is appended.
 */
function withClass(Component: unknown, cls: string) {
	const Wrapped = ({ class: extraClass, ...rest }: Record<string, unknown>) => {
		const combined = [cls, extraClass].filter(Boolean).join(' ') || undefined;
		return jsx(
			Component as Parameters<typeof jsx>[0],
			combined !== undefined ? { ...rest, class: combined } : rest,
		);
	};
	__astro_tag_component__(Wrapped, 'astro:jsx');
	return Wrapped;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Builds the merged component map for <Content components={...} />.
 *
 * Priority (highest to lowest):
 *   1. customComponents — caller-provided full replacements
 *   2. classMap overrides — classMap entries applied to default components
 *   3. notionComponents — default Notion component mapping
 */
export function resolveComponents(
	notionComponents: NotionComponents,
	classMap: Partial<Record<ClassMapKeys, string>> = {},
	customComponents?: Partial<NotionComponents & Record<string, unknown>>,
): Record<string, unknown> {
	const overrides: Record<string, unknown> = {};

	// Apply classMap overrides to Notion-specific block/inline components
	for (const [compKey, cmKey] of COMPONENT_CLASS_MAP) {
		const cls = classMap[cmKey];
		if (cls) overrides[compKey] = withClass(notionComponents[compKey], cls);
	}

	// TableBlock special case: outer wrapper (tableWrapper) and inner table (table) are
	// separate elements forwarded via the tableWrapperClass prop on TableBlock.
	if (classMap.tableWrapper || classMap.table) {
		const Base = notionComponents.table as unknown;
		const wrapperCls = classMap.tableWrapper;
		const tableCls = classMap.table;
		const Wrapped = ({ class: extraClass, ...rest }: Record<string, unknown>) => {
			const combined = [tableCls, extraClass].filter(Boolean).join(' ') || undefined;
			return jsx(Base as Parameters<typeof jsx>[0], {
				...rest,
				...(combined !== undefined ? { class: combined } : {}),
				...(wrapperCls ? { tableWrapperClass: wrapperCls } : {}),
			});
		};
		__astro_tag_component__(Wrapped, 'astro:jsx');
		overrides.table = Wrapped;
	}

	// Apply classMap overrides to standard HTML elements
	for (const tag of HTML_TAGS) {
		const cls = classMap[tag];
		if (cls) overrides[tag] = makeHtmlElement(tag, cls);
	}

	return { ...notionComponents, ...overrides, ...customComponents };
}

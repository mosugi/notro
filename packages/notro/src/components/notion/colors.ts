/**
 * Notion color system
 * https://developers.notion.com/reference/block#color
 *
 * The color palette is a fixed set of 9 text colors and 9 background colors.
 * Components emit data-color attributes; notro-ui CSS styles them via
 * [data-color="blue_background"] selectors.
 *
 * Users configure the actual color values by overriding CSS custom properties:
 *   :root { --nt-color-blue: oklch(0.6 0.2 240); --nt-color-blue-bg: oklch(0.95 0.05 240); }
 */

/** Text colors applied to inline text and block headings */
export const NOTION_TEXT_COLORS = [
	'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red',
] as const;

/** Background colors applied to block-level elements (callout, heading, etc.) */
export const NOTION_BG_COLORS = [
	'gray_background', 'brown_background', 'orange_background', 'yellow_background',
	'green_background', 'blue_background', 'purple_background', 'pink_background', 'red_background',
] as const;

export type NotionTextColor = typeof NOTION_TEXT_COLORS[number];
export type NotionBgColor   = typeof NOTION_BG_COLORS[number];

/** Any valid Notion color value — text or background */
export type NotionColor = NotionTextColor | NotionBgColor;

/** Convert a Notion color name to a CSS class name (nt-color-*) */
export function colorToClass(color: string | undefined): string {
	if (!color || color === 'default') return '';
	if (color.endsWith('_background')) {
		const base = color.slice(0, -'_background'.length);
		if ((NOTION_TEXT_COLORS as readonly string[]).includes(base)) return `nt-color-${color}`;
	}
	if ((NOTION_TEXT_COLORS as readonly string[]).includes(color)) return `nt-color-${color}`;
	return '';
}

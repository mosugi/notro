/**
 * Notion color system
 * https://developers.notion.com/reference/block#color
 *
 * notro components use data-color attributes for color annotations.
 * Styling is handled by notro-ui's .nt-markdown-content [data-color="*"] selectors.
 *
 * colorToClass() is kept as a utility for user-land code that needs CSS class names.
 */

const TEXT_COLORS = new Set([
	'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red',
]);

const BG_COLORS = new Set([
	'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red',
]);

/** Convert a Notion color name to a CSS class name (nt-color-*) */
export function colorToClass(color: string | undefined): string {
	if (!color || color === 'default') return '';
	if (color.endsWith('_background')) {
		const base = color.slice(0, -'_background'.length);
		if (BG_COLORS.has(base)) return `nt-color-${color}`;
	}
	if (TEXT_COLORS.has(color)) return `nt-color-${color}`;
	return '';
}


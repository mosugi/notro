/**
 * Notion color system
 * https://developers.notion.com/reference/block#color
 *
 * CSS classes are defined in apps/notro-tail/src/styles/global.css as .nt-color-*
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
	// Support both "_background" (Notion API) and "_bg" (legacy) suffixes
	if (color.endsWith('_background')) {
		const base = color.slice(0, -'_background'.length);
		if (BG_COLORS.has(base)) return `nt-color-${color}`;
	}
	if (color.endsWith('_bg')) {
		const base = color.slice(0, -3);
		if (BG_COLORS.has(base)) return `nt-color-${color}`;
	}
	if (TEXT_COLORS.has(color)) return `nt-color-${color}`;
	return '';
}

/**
 * @deprecated Use colorToClass() instead.
 * colorToCSS() is kept for backward compatibility with custom components.
 * It now returns a CSS class name string instead of an inline style string.
 */
export function colorToCSS(color: string | undefined): string {
	return colorToClass(color);
}

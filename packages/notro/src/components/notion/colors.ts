/**
 * Notion color system
 * https://developers.notion.com/reference/block#color
 */

const COLORS = {
	gray:   { text: '#787774', bg: '#F1F1EF' },
	brown:  { text: '#9F6B53', bg: '#F4EEEE' },
	orange: { text: '#D9730D', bg: '#FBECDD' },
	yellow: { text: '#CB912F', bg: '#FBF3DB' },
	green:  { text: '#448361', bg: '#EDF3EC' },
	blue:   { text: '#337EA9', bg: '#E7F3F8' },
	purple: { text: '#9065B0', bg: '#F6F3F9' },
	pink:   { text: '#C14C8A', bg: '#FAF1F5' },
	red:    { text: '#D44C47', bg: '#FDEBEC' },
} as const;

/** Convert a Notion color name to a CSS style string */
export function colorToCSS(color: string | undefined): string {
	if (!color) return '';
	// Support both "_background" (Notion API) and "_bg" (legacy) suffixes
	if (color.endsWith('_background')) {
		const base = color.slice(0, -'_background'.length) as keyof typeof COLORS;
		if (base in COLORS) return `background-color:${COLORS[base].bg}`;
	}
	if (color.endsWith('_bg')) {
		const base = color.slice(0, -3) as keyof typeof COLORS;
		if (base in COLORS) return `background-color:${COLORS[base].bg}`;
	}
	if (color in COLORS) return `color:${COLORS[color as keyof typeof COLORS].text}`;
	return '';
}

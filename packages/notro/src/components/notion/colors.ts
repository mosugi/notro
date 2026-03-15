/**
 * Notion color system
 * https://developers.notion.com/reference/block#color
 */

const TEXT_COLORS: Record<string, string> = {
	gray: '#787774',
	brown: '#9F6B53',
	orange: '#D9730D',
	yellow: '#CB912F',
	green: '#448361',
	blue: '#337EA9',
	purple: '#9065B0',
	pink: '#C14C8A',
	red: '#D44C47',
};

const BG_COLORS: Record<string, string> = {
	gray_bg: '#F1F1EF',
	brown_bg: '#F4EEEE',
	orange_bg: '#FBECDD',
	yellow_bg: '#FBF3DB',
	green_bg: '#EDF3EC',
	blue_bg: '#E7F3F8',
	purple_bg: '#F6F3F9',
	pink_bg: '#FAF1F5',
	red_bg: '#FDEBEC',
};

/** Convert a Notion color name to a CSS style string */
export function colorToCSS(color: string | undefined): string {
	if (!color) return '';
	if (color in BG_COLORS) return `background-color:${BG_COLORS[color]}`;
	if (color in TEXT_COLORS) return `color:${TEXT_COLORS[color]}`;
	return '';
}

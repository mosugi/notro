/**
 * Notion color system
 * https://developers.notion.com/reference/block#color
 *
 * CSS classes are defined in notro-theme.css.
 * Edit notro-theme.css to change the actual color values.
 */

export const notroColorVariants = {
	default:           '',
	gray:              'notro-text-gray',
	brown:             'notro-text-brown',
	orange:            'notro-text-orange',
	yellow:            'notro-text-yellow',
	green:             'notro-text-green',
	blue:              'notro-text-blue',
	purple:            'notro-text-purple',
	pink:              'notro-text-pink',
	red:               'notro-text-red',
	gray_background:   'notro-bg-gray',
	brown_background:  'notro-bg-brown',
	orange_background: 'notro-bg-orange',
	yellow_background: 'notro-bg-yellow',
	green_background:  'notro-bg-green',
	blue_background:   'notro-bg-blue',
	purple_background: 'notro-bg-purple',
	pink_background:   'notro-bg-pink',
	red_background:    'notro-bg-red',
} as const;

export type NotroColor = keyof typeof notroColorVariants;

/** @deprecated Use notroColorVariants with tailwind-variants instead */
export function colorToClass(color: string | undefined): string {
	if (!color || color === 'default') return '';
	if (color in notroColorVariants) {
		return notroColorVariants[color as NotroColor];
	}
	return '';
}

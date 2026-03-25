/**
 * Notion color → CSS class mapping for notro-ui components.
 *
 * Returns `notro-text-*` or `notro-bg-*` class names defined in notro-theme.css.
 * Edit this file and notro-theme.css to customize colors.
 */

const TEXT_COLOR_MAP: Record<string, string> = {
  gray:   'notro-text-gray',
  brown:  'notro-text-brown',
  orange: 'notro-text-orange',
  yellow: 'notro-text-yellow',
  green:  'notro-text-green',
  blue:   'notro-text-blue',
  purple: 'notro-text-purple',
  pink:   'notro-text-pink',
  red:    'notro-text-red',
};

const BG_COLOR_MAP: Record<string, string> = {
  gray_background:   'notro-bg-gray',
  brown_background:  'notro-bg-brown',
  orange_background: 'notro-bg-orange',
  yellow_background: 'notro-bg-yellow',
  green_background:  'notro-bg-green',
  blue_background:   'notro-bg-blue',
  purple_background: 'notro-bg-purple',
  pink_background:   'notro-bg-pink',
  red_background:    'notro-bg-red',
};

/** Convert a Notion color name to a notro-ui CSS class. */
export function colorToClass(color: string | undefined): string {
  if (!color || color === 'default') return '';
  return TEXT_COLOR_MAP[color] ?? BG_COLOR_MAP[color] ?? '';
}

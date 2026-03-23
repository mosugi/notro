/**
 * CSS-in-JS for tokens.css — Notion color custom properties.
 * Injected via addBase() in the notro-ui TailwindCSS plugin.
 *
 * buildTokens(colors) merges user-supplied color overrides into the defaults.
 *
 * Color key format (matching NotionColor type in notro package):
 *   Text colors:       'gray', 'blue', 'red', ...
 *   Background colors: 'gray_background', 'blue_background', ...
 *
 * In CSS @plugin block, use kebab-case (auto-normalized):
 *   @plugin "notro-ui" { blue: #1d4ed8; blue-background: #eff6ff; }
 */

const DEFAULTS = {
  '--nt-text-rgb':        '55 53 47',

  '--nt-color-gray':      '#787774',
  '--nt-color-brown':     '#9F6B53',
  '--nt-color-orange':    '#D9730D',
  '--nt-color-yellow':    '#CB912F',
  '--nt-color-green':     '#448361',
  '--nt-color-blue':      '#337EA9',
  '--nt-color-purple':    '#9065B0',
  '--nt-color-pink':      '#C14C8A',
  '--nt-color-red':       '#D44C47',

  '--nt-color-gray-bg':   '#F1F1EF',
  '--nt-color-brown-bg':  '#F4EEEE',
  '--nt-color-orange-bg': '#FBECDD',
  '--nt-color-yellow-bg': '#FBF3DB',
  '--nt-color-green-bg':  '#EDF3EC',
  '--nt-color-blue-bg':   '#E7F3F8',
  '--nt-color-purple-bg': '#F6F3F9',
  '--nt-color-pink-bg':   '#FAF1F5',
  '--nt-color-red-bg':    '#FDEBEC',
};

const DEFAULTS_DARK = {
  '--nt-text-rgb':        '226 232 240',

  '--nt-color-gray':      '#9b9b97',
  '--nt-color-brown':     '#c49a82',
  '--nt-color-orange':    '#e88c4a',
  '--nt-color-yellow':    '#d9a84e',
  '--nt-color-green':     '#6aad8a',
  '--nt-color-blue':      '#5ba5cc',
  '--nt-color-purple':    '#b08fd0',
  '--nt-color-pink':      '#d97ab3',
  '--nt-color-red':       '#e07b78',

  '--nt-color-gray-bg':   '#2d2d2b',
  '--nt-color-brown-bg':  '#2e2320',
  '--nt-color-orange-bg': '#2e2010',
  '--nt-color-yellow-bg': '#2b2410',
  '--nt-color-green-bg':  '#182b22',
  '--nt-color-blue-bg':   '#142533',
  '--nt-color-purple-bg': '#21192d',
  '--nt-color-pink-bg':   '#2d1425',
  '--nt-color-red-bg':    '#2d1314',
};

/**
 * Convert a NotionColor key to a CSS custom property name.
 * 'blue'            → '--nt-color-blue'
 * 'blue_background' → '--nt-color-blue-bg'
 * 'blue-background' → '--nt-color-blue-bg' (CSS @plugin uses kebab-case)
 */
function colorKeyToCssVar(key) {
  // Normalize: 'blue-background' → 'blue_background'
  const normalized = key.replace(/-/g, '_');
  if (normalized.endsWith('_background')) {
    const base = normalized.slice(0, -'_background'.length);
    return `--nt-color-${base}-bg`;
  }
  return `--nt-color-${key}`;
}

/**
 * Build the :root token block, merging default Notion colors with user overrides.
 *
 * @param {Partial<Record<string, string>>} colors - Color overrides keyed by NotionColor name
 *   e.g. { blue: '#1d4ed8', blue_background: '#eff6ff' }
 */
export function buildTokens(colors = {}) {
  // Convert color overrides to CSS variable names
  const overrides = {};
  for (const [key, value] of Object.entries(colors)) {
    overrides[colorKeyToCssVar(key)] = value;
  }

  return {
    ':root': { ...DEFAULTS, ...overrides },
    '@media (prefers-color-scheme: dark)': {
      ':root': DEFAULTS_DARK,
    },
  };
}

// Static export for when no color overrides are needed
export const tokens = buildTokens();

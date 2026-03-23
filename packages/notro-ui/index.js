/**
 * notro-ui — TailwindCSS plugin for Notion block styling.
 *
 * Usage in CSS (TailwindCSS v4):
 *   @import "tailwindcss";
 *   @plugin "notro-ui";
 *
 *   @plugin "notro-ui" {
 *     blue: #1d4ed8;
 *     blue-background: #eff6ff;
 *   }
 *
 * Usage in tailwind.config.js (TailwindCSS v3 / v4 with @config):
 *   import notroUI from 'notro-ui';
 *   export default {
 *     plugins: [notroUI],
 *     // or with color overrides:
 *     plugins: [notroUI({
 *       colors: {
 *         blue:             '#1d4ed8',
 *         blue_background:  '#eff6ff',
 *       }
 *     })],
 *   };
 *
 * Color key format (matching NotionColor type in notro package):
 *   Text colors:       'gray', 'brown', 'orange', 'yellow', 'green',
 *                      'blue', 'purple', 'pink', 'red'
 *   Background colors: 'gray_background', 'blue_background', ...
 *
 * In CSS @plugin block, use kebab-case:
 *   blue-background: #eff6ff;
 *
 * Or with @import (resolves to index.css via "style" export condition):
 *   @import "tailwindcss";
 *   @import "notro-ui";
 */

import plugin from "tailwindcss/plugin";
import { buildTokens }        from "./src/plugin/tokens.js";
import { prose, proseBase }   from "./src/plugin/prose.js";
import { utilities }          from "./src/plugin/utilities.js";
import { themes }             from "./src/plugin/themes.js";

export default plugin.withOptions(
  /** @param {{ colors?: Record<string, string> }} [options] */
  (options = {}) => ({ addBase, addUtilities }) => {
    const { colors = {} } = options;

    // Tokens: CSS custom properties (with optional color overrides) + dark mode
    addBase(buildTokens(colors));
    // Prose: @keyframes, dark mode styles, responsive breakpoints
    addBase(proseBase);
    // All component + theme styles go in addBase (TailwindCSS v4 addComponents/
    // addUtilities only accept single class selectors; attribute selectors
    // like [data-callout] must use addBase).
    addBase(prose);
    addBase(themes);
    // Utilities: single class selectors (nt-text-*, nt-bg-*, nt-border-*)
    addUtilities(utilities);
  }
);

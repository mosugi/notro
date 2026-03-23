/**
 * notro-ui — TailwindCSS plugin for Notion block styling.
 *
 * Usage in CSS:
 *   @import "tailwindcss";
 *   @plugin "notro-ui";
 *
 * Or with @import (resolves to index.css via "style" export condition):
 *   @import "tailwindcss";
 *   @import "notro-ui";
 */

import plugin from "tailwindcss/plugin";
import { tokens }             from "./src/plugin/tokens.js";
import { prose, proseBase }   from "./src/plugin/prose.js";
import { utilities }          from "./src/plugin/utilities.js";
import { themes }             from "./src/plugin/themes.js";

export default plugin(({ addBase, addUtilities }) => {
  // Tokens: CSS custom properties + dark mode overrides
  addBase(tokens);
  // Prose: @keyframes, dark mode, responsive breakpoints
  addBase(proseBase);
  // All component styles go in addBase because TailwindCSS v4 addComponents
  // only accepts single class selectors (attribute selectors like [data-callout]
  // are not allowed in addComponents/addUtilities).
  addBase(prose);
  addBase(themes);
  // Utilities: single class selectors only
  addUtilities(utilities);
});

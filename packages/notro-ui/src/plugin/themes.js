/**
 * CSS-in-JS for bordered and compact themes.
 * Injected via addComponents() in the notro-ui TailwindCSS plugin.
 *
 * Usage (HTML):
 *   <div class="nt-theme-bordered"> ... </div>
 *   <div class="nt-theme-compact">  ... </div>
 */

export const themes = {
  // ── Bordered theme ─────────────────────────────────────────────────────────
  // Replaces filled callout backgrounds with left-border style
  ".nt-theme-bordered .nt-markdown-content [data-callout], .nt-theme-bordered[data-callout]": {
    backgroundColor: "transparent",
    borderLeft:      "3px solid rgb(var(--nt-text-rgb) / 0.30)",
    borderRadius:    "0",
    paddingLeft:     "1rem",
  },

  // Per-color border overrides
  ".nt-theme-bordered [data-callout][data-color='blue_background']":   { borderColor: "var(--nt-color-blue)" },
  ".nt-theme-bordered [data-callout][data-color='red_background']":    { borderColor: "var(--nt-color-red)" },
  ".nt-theme-bordered [data-callout][data-color='green_background']":  { borderColor: "var(--nt-color-green)" },
  ".nt-theme-bordered [data-callout][data-color='yellow_background']": { borderColor: "var(--nt-color-yellow)" },
  ".nt-theme-bordered [data-callout][data-color='orange_background']": { borderColor: "var(--nt-color-orange)" },
  ".nt-theme-bordered [data-callout][data-color='purple_background']": { borderColor: "var(--nt-color-purple)" },
  ".nt-theme-bordered [data-callout][data-color='pink_background']":   { borderColor: "var(--nt-color-pink)" },
  ".nt-theme-bordered [data-callout][data-color='brown_background']":  { borderColor: "var(--nt-color-brown)" },
  ".nt-theme-bordered [data-callout][data-color='gray_background']":   { borderColor: "var(--nt-color-gray)" },

  // ── Compact theme ──────────────────────────────────────────────────────────
  // Reduces spacing on all Notion blocks for dense layouts
  ".nt-theme-compact .nt-markdown-content p":   { marginBottom: "0.5rem" },
  ".nt-theme-compact .nt-markdown-content ul, .nt-theme-compact .nt-markdown-content ol": { marginBottom: "0.5rem" },
  ".nt-theme-compact .nt-markdown-content h1":  { marginTop: "1.5rem",  marginBottom: "0.5rem" },
  ".nt-theme-compact .nt-markdown-content h2":  { marginTop: "1.25rem", marginBottom: "0.25rem" },
  ".nt-theme-compact .nt-markdown-content h3":  { marginTop: "1rem",    marginBottom: "0.25rem" },
  ".nt-theme-compact .nt-markdown-content h4":  { marginTop: "0.5rem",  marginBottom: "0.125rem" },
  ".nt-theme-compact .nt-markdown-content [data-callout]": {
    padding:      "0.5rem 0.75rem",
    marginTop:    "0.5rem",
    marginBottom: "0.5rem",
  },
  ".nt-theme-compact .nt-markdown-content details": {
    marginTop:    "0.125rem",
    marginBottom: "0.125rem",
  },
  ".nt-theme-compact .nt-markdown-content hr": {
    marginTop:    "1rem",
    marginBottom: "1rem",
  },
};

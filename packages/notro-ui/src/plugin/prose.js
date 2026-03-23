/**
 * CSS-in-JS for prose.css — .nt-markdown-content wrapper styles.
 * Uses flat selectors for maximum TailwindCSS v4 compatibility.
 *
 * - prose:     injected via addComponents() — no @media, no @keyframes
 * - proseBase: injected via addBase()       — @keyframes + dark mode @media
 */

// Base styles: @keyframes + dark mode media queries (must go in addBase)
export const proseBase = {
  "@keyframes nt-toggle-fadein": {
    from: { opacity: "0" },
    to:   { opacity: "1" },
  },

  "@media (prefers-color-scheme: dark)": {
    ".nt-markdown-content pre": {
      backgroundColor: "#1e293b",
      color:           "#e2e8f0",
    },
    ".nt-markdown-content :not(pre) > code": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color:           "#f87171",
    },
    "[data-toc-label]":     { color: "#cbd5e1" },
    "[data-image-caption]": { color: "#94a3b8" },
    "[data-media-caption]": { color: "#94a3b8" },
    "[data-pdf-caption]":   { color: "#94a3b8" },
    "[data-file-link]":     { color: "#cbd5e1" },
    ".nt-toc-item a":       { color: "#94a3b8" },
  },

  "@media (min-width: 768px)": {
    ".nt-markdown-content [data-columns]": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  },
};

export const prose = {
  // ── Wrapper ─────────────────────────────────────────────────────────────────
  ".nt-markdown-content": {
    fontSize:   "1rem",
    lineHeight: "1.75rem",
    color:      "rgb(var(--nt-text-rgb))",
  },

  // ── Block-level elements ────────────────────────────────────────────────────
  ".nt-markdown-content p": {
    marginBottom: "1rem",
    lineHeight:   "1.75rem",
  },

  ".nt-markdown-content ul": {
    marginBottom: "1rem",
    listStyleType: "disc",
    paddingLeft:  "1.5rem",
  },

  ".nt-markdown-content ol": {
    marginBottom: "1rem",
    listStyleType: "decimal",
    paddingLeft:  "1.5rem",
  },

  ".nt-markdown-content li": {
    lineHeight: "1.75rem",
  },

  ".nt-markdown-content ul li + li, .nt-markdown-content ol li + li": {
    marginTop: "0.25rem",
  },

  // ── Headings ─────────────────────────────────────────────────────────────────
  ".nt-markdown-content h1": {
    marginBottom:    "0.75rem",
    marginTop:       "2.5rem",
    fontSize:        "1.875rem",
    fontWeight:      "700",
    letterSpacing:   "-0.025em",
    lineHeight:      "1.2",
  },

  ".nt-markdown-content h2": {
    marginBottom:    "0.5rem",
    marginTop:       "2rem",
    fontSize:        "1.5rem",
    fontWeight:      "600",
    letterSpacing:   "-0.025em",
    lineHeight:      "1.3",
  },

  ".nt-markdown-content h3": {
    marginBottom: "0.5rem",
    marginTop:    "1.5rem",
    fontSize:     "1.25rem",
    fontWeight:   "600",
    lineHeight:   "1.4",
  },

  ".nt-markdown-content h4": {
    marginBottom: "0.25rem",
    marginTop:    "1rem",
    fontSize:     "1rem",
    fontWeight:   "600",
    lineHeight:   "1.5",
  },

  // ── Inline elements ──────────────────────────────────────────────────────────
  ".nt-markdown-content strong": { fontWeight: "600" },
  ".nt-markdown-content em":     { fontStyle: "italic" },
  ".nt-markdown-content del":    { textDecoration: "line-through" },

  ".nt-markdown-content a": {
    textDecoration:      "underline",
    textUnderlineOffset: "2px",
  },
  ".nt-markdown-content a:hover": { opacity: "0.7" },

  // ── HR ───────────────────────────────────────────────────────────────────────
  ".nt-markdown-content hr": {
    marginTop:    "2rem",
    marginBottom: "2rem",
    border:       "none",
    borderTop:    "1px solid rgb(var(--nt-text-rgb) / 0.12)",
  },

  // ── Code ─────────────────────────────────────────────────────────────────────
  ".nt-markdown-content pre": {
    marginTop:    "1rem",
    marginBottom: "1rem",
    overflowX:    "auto",
    borderRadius: "0.375rem",
    padding:      "1rem 1.25rem",
    fontFamily:   "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize:     "0.875rem",
    lineHeight:   "1.7",
  },

  ".nt-markdown-content pre > code": {
    fontFamily:      "inherit",
    fontSize:        "inherit",
    background:      "transparent",
    padding:         "0",
  },

  ".nt-markdown-content :not(pre) > code": {
    fontFamily:      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize:        "85%",
    backgroundColor: "rgba(135, 131, 120, 0.15)",
    color:           "#eb5757",
    borderRadius:    "3px",
    padding:         "0.2em 0.4em",
  },

  // ── Blockquote ───────────────────────────────────────────────────────────────
  ".nt-markdown-content blockquote": {
    marginTop:    "1rem",
    marginBottom: "1rem",
    borderLeft:   "3px solid rgb(var(--nt-text-rgb) / 0.30)",
    paddingLeft:  "1rem",
    fontStyle:    "italic",
  },

  ".nt-markdown-content blockquote > p:first-child": { marginTop: "0" },
  ".nt-markdown-content blockquote > p:last-child":  { marginBottom: "0" },

  // ── Callout block ─────────────────────────────────────────────────────────────
  ".nt-markdown-content [data-callout]": {
    // Component-level CSS variables — users can override these
    "--nt-callout-bg":      "var(--nt-color-gray-bg)",
    "--nt-callout-padding": "1rem",
    "--nt-callout-gap":     "0.75rem",
    "--nt-callout-radius":  "0.375rem",
    display:         "flex",
    alignItems:      "flex-start",
    gap:             "var(--nt-callout-gap)",
    marginTop:       "1rem",
    marginBottom:    "1rem",
    borderRadius:    "var(--nt-callout-radius)",
    padding:         "var(--nt-callout-padding)",
    backgroundColor: "var(--nt-callout-bg)",
  },

  // Color variants — override --nt-callout-bg via data-color
  ".nt-markdown-content [data-callout][data-color='gray_background']":   { "--nt-callout-bg": "var(--nt-color-gray-bg)" },
  ".nt-markdown-content [data-callout][data-color='brown_background']":  { "--nt-callout-bg": "var(--nt-color-brown-bg)" },
  ".nt-markdown-content [data-callout][data-color='orange_background']": { "--nt-callout-bg": "var(--nt-color-orange-bg)" },
  ".nt-markdown-content [data-callout][data-color='yellow_background']": { "--nt-callout-bg": "var(--nt-color-yellow-bg)" },
  ".nt-markdown-content [data-callout][data-color='green_background']":  { "--nt-callout-bg": "var(--nt-color-green-bg)" },
  ".nt-markdown-content [data-callout][data-color='blue_background']":   { "--nt-callout-bg": "var(--nt-color-blue-bg)" },
  ".nt-markdown-content [data-callout][data-color='purple_background']": { "--nt-callout-bg": "var(--nt-color-purple-bg)" },
  ".nt-markdown-content [data-callout][data-color='pink_background']":   { "--nt-callout-bg": "var(--nt-color-pink-bg)" },
  ".nt-markdown-content [data-callout][data-color='red_background']":    { "--nt-callout-bg": "var(--nt-color-red-bg)" },

  "[data-callout-icon]": {
    flexShrink: "0",
    fontSize:   "1.25rem",
    lineHeight: "1",
  },

  "[data-callout-body]": {
    minWidth: "0",
    flex:     "1",
  },

  "[data-callout-body] > :first-child": { marginTop: "0" },
  "[data-callout-body] > :last-child":  { marginBottom: "0" },

  // ── Toggle (details/summary) ──────────────────────────────────────────────────
  ".nt-markdown-content details": {
    marginTop:    "0.25rem",
    marginBottom: "0.25rem",
  },

  ".nt-markdown-content details > summary": {
    listStyle:     "none",
    cursor:        "pointer",
    paddingTop:    "0.25rem",
    paddingBottom: "0.25rem",
    fontWeight:    "500",
    userSelect:    "none",
  },

  ".nt-markdown-content details > summary::marker, .nt-markdown-content details > summary::-webkit-details-marker": {
    display: "none",
  },

  ".nt-markdown-content details > summary::before": {
    content:         '"▶"',
    display:         "inline-block",
    fontSize:        "0.6em",
    marginRight:     "0.5em",
    transition:      "transform 0.2s",
    transformOrigin: "center",
    verticalAlign:   "middle",
    color:           "rgb(var(--nt-text-rgb) / 0.45)",
  },

  ".nt-markdown-content details[open] > summary::before": {
    transform: "rotate(90deg)",
  },

  ".nt-markdown-content details > :not(summary)": {
    animation: "nt-toggle-fadein 0.15s ease",
  },

  // ── Columns ───────────────────────────────────────────────────────────────────
  ".nt-markdown-content [data-columns]": {
    display:             "grid",
    gridTemplateColumns: "1fr",
    gap:                 "2rem",
    marginTop:           "1rem",
    marginBottom:        "1rem",
  },

  ".nt-markdown-content [data-column]": {
    minWidth: "0",
  },

  // ── Table ─────────────────────────────────────────────────────────────────────
  ".nt-markdown-content [data-table-wrapper]": {
    marginTop:    "1rem",
    marginBottom: "1rem",
    width:        "100%",
    overflowX:    "auto",
  },

  ".nt-markdown-content [data-table-wrapper][data-fit-page-width]": {
    width: "100%",
  },

  ".nt-markdown-content table": {
    width:           "100%",
    borderCollapse:  "collapse",
    fontSize:        "0.875rem",
    border:          "1px solid rgb(var(--nt-text-rgb) / 0.09)",
  },

  ".nt-markdown-content table td, .nt-markdown-content table th": {
    padding:       "0.375rem 0.75rem",
    textAlign:     "left",
    verticalAlign: "top",
    border:        "1px solid rgb(var(--nt-text-rgb) / 0.09)",
    fontSize:      "0.875rem",
  },

  "[data-header-row] tr:first-child td, [data-header-row] tr:first-child th": {
    fontWeight:      "600",
    backgroundColor: "rgb(var(--nt-text-rgb) / 0.04)",
  },

  "[data-header-col] td:first-child, [data-header-col] th:first-child": {
    fontWeight:      "600",
    backgroundColor: "rgb(var(--nt-text-rgb) / 0.04)",
  },

  // ── Table of contents ─────────────────────────────────────────────────────────
  ".nt-markdown-content [data-toc]": {
    marginTop:       "1rem",
    marginBottom:    "1rem",
    borderRadius:    "0.375rem",
    border:          "1px solid rgb(var(--nt-text-rgb) / 0.09)",
    backgroundColor: "rgb(var(--nt-text-rgb) / 0.02)",
    padding:         "1rem",
    fontSize:        "0.875rem",
  },

  "[data-toc-label]": {
    margin:     "0 0 0.5rem",
    fontWeight: "600",
    fontSize:   "0.875rem",
    color:      "rgb(var(--nt-text-rgb) / 0.70)",
  },

  ".nt-toc-block__list": {
    listStyle: "none",
    margin:    "0",
    padding:   "0",
  },

  ".nt-toc-item": {
    lineHeight: "1.6",
  },

  ".nt-toc-item a": {
    color:          "#374151",
    textDecoration: "none",
    fontSize:       "0.875rem",
  },

  ".nt-toc-item a:hover": {
    color:          "#2563eb",
    textDecoration: "underline",
  },

  ".nt-toc-level-1": { paddingLeft: "0" },
  ".nt-toc-level-2": { paddingLeft: "1rem" },
  ".nt-toc-level-3": { paddingLeft: "2rem" },
  ".nt-toc-level-4": { paddingLeft: "3rem" },

  // ── Media: image ──────────────────────────────────────────────────────────────
  ".nt-markdown-content [data-image-block]": {
    marginTop:    "1rem",
    marginBottom: "1rem",
  },

  "[data-image-img]": {
    height:   "auto",
    maxWidth: "100%",
  },

  "[data-image-caption]": {
    marginTop:  "0.375rem",
    fontSize:   "0.875rem",
    color:      "#6b7280",
    textAlign:  "center",
  },

  // ── Media: audio / video ──────────────────────────────────────────────────────
  ".nt-markdown-content [data-media-type]": {
    marginTop:    "1rem",
    marginBottom: "1rem",
  },

  "[data-media-player]": { width: "100%" },

  "[data-media-caption]": {
    marginTop: "0.375rem",
    fontSize:  "0.875rem",
    color:     "#6b7280",
  },

  // ── File block ────────────────────────────────────────────────────────────────
  ".nt-markdown-content [data-file-block]": {
    marginTop:    "0.5rem",
    marginBottom: "0.5rem",
  },

  "[data-file-link]": {
    display:             "inline-flex",
    alignItems:          "center",
    gap:                 "0.375rem",
    color:               "#374151",
    textDecoration:      "underline",
    textUnderlineOffset: "2px",
  },

  "[data-file-link]:hover": { opacity: "0.7" },
  "[data-file-icon]":       { fontSize: "1rem" },

  // ── PDF block ─────────────────────────────────────────────────────────────────
  ".nt-markdown-content [data-pdf-block]": {
    marginTop:    "1rem",
    marginBottom: "1rem",
  },

  "[data-pdf-frame]": {
    width:     "100%",
    minHeight: "500px",
    border:    "none",
  },

  "[data-pdf-caption]": {
    marginTop: "0.375rem",
    fontSize:  "0.875rem",
    color:     "#6b7280",
  },

  // ── Mermaid diagram ───────────────────────────────────────────────────────────
  ".nt-mermaid-block": {
    marginTop:    "1.5rem",
    marginBottom: "1.5rem",
    overflowX:    "auto",
    borderRadius: "0.5rem",
  },

  ".nt-mermaid-block svg": { display: "block" },

  // ── Page/database references ──────────────────────────────────────────────────
  ".nt-markdown-content [data-pageref], .nt-markdown-content [data-databaseref]": {
    display:             "inline-flex",
    alignItems:          "center",
    gap:                 "0.25rem",
    textDecoration:      "underline",
    textUnderlineOffset: "2px",
  },

  "[data-pageref-icon], [data-databaseref-icon]": { fontSize: "0.9em" },

  ".nt-markdown-content a[data-inline]": { display: "inline" },

  // ── Task list ─────────────────────────────────────────────────────────────────
  ".nt-markdown-content .contains-task-list": {
    listStyle:   "none",
    paddingLeft: "0",
  },

  ".nt-markdown-content .task-list-item": {
    display:    "flex",
    alignItems: "flex-start",
    gap:        "0.5rem",
    paddingLeft: "0",
  },

  ".nt-markdown-content .task-list-item input[type='checkbox']": {
    marginTop:  "0.25rem",
    flexShrink: "0",
    cursor:     "default",
  },

  // ── Color annotations via data-color ─────────────────────────────────────────
  ".nt-markdown-content [data-color='gray']":   { color: "var(--nt-color-gray)" },
  ".nt-markdown-content [data-color='brown']":  { color: "var(--nt-color-brown)" },
  ".nt-markdown-content [data-color='orange']": { color: "var(--nt-color-orange)" },
  ".nt-markdown-content [data-color='yellow']": { color: "var(--nt-color-yellow)" },
  ".nt-markdown-content [data-color='green']":  { color: "var(--nt-color-green)" },
  ".nt-markdown-content [data-color='blue']":   { color: "var(--nt-color-blue)" },
  ".nt-markdown-content [data-color='purple']": { color: "var(--nt-color-purple)" },
  ".nt-markdown-content [data-color='pink']":   { color: "var(--nt-color-pink)" },
  ".nt-markdown-content [data-color='red']":    { color: "var(--nt-color-red)" },

  ".nt-markdown-content [data-color='gray_background']":   { backgroundColor: "var(--nt-color-gray-bg)" },
  ".nt-markdown-content [data-color='brown_background']":  { backgroundColor: "var(--nt-color-brown-bg)" },
  ".nt-markdown-content [data-color='orange_background']": { backgroundColor: "var(--nt-color-orange-bg)" },
  ".nt-markdown-content [data-color='yellow_background']": { backgroundColor: "var(--nt-color-yellow-bg)" },
  ".nt-markdown-content [data-color='green_background']":  { backgroundColor: "var(--nt-color-green-bg)" },
  ".nt-markdown-content [data-color='blue_background']":   { backgroundColor: "var(--nt-color-blue-bg)" },
  ".nt-markdown-content [data-color='purple_background']": { backgroundColor: "var(--nt-color-purple-bg)" },
  ".nt-markdown-content [data-color='pink_background']":   { backgroundColor: "var(--nt-color-pink-bg)" },
  ".nt-markdown-content [data-color='red_background']":    { backgroundColor: "var(--nt-color-red-bg)" },
};

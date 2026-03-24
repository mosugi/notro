/**
 * notro-theme — TailwindCSS 4 plugin for Notion block styles
 *
 * Usage in global.css:
 *
 *   @import "tailwindcss";
 *   @plugin "notro-theme";
 *
 * To customise colors, add CSS variable overrides after the @plugin:
 *
 *   :root {
 *     --nt-color-blue: #4a9eff;
 *     --nt-text-rgb: 30 30 30;
 *   }
 */
import plugin from 'tailwindcss/plugin';

export default plugin(function ({ addBase, addComponents, addUtilities }) {
  // ── CSS custom properties ─────────────────────────────────────────────────
  addBase({
    ':root': {
      // Base RGB channels for Notion's default text color (#37352f).
      // Used by nt-text / nt-bg-* / nt-border* utilities.
      // Overridden in dark mode so all derived classes auto-switch.
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
    },

    // Fade-in animation for toggle content when opened
    '@keyframes nt-toggle-fadein': {
      from: { opacity: '0' },
      to:   { opacity: '1' },
    },

    // Dark mode — override all Notion color variables in one place
    '@media (prefers-color-scheme: dark)': {
      ':root': {
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
      },
    },

    // ── Block-level styles ───────────────────────────────────────────────────
    //
    // Complex selectors (data-attribute, element + context, :not(), ::before)
    // are placed here in addBase because addComponents/addUtilities in
    // TailwindCSS v4 only accept simple class selectors.

    // Code blocks — colored by @shikijs/rehype (colors injected inline)
    '.nt-markdown-content pre': {
      borderRadius: '0.375rem',
      paddingTop: '1rem',
      paddingBottom: '1rem',
      paddingLeft: '1.25rem',
      paddingRight: '1.25rem',
      overflowX: 'auto',
      fontSize: '0.875rem',
      lineHeight: '1.7',
      marginTop: '1.25rem',
      marginBottom: '1.25rem',
    },
    '@media (prefers-color-scheme: dark)': {
      '.nt-markdown-content pre': {
        backgroundColor: '#1e293b',  // slate-800
        color: '#e2e8f0',            // slate-200
      },
    },

    '.nt-markdown-content pre > code': {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      backgroundColor: 'transparent',
      padding: '0',
      color: 'inherit',
      fontSize: 'inherit',
    },

    // Inline code — global CSS for :not(pre) > code
    // (classMap cannot express this nesting distinction)
    '.nt-markdown-content :not(pre) > code': {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      backgroundColor: 'rgba(135,131,120,0.15)',
      color: '#eb5757',
      borderRadius: '3px',
      paddingTop: '0.2em',
      paddingBottom: '0.2em',
      paddingLeft: '0.4em',
      paddingRight: '0.4em',
      fontSize: '85%',
    },
    '@media (prefers-color-scheme: dark)': {
      '.nt-markdown-content :not(pre) > code': {
        backgroundColor: 'rgb(255 255 255 / 0.1)',
        color: '#f87171',  // red-400
      },
    },

    // Toggle (details/summary) — smooth open/close transition
    '.nt-toggle-block__title': {
      cursor: 'pointer',
      listStyleType: 'none',
      transitionProperty: 'color',
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDuration: '150ms',
    },
    '.nt-toggle-block__title:hover': {
      color: 'rgb(var(--nt-text-rgb) / 0.70)',
    },
    // Hide default browser triangle marker
    '.nt-toggle-block__title::marker, .nt-toggle-block__title::-webkit-details-marker': {
      display: 'none',
    },
    // Custom disclosure triangle with rotation transition
    '.nt-toggle-block__title::before': {
      content: '"▶"',
      display: 'inline-block',
      marginRight: '0.4em',
      fontSize: '0.65em',
      transitionProperty: 'transform',
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDuration: '200ms',
      transformOrigin: 'center',
    },
    'details[open] > .nt-toggle-block__title::before': {
      transform: 'rotate(90deg)',
    },

    // Toggle block — smooth indicator rotation on open/close
    '.nt-toggle-block > summary, .nt-markdown-content details > summary': {
      listStyleType: 'none',
      cursor: 'pointer',
    },
    '.nt-toggle-block > summary::-webkit-details-marker, .nt-markdown-content details > summary::-webkit-details-marker': {
      display: 'none',
    },
    // Animated disclosure triangle via ::before pseudo-element
    '.nt-toggle-block > summary::before, .nt-markdown-content details > summary::before': {
      content: '"▶"',
      display: 'inline-block',
      fontSize: '0.6em',
      marginRight: '0.5em',
      transitionProperty: 'transform',
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDuration: '200ms',
      transformOrigin: 'center',
      verticalAlign: 'middle',
      color: 'rgb(var(--nt-text-rgb) / 0.45)',
    },
    '.nt-toggle-block[open] > summary::before, .nt-markdown-content details[open] > summary::before': {
      transform: 'rotate(90deg)',
    },
    // Fade-in for toggle content when opened
    '.nt-toggle-block > :not(summary), .nt-markdown-content details > :not(summary)': {
      animation: 'nt-toggle-fadein 0.15s ease',
    },

    // hr visual styles
    '.nt-markdown-content hr': {
      marginTop: '2rem',
      marginBottom: '2rem',
      borderWidth: '0',
      borderTopWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#e5e7eb',  // gray-200
    },
    '@media (prefers-color-scheme: dark)': {
      '.nt-markdown-content hr': {
        borderColor: 'rgb(255 255 255 / 0.12)',
      },
    },

    // Task list checkbox styles for remark-gfm output
    '.nt-markdown-content .contains-task-list': {
      listStyleType: 'none',
      paddingLeft: '0',
    },
    '.nt-markdown-content .task-list-item': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      paddingLeft: '0',
    },
    '.nt-markdown-content .task-list-item input[type="checkbox"]': {
      marginTop: '0.25rem',
      flexShrink: '0',
      cursor: 'default',
    },

    // Table cell borders (injection-impossible: td/th need parent context)
    '.nt-markdown-content table td, .nt-markdown-content table th': {
      paddingLeft: '0.75rem',
      paddingRight: '0.75rem',
      paddingTop: '0.375rem',
      paddingBottom: '0.375rem',
      textAlign: 'left',
      verticalAlign: 'top',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgb(var(--nt-text-rgb) / 0.09)',
    },
    '.nt-markdown-content table': {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgb(var(--nt-text-rgb) / 0.09)',
    },

    // Table structural variants (injection-impossible via classMap)
    '[data-header-row] tr:first-child td, [data-header-row] tr:first-child th': {
      fontWeight: '600',
      backgroundColor: 'rgb(var(--nt-text-rgb) / 0.04)',
    },
    '[data-header-col] td:first-child, [data-header-col] th:first-child': {
      fontWeight: '600',
      backgroundColor: 'rgb(var(--nt-text-rgb) / 0.04)',
    },

    // Image block sub-elements
    '[data-image-img]': {
      height: 'auto',
      maxWidth: '100%',
    },
    '[data-image-caption]': {
      fontSize: '0.875rem',
      color: '#6b7280',       // gray-500
      marginTop: '0.375rem',
      textAlign: 'center',
    },
    '@media (prefers-color-scheme: dark)': {
      '[data-image-caption]': { color: '#94a3b8' },  // slate-400
    },

    // Media blocks (audio / video)
    '[data-media-caption]': {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.375rem',
    },
    '@media (prefers-color-scheme: dark)': {
      '[data-media-caption]': { color: '#94a3b8' },
    },

    // File block sub-elements
    '[data-file-link]': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      color: '#374151',       // gray-700
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
    },
    '[data-file-link]:hover': { opacity: '0.7' },
    '@media (prefers-color-scheme: dark)': {
      '[data-file-link]': { color: '#cbd5e1' },  // slate-300
    },

    '[data-file-icon]': { fontSize: '1rem' },
    '[data-fit-page-width]': { width: '100%' },
    '[data-media-player]':   { width: '100%' },
    '[data-pageref-icon], [data-databaseref-icon]': { fontSize: '0.9em' },
    'a[data-inline]': { display: 'inline' },

    // PDF block sub-elements
    '[data-pdf-frame]': {
      width: '100%',
      minHeight: '500px',
      border: '0',
    },
    '[data-pdf-caption]': {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.375rem',
    },
    '@media (prefers-color-scheme: dark)': {
      '[data-pdf-caption]': { color: '#94a3b8' },
    },

    // TOC label
    '[data-toc-label]': {
      fontWeight: '600',
      fontSize: '0.875rem',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    '@media (prefers-color-scheme: dark)': {
      '[data-toc-label]': { color: '#cbd5e1' },
    },

    // Callout icon/body
    '[data-callout-icon]': {
      flexShrink: '0',
      fontSize: '1.25rem',
      lineHeight: '1',
    },
    '[data-callout-body]': {
      minWidth: '0',
      flex: '1 1 0%',
    },
    '[data-callout-body] > :first-child': { marginTop: '0' },
    '[data-callout-body] > :last-child':  { marginBottom: '0' },
  });

  // ── Simple class components ───────────────────────────────────────────────
  addComponents({
    // Base wrapper for Notion markdown content
    '.nt-markdown-content': {
      fontSize: '1rem',
      lineHeight: '1.625',
      color: 'rgb(var(--nt-text-rgb))',
    },

    // Table of contents block styles
    '.nt-toc-block__list': {
      listStyleType: 'none',
      margin: '0',
      padding: '0',
    },
    '.nt-toc-item': { lineHeight: '1.6' },
    '.nt-toc-item a': {
      color: '#374151',       // gray-700
      textDecoration: 'none',
      fontSize: '0.875rem',
    },
    '.nt-toc-item a:hover': {
      color: '#2563eb',       // blue-600
      textDecoration: 'underline',
    },

    // Mermaid diagram block
    // SVG keeps its natural pixel dimensions from beautiful-mermaid.
    // Forcing width:100% causes SVG-internal content outside the viewBox to be
    // hard-clipped even with overflow:visible on the SVG.
    '.nt-mermaid-block': {
      marginTop: '1.5rem',
      marginBottom: '1.5rem',
      overflowX: 'auto',
      borderRadius: '0.5rem',
    },
    '.nt-mermaid-block svg': { display: 'block' },
  });

  // ── Utility classes ───────────────────────────────────────────────────────
  addUtilities({
    // Notion text colors
    '.nt-color-gray':              { color: 'var(--nt-color-gray)' },
    '.nt-color-brown':             { color: 'var(--nt-color-brown)' },
    '.nt-color-orange':            { color: 'var(--nt-color-orange)' },
    '.nt-color-yellow':            { color: 'var(--nt-color-yellow)' },
    '.nt-color-green':             { color: 'var(--nt-color-green)' },
    '.nt-color-blue':              { color: 'var(--nt-color-blue)' },
    '.nt-color-purple':            { color: 'var(--nt-color-purple)' },
    '.nt-color-pink':              { color: 'var(--nt-color-pink)' },
    '.nt-color-red':               { color: 'var(--nt-color-red)' },

    // Notion background colors (_background = Notion API form)
    '.nt-color-gray_background':   { backgroundColor: 'var(--nt-color-gray-bg)' },
    '.nt-color-brown_background':  { backgroundColor: 'var(--nt-color-brown-bg)' },
    '.nt-color-orange_background': { backgroundColor: 'var(--nt-color-orange-bg)' },
    '.nt-color-yellow_background': { backgroundColor: 'var(--nt-color-yellow-bg)' },
    '.nt-color-green_background':  { backgroundColor: 'var(--nt-color-green-bg)' },
    '.nt-color-blue_background':   { backgroundColor: 'var(--nt-color-blue-bg)' },
    '.nt-color-purple_background': { backgroundColor: 'var(--nt-color-purple-bg)' },
    '.nt-color-pink_background':   { backgroundColor: 'var(--nt-color-pink-bg)' },
    '.nt-color-red_background':    { backgroundColor: 'var(--nt-color-red-bg)' },

    // Indent by heading level (h1=0, h2=1rem, h3=2rem, h4=3rem)
    '.nt-toc-level-1': { paddingLeft: '0' },
    '.nt-toc-level-2': { paddingLeft: '1rem' },
    '.nt-toc-level-3': { paddingLeft: '2rem' },
    '.nt-toc-level-4': { paddingLeft: '3rem' },

    // ── Notion base text / bg / border color scale ────────────────────────
    // All classes derive from --nt-text-rgb which switches in dark mode.
    '.nt-text':    { color: 'rgb(var(--nt-text-rgb))' },
    '.nt-text-80': { color: 'rgb(var(--nt-text-rgb) / 0.80)' },
    '.nt-text-75': { color: 'rgb(var(--nt-text-rgb) / 0.75)' },
    '.nt-text-70': { color: 'rgb(var(--nt-text-rgb) / 0.70)' },
    '.nt-text-65': { color: 'rgb(var(--nt-text-rgb) / 0.65)' },
    '.nt-text-60': { color: 'rgb(var(--nt-text-rgb) / 0.60)' },
    '.nt-text-55': { color: 'rgb(var(--nt-text-rgb) / 0.55)' },
    '.nt-text-50': { color: 'rgb(var(--nt-text-rgb) / 0.50)' },
    '.nt-text-45': { color: 'rgb(var(--nt-text-rgb) / 0.45)' },
    '.nt-text-40': { color: 'rgb(var(--nt-text-rgb) / 0.40)' },
    '.nt-text-35': { color: 'rgb(var(--nt-text-rgb) / 0.35)' },
    '.nt-text-30': { color: 'rgb(var(--nt-text-rgb) / 0.30)' },

    '.nt-bg-02': { backgroundColor: 'rgb(var(--nt-text-rgb) / 0.02)' },
    '.nt-bg-03': { backgroundColor: 'rgb(var(--nt-text-rgb) / 0.03)' },
    '.nt-bg-04': { backgroundColor: 'rgb(var(--nt-text-rgb) / 0.04)' },
    '.nt-bg-05': { backgroundColor: 'rgb(var(--nt-text-rgb) / 0.05)' },
    '.nt-bg-06': { backgroundColor: 'rgb(var(--nt-text-rgb) / 0.06)' },
    '.nt-bg-07': { backgroundColor: 'rgb(var(--nt-text-rgb) / 0.07)' },
    '.nt-bg-09': { backgroundColor: 'rgb(var(--nt-text-rgb) / 0.09)' },
    '.nt-bg-10': { backgroundColor: 'rgb(var(--nt-text-rgb) / 0.10)' },
    '.nt-bg-12': { backgroundColor: 'rgb(var(--nt-text-rgb) / 0.12)' },
    '.nt-bg-15': { backgroundColor: 'rgb(var(--nt-text-rgb) / 0.15)' },
    '.nt-bg-18': { backgroundColor: 'rgb(var(--nt-text-rgb) / 0.18)' },

    '.nt-border':    { borderColor: 'rgb(var(--nt-text-rgb) / 0.09)' },
    '.nt-border-06': { borderColor: 'rgb(var(--nt-text-rgb) / 0.06)' },
    '.nt-border-07': { borderColor: 'rgb(var(--nt-text-rgb) / 0.07)' },
    '.nt-border-12': { borderColor: 'rgb(var(--nt-text-rgb) / 0.12)' },
    '.nt-border-15': { borderColor: 'rgb(var(--nt-text-rgb) / 0.15)' },
    '.nt-border-18': { borderColor: 'rgb(var(--nt-text-rgb) / 0.18)' },
    '.nt-border-30': { borderColor: 'rgb(var(--nt-text-rgb) / 0.30)' },
  });
});

// Notion Enhanced Markdown uses "_bg" suffix for background colors,
// but the canonical color names use "_background".
// e.g. gray_bg → gray_background, blue_bg → blue_background
export function normalizeColor(color: string): string {
  return color.endsWith("_bg") ? color.slice(0, -3) + "_background" : color;
}

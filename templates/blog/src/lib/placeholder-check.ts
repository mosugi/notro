/**
 * Detects placeholder values that ship with the template so we can warn the
 * user before they deploy a site that still reads "My Site" / "Your Name" /
 * "https://example.com".
 *
 * Returns an array of warning messages (empty when everything has been
 * customised). Intentionally a pure function so it's trivially testable.
 */
export interface PlaceholderCheckInput {
  siteName: string;
  siteAuthor: string;
  siteDescription: string;
  astroSiteUrl: string | undefined;
}

const PLACEHOLDERS = {
  siteName: "My Site",
  siteAuthor: "Your Name",
  siteDescription: "My site powered by Notion and Astro.",
  astroSiteUrl: "https://example.com",
} as const;

export function findPlaceholderWarnings(input: PlaceholderCheckInput): string[] {
  const warnings: string[] = [];

  if (input.siteName === PLACEHOLDERS.siteName) {
    warnings.push(
      `config.site.name is still the placeholder "${PLACEHOLDERS.siteName}". Update src/config.ts before deploying.`,
    );
  }
  if (input.siteAuthor === PLACEHOLDERS.siteAuthor) {
    warnings.push(
      `config.site.author is still the placeholder "${PLACEHOLDERS.siteAuthor}". Update src/config.ts before deploying.`,
    );
  }
  if (input.siteDescription === PLACEHOLDERS.siteDescription) {
    warnings.push(
      "config.site.description is still the template placeholder. Update src/config.ts before deploying.",
    );
  }
  if (input.astroSiteUrl === PLACEHOLDERS.astroSiteUrl) {
    warnings.push(
      `astro.config.mjs \`site\` is still "${PLACEHOLDERS.astroSiteUrl}". Set the SITE_URL env var or edit astro.config.mjs before deploying.`,
    );
  }

  return warnings;
}

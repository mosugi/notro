/**
 * Astro integration entry point for notro.
 *
 * Safe to import in `astro.config.mjs` — no Astro component dependencies.
 *
 * @example
 * ```js
 * // astro.config.mjs
 * import { notroIntegration } from 'notro/integration';
 * export default defineConfig({ integrations: [notroIntegration()] });
 * ```
 */
export { notroIntegration } from './src/integration.ts';

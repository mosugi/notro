/**
 * Astro integration entry point for notro.
 *
 * Safe to import in `astro.config.mjs` — no Astro component dependencies.
 *
 * @example
 * ```js
 * // astro.config.mjs
 * import { notro } from 'notro/integration';
 * export default defineConfig({ integrations: [notro()] });
 * ```
 */
export { notro } from './src/integration.ts';

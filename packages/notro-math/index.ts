/**
 * notro-math — math rendering pipeline for notro.
 *
 * Re-exports remark-math and rehype-katex so that users can add math support
 * to their notro setup with a single package:
 *
 * Usage in astro.config.mjs:
 *   import { remarkMath, rehypeKatex } from 'notro-math';
 *   notro({
 *     remarkPlugins: [remarkMath],
 *     rehypePlugins: [rehypeKatex],
 *   })
 */
export { default as remarkMath } from 'remark-math';
export { default as rehypeKatex } from 'rehype-katex';

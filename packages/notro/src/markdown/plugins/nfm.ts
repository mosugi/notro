/**
 * remarkNfm — Notion-flavored Markdown plugin for remark.
 *
 * Analogous to remarkGfm, this single plugin enables the full Notion markdown
 * syntax by bundling three concerns:
 *
 * 1. Pre-parse normalization — patches the remark Parser to run
 *    preprocessNotionMarkdown() on the raw source before tokenization.
 *    Fixes structural issues in Notion's API output (escaped inline math,
 *    callout directive spacing, HTML closing-tag blank lines, etc.)
 *    that would otherwise prevent correct AST construction.
 *
 * 2. Directive parser support — registers the remark-directive micromark
 *    extension so :::callout{...} container directives are recognized at
 *    parse time.
 *
 * 3. Callout conversion — post-parse transform that converts
 *    containerDirective nodes named "callout" into <callout icon color>
 *    HTML elements consumed by the Notion component mapping.
 *
 * Usage:
 * ```ts
 * import { remarkNfm } from 'notro';
 * // in evaluate() options or @astrojs/mdx remarkPlugins:
 * remarkPlugins: [remarkNfm, remarkGfm, remarkMath]
 * ```
 */

import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import remarkDirective from 'remark-directive';
import { preprocessNotionMarkdown } from '../transformer.ts';
import { calloutPlugin } from './callout.ts';

export const remarkNfm: Plugin<[], Root> = function () {
	// Pre-parse: wrap the parser so preprocessNotionMarkdown() runs on the raw
	// source before remark tokenizes it. remark-parse sets this.parser
	// (lowercase, unified v11 API) before user remarkPlugins run. Micromark
	// extensions from remarkGfm, remarkMath, and remarkDirective are read from
	// this.data() at parse call time, so patching the parser here does not
	// exclude them.
	//
	// Note: unified v11 uses this.parser (lowercase); this.Parser (uppercase)
	// is the deprecated v10 alias and is always undefined in current remark.
	if (this.parser) {
		const originalParser = this.parser;
		this.parser = function (doc, file) {
			return originalParser(preprocessNotionMarkdown(doc), file);
		};
	}

	// Directive parser support: adds micromark + mdast-util extensions so
	// :::callout{...} blocks are tokenized and converted to containerDirective
	// nodes during parsing (not as a post-parse transform).
	this.use(remarkDirective);

	// Callout conversion: visits containerDirective nodes named "callout" and
	// sets hName/hProperties so rehype emits <callout icon color> elements.
	this.use(calloutPlugin);
};

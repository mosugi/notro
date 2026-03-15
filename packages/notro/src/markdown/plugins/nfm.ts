/**
 * remarkNfm — Notion-flavored Markdown plugin for remark.
 *
 * Analogous to remarkGfm, this single plugin enables the full Notion markdown
 * syntax. It follows the same pattern as remarkGfm (data()-based micromark
 * extensions) and bundles three concerns:
 *
 * 1. Pre-parse normalization — patches self.parser (unified v11 lowercase API)
 *    to run preprocessNotionMarkdown() on the raw source before tokenization.
 *    Fixes structural issues in Notion's API output that would otherwise
 *    prevent correct AST construction.
 *
 * 2. Directive parser support — adds the micromark-extension-directive and
 *    mdast-util-directive extensions directly via self.data(), same as how
 *    remarkGfm adds GFM support, so :::callout{...} blocks are recognized.
 *
 * 3. Callout conversion — returns a post-parse transform that converts
 *    containerDirective nodes named "callout" into <callout icon color>
 *    elements for the Notion component mapping.
 *
 * Usage:
 * ```ts
 * import { remarkNfm } from 'notro';
 * remarkPlugins: [remarkNfm, remarkGfm, remarkMath]
 * ```
 */

/**
 * @import {} from 'remark-parse'
 * @import {} from 'remark-stringify'
 */

import type { Plugin, Processor, Transformer } from 'unified';
import type { Root } from 'mdast';
import { directive } from 'micromark-extension-directive';
import { directiveFromMarkdown, directiveToMarkdown } from 'mdast-util-directive';
import { preprocessNotionMarkdown } from '../transformer.ts';
import { calloutPlugin } from './callout.ts';

/**
 * Configuration for remarkNfm (reserved for future options).
 */
export type Options = Record<string, never>;

/** @type {Options} */
const emptyOptions: Options = {};

export const remarkNfm: Plugin<[Options?], Root, Root> = function (options): Transformer<Root, Root> | undefined {
	// Follows the same pattern as remarkGfm: cast this to the concrete
	// Processor type since TypeScript cannot infer `this` inside a plugin.
	// @ts-expect-error: TS is wrong about `this`.
	const self = this as Processor<Root>;
	const _settings = options || emptyOptions;
	const data = self.data();

	// ── Pre-parse normalization ─────────────────────────────────────────────
	// Wrap self.parser (unified v11 lowercase API; self.Parser uppercase is
	// deprecated and always undefined) so preprocessNotionMarkdown() runs
	// on the raw source string before the micromark tokenizer sees it.
	// All micromark extensions (from remarkGfm, remarkMath, etc.) are read
	// from self.data() at parse call time — not at attacher registration time —
	// so patching the parser here never excludes them.
	if (self.parser) {
		const originalParser = self.parser;
		self.parser = function (doc, file) {
			return originalParser(preprocessNotionMarkdown(doc), file);
		};
	}

	// ── Directive syntax support ────────────────────────────────────────────
	// Adds the same extensions that remark-directive would register, but
	// directly via self.data() following the remarkGfm pattern, keeping
	// remarkNfm self-contained without an internal this.use() call.
	const micromarkExtensions =
		data.micromarkExtensions || (data.micromarkExtensions = []);
	const fromMarkdownExtensions =
		data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
	const toMarkdownExtensions =
		data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

	micromarkExtensions.push(directive());
	fromMarkdownExtensions.push(directiveFromMarkdown());
	toMarkdownExtensions.push(directiveToMarkdown());

	// ── Callout conversion ──────────────────────────────────────────────────
	// Return the callout transform so unified registers it as a post-parse
	// transformer. Directive nodes are created at parse time (via the
	// micromark extensions above), so no ordering dependency exists here.
	return calloutPlugin.call(self) as Transformer<Root, Root> | undefined;
};

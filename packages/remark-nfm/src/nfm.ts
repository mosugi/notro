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
 * import { remarkNfm } from 'remark-nfm';
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
import type { ContainerDirective } from 'mdast-util-directive';
import { gfmStrikethrough } from 'micromark-extension-gfm-strikethrough';
import { gfmStrikethroughFromMarkdown, gfmStrikethroughToMarkdown } from 'mdast-util-gfm-strikethrough';
import { gfmTaskListItem } from 'micromark-extension-gfm-task-list-item';
import { gfmTaskListItemFromMarkdown, gfmTaskListItemToMarkdown } from 'mdast-util-gfm-task-list-item';
import { visit } from 'unist-util-visit';
import { preprocessNotionMarkdown } from './transformer.ts';

/**
 * Configuration for remarkNfm (reserved for future options).
 */
export type Options = Record<string, never>;

export const remarkNfm: Plugin<[Options?], Root, Root> = function (_options): Transformer<Root, Root> | undefined {
	// Follows the same pattern as remarkGfm: cast this to the concrete
	// Processor type since TypeScript cannot infer `this` inside a plugin.
	// @ts-expect-error: TS is wrong about `this`.
	const self = this as Processor<Root>;
	const data = self.data() as Record<string, unknown>;

	// Guard against double-application: if this plugin has already been attached
	// to the processor (e.g. via two remarkPlugins entries or a nested use()),
	// skip re-registering extensions and the parser patch to avoid duplicate
	// preprocessNotionMarkdown() runs and stacked micromark extensions.
	if (data.remarkNfmAttached) return;
	data.remarkNfmAttached = true;

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

	micromarkExtensions.push(directive(), gfmStrikethrough(), gfmTaskListItem());
	fromMarkdownExtensions.push(directiveFromMarkdown(), gfmStrikethroughFromMarkdown(), gfmTaskListItemFromMarkdown());
	toMarkdownExtensions.push(directiveToMarkdown(), gfmStrikethroughToMarkdown(), gfmTaskListItemToMarkdown());

	// ── Callout conversion ──────────────────────────────────────────────────
	// Return the callout transform so unified registers it as a post-parse
	// transformer. Directive nodes are created at parse time (via the
	// micromark extensions above), so no ordering dependency exists here.
	//
	// Transforms :::callout{icon="💡" color="gray_bg"} container directives
	// into <callout icon="..." color="..."> elements for the component mapping.
	return (tree) => {
		visit(tree, "containerDirective", (node: ContainerDirective) => {
			if (node.name !== "callout") return;

			const attrs = node.attributes ?? {};

			// Output as <callout> custom element so the component mapping
			// (notionComponents.callout = Callout.astro) can handle rendering.
			// Pass color as-is (e.g. "gray_bg") — Callout.astro's colorToCSS()
			// handles both _bg and _background suffix formats.
			// Only include properties that have a value to avoid setting empty strings.
			node.data = {
				...node.data,
				hName: "callout",
				hProperties: {
					...(attrs.color && { color: attrs.color }),
					...(attrs.icon && { icon: attrs.icon }),
				},
			};
		});
	};
};

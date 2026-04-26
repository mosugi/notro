import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { remarkNfm } from "./nfm.js";

/** Full pipeline: remarkNfm → remark-rehype → rehype-raw → HTML */
function process(markdown: string): string {
	const result = unified()
		.use(remarkParse)
		.use(remarkNfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRaw)
		.use(rehypeStringify)
		.processSync(markdown);
	return String(result);
}

/**
 * Pipeline without rehype-raw — used to demonstrate that certain behaviors
 * (e.g. tag-name normalization) require rehype-raw in the chain.
 */
function processWithoutRehypeRaw(markdown: string): string {
	const result = unified()
		.use(remarkParse)
		.use(remarkNfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeStringify)
		.processSync(markdown);
	return String(result);
}

// ============================================================
// <br> soft line break rendering
//
// Notion outputs <br> for intra-block Shift+Enter. The preprocessor
// leaves the tag untouched; rehype-raw (via parse5) is responsible
// for parsing it into a proper void element in the hast tree.
// ============================================================
describe("remarkNfm: <br> soft line break rendering", () => {
	it("renders <br> as a line break within a paragraph", () => {
		const html = process("月曜日<br>10:00");
		expect(html).toMatch(/<p>月曜日<br>10:00<\/p>/);
	});

	it("renders self-closing <br/> as a line break (backward compat)", () => {
		const html = process("line1<br/>line2");
		expect(html).toMatch(/<p>line1<br>line2<\/p>/);
	});

	it("renders multiple <br> tags within a single paragraph", () => {
		const html = process("line1<br>line2<br>line3");
		expect(html).toMatch(/<p>line1<br>line2<br>line3<\/p>/);
	});

	it("keeps <br> inline while separating adjacent blocks into separate paragraphs", () => {
		// Two Notion blocks, each with an intra-block Shift+Enter (▫️ is a block separator)
		const html = process("月曜日<br>10:00\n火曜日<br>9:00");
		expect(html).toMatch(/<p>月曜日<br>10:00<\/p>/);
		expect(html).toMatch(/<p>火曜日<br>9:00<\/p>/);
	});

	it("does not treat a plain soft line break (\\n) as a <br>", () => {
		// Fix 13 expands \n → \n\n (separate <p> elements), not <br>
		const html = process("line one\nline two");
		expect(html).not.toContain("<br>");
		expect(html).toContain("<p>line one</p>");
		expect(html).toContain("<p>line two</p>");
	});

	// ── rehype-raw responsibility ──────────────────────────────────────────────
	// Without rehype-raw, hast `raw` nodes produced by remark-rehype are
	// HTML-escaped by rehype-stringify (the `<` becomes `&#x3C;`), so <br>
	// never renders as a void element.  rehype-raw runs hast-util-raw (parse5)
	// to convert raw nodes into proper hast elements before stringification.

	it("requires rehype-raw to render inline <br> as a void element", () => {
		// Without rehype-raw: the raw node is HTML-escaped by rehype-stringify
		const broken = processWithoutRehypeRaw("line1<br>line2");
		expect(broken).not.toContain("<br>");
		expect(broken).toContain("&#x3C;br>"); // < is escaped — <br> is broken
		// With rehype-raw: parse5 converts the raw node to a proper void element
		const fixed = process("line1<br>line2");
		expect(fixed).toContain("<br>");
		expect(fixed).not.toContain("&#x3C;");
	});

	it("rehype-raw normalizes <BR> (uppercase) tag name to <br>", () => {
		// Without rehype-raw: tag name is preserved as-is (but still HTML-escaped)
		expect(processWithoutRehypeRaw("line1<BR>line2")).toContain("&#x3C;BR>");
		// With rehype-raw: parse5 normalizes the tag name to lowercase
		const html = process("line1<BR>line2");
		expect(html).toContain("<br>");
		expect(html).not.toContain("<BR>");
	});
});

// ============================================================
// Block boundary expansion (single \n → separate paragraphs)
// ============================================================
describe("remarkNfm: block boundary expansion", () => {
	it("renders two Notion blocks separated by a single \\n as separate paragraphs", () => {
		const html = process("block one\nblock two");
		expect(html).toContain("<p>block one</p>");
		expect(html).toContain("<p>block two</p>");
	});

	it("renders blocks separated by \\n\\n as separate paragraphs", () => {
		const html = process("block one\n\nblock two");
		expect(html).toContain("<p>block one</p>");
		expect(html).toContain("<p>block two</p>");
	});

	it("preserves code block content when expanding block boundaries", () => {
		const html = process("intro\n```\nline one\nline two\n```\noutro");
		expect(html).toContain("line one\nline two");
		expect(html).toContain("<p>intro</p>");
		expect(html).toContain("<p>outro</p>");
	});
});

// ============================================================
// Callout conversion
// ============================================================
describe("remarkNfm: callout conversion", () => {
	it("converts :::callout directive to <callout> element with icon and color", () => {
		const html = process(':::callout{icon="💡" color="gray_bg"}\ncallout text\n:::');
		expect(html).toContain("<callout");
		expect(html).toContain('icon="💡"');
		expect(html).toContain('color="gray_bg"');
		expect(html).toContain("callout text");
	});

	it("converts callout without attributes", () => {
		const html = process(":::callout\nsome text\n:::");
		expect(html).toContain("<callout");
		expect(html).toContain("some text");
	});

	it("converts callout with only color attribute", () => {
		const html = process(':::callout{color="blue_bg"}\ncolored callout\n:::');
		expect(html).toContain('color="blue_bg"');
		expect(html).toContain("colored callout");
	});
});

// ============================================================
// GFM strikethrough
// ============================================================
describe("remarkNfm: GFM strikethrough", () => {
	it("renders ~~text~~ as <del>", () => {
		const html = process("~~strikethrough~~");
		expect(html).toContain("<del>strikethrough</del>");
	});
});

// ============================================================
// GFM task list
// ============================================================
describe("remarkNfm: GFM task list", () => {
	it("renders - [x] as a checked checkbox", () => {
		const html = process("- [x] done");
		expect(html).toContain('type="checkbox"');
		expect(html).toContain("checked");
	});

	it("renders - [ ] as an unchecked checkbox", () => {
		const html = process("- [ ] todo");
		expect(html).toContain('type="checkbox"');
		expect(html).not.toMatch(/checked(?!=)/);
	});
});

// ============================================================
// Double-application guard (remarkNfm idempotency)
// ============================================================
describe("remarkNfm: double-application guard", () => {
	it("produces the same output when remarkNfm is applied twice", () => {
		const input = "月曜日<br>10:00\nblock two";
		const once = unified()
			.use(remarkParse)
			.use(remarkNfm)
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(rehypeRaw)
			.use(rehypeStringify)
			.processSync(input);
		const twice = unified()
			.use(remarkParse)
			.use(remarkNfm)
			.use(remarkNfm) // applied twice intentionally
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(rehypeRaw)
			.use(rehypeStringify)
			.processSync(input);
		expect(String(twice)).toBe(String(once));
	});
});

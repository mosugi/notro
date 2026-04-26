import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { remarkNfm } from "./nfm.js";

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

// ============================================================
// <br> soft line break rendering
// ============================================================
describe("remarkNfm: <br> soft line break rendering", () => {
	it("renders <br> as a line break within a paragraph", () => {
		const html = process("月曜日<br>10:00");
		// Both parts are in the same paragraph, with <br> between them
		expect(html).toMatch(/<p>月曜日<br>10:00<\/p>/);
	});

	it("renders <BR> (uppercase) as a line break", () => {
		const html = process("line1<BR>line2");
		expect(html).toContain("<br>");
	});

	it("keeps <br> inline while separating adjacent blocks into separate paragraphs", () => {
		// Notion API output: two blocks, each with an intra-block Shift+Enter
		const html = process("月曜日<br>10:00\n火曜日<br>9:00");
		expect(html).toMatch(/<p>月曜日<br>10:00<\/p>/);
		expect(html).toMatch(/<p>火曜日<br>9:00<\/p>/);
	});

	it("does not treat a plain soft line break (\\n) as a <br>", () => {
		// CommonMark: soft line break renders as a space, not a line break
		// Fix 13 expands \n to \n\n (separate paragraphs), but each paragraph
		// itself does not get a <br>
		const html = process("line one\nline two");
		expect(html).not.toContain("<br>");
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
		expect(html).not.toMatch(/checked(?!=)/); // no checked attribute
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

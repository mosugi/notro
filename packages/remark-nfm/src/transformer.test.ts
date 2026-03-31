import { describe, it, expect } from "vitest";
import { preprocessNotionMarkdown } from "./transformer.js";

// ============================================================
// Fix 0: Migration — convert \$...\$ back to $...$
// ============================================================
describe("Fix 0: escaped inline math migration", () => {
  it("converts \\$...\\$ to $...$", () => {
    const input = "Some text \\$E = mc^2\\$ more text";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("Some text $E = mc^2$ more text");
  });

  it("leaves already-correct $...$ unchanged", () => {
    const input = "Some text $E = mc^2$ more text";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("Some text $E = mc^2$ more text");
  });

  it("does not cross newlines", () => {
    // Backslash-dollars that span lines should not be merged
    const input = "\\$foo\nbar\\$";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("\\$foo\nbar\\$");
  });
});

// ============================================================
// Fix 1: Ensure --- dividers have a blank line before them
// ============================================================
describe("Fix 1: setext heading prevention for ---", () => {
  it("inserts blank line before --- when preceded by text", () => {
    const input = "Some text\n---";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("Some text\n\n---");
  });

  it("leaves --- with existing blank line unchanged", () => {
    const input = "Some text\n\n---";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("Some text\n\n---");
  });

  it("inserts blank line before --- followed by more content", () => {
    const input = "paragraph\n---\nnext line";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("paragraph\n\n---\nnext line");
  });

  it("leaves --- at the start of string unchanged", () => {
    const input = "---\ntext";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("---\ntext");
  });

  it("inserts blank line before --- when preceded by a spaces-only line that itself follows text", () => {
    // "text\n   \n---" — the whitespace-only line is not a reliable blank line in all parsers
    const input = "text\n   \n---";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("text\n\n---");
  });

  it("inserts blank line before --- when preceded by a tab-only line that itself follows text", () => {
    const input = "text\n\t\n---";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("text\n\n---");
  });

  it("inserts blank line before --- with spaces-only line when followed by more content", () => {
    const input = "paragraph\n   \n---\nnext line";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("paragraph\n\n---\nnext line");
  });
});

// ============================================================
// Fix 2: Normalize callout directive syntax
// ============================================================
describe("Fix 2: callout directive normalization", () => {
  it("removes space between ::: and callout", () => {
    const input = "::: callout\ncontent\n:::";
    const output = preprocessNotionMarkdown(input);
    expect(output).toContain(":::callout");
    expect(output).not.toContain("::: callout");
  });

  it("moves attributes next to :::callout (no space)", () => {
    const input = '::: callout {icon="💡" color="blue"}\ncontent\n:::';
    const output = preprocessNotionMarkdown(input);
    expect(output).toContain(':::callout{icon="💡" color="blue"}');
  });

  it("dedents tab-indented content inside callout blocks", () => {
    const input = ":::callout\n\tcallout body\n:::";
    const output = preprocessNotionMarkdown(input);
    // Tab at start of "callout body" should be removed
    expect(output).toContain("\ncallout body\n");
    expect(output).not.toContain("\t");
  });

  it("handles callout with no attributes", () => {
    const input = "::: callout\ntext\n:::";
    const output = preprocessNotionMarkdown(input);
    expect(output).toContain(":::callout\n");
  });

  it("handles nested callout — inner ::: callout is normalized and dedented", () => {
    // Notion outputs nested callouts as tab-indented ::: callout blocks.
    // The inner "::: callout" should be normalized to ":::callout" and
    // its tab-indented body should be dedented after the outer dedent.
    const input = "::: callout {icon=\"💡\"}\n\touter content\n\t::: callout {icon=\"🔥\"}\n\t\tinner content\n\t:::\n:::";
    const output = preprocessNotionMarkdown(input);
    // Outer callout should be normalized
    expect(output).toContain(':::callout{icon="💡"}');
    // Inner callout should also be normalized (not left as "::: callout")
    expect(output).toContain(':::callout{icon="🔥"}');
    // Inner content should be fully dedented (no leading tabs)
    expect(output).not.toMatch(/^\t/m);
    // Structure: outer open, outer content, inner open, inner content, inner close, outer close
    expect(output).toBe(
      ':::callout{icon="💡"}\nouter content\n:::callout{icon="🔥"}\ninner content\n:::\n:::'
    );
  });

  it("handles triple-nested callouts — all levels normalized and dedented", () => {
    const input =
      "::: callout\n\touter\n\t::: callout\n\t\tmiddle\n\t\t::: callout\n\t\t\tinner\n\t\t:::\n\t:::\n:::";
    const output = preprocessNotionMarkdown(input);
    // All three levels should be normalized
    expect(output.split(":::callout").length - 1).toBe(3);
    // No leading tabs anywhere in the output
    expect(output).not.toMatch(/^\t/m);
    expect(output).toBe(":::callout\nouter\n:::callout\nmiddle\n:::callout\ninner\n:::\n:::\n:::");
  });

  it("does not close outer callout early when inner ::: appears", () => {
    // Without nesting-counter fix, the outer callout would close at the first ":::"
    // (the inner closing :::), leaving the outer closing ::: as a stray line.
    const input = ":::callout\n\touter text\n\t:::callout\n\t\tinner text\n\t:::\n\tmore outer\n:::";
    const output = preprocessNotionMarkdown(input);
    // "more outer" must be inside the outer callout (between :::callout and final :::)
    const lines = output.split("\n");
    const firstOpen = lines.indexOf(":::callout");
    const lastClose = lines.lastIndexOf(":::");
    const moreOuterIdx = lines.indexOf("more outer");
    expect(moreOuterIdx).toBeGreaterThan(firstOpen);
    expect(moreOuterIdx).toBeLessThan(lastClose);
  });
});

// ============================================================
// Fix 3: Block-level color annotations → raw HTML
// ============================================================
describe("Fix 3: block-level color annotations", () => {
  it("converts heading with color to raw HTML heading tag", () => {
    const input = '## My Heading {color="blue"}';
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe('<h2 color="blue">My Heading</h2>');
  });

  it("converts h1 with color to <h1>", () => {
    const input = '# Title {color="red"}';
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe('<h1 color="red">Title</h1>');
  });

  it("converts paragraph text with color to <p>", () => {
    const input = 'Some paragraph text {color="gray"}';
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe('<p color="gray">Some paragraph text</p>');
  });

  it("leaves headings without color unchanged", () => {
    const input = "## Normal Heading";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("## Normal Heading");
  });
});

// ============================================================
// Fix 4: <table_of_contents/> wrapping
// ============================================================
describe("Fix 4: table_of_contents wrapping", () => {
  it("wraps <table_of_contents/> in <div>", () => {
    const input = "<table_of_contents/>";
    const output = preprocessNotionMarkdown(input);
    expect(output).toContain("<div><table_of_contents/></div>");
  });

  it("wraps hyphenated form <table-of-contents/> too", () => {
    const input = "<table-of-contents/>";
    const output = preprocessNotionMarkdown(input);
    expect(output).toContain("<div><table_of_contents/></div>");
  });

  it("adds trailing newline after the wrapped tag", () => {
    const input = "<table_of_contents/>\nnext line";
    const output = preprocessNotionMarkdown(input);
    // Should have a blank line before "next line"
    expect(output).toMatch(/<div><table_of_contents\/><\/div>\n/);
  });
});

// ============================================================
// Fix 5: Inline equation format $`...`$ → $...$
// ============================================================
describe("Fix 5: inline equation normalization", () => {
  it("converts $`...`$ to $...$", () => {
    const input = "Equation $`E = mc^2`$ here";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("Equation $E = mc^2$ here");
  });

  it("leaves standard $...$ unchanged", () => {
    const input = "Equation $E = mc^2$ here";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("Equation $E = mc^2$ here");
  });

  it("handles multiple inline equations on one line", () => {
    const input = "$`a`$ and $`b`$";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("$a$ and $b$");
  });
});

// ============================================================
// Fix 6: <synced_block> stripping
// ============================================================
describe("Fix 6: synced_block stripping", () => {
  it("strips <synced_block> wrapper tags", () => {
    const input = "<synced_block>\n\tcontent line\n</synced_block>";
    const output = preprocessNotionMarkdown(input);
    expect(output).not.toContain("<synced_block>");
    expect(output).not.toContain("</synced_block>");
  });

  it("dedents tab-indented content inside synced_block", () => {
    const input = "<synced_block>\n\tsome content\n</synced_block>";
    const output = preprocessNotionMarkdown(input);
    expect(output).toContain("some content");
    // Should not have leading tab
    expect(output).not.toMatch(/^\tsome content/m);
  });

  it("removes <synced_block_reference> tags inside the block", () => {
    const input =
      "<synced_block>\n\t<synced_block_reference/>\n\tcontent\n</synced_block>";
    const output = preprocessNotionMarkdown(input);
    expect(output).not.toContain("synced_block_reference");
  });

  it("strips <synced_block_reference> wrapper tags (reference occurrence)", () => {
    const input = "<synced_block_reference>\n\tcontent line\n</synced_block_reference>";
    const output = preprocessNotionMarkdown(input);
    expect(output).not.toContain("<synced_block_reference>");
    expect(output).not.toContain("</synced_block_reference>");
    expect(output).toContain("content line");
  });

  it("dedents tab-indented content inside synced_block_reference", () => {
    const input = "<synced_block_reference>\n\tsome content\n</synced_block_reference>";
    const output = preprocessNotionMarkdown(input);
    expect(output).toContain("some content");
    expect(output).not.toMatch(/^\tsome content/m);
  });

  it("handles real-world API output: synced_block_reference with url attribute and inner closing tag", () => {
    // Mirrors actual Notion API output: outer <synced_block_reference url="...">,
    // tab-indented content, a tab-indented </synced_block_reference> artifact,
    // and the unindented outer closing tag.
    const input = [
      '<synced_block_reference url="https://www.notion.so/abc123">',
      "\tActual paragraph content here.",
      "\t</synced_block_reference>",
      "</synced_block_reference>",
    ].join("\n");
    const output = preprocessNotionMarkdown(input);
    expect(output).not.toContain("<synced_block_reference");
    expect(output).not.toContain("</synced_block_reference>");
    expect(output).toContain("Actual paragraph content here.");
  });
});

// ============================================================
// Fix 7: <empty-block/> isolation
// ============================================================
describe("Fix 7: empty-block isolation", () => {
  it("adds blank line before <empty-block/> when preceded by text on previous line", () => {
    const input = "some text\n<empty-block/>";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("some text\n\n<empty-block/>");
  });

  it("adds blank line after <empty-block/> when followed by text on next line", () => {
    const input = "<empty-block/>\nsome text";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("<empty-block/>\n\nsome text");
  });

  it("leaves <empty-block/> already surrounded by blank lines unchanged", () => {
    const input = "before\n\n<empty-block/>\n\nafter";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("before\n\n<empty-block/>\n\nafter");
  });
});

// ============================================================
// Fix 8: Trailing blank line after block-level HTML closing tags
// ============================================================
describe("Fix 8: trailing blank line after block-level closing tags", () => {
  it("inserts blank line after </table> when followed by text", () => {
    const input = "</table>\nnext paragraph";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("</table>\n\nnext paragraph");
  });

  it("inserts blank line after </details>", () => {
    const input = "</details>\n# Heading";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("</details>\n\n# Heading");
  });

  it("inserts blank line after </columns>", () => {
    const input = "</columns>\nsome text";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("</columns>\n\nsome text");
  });

  it("inserts blank line after </column>", () => {
    const input = "</column>\nsome text";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("</column>\n\nsome text");
  });

  it("inserts blank line after </summary>", () => {
    const input = "</summary>\nsome text";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("</summary>\n\nsome text");
  });

  it("leaves closing tag with existing blank line unchanged", () => {
    const input = "</table>\n\nnext paragraph";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("</table>\n\nnext paragraph");
  });
});

// ============================================================
// Fix 9: Markdown links inside <td> cells → <a> tags
// ============================================================
describe("Fix 9: markdown links inside td cells", () => {
  it("converts [text](url) inside <td> to <a href>", () => {
    const input = "<td>[Click here](https://example.com)</td>";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe('<td><a href="https://example.com">Click here</a></td>');
  });

  it("leaves plain text inside <td> unchanged", () => {
    const input = "<td>plain text</td>";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("<td>plain text</td>");
  });

  it("converts multiple links inside a single <td>", () => {
    const input =
      "<td>[first](https://a.com) and [second](https://b.com)</td>";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe(
      '<td><a href="https://a.com">first</a> and <a href="https://b.com">second</a></td>'
    );
  });

  it("leaves markdown links outside <td> unchanged", () => {
    const input = "[link text](https://example.com)";
    const output = preprocessNotionMarkdown(input);
    expect(output).toBe("[link text](https://example.com)");
  });

  it("handles links inside <td> with surrounding content in a table row", () => {
    const input =
      "<tr>\n<td>[docs](https://docs.example.com)</td>\n<td>cell2</td>\n</tr>";
    const output = preprocessNotionMarkdown(input);
    expect(output).toContain('<a href="https://docs.example.com">docs</a>');
    expect(output).toContain("<td>cell2</td>");
  });
});

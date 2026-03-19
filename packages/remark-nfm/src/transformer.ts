/**
 * Preprocesses Notion Enhanced Markdown before remark/MDX parsing.
 *
 * Fixes structural issues in Notion's markdown output that prevent correct
 * parsing by standard CommonMark/GFM parsers:
 *
 * 0. (Migration) Escaped inline math:
 *    Old versions of this function incorrectly escaped inline math as \$...\$.
 *    This fix converts \$...\$ back to $...$ so remark-math can parse it.
 *
 * 1. Setext heading prevention:
 *    A "---" line immediately after non-blank text is interpreted as a setext
 *    H2 heading. Notion uses "---" as dividers, so we insert a blank line before
 *    each one to force it to become a <hr> thematic break.
 *
 * 2. Callout directive syntax:
 *    Notion outputs "::: callout {icon="..." color="..."}" with spaces.
 *    remark-directive requires ":::callout{...}" (no spaces).
 *
 * 3. Block-level color annotations:
 *    Lines ending with {color="..."} are converted to raw HTML elements so the
 *    heading components (H1–H4) can receive the color as a prop.
 *
 * 4. Table of contents:
 *    CommonMark HTML block detection requires tag names matching [A-Za-z][A-Za-z0-9-]*.
 *    The underscore form <table_of_contents/> (Notion API output) is not recognized as HTML
 *    by CommonMark, so it gets escaped as text. Wrap it in <div> so remark treats it
 *    as HTML and the component mapping can render TableOfContents.astro.
 *
 * 5. Inline equation format:
 *    Notion outputs inline math as $`E = mc^2`$ (backtick-delimited inside $...$).
 *    remark-math expects standard $E = mc^2$ (no backticks). We strip the backticks.
 *
 * 6. Underscore tags (synced_block):
 *    Same underscore issue as table_of_contents — <synced_block> wraps content
 *    with tab-indented markdown. Strip the wrapper tags and dedent the content
 *    so remark can parse it as normal markdown.
 *
 * 7. Empty block isolation:
 *    <empty-block/> inline within a paragraph becomes a block-level element after
 *    the component mapping runs, producing invalid HTML (<div> inside <p>). Adding
 *    blank lines around it ensures remark treats it as a standalone HTML block.
 *
 * 8. Trailing blank line after block-level HTML closing tags:
 *    CommonMark HTML blocks (type 6: block-level elements like <table>, <details>,
 *    <columns>) end only when followed by a blank line. Notion's markdown output
 *    sometimes omits this blank line, causing subsequent markdown (headings, lists,
 *    code fences, etc.) to be consumed as raw HTML text and rendered literally.
 *    We insert a blank line after closing tags when one is absent.
 *
 * 9. Markdown links inside raw HTML table cells:
 *    Notion exports table cell rich-text links as markdown link syntax
 *    [text](url) inside raw HTML <td> blocks. remark does not process inline
 *    markdown inside raw HTML, so these appear as literal text. We convert
 *    them to <a href="url">text</a> before the pipeline runs.
 */
export function preprocessNotionMarkdown(markdown: string): string {
  // Fix 0: Migration — convert \$...\$ (escaped dollars from old preprocessing bug)
  // back to $...$ so remark-math can parse inline math correctly.
  // Pattern: backslash-dollar, non-newline/non-dollar content, backslash-dollar.
  // This is idempotent: $...$ (already correct) won't match since it has no backslash.
  let result = markdown.replace(/\\\$([^$\n]+)\\\$/g, (_, content: string) => `$${content}$`);

  // Fix 1: Ensure --- dividers have a blank line before them.
  // A "---" line immediately after any non-blank content (including after a
  // whitespace-only line that itself follows text) is interpreted as a setext
  // H2 heading. We ensure a blank line precedes every "---" divider.
  //
  // Step 1a: Handle "text\n   \n---" — a whitespace-only line between text and ---
  // is not reliably treated as a blank line by all parsers, so explicitly insert
  // a blank line before the --- and remove the trailing whitespace from the line.
  result = result.replace(/([^\n])\n[ \t]+\n(---+)(\n|$)/g, "$1\n\n$2$3");
  // Step 1b: Handle "text\n---" — no intervening line at all.
  result = result.replace(/([^\n])\n(---+)(\n|$)/g, "$1\n\n$2$3");

  // Fix 2: Normalize callout directive syntax.
  // Notion outputs "::: callout {icon="..." color="..."}" (with spaces)
  // or "::: callout" (no attrs) in newer API responses.
  // remark-directive requires ":::callout{...}" (no spaces, attrs optional).
  // Also dedent tab-indented content inside callout blocks — CommonMark
  // treats tab-indented lines as indented code blocks otherwise.
  // Process callout blocks line-by-line to correctly handle nested ::: directives.
  // A regex-based approach fails when the callout body contains other ::: blocks
  // (e.g. :::note … :::) because the lazy [\s\S]*? matches up to the first :::
  // on a line, closing the outer callout too early. Instead we track nesting depth
  // explicitly and find the matching closing ::: before dedenting the body.
  //
  // This function also handles nested callouts that are tab-indented inside an
  // outer callout block. After dedenting the outer callout body, the inner
  // "::: callout" syntax is normalized and then processed recursively so that
  // nested callouts are fully expanded at every level.
  result = (function processCalloutsDedent(input: string): string {
    // Normalize "::: callout {attrs}" → ":::callout{attrs}" at any indentation level.
    // This is run at each recursive level so that newly-dedented inner callout
    // opening lines are normalized before the line scanner processes them.
    const normalized = input.replace(
      /^::: callout( \{[^}]*\})?$/gm,
      (_, attrs) => `:::callout${attrs?.trim() ?? ""}`,
    );
    const lines = normalized.split("\n");
    const out: string[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (/^:::callout/.test(line)) {
        // Scan forward to find the matching closing ::: at depth 0.
        // Only lines that start exactly with ":::" (no leading whitespace) count
        // as directive markers at this nesting level.
        let depth = 1;
        let j = i + 1;
        while (j < lines.length) {
          if (/^:::/.test(lines[j])) {
            if (lines[j] === ":::") {
              depth--;
              if (depth === 0) break;
            } else {
              // Any other opening directive (:::callout, :::note, etc.) increases depth.
              depth++;
            }
          }
          j++;
        }
        if (j < lines.length) {
          // Found the matching closing :::; dedent content between open and close,
          // then recursively process the dedented content so that nested callout
          // blocks inside are also normalized and dedented.
          const contentLines = lines.slice(i + 1, j);
          const dedented = contentLines.map((cl) => cl.replace(/^\t/, "")).join("\n");
          const processedContent = processCalloutsDedent(dedented);
          out.push(line);
          if (processedContent) out.push(...processedContent.split("\n"));
          out.push(":::");
          i = j + 1;
        } else {
          // No matching closing ::: found — emit the opening line as-is and continue.
          out.push(line);
          i++;
        }
      } else {
        out.push(line);
        i++;
      }
    }
    return out.join("\n");
  })(result);

  // Fix 3: Convert block-level color annotations to raw HTML.
  result = result.replace(
    /^(#{1,6}) (.+?) \{color="([^"]+)"\}$/gm,
    (_, hashes: string, text: string, color: string) =>
      `<h${hashes.length} color="${color}">${text}</h${hashes.length}>`
  );
  result = result.replace(
    /^([^<#\n][^\n]*?) \{color="([^"]+)"\}$/gm,
    '<p color="$2">$1</p>'
  );

  // Fix 4: Wrap table-of-contents tags in <div> so remark treats them as HTML.
  // CommonMark HTML block detection requires tag names matching [A-Za-z][A-Za-z0-9-]*.
  // The underscore form <table_of_contents/> (Notion API output) is not recognized as HTML
  // by CommonMark. The hyphenated form <table-of-contents/> (seed/user input) is valid but
  // we normalize both to <table_of_contents/> inside a <div> for consistent plugin handling.
  result = result.replace(
    /^<table[_-]of[_-]contents(?:\s[^>]*)?\s*\/?>$/gm,
    "<div><table_of_contents/></div>\n"
  );

  // Fix 5: Convert Notion inline equation format $`...`$ → $...$ for remark-math.
  // Uses function-form replacement to avoid $ metacharacter confusion in the
  // replacement string.
  result = result.replace(/\$`([^`]+)`\$/g, (_, content: string) => `$${content}$`);

  // Fix 6: Strip <synced_block> wrapper tags and dedent content.
  // These tags contain underscores, preventing CommonMark HTML block detection.
  // The content inside is tab-indented; strip the wrapper and dedent so it
  // renders as normal markdown. Also strip any <synced_block_reference> tags
  // that appear inside (they have no display-relevant semantics).
  result = result.replace(
    /^<synced_block(?:\s[^>]*)?>$([\s\S]*?)^<\/synced_block>$/gm,
    (_, content: string) =>
      content
        .replace(/^\t<\/?synced_block_reference(?:\s[^>]*)?\/?>[ \t]*$/gm, "")
        .replace(/^\t/gm, "")
  );

  // Fix 7: Ensure <empty-block/> is treated as a standalone block element.
  // Without blank lines around it, remark places it inline inside a <p>,
  // which the component mapping then renders as a block inside inline content.
  result = result.replace(/([^\n])\n(<empty-block\/>)/g, "$1\n\n$2");
  result = result.replace(/(<empty-block\/>)\n([^\n])/g, "$1\n\n$2");

  // Fix 8: Ensure block-level HTML closing tags have a trailing blank line.
  // CommonMark HTML blocks (type 6) end only at a blank line. Notion omits
  // this blank line after </table>, </details>, </columns>, </column>, etc.,
  // causing any following markdown to be consumed as raw HTML text and rendered
  // as a literal string instead of proper HTML elements.
  result = result.replace(
    /(<\/(?:table|details|columns|column|summary)>)\n([^\n])/g,
    "$1\n\n$2"
  );

  // Fix 9: Convert markdown link syntax inside raw HTML <td> cells to <a> tags.
  // Notion exports table cell links as [text](url) inside <td>...</td>, but remark
  // does not process inline markdown inside raw HTML blocks. Replace them with
  // proper anchor elements so they render as clickable links.
  // The URL pattern handles one level of nested parentheses, e.g.:
  //   https://en.wikipedia.org/wiki/Rust_(programming_language)
  //   https://developer.mozilla.org/docs/Array/find()
  result = result.replace(/<td>([\s\S]*?)<\/td>/g, (_, content: string) => {
    const linked = content.replace(
      /\[([^\]\n]+)\]\(([^()\n]*(?:\([^()\n]*\)[^()\n]*)*)\)/g,
      '<a href="$2">$1</a>'
    );
    return `<td>${linked}</td>`;
  });

  return result;
}

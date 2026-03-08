/**
 * Seed script: creates ~20 sample pages in the Notion database.
 * Each page tests a different Notion/Markdown rendering pattern.
 *
 * Usage:
 *   NOTION_TOKEN=... NOTION_DATASOURCE_ID=... node scripts/seed-notion-pages.mjs
 *   # or just: node scripts/seed-notion-pages.mjs  (if env vars are set)
 */

// In Claude Code on the Web, outbound HTTP goes through a proxy set via https_proxy.
// Node.js's built-in fetch does not pick this up automatically, so we configure
// undici's global dispatcher to route through it.
import { ProxyAgent, setGlobalDispatcher } from "undici";
if (process.env.https_proxy) {
  setGlobalDispatcher(new ProxyAgent(process.env.https_proxy));
}

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DATASOURCE_ID;

if (!process.env.NOTION_TOKEN || !DB_ID) {
  console.error("Missing NOTION_TOKEN or NOTION_DATASOURCE_ID");
  process.exit(1);
}

// Helper to build page properties
function props({ title, slug, description = "", tags = [], category = null, date = "2026-01-01", isPublic = true }) {
  const p = {
    Name: { title: [{ text: { content: title } }] },
    Slug: { rich_text: [{ text: { content: slug } }] },
    Description: { rich_text: [{ text: { content: description } }] },
    Public: { checkbox: isPublic },
    Tags: { multi_select: tags.map((name) => ({ name })) },
    Date: { date: { start: date } },
  };
  if (category) p.Category = { select: { name: category } };
  return p;
}

// Wait between API calls to stay within the 3 req/s limit
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Page definitions: each entry has properties + markdown body
const pages = [
  // 01 - Headings & basic paragraphs
  {
    properties: props({
      title: "Sample 01: Headings & Paragraphs",
      slug: "sample-01-headings",
      description: "Tests H1–H3 headings and paragraph text.",
      tags: ["sample", "headings"],
      category: "Basics",
      date: "2026-01-01",
    }),
    markdown: `# Heading 1

This is a paragraph under Heading 1. Lorem ipsum dolor sit amet.

## Heading 2

Another paragraph. Notion headings map to H1/H2/H3 in Markdown.

### Heading 3

The deepest heading level supported by Notion.

Regular paragraph after the heading.
`,
  },

  // 02 - Inline formatting
  {
    properties: props({
      title: "Sample 02: Inline Formatting",
      slug: "sample-02-inline-formatting",
      description: "Bold, italic, underline, strikethrough, inline code, links.",
      tags: ["sample", "formatting"],
      category: "Basics",
      date: "2026-01-02",
    }),
    markdown: `# Inline Formatting

**Bold text** and *italic text* and ~~strikethrough text~~.

Combined: **_bold italic_** and ~~**bold strikethrough**~~.

Inline \`code snippet\` inside a sentence.

[External link](https://astro.build) and [another link](https://notion.so).

Plain text for comparison.
`,
  },

  // 03 - Bulleted & numbered lists
  {
    properties: props({
      title: "Sample 03: Lists",
      slug: "sample-03-lists",
      description: "Bulleted lists, numbered lists, and nested lists.",
      tags: ["sample", "lists"],
      category: "Basics",
      date: "2026-01-03",
    }),
    markdown: `# Lists

## Bulleted List

- Item A
- Item B
  - Nested B1
  - Nested B2
- Item C

## Numbered List

1. First item
2. Second item
   1. Nested 2.1
   2. Nested 2.2
3. Third item

## Mixed Nesting

- Bullet top
  1. Numbered child
  2. Another numbered child
- Another bullet
`,
  },

  // 04 - Tables
  {
    properties: props({
      title: "Sample 04: Tables",
      slug: "sample-04-tables",
      description: "GFM-style tables rendered from Notion.",
      tags: ["sample", "tables"],
      category: "Basics",
      date: "2026-01-04",
    }),
    markdown: `# Tables

## Simple Table

| Column A | Column B | Column C |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

## Aligned Table

| Left-aligned | Center-aligned | Right-aligned |
|:------------|:--------------:|--------------:|
| Apple        | Banana         | Cherry        |
| 100          | 200            | 300           |
`,
  },

  // 05 - Code blocks
  {
    properties: props({
      title: "Sample 05: Code Blocks",
      slug: "sample-05-code-blocks",
      description: "Fenced code blocks with syntax highlighting.",
      tags: ["sample", "code"],
      category: "Basics",
      date: "2026-01-05",
    }),
    markdown: `# Code Blocks

## TypeScript

\`\`\`typescript
interface Post {
  id: string;
  title: string;
  tags: string[];
}

function getPost(id: string): Post | undefined {
  return posts.find((p) => p.id === id);
}
\`\`\`

## Bash

\`\`\`bash
# Install dependencies
npm install

# Run dev server
npm run dev --workspace=notro-tail
\`\`\`

## JSON

\`\`\`json
{
  "name": "notro-tail",
  "version": "0.0.1",
  "type": "module"
}
\`\`\`

## Plain text (no language)

\`\`\`
This is plain text without syntax highlighting.
Line two.
\`\`\`
`,
  },

  // 06 - Blockquote
  {
    properties: props({
      title: "Sample 06: Blockquotes",
      slug: "sample-06-blockquotes",
      description: "Blockquote elements from Notion.",
      tags: ["sample", "blockquote"],
      category: "Basics",
      date: "2026-01-06",
    }),
    markdown: `# Blockquotes

> This is a simple blockquote. It wraps long lines correctly when the content exceeds the container width.

> **Bold inside a quote.** And *italic* too.
>
> Second paragraph within the same blockquote block.

Regular paragraph after the quote.
`,
  },

  // 07 - Callouts
  {
    properties: props({
      title: "Sample 07: Callouts",
      slug: "sample-07-callouts",
      description: "Notion callout blocks with different emoji icons.",
      tags: ["sample", "callout"],
      category: "Advanced",
      date: "2026-01-07",
    }),
    markdown: `# Callouts

:::callout
💡 **Tip:** This is a default callout. It renders as a styled box.
:::

:::callout{color="blue_background"}
ℹ️ **Info:** Blue-tinted callout for informational content.
:::

:::callout{color="red_background"}
⚠️ **Warning:** Red callout for important warnings.
:::

:::callout{color="green_background"}
✅ **Success:** Green callout for success messages.
:::

:::callout{color="yellow_background"}
🔔 **Note:** Yellow callout for general notes.
:::
`,
  },

  // 08 - Toggles
  {
    properties: props({
      title: "Sample 08: Toggles",
      slug: "sample-08-toggles",
      description: "Notion toggle blocks rendered as <details>/<summary>.",
      tags: ["sample", "toggle"],
      category: "Advanced",
      date: "2026-01-08",
    }),
    markdown: `# Toggles

<details>
<summary>Click to expand: Basic Toggle</summary>

This is the content inside the toggle. It can contain any Markdown.

- List item inside toggle
- Another item

</details>

<details>
<summary>Toggle with Code</summary>

\`\`\`typescript
const x = 42;
console.log(x);
\`\`\`

</details>

<details>
<summary>Nested Toggle (outer)</summary>

Outer content here.

<details>
<summary>Inner Toggle</summary>

Inner content here.

</details>

</details>
`,
  },

  // 09 - Math
  {
    properties: props({
      title: "Sample 09: Math (KaTeX)",
      slug: "sample-09-math",
      description: "Inline and block math equations via KaTeX.",
      tags: ["sample", "math"],
      category: "Advanced",
      date: "2026-01-09",
    }),
    markdown: `# Math Equations

## Inline Math

Einstein's famous equation: $E = mc^2$.

The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.

## Block Math

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
\\begin{pmatrix}
  a & b \\\\
  c & d
\\end{pmatrix}
\\begin{pmatrix}
  x \\\\
  y
\\end{pmatrix}
=
\\begin{pmatrix}
  ax + by \\\\
  cx + dy
\\end{pmatrix}
$$
`,
  },

  // 10 - Columns
  {
    properties: props({
      title: "Sample 10: Columns",
      slug: "sample-10-columns",
      description: "Notion column layouts.",
      tags: ["sample", "columns"],
      category: "Layout",
      date: "2026-01-10",
    }),
    markdown: `# Column Layouts

<columns>
<column>

## Left Column

This is the left column content.

- Point 1
- Point 2

</column>
<column>

## Right Column

This is the right column content.

**Bold text** in the right column.

</column>
</columns>

Three-column layout:

<columns>
<column>

**Column 1**

Short content.

</column>
<column>

**Column 2**

More content here.

</column>
<column>

**Column 3**

Even more content.

</column>
</columns>
`,
  },

  // 11 - Colors & annotations
  {
    properties: props({
      title: "Sample 11: Colors",
      slug: "sample-11-colors",
      description: "Notion text colors and background colors.",
      tags: ["sample", "colors"],
      category: "Styling",
      date: "2026-01-11",
    }),
    markdown: `# Colors

<span class="nt-color-red">Red text</span> and <span class="nt-color-blue">blue text</span>.

<span class="nt-color-green">Green</span>, <span class="nt-color-orange">orange</span>, <span class="nt-color-purple">purple</span>.

Background colors:

<span class="nt-color-red_background">Red background</span>

<span class="nt-color-blue_background">Blue background</span>

<span class="nt-color-yellow_background">Yellow background</span>

<span class="nt-color-green_background">Green background</span>
`,
  },

  // 12 - Table of Contents
  {
    properties: props({
      title: "Sample 12: Table of Contents",
      slug: "sample-12-toc",
      description: "Page with a table of contents block.",
      tags: ["sample", "toc"],
      category: "Navigation",
      date: "2026-01-12",
    }),
    markdown: `# Table of Contents

<table-of-contents />

## Section One

Content of section one. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Section Two

Content of section two. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Subsection 2.1

Deeper content here.

### Subsection 2.2

More deeper content.

## Section Three

Final section content.
`,
  },

  // 13 - Images
  {
    properties: props({
      title: "Sample 13: Images",
      slug: "sample-13-images",
      description: "External images embedded in Notion pages.",
      tags: ["sample", "images", "media"],
      category: "Media",
      date: "2026-01-13",
    }),
    markdown: `# Images

## External Image

![Astro logo](https://astro.build/assets/press/astro-icon-light-gradient.png)

## Image with Caption

![A scenic mountain landscape](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800)

*A beautiful mountain scene from Unsplash.*

## Inline description with image

The image below shows a sample placeholder:

![Placeholder image](https://placehold.co/600x400?text=Sample+Image)
`,
  },

  // 14 - Divider / horizontal rule
  {
    properties: props({
      title: "Sample 14: Dividers",
      slug: "sample-14-dividers",
      description: "Horizontal rule dividers between sections.",
      tags: ["sample", "divider"],
      category: "Basics",
      date: "2026-01-14",
    }),
    markdown: `# Dividers

Section before the first divider.

---

Section between dividers. This content is separated visually from the sections above and below.

---

Final section after dividers.

---

Multiple dividers create clear visual breaks in long content.
`,
  },

  // 15 - Long content / scrollable
  {
    properties: props({
      title: "Sample 15: Long Content",
      slug: "sample-15-long-content",
      description: "A longer page to test scrolling and layout stability.",
      tags: ["sample", "long"],
      category: "Basics",
      date: "2026-01-15",
    }),
    markdown: `# Long Content Page

This page contains a large amount of text to test how the layout handles long documents.

## Lorem Ipsum Section 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Lorem Ipsum Section 2

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati.

## Lorem Ipsum Section 3

Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.

Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.

## Lorem Ipsum Section 4

Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.

Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.

## Final Section

This concludes the long content page. If you have read this far, the layout is working correctly for long documents.
`,
  },

  // 16 - Mixed content (realistic blog post)
  {
    properties: props({
      title: "Sample 16: Mixed Content (Blog Post)",
      slug: "sample-16-mixed-blog-post",
      description: "A realistic blog post mixing various Notion block types.",
      tags: ["sample", "blog", "mixed"],
      category: "Tutorial",
      date: "2026-01-16",
    }),
    markdown: `# Getting Started with Astro and Notion

In this post, we'll explore how to build a static blog using **Astro 5** and **Notion** as a CMS.

## Why Notion as a CMS?

Notion offers a clean writing experience with a rich block editor. Using the Notion Public API, we can fetch page content as Markdown and render it in Astro.

:::callout
💡 **Tip:** You need a Notion Internal Integration Token to use the API. Create one at [notion.so/profile/integrations](https://www.notion.so/profile/integrations).
:::

## Setting Up the Project

\`\`\`bash
npm create astro@latest my-blog
cd my-blog
npm install notro
\`\`\`

## Configuring the Content Loader

Add the following to your \`content.config.ts\`:

\`\`\`typescript
import { defineCollection } from "astro:content";
import { loader, pageWithMarkdownSchema } from "notro";

const posts = defineCollection({
  loader: loader({
    queryParameters: { data_source_id: import.meta.env.NOTION_DATASOURCE_ID },
    clientOptions: { auth: import.meta.env.NOTION_TOKEN },
  }),
  schema: pageWithMarkdownSchema,
});

export const collections = { posts };
\`\`\`

## Key Features

| Feature | Supported |
|---------|-----------|
| Headings | ✅ |
| Code blocks | ✅ |
| Callouts | ✅ |
| Tables | ✅ |
| Math (KaTeX) | ✅ |
| Toggles | ✅ |

## Conclusion

With NotroTail, you get a fast, SEO-optimized blog powered by Notion. Happy writing!
`,
  },

  // 17 - No tags / minimal
  {
    properties: props({
      title: "Sample 17: Minimal Page",
      slug: "sample-17-minimal",
      description: "A minimal page with almost no content.",
      tags: [],
      date: "2026-01-17",
    }),
    markdown: `# Minimal Page

Just a short paragraph. Nothing fancy here.
`,
  },

  // 18 - Task list / checkboxes
  {
    properties: props({
      title: "Sample 18: Task Lists",
      slug: "sample-18-task-lists",
      description: "GFM task list checkboxes.",
      tags: ["sample", "todo"],
      category: "Basics",
      date: "2026-01-18",
    }),
    markdown: `# Task Lists

## Project Checklist

- [x] Set up Astro project
- [x] Install notro package
- [x] Configure content collections
- [ ] Add custom components
- [ ] Deploy to Vercel

## Feature Wishlist

- [x] Markdown rendering
- [x] Syntax highlighting
- [x] Math support
- [ ] Full-text search
- [ ] Dark mode toggle
`,
  },

  // 19 - Pinned / featured post
  {
    properties: props({
      title: "Sample 19: Pinned Post",
      slug: "sample-19-pinned",
      description: "A pinned/featured post that appears at the top of the list.",
      tags: ["sample", "pinned"],
      category: "Featured",
      date: "2026-01-19",
    }),
    markdown: `# Pinned Post

This post is tagged as **pinned** so it appears at the top of the blog list page, regardless of its publication date.

## Why Pinning?

Pinned posts are useful for:

- Announcements
- Getting-started guides
- Featured content

## How It Works

In \`[...page].astro\`, pinned posts are sorted to the top using the \`pinned\` tag filter.
`,
  },

  // Fixed page: About
  // Demonstrates .page-about bodyClass — h2 headings get a blue left border
  // (defined in global.css as: .page-about .nt-markdown-content h2 { border-l-4 border-blue-500 })
  {
    properties: props({
      title: "About",
      slug: "about",
      description: "What notro-tail is and how it works.",
      tags: [],
      date: "2026-01-01",
    }),
    markdown: `# About NotroTail

**NotroTail** is a Notion-to-Astro static site generator template.
It fetches content from Notion via the Public API, renders it through a custom
remark/rehype plugin pipeline, and outputs a fast, SEO-optimized static site
styled with TailwindCSS 4.

## How content flows

1. The \`loader()\` from the \`notro\` package queries the Notion database and fetches each page as Markdown.
2. Pages are cached by \`last_edited_time\`. Only changed pages are re-fetched on the next build — incremental builds stay fast even with hundreds of posts.
3. Preprocessed Markdown is stored in Astro's Content Collection store.
4. At render time, \`NotionMarkdownRenderer\` runs the full remark/rehype plugin pipeline.

## Notion block support

| Block type | Plugin |
|---|---|
| Callouts | \`calloutPlugin\` (remark) |
| Toggles | \`togglePlugin\` (rehype) |
| Column layouts | \`columnsPlugin\` (rehype) |
| Table of contents | \`tableOfContentsPlugin\` (rehype) |
| Math (KaTeX) | \`remark-math\` + \`rehype-katex\` |
| Page links | \`pageLinkPlugin\` (rehype) |
| Media embeds | \`mediaPlugin\` (rehype) |

## Per-page custom styles

Each Notion page that appears in navigation can be assigned a \`bodyClass\` in
\`src/config.ts\`. That class is applied to \`<body>\`, enabling scoped CSS in
\`global.css\` without affecting other pages.

This page has \`bodyClass: "page-about"\`. The \`h2\` headings you see above —
like "How content flows" and "Notion block support" — have a blue left border
applied by:

\`\`\`css
.page-about .nt-markdown-content h2 {
  border-left: 4px solid #3b82f6;
  padding-left: 0.75rem;
}
\`\`\`

## Workspace structure

The repo is an npm workspace monorepo:

- **\`apps/notro-tail/\`** — the deployable Astro 5 website (this site)
- **\`packages/notro/\`** — the publishable npm library (loader, components, plugins)

## Links

- [GitHub: mosugi/notro-tail](https://github.com/mosugi/notro-tail)
- [notro on npm](https://www.npmjs.com/package/notro)
`,
  },

  // Fixed page: Privacy
  // Demonstrates .page-privacy bodyClass — body text is smaller and subdued
  // (defined in global.css as: .page-privacy .nt-markdown-content { text-sm text-gray-600 })
  {
    properties: props({
      title: "Privacy",
      slug: "privacy",
      description: "Privacy policy for the NotroTail demo site.",
      tags: [],
      date: "2026-01-01",
    }),
    markdown: `# Privacy Policy

This is a demonstration site built with **NotroTail** (Notion → Astro static site generator).
The following policy applies to this demo deployment.

## Data we collect

This site is statically generated and does not run a backend server.
No user data is collected, stored, or transmitted by this site itself.

If you are self-hosting notro-tail and add analytics, contact forms, or other
third-party services, those services are subject to their own privacy policies.

## Notion data

Page content is fetched from Notion at build time via the Notion Public API.
No Notion credentials are exposed to visitors; the API token is used only during
the static build process on the server.

## Cookies

This site sets no cookies and uses no local storage.

## Third-party services

| Service | Purpose | Privacy policy |
|---|---|---|
| Netlify / Vercel | Static hosting | See provider's policy |
| KaTeX CDN | Math rendering stylesheet | No tracking |

## Changes to this policy

Because this is a demo site, this policy may be updated at any time without notice.

## Per-page styling note

This page has \`bodyClass: "page-privacy"\` in \`config.ts\`.
The smaller, subdued text you are reading is applied by:

\`\`\`css
.page-privacy .nt-markdown-content {
  font-size: 0.875rem; /* text-sm */
  color: #4b5563;      /* text-gray-600 */
}
\`\`\`

This is the per-page \`bodyClass\` feature of notro-tail in action.
`,
  },

  // 20 - Private / unlisted (Public = false)
  {
    properties: props({
      title: "Sample 20: Private Page (Not Public)",
      slug: "sample-20-private",
      description: "This page has Public=false and should NOT appear in the build.",
      tags: ["sample", "private"],
      date: "2026-01-20",
      isPublic: false,
    }),
    markdown: `# Private Page

This page has \`Public: false\` and should be excluded from the Astro build.

If you can see this page rendered, the Public filter is not working correctly.
`,
  },
];

async function main() {
  console.log(`Creating ${pages.length} sample pages in database ${DB_ID}...\n`);

  for (let i = 0; i < pages.length; i++) {
    const { properties, markdown } = pages[i];
    const title = properties.Name.title[0].text.content;

    try {
      const page = await notion.pages.create({
        parent: { data_source_id: DB_ID, type: "data_source_id" },
        properties,
        markdown,
      });
      console.log(`[${String(i + 1).padStart(2, "0")}] ✓ Created: ${title} (${page.id})`);
    } catch (err) {
      console.error(`[${String(i + 1).padStart(2, "0")}] ✗ Failed: ${title}`);
      console.error(`    ${err.message}`);
    }

    // Stay within the 3 req/s Notion API rate limit
    if (i < pages.length - 1) await sleep(400);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

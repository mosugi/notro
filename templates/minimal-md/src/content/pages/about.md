---
slug: about
title: About this template
---

# About this template

`notro-minimal-md` is the smallest possible notro setup that uses local
markdown files instead of the Notion API.

## Files

- `src/content/pages/*.md` — your content. One file per page.
- `src/content.config.ts` — wires `fileLoader` to that directory.
- `src/pages/[slug].astro` — renders each entry through `<NotroContent>`.

## Adding a new page

1. Create `src/content/pages/<slug>.md`.
2. Set `slug` and `title` in YAML frontmatter.
3. Write Notion-flavored markdown in the body.

The dev server reloads automatically on file changes.

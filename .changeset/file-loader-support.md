---
"notro-loader": minor
---

Add `fileLoader` — an Astro Content Loader that reads `.md` / `.mdx`
files from the local filesystem and exposes their body to
`<NotroContent>` through the same MDX pipeline as Notion-sourced
entries.

The loader is shape-agnostic, matching the ergonomics of Astro's
built-in `glob` loader: YAML frontmatter is passed through verbatim
as `data`, plus a `markdown` field for the body and two filesystem-
derived timestamps (`createdTime`, `lastEditedTime`) that the
frontmatter can override. Define the schema you want on the
collection itself — `fileLoader` does not interpret any specific
frontmatter keys. A `generateId` hook is provided for custom entry
IDs (default: `frontmatter.slug ?? filename stem`), and dev-mode
hot reload works via Astro's file watcher.

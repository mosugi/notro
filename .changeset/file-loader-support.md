---
"notro-loader": minor
---

Add `fileLoader` — an Astro Content Loader that reads Notion-flavored
markdown from the local filesystem. Each `.md` / `.mdx` file under the
configured `base` directory becomes one collection entry; YAML
frontmatter keys (`title`, `slug`, `description`, `public`, `tags`,
`category`, `date`) are mapped to Notion-style `properties`, so the
same schema, pages, and helpers (`getPlainText`, `buildLinkToPages`,
`hasTag`, ...) work unchanged for both Notion- and file-backed
collections. Supports dev-mode hot reload via Astro's file watcher
and exposes `generateId` / `transform` hooks for customization.

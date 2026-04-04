# notro-tail — Astro template app

`apps/notro-tail` is the reference Astro 6 website that ships with the monorepo.
It demonstrates every feature of the `notro` library and can be used as a starting point for your own Notion-backed site.

---

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/pages/index.astro` | Hero landing page with feature cards |
| `/blog/` | `src/pages/blog/[...page].astro` | Paginated blog list; page 1 shows pinned posts |
| `/blog/[slug]/` | `src/pages/blog/[slug].astro` | Individual blog post with prev/next navigation |
| `/blog/tag/[tag]/` | `src/pages/blog/tag/[tag]/[...page].astro` | Filtered list by tag with back link |

---

## Key Files

### `src/config.ts`

Site-wide configuration: site name, language, analytics, posts per page, navigation links, footer links, and social links.

### `src/layouts/Layout.astro`

Base HTML shell. Accepts:

| Prop | Type | Effect |
|------|------|--------|
| `title` | `string` | `<title>` and `og:title` |
| `description` | `string?` | `<meta name="description">` and `og:description` |
| `bodyClass` | `string?` | CSS class on `<body>` for per-page scoped styles |

Canonical URL and `og:url` are computed automatically from `Astro.url`.

### `src/components/Header.astro`

Sticky header with active-link highlighting. Reads `Astro.url.pathname` and applies `font-medium text-gray-900` to the current page.

### `src/styles/global.css`

TailwindCSS 4 stylesheet. Defines:
- `nt-*` utility classes for design tokens (text/bg/border opacity scale)

---

## Blog Post Features

### Prev/Next Navigation

Each blog post page shows a two-column card at the bottom linking to the adjacent posts sorted by `Date` (descending). Posts tagged `"page"` (fixed pages) are excluded from this list and show no prev/next nav.

### Pinned Posts

Posts tagged `"pinned"` appear in a separate pinned section at the top of page 1 of the blog list. On page 2+, a hint links back to page 1.

### Tag Filtering

`/blog/tag/[tag]/` lists all posts for a given tag with a back link to the full blog list.

---

## Notion Database Schema

| Property | Type | Used by |
|----------|------|---------|
| `Name` | title | Post title, `<title>`, `og:title` |
| `Description` | rich_text | Excerpt, `<meta description>`, `og:description` |
| `Public` | checkbox | Loader filter (only `Public: true` pages are fetched) |
| `Slug` | rich_text | URL path (`/blog/[slug]/`) |
| `Tags` | multi_select | Tag filtering; `"page"` = fixed page, `"pinned"` = pinned post |
| `Category` | select | Available for custom filtering |
| `Date` | date | Publication date; used for prev/next ordering |

---

## Development

```bash
# From repo root
npm install
npm run dev          # starts dev server at http://localhost:4321
npm run build        # astro check + astro build

# From this directory
npm run dev
npm run build
npm run format       # Prettier + prettier-plugin-astro
```

Environment variables required:

```
NOTION_TOKEN=<Notion Internal Integration Token>
NOTION_DATASOURCE_ID=<Notion data source (database) ID>
```

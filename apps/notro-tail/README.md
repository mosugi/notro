# notro-tail — Astro template app

`apps/notro-tail` is the reference Astro 5 website that ships with the monorepo.
It demonstrates every feature of the `notro` library and can be used as a starting point for your own Notion-backed site.

---

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/pages/index.astro` | Hero landing page with feature cards |
| `/blog/` | `src/pages/blog/[...page].astro` | Paginated blog list; page 1 shows pinned posts |
| `/blog/[slug]/` | `src/pages/blog/[slug].astro` | Individual blog post with prev/next navigation |
| `/blog/tag/[tag]/` | `src/pages/blog/tag/[tag]/[...page].astro` | Filtered list by tag with back link |
| `/contact/` | `src/pages/contact.astro` | Static Astro page (no Notion) — explains how the site works |

---

## Key Files

### `src/config.ts`

Registers Notion pages that appear in the header navigation and assigns per-page body classes:

```ts
export const navPages: NavPageConfig[] = [
  { slug: "about",   bodyClass: "page-about" },
  { slug: "privacy", bodyClass: "page-privacy" },
];
```

Any slug listed here is treated as a **fixed page** — excluded from blog pagination and prev/next navigation.

### `src/layouts/Layout.astro`

Base HTML shell. Accepts:

| Prop | Type | Effect |
|------|------|--------|
| `title` | `string` | `<title>` and `og:title` |
| `description` | `string?` | `<meta name="description">` and `og:description` |
| `bodyClass` | `string?` | CSS class on `<body>` for per-page scoped styles |

Canonical URL and `og:url` are computed automatically from `Astro.url`.

### `src/components/Header.astro`

Sticky header with active-link highlighting. Reads `Astro.url.pathname` and applies `font-medium text-gray-900` to the current page. The **Docs** button (`/contact/`) is a filled blue pill that darkens when active.

### `src/styles/global.css`

TailwindCSS 4 stylesheet. Defines:
- `nt-*` utility classes for all Notion block types, colors, and annotations
- `.nt-markdown-content` prose typography (headings, code, tables, links, …)
- Per-page body themes (see below)

---

## Per-Page Scoped Styles (`bodyClass`)

Add a unique CSS class to `<body>` to give each page a distinct visual identity without affecting other pages. All content rules must be scoped under `main` or `.nt-markdown-content` to avoid leaking into the shared header/footer.

| `bodyClass` | Visual theme |
|-------------|-------------|
| `page-about` | Blue 3 px top border on page; `h2` has blue left border + `bg-blue-50` tint; links are bold blue |
| `page-privacy` | Compact legal style — small `tracking-widest` uppercase `h2`s with a ruled bottom border, `text-sm` body |
| `page-contact` | Indigo-50 gradient on `<main>`; `h2` and links in indigo; `<section>` dividers |

**How to add a new per-page theme:**

1. Add `{ slug: "my-page", bodyClass: "page-my-page" }` to `src/config.ts`.
2. Write `.page-my-page main h2 { … }` (or similar) in `global.css`.
3. The `[slug].astro` route reads the config map and injects the class automatically.

For static Astro pages (not Notion-backed), pass `bodyClass` directly:
```astro
<Layout title="My Page" bodyClass="page-my-page">
```

---

## Blog Post Features

### Prev/Next Navigation

Each blog post page shows a two-column card at the bottom:
- **← 新しい記事** — newer post (by `Date` property, descending)
- **古い記事 →** — older post

Posts tagged `"page"` (fixed pages like About, Privacy) are excluded from the sorted list and show no prev/next nav.

### Pinned Posts

Posts tagged `"pinned"` appear in a separate "ピン留め" section at the top of page 1 of the blog list. On page 2+, a "← ピン留め記事は1ページ目にあります" hint links back to page 1.

### Tag Filtering

`/blog/tag/[tag]/` lists all posts for a given tag. A "← ブログ一覧" back link appears above the heading.

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

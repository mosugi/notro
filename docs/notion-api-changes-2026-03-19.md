# Notion API Changes — 2026-03-19

## Tasks: N-12 / N-19

### N-12: Set about and privacy pages to Public=true

The following pages were updated via the Notion API (`PATCH /v1/pages/{id}`) to set `Public: true`:

| Page | Slug | Page ID | Before | After |
|------|------|---------|--------|-------|
| About | `about` | `31d6b8b6-8958-812a-9e16-d676ccd44d24` | `false` | `true` |
| Privacy Policy | `privacy` | `31d6b8b6-8958-819f-bec5-e1060bf2dc14` | `false` | `true` |

**Note:** `sample-fixed-page` was intentionally left as `Public=false` because its body is empty. Publishing an empty page provides no value; it should be populated with demo content before being made public.

---

### N-19: Fix "Astro 5" typo to "Astro 6" in about page

The about page (`31d6b8b6-8958-812a-9e16-d676ccd44d24`) contained two occurrences of "Astro 5" that were incorrect — the project uses Astro 6.

**Blocks updated via `PATCH /v1/blocks/{id}`:**

| Block ID | Block Type | Change |
|----------|-----------|--------|
| `8feb8a11-bf67-4564-90fa-24fd5e5ef822` | `paragraph` | `Astro 5` → `Astro 6` in body text |
| `9f45017f-bff9-4af6-bf4b-ec8b249fc736` | `table_row` | `Astro 5` → `Astro 6` in tech stack table |

**API endpoint used:** `https://api.notion.com/v1` with `Notion-Version: 2025-09-03`

**Verified:** Retrieved the page markdown after update and confirmed both occurrences now read "Astro 6".

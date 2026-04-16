# content/

Source markdown pages for Notion-managed sites.  
Each sub-directory corresponds to one Notion database / one template.

```
content/
├── docs/               ← templates/docs (Starlight docs site)
│   ├── 01-callout.md
│   └── ...
├── blog/               ← templates/blog (blog template)
│   ├── hello-notro.md
│   └── ...
└── gallery/            ← any future template (future)
```

---

## Reflecting pages to Notion

`notro-md-sync publish` reads `.md` files from a sub-directory and creates
(or replaces) Notion pages in the specified database.

Each script uses a **template-specific environment variable** for the data source ID:

| Script | Env var | Template |
|---|---|---|
| `pnpm run reflect` | `NOTION_DATASOURCE_ID_DOCS` | `templates/docs` |
| `pnpm run reflect:blog` | `NOTION_DATASOURCE_ID_BLOG` | `templates/blog` |

Both scripts also require `NOTION_TOKEN`.

### Commands

```bash
# Reflect all files in content/docs/ to Notion
NOTION_TOKEN=... NOTION_DATASOURCE_ID_DOCS=... pnpm run reflect

# Reflect all files in content/blog/ to Notion
NOTION_TOKEN=... NOTION_DATASOURCE_ID_BLOG=... pnpm run reflect:blog

# Dry run — preview what would happen (no API calls)
NOTION_TOKEN=... NOTION_DATASOURCE_ID_BLOG=... pnpm run reflect:blog -- --dry-run

# Reflect a single file (prefix match on filename)
NOTION_TOKEN=... NOTION_DATASOURCE_ID_BLOG=... pnpm run reflect:blog -- --filter hello-notro

# Re-create pages that already exist (archive old → create new)
NOTION_TOKEN=... NOTION_DATASOURCE_ID_BLOG=... pnpm run reflect:blog -- --force
```

Or set the env vars in your shell first:

```bash
export NOTION_TOKEN=secret_xxxx
export NOTION_DATASOURCE_ID_DOCS=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
export NOTION_DATASOURCE_ID_BLOG=yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy

pnpm run reflect
pnpm run reflect -- --dry-run
pnpm run reflect -- --filter 01-callout --force

pnpm run reflect:blog
pnpm run reflect:blog -- --dry-run
pnpm run reflect:blog -- --filter hello-notro --force
```

### Options

| Option | Description |
|---|---|
| `--dry-run` | Print what would happen without making any API calls |
| `--force` | Archive the existing Notion page and create a fresh one |
| `--filter <prefix>` | Process only the file whose name starts with `<prefix>` |
| `--help` | Show help |

### Notion page properties

Each reflected page is created with these properties:

| Property | Value |
|---|---|
| `Name` | Title from frontmatter, or title-cased filename |
| `Slug` | `slug` from frontmatter, or filename without extension |
| `Public` | `false` (not published) |
| `Tags` | `["md-sync"]` |
| `Date` | Today's date |

> The target Notion database must have these properties defined.
> See `templates/docs/src/content.config.ts` and `templates/blog/src/content.config.ts`
> for the schemas used by each template to fetch pages back from Notion.

---

## Adding a new content directory

1. Create a sub-directory under `content/` (e.g. `content/gallery/`)
2. Add `.md` files — frontmatter `slug` and `title` are optional (defaults: filename)
3. Create a Notion database with the required properties (`Name`, `Slug`, `Public`, `Tags`, `Date`)
4. Add a script to `package.json`: `"reflect:gallery": "notro-md-sync publish content/gallery --db $NOTION_DATASOURCE_ID_GALLERY"`
5. Update the template's `content.config.ts` to read `import.meta.env.NOTION_DATASOURCE_ID_GALLERY`
6. Run `NOTION_TOKEN=... NOTION_DATASOURCE_ID_GALLERY=... pnpm run reflect:gallery`

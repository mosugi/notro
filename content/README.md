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
└── portfolio/          ← any future template (future)
```

---

## Reflecting pages to Notion

`reflect-to-notion.ts` reads `.md` files from a sub-directory and creates
(or replaces) Notion pages in the database set by `NOTION_DATASOURCE_ID`.

### Setup

Create a `.env` file in the target template directory (e.g. `templates/docs/.env`):

```
NOTION_TOKEN=secret_xxxx
NOTION_DATASOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Commands

```bash
# Dry run — preview what would happen (no API calls)
NOTION_TOKEN=... NOTION_DATASOURCE_ID=... pnpm run reflect -- --dry-run

# Reflect all files in content/docs/ to Notion
NOTION_TOKEN=... NOTION_DATASOURCE_ID=... pnpm run reflect

# Reflect all files in content/blog/ to Notion
NOTION_TOKEN=... NOTION_DATASOURCE_ID=... pnpm run reflect:blog

# Reflect a single file (prefix match on filename)
pnpm run reflect -- --filter 01-callout

# Re-create pages that already exist (archive old → create new)
pnpm run reflect -- --force
```

Or set the env vars in your shell first:

```bash
export NOTION_TOKEN=secret_xxxx
export NOTION_DATASOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

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
| `--fixture <name>` | Process only the file whose name starts with `<name>` |
| `--help` | Show help |

### Notion page properties

Each reflected page is created with these properties:

| Property | Value |
|---|---|
| `Name` | `[Fixture] <title derived from filename>` |
| `Slug` | `notro-fixture-<filename-without-ext>` |
| `Public` | `false` (not published) |
| `Tags` | `["md-sync"]` |
| `Date` | Today's date |

> The target Notion database must have these properties defined.
> See `templates/docs/src/content.config.ts` and `templates/blog/src/content.config.ts`
> for the schemas used by each template to fetch pages back from Notion.

---

## Available scripts

| Script | Source directory | Target template |
|---|---|---|
| `pnpm run reflect` | `content/docs/` | `templates/docs` |
| `pnpm run reflect:blog` | `content/blog/` | `templates/blog` |

Each script uses `NOTION_TOKEN` and `NOTION_DATASOURCE_ID` from the environment.
Make sure `NOTION_DATASOURCE_ID` points to the correct database for each template.

---

## Adding a new content directory

1. Create a sub-directory under `content/` (e.g. `content/portfolio/`)
2. Add `.md` files — frontmatter `slug` and `title` are optional (defaults: filename)
3. Create a Notion database with the required properties (`Name`, `Slug`, `Public`, `Tags`, `Date`)
4. Add a script to `package.json`: `"reflect:portfolio": "notro-md-sync publish content/portfolio"`
5. Run `NOTION_TOKEN=... NOTION_DATASOURCE_ID=... pnpm run reflect:portfolio`

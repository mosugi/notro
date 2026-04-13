# content/

Source markdown pages for Notion-managed sites.  
Each sub-directory corresponds to one Notion database / one template.

```
content/
├── docs/               ← templates/docs (Starlight docs site)
│   ├── 01-callout.md
│   └── ...
├── blog/               ← templates/blog  (future)
├── portfolio/          ← any future template (future)
└── reflect-to-notion.ts
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

# Reflect a single file (prefix match on filename)
pnpm run reflect -- --fixture 01-callout

# Re-create pages that already exist (archive old → create new)
pnpm run reflect -- --force
```

Or set the env vars in your shell first:

```bash
export NOTION_TOKEN=secret_xxxx
export NOTION_DATASOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

pnpm run reflect
pnpm run reflect -- --dry-run
pnpm run reflect -- --fixture 01-callout --force
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
| `Tags` | `["fixture"]` |
| `Date` | Today's date |

> The target Notion database must have these properties defined.
> See `templates/docs/src/content.config.ts` for the schema used by
> the Starlight site to fetch pages back from Notion.

---

## Adding a new content directory

1. Create a sub-directory under `content/` (e.g. `content/blog/`)
2. Add `.md` files — first `# Heading` becomes the page title
3. Create a Notion database with the required properties
4. Run `pnpm run reflect` with the appropriate env vars

> `reflect-to-notion.ts` currently reads from `content/docs/`.
> To target a different sub-directory, update the `fixtureDir` variable
> in `reflect-to-notion.ts` (line ~188) or add a `--dir` option.

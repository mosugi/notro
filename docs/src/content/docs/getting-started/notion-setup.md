---
title: Notion Setup
description: Create a Notion integration and connect your database.
---

## 1. Create an Internal Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"New integration"**
3. Set a name (e.g. "My notro Site") and select your workspace
4. Copy the **Internal Integration Token** — this is your `NOTION_TOKEN`

## 2. Create a Database

Create a new Notion database (full page, not inline) with these properties:

| Property | Type | Required |
|---|---|---|
| `Name` | Title | ✓ |
| `Slug` | Rich text | ✓ |
| `Public` | Checkbox | ✓ |
| `Date` | Date | ✓ |
| `Description` | Rich text | — |
| `Tags` | Multi-select | — |
| `Category` | Select | — |

## 3. Connect the Integration to Your Database

1. Open your database in Notion
2. Click **⋯ (More)** → **"Add connections"**
3. Search for your integration name and connect it

## 4. Get the Database ID

Copy your database URL. The ID is the UUID in the URL:

```
https://www.notion.so/workspace/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx?v=...
                                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                This is your NOTION_DATASOURCE_ID
```

## 5. Mark pages as Public

Only pages with `Public = ✓` will be included in the build. Set this on each page you want to publish.

## Special tags

| Tag | Behavior |
|---|---|
| `page` | Treated as a fixed page (excluded from blog listing) |
| `pinned` | Shown at the top of the blog list on page 1 |

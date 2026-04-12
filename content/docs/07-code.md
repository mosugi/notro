---
slug: notro-fixture-code
title: "[Fixture] Code"
---

# Code Blocks

## TypeScript

```typescript
interface NotionPage {
  id: string;
  properties: Record<string, unknown>;
  markdown: string;
  truncated: boolean;
}

async function fetchPage(pageId: string): Promise<NotionPage> {
  const response = await fetch(`/api/pages/${pageId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.statusText}`);
  }
  return response.json();
}
```

## JavaScript

```javascript
const preprocessNotionMarkdown = (markdown) => {
  // Fix 1: Ensure --- dividers have a blank line before them
  let result = markdown.replace(/([^\n])\n(---+)(\n|$)/g, "$1\n\n$2$3");

  // Fix 7: Ensure <empty-block/> is treated as a standalone element
  result = result.replace(/([^\n])\n(<empty-block\/>)/g, "$1\n\n$2");
  result = result.replace(/(<empty-block\/>)\n([^\n])/g, "$1\n\n$2");

  return result;
};
```

## Python

```python
import json
import sys

def extract_page_titles(response_json: str) -> list[str]:
    """Extract page titles from a Notion API response."""
    data = json.loads(response_json)
    titles = []
    for page in data.get("results", []):
        name_prop = page.get("properties", {}).get("Name", {})
        title_parts = name_prop.get("title", [])
        if title_parts:
            titles.append(title_parts[0]["plain_text"])
    return titles

if __name__ == "__main__":
    raw = sys.stdin.read()
    for title in extract_page_titles(raw):
        print(title)
```

## Bash / Shell

```bash
# Build and preview the blog template
pnpm run build
pnpm --filter notro-blog run preview

# Fetch page list from Notion API
curl -s "https://api.notion.com/v1/databases/$NOTION_DATASOURCE_ID/query" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2026-03-11" \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -m json.tool
```

## JSON

```json
{
  "name": "remark-notro",
  "version": "0.0.3",
  "type": "module",
  "scripts": {
    "build": "tsdown",
    "test": "vitest run"
  },
  "dependencies": {
    "micromark-extension-directive": "^4.0.0"
  }
}
```

## CSS

```css
.notro-callout {
  border-left: 4px solid var(--callout-color, #e5e7eb);
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.notro-callout[data-color="blue"] {
  --callout-color: #3b82f6;
  background-color: #eff6ff;
}
```

## Inline code

Use `pnpm install` to install dependencies, then `pnpm run dev` to start the development server at `http://localhost:4321`.

The `preprocessNotionMarkdown()` function in `packages/remark-nfm/src/transformer.ts` handles all preprocessing.

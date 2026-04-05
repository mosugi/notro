---
title: NotroContent
description: API reference for the NotroContent Astro component.
---

## Import

```ts
import { NotroContent } from "notro";
```

Renders preprocessed Notion Markdown as an Astro component tree.

## Props

```ts
interface Props {
  markdown: string;
  linkToPages?: Record<string, { url: string; title: string }>;
  classMap?: Partial<Record<ClassMapKeys, string>>;
  components?: Partial<NotionComponents>;
}
```

### markdown

**Required.** The preprocessed Markdown string from `entry.data.markdown`.

### linkToPages

A map of Notion page IDs to URL + title pairs. Used to resolve internal `notion.so` links in the content.

```astro
<NotroContent
  markdown={markdown}
  linkToPages={{
    "page-id-1": { url: "/blog/post-1/", title: "Post 1" },
  }}
/>
```

### classMap

Inject Tailwind classes into default components without replacing them:

```astro
<NotroContent
  markdown={markdown}
  classMap={{
    callout: "border-l-4 border-blue-500",
    toggle: "rounded-lg bg-gray-50",
  }}
/>
```

### components

Full component replacement:

```astro
<NotroContent
  markdown={markdown}
  components={{ callout: MyCustomCallout }}
/>
```

## Example

```astro
---
import { NotroContent } from "notro";
const { entry } = Astro.props;
---

<div class="nt-markdown-content">
  <NotroContent markdown={entry.data.markdown} />
</div>
```

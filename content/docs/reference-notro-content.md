---
slug: reference/notro-content
title: NotroContent
---

# NotroContent

`NotroContent` is an Astro component that compiles and renders preprocessed Notion markdown. It handles MDX compilation, component mapping, and optional internal link resolution.

## Import

```ts
import { NotroContent } from "notro-loader";
```

## Usage

```astro
---
import { NotroContent } from "notro-loader";
const { entry } = Astro.props;
---
<div class="notro-markdown">
  <NotroContent markdown={entry.data.markdown} />
</div>
```

## Props

```ts
interface Props {
  markdown: string;
  linkToPages?: Record<string, { url: string; title: string }>;
  classMap?: Partial<Record<ClassMapKeys, string>>;
  components?: Partial<NotionComponents>;
}
```

### markdown (required)

The preprocessed markdown string from the Content Collection entry. This is the value stored under `entry.data.markdown` by the loader.

```astro
<NotroContent markdown={entry.data.markdown} />
```

### linkToPages

A map from Notion page UUID to `{ url, title }` for resolving internal Notion page links. When a Notion page contains a link to another Notion page, `NotroContent` replaces the `notion.so` URL with the corresponding site-relative URL.

```astro
---
import { getCollection } from "astro:content";
import { buildLinkToPages } from "notro-loader/utils";

const allPosts = await getCollection("posts");
const linkToPages = buildLinkToPages(allPosts);
---
<NotroContent
  markdown={entry.data.markdown}
  linkToPages={linkToPages}
/>
```

`buildLinkToPages` builds the map by iterating over all entries and mapping each `entry.id` to `{ url: "/blog/" + entry.data.slug, title: entry.data.title }`.

### classMap

A partial map of component slots to additional Tailwind class strings. Use this to customize styling without replacing entire components.

```astro
<NotroContent
  markdown={entry.data.markdown}
  classMap={{
    callout: "rounded-xl border-2",
    toggle: "my-6",
    codeBlock: "text-sm font-mono",
    table: "w-full",
  }}
/>
```

Available keys correspond to the notro-ui component slots. Run `notro-ui list --installed` to see installed components and their class map keys.

### components

A partial map of Notion block types to custom Astro components. Merged with the notro defaults — only the keys you provide are overridden.

```astro
---
import MyCallout from "./MyCallout.astro";
import MyToggle from "./MyToggle.astro";
---
<NotroContent
  markdown={entry.data.markdown}
  components={{
    callout: MyCallout,
    toggle: MyToggle,
  }}
/>
```

#### Component map keys

| Key | HTML element | Notion block |
|---|---|---|
| `callout` | `<callout>` | Callout |
| `toggle` | `<details>` | Toggle |
| `columns` | `<columns>` | Column layout wrapper |
| `column` | `<column>` | Individual column |
| `video` | `<video>` | Video embed |
| `table_of_contents` | `<table_of_contents>` | Table of contents |
| `empty_block` | `<empty-block>` | Empty block |
| `pre` | `<pre>` | Code block |
| `img` | `<img>` | Image |
| `a` | `<a>` | Link |
| `h1`–`h4` | `<h1>`–`<h4>` | Headings |
| `p` | `<p>` | Paragraph |
| `blockquote` | `<blockquote>` | Blockquote |
| `table` | `<table>` | Table |

## MDX compilation caching

`NotroContent` uses `compileMdxCached()` internally, which caches the compiled MDX module keyed by a hash of the markdown string. Re-renders of the same page within a single build reuse the cached module without re-invoking the MDX compiler.

## CSS wrapper

The `notro-markdown` CSS class is applied to the element wrapping `NotroContent`'s output (by the parent in the template, not by `NotroContent` itself). This class in `notro-theme.css` scopes styles for:

- `<pre>` / `<code>` blocks
- Task list checkboxes
- Tables
- Blockquotes

```astro
<!-- Apply the wrapper class in your layout -->
<div class="notro-markdown">
  <NotroContent markdown={entry.data.markdown} />
</div>
```

## Type reference

```ts
import type { NotionComponents, ClassMapKeys } from "notro-loader";

interface NotroContentProps {
  markdown: string;
  linkToPages?: Record<string, { url: string; title: string }>;
  classMap?: Partial<Record<ClassMapKeys, string>>;
  components?: Partial<NotionComponents>;
}
```

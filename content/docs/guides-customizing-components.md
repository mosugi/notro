---
slug: guides/customizing-components
title: Customizing Components
---

# Customizing Components

notro renders Notion blocks through Astro components. This page explains three ways to customize how blocks look and behave.

## notro-ui: copy-and-own components

Notion block components are managed via the `notro-ui` CLI. Components live in `packages/notro-ui/src/templates/` as the source of truth, and you copy them into your project where they become your own code.

### Install the CLI

```bash
npm i -g notro-ui
# or use pnpm dlx:
pnpm dlx notro-ui --help
```

### Add components to your project

Run this from your project root (where `notro.json` will be placed):

```bash
# Initialize (creates notro.json, places notro-theme.css)
notro-ui init

# Add all components (skips existing files)
notro-ui add --all

# Add specific components
notro-ui add callout toggle columns
```

### Update components from upstream

```bash
# Pull updates (overwrites local changes — use with care)
notro-ui update --all --yes

# Preview what would change (without --yes, shows confirmation prompt)
notro-ui update --all
```

### Available commands

| Command | Behavior |
|---|---|
| `notro-ui init` | Creates `notro.json`, places `notro-theme.css` |
| `notro-ui add [name...] [--all]` | Adds components (**skips existing files**) |
| `notro-ui update [name...] [--all] [--yes]` | Updates components (**overwrites**) |
| `notro-ui remove [name...] [--all]` | Removes components |
| `notro-ui list [--installed]` | Lists available / installed components |

### notro.json

`notro-ui init` creates a `notro.json` at your project root:

```json
{
  "outDir": "src/components/notion",
  "stylesDir": "src/styles",
  "components": ["callout", "toggle", "columns", "code-block"]
}
```

Commit `notro.json` to track which components are installed.

---

## CSS class overrides with classMap

The easiest way to customize component styling without replacing components is the `classMap` prop on `NotroContent`. Pass a partial map of `ClassMapKeys → string` to inject additional Tailwind classes into specific elements:

```astro
---
import { NotroContent } from "notro-loader";
const { entry } = Astro.props;
---
<NotroContent
  markdown={entry.data.markdown}
  classMap={{
    callout: "rounded-xl border-2",
    toggle: "my-4",
    codeBlock: "text-sm",
  }}
/>
```

Class map keys correspond to component slots. Use `notro-ui list` to see what keys are available.

---

## Full component overrides with components

For complete control, pass custom Astro components via the `components` prop:

```astro
---
import { NotroContent } from "notro-loader";
import MyCallout from "./MyCallout.astro";
import MyCodeBlock from "./MyCodeBlock.astro";
const { entry } = Astro.props;
---
<NotroContent
  markdown={entry.data.markdown}
  components={{
    callout: MyCallout,
    pre: MyCodeBlock,
  }}
/>
```

Only the keys you provide are overridden — all other components use the notro defaults.

### Writing a custom component

Component props mirror the HTML attributes that Notion generates. For example, a custom callout receives `icon`, `color`, and slot content:

```astro
---
// MyCallout.astro
interface Props {
  icon?: string;
  color?: string;
}
const { icon, color } = Astro.props;
---
<aside class:list={["my-callout", color && `my-callout--${color}`]}>
  {icon && <span class="my-callout__icon">{icon}</span>}
  <div class="my-callout__body">
    <slot />
  </div>
</aside>
```

### Component map reference

| Key | Element | Notion block |
|---|---|---|
| `callout` | `<callout>` | Callout block |
| `toggle` | `<details>` | Toggle block |
| `columns` | `<columns>` | Column layout wrapper |
| `column` | `<column>` | Individual column |
| `video` | `<video>` | Video embed |
| `table_of_contents` | `<table_of_contents>` | Table of contents |
| `empty_block` | `<empty-block>` | Empty spacing block |
| `pre` | `<pre>` | Code block |
| `img` | `<img>` | Image |
| `a` | `<a>` | Link |
| `h1`–`h4` | `<h1>`–`<h4>` | Headings |

---

## Styling with notro-theme.css

`notro-theme.css` defines CSS variables and utility classes for Notion block colors, toggle styles, table styles, and more. It is placed in `src/styles/` by `notro-ui init`.

Import it in your global stylesheet:

```css
/* global.css */
@import "tailwindcss";
@import "./notro-theme.css";
```

### Color tokens

```css
/* Text colors */
.notro-text-gray    .notro-text-brown   .notro-text-orange
.notro-text-yellow  .notro-text-green   .notro-text-blue
.notro-text-purple  .notro-text-pink    .notro-text-red

/* Background colors */
.notro-bg-gray      .notro-bg-brown     .notro-bg-orange
.notro-bg-yellow    .notro-bg-green     .notro-bg-blue
.notro-bg-purple    .notro-bg-pink      .notro-bg-red
```

These are applied automatically by the `rehypeNotionColor` plugin when Notion pages contain color-annotated blocks.

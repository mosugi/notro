# notro-ui

Styled Notion block components for [notro](../notro/), installable via CLI.

> **This is NOT a component library.**
>
> notro-ui is a collection of copy-and-own Astro components. You run a CLI command, the source files are copied into your project, and they become **your code**. Edit them directly. No prop drilling. No theme configuration. No version lock-in.
>
> This is the same philosophy as [shadcn/ui](https://ui.shadcn.com/) and [StarwindUI](https://starwindui.com/).

---

## How it works

```
packages/notro-ui/src/templates/   ← canonical source (well-tested starting point)
         ↓  npx notro-ui init
apps/your-project/src/components/notro/   ← your code, fully owned by you
```

1. `npx notro-ui init` copies all component files to `src/components/notro/`
2. Files are yours — edit classes, add variants, restructure markup freely
3. Re-run `npx notro-ui add <name>` to reset a single component to the template default

---

## Installation

```sh
# Copy all components into your project
npx notro-ui init

# Or copy a single component
npx notro-ui add callout
```

Files are written to `src/components/notro/` by default. Use `--out-dir` to change the destination:

```sh
npx notro-ui init --out-dir src/components/blocks
```

---

## Prerequisites

Your project needs:

```sh
npm install notro tailwind-variants
```

And `notro-theme.css` imported in your global CSS (`src/styles/global.css`):

```css
@import "./notro-theme.css";
```

(`npx notro-ui init` copies `notro-theme.css` to `src/styles/notro-theme.css` automatically.)

---

## Using the installed components

After `init`, wire up the local `NotroContents` in your page:

```astro
---
// src/pages/blog/[slug].astro
import { buildLinkToPages, getPlainText } from "notro";
import NotroContents from "../../components/notro/NotroContents.astro";

const { entry } = Astro.props;
---

<NotroContents
  markdown={entry.data.markdown}
  linkToPages={linkToPages}
/>
```

The local `NotroContents.astro` (in `src/components/notro/`) imports all your installed components and maps them to Notion block types. This file is yours — add, remove, or swap components by editing it directly.

---

## Customizing components

Every component exports its style definition using [`tailwind-variants`](https://www.tailwind-variants.org/):

```astro
<!-- src/components/notro/Callout.astro -->
export const callout = tv({
  base: 'flex items-start gap-3 my-4 rounded-lg border ...',
  variants: {
    color: {
      default: 'notro-bg-gray',
      blue_background: 'notro-bg-blue',
      // ...
    },
  },
});
```

To customize, just edit the file:

```astro
<!-- Change border radius, padding, font -->
export const callout = tv({
  base: 'flex items-start gap-2 my-6 rounded-none border-l-4 pl-6 ...',
  ...
});
```

Color tokens (`notro-bg-gray`, `notro-text-blue`, etc.) are CSS variables defined in `notro-theme.css`. Edit that file to change colors globally.

---

## Available components

| Component | Notion block |
|---|---|
| `Callout` | Callout block |
| `Toggle` + `ToggleTitle` | Toggle block |
| `H1` – `H4` | Heading 1–4 |
| `Quote` | Quote block |
| `TableBlock` | Table |
| `TableOfContents` | Table of contents |
| `Columns` + `Column` | Column layout |
| `ImageBlock` | Image |
| `Audio` | Audio embed |
| `Video` | Video embed |
| `FileBlock` | File attachment |
| `PdfBlock` | PDF embed |
| `PageRef` | Page link |
| `DatabaseRef` | Database link |
| `StyledSpan` | Colored / underlined inline text |
| `Mention` | @mention |
| `MentionDate` | Date mention |
| `SyncedBlock` | Synced block |
| `EmptyBlock` | Empty line spacer |
| `TableRow` / `TableCell` / `TableCol` / `TableColgroup` | Table internals |
| `NotroContents.astro` | Entry point — maps all components; edit `makeHtmlElement(...)` calls to style `<p>`, `<ul>`, `<a>`, etc. |
| `colors.ts` | Color variant map for `tv()` |
| `notro-theme.css` | CSS variables + complex selectors |

```sh
# See the full list
npx notro-ui list
```

---

## How it relates to `notro`

| Package | Role |
|---|---|
| [`notro`](../notro/) | Headless — Content Loader, MDX pipeline, unstyled components |
| `notro-ui` | Style layer — copy-and-own styled components that sit on top of `notro` |

`notro` provides `compileMdxCached` (the MDX compiler) and the headless component set. `notro-ui`'s `NotroContents.astro` uses `compileMdxCached` directly and wires in your local styled components.

---

## Reference implementation

[`apps/notro-tail`](../../apps/notro-tail/) is the reference implementation. It shows what a project looks like after running `npx notro-ui init`:

- `src/components/notro/` — installed components
- `src/styles/notro-theme.css` — installed theme
- `src/pages/blog/[slug].astro` — using `NotroContents`

---
title: Customizing Components
description: Override Notion block components and inject CSS classes.
---

## classMap — CSS class injection

The simplest way to customize styling. Pass a `classMap` prop to `NotroContent` to inject Tailwind classes into default components without replacing them:

```astro
<NotroContent
  markdown={markdown}
  classMap={{
    callout: "border-l-4 border-blue-500",
    toggle: "bg-gray-50 rounded-lg",
  }}
/>
```

## components — Full component override

Replace individual Notion block components entirely:

```astro
---
import { NotroContent } from "notro";
import MyCallout from "../components/MyCallout.astro";
---

<NotroContent
  markdown={markdown}
  components={{ callout: MyCallout }}
/>
```

Your custom component receives the same props as the default component.

## Per-page themes (bodyClass)

Pass a `bodyClass` to `<Layout>` to apply per-page scoped styles defined in `global.css`:

```astro
<Layout title="About" bodyClass="page-about">
  ...
</Layout>
```

Add corresponding CSS under the body class selector in `src/styles/global.css`:

```css
.page-about main h2 {
  border-left: 4px solid theme(--color-blue-500);
  padding-left: 0.75rem;
}
```

---
title: notro() Integration
description: API reference for the notro() Astro integration.
---

## Import

```js
import { notro } from "notro/integration";
```

Used in `astro.config.mjs`. Registers `@astrojs/mdx` with the notro plugin pipeline.

## Options

```ts
notro({
  shikiConfig?: ShikiConfig;        // Shiki code highlighting config
  remarkPlugins?: PluggableList;    // Additional remark plugins
  rehypePlugins?: PluggableList;    // Additional rehype plugins
})
```

### shikiConfig

Passed directly to Shiki. Default theme is `github-dark`.

```js
notro({ shikiConfig: { theme: "github-light" } })
```

### remarkPlugins

Additional remark plugins to inject into the MDX pipeline. These run after `remarkNfm` and `remark-gfm`.

```js
import remarkMath from "remark-math";
notro({ remarkPlugins: [remarkMath] })
```

### rehypePlugins

Additional rehype plugins. These run before the Shiki syntax highlighter.

```js
import rehypeKatex from "rehype-katex";
notro({ rehypePlugins: [rehypeKatex] })
```

## Why it's required

`notro()` injects `@astrojs/mdx`, which registers the `astro:jsx` renderer that `@mdx-js/mdx`'s `evaluate()` depends on. Without it, `NotroContent` fails at runtime.

# notro-ui

**TailwindCSS 4 plugin + Astro component library for Notion block styles.**

`notro-ui` provides:

- `@plugin "notro-ui"` — TailwindCSS 4 plugin that defines `nt-*` utility classes and CSS variables
- Copy-paste Astro components via the `notro` CLI (`npx notro add <component>`)

---

## セットアップ

### 1. インストール

```bash
npm install notro-ui
```

### 2. global.css に追加

```css
/* src/styles/global.css */
@import "tailwindcss";
@plugin "notro-ui";
```

### 3. （オプション）カラーをカスタマイズ

```css
/* @plugin の後に :root を上書きする */
@plugin "notro-ui";

:root {
  --nt-color-blue: #4a9eff;
  --nt-text-rgb: 30 30 30;
}
```

---

## コンポーネントの追加

`notro` CLIでコンポーネントをプロジェクトにコピーします。

```bash
# 利用可能なコンポーネント一覧
npx notro list

# コンポーネントを追加（src/components/notion/<name>/ に生成）
npx notro add callout
npx notro add toggle image table

# 最新版に更新
npx notro update callout

# 削除
npx notro remove callout
```

追加すると `src/components/notion/callout/` が生成されます：

```
src/components/notion/callout/
├── Callout.astro   ← コピーされたソース（自由に編集可）
└── index.ts        ← named export
```

### 使い方（NotionMarkdownRenderer に渡す）

```astro
---
import { NotionMarkdownRenderer } from "notro";
import { Callout } from "@/components/notion/callout";

const { entry } = Astro.props;
---

<NotionMarkdownRenderer
  markdown={entry.data.markdown}
  components={{ callout: Callout }}
/>
```

複数コンポーネントをまとめて渡す場合：

```astro
---
import { Callout }    from "@/components/notion/callout";
import { Toggle, ToggleTitle } from "@/components/notion/toggle";
import { H1, H2, H3, H4 }    from "@/components/notion/headings";
---

<NotionMarkdownRenderer
  markdown={entry.data.markdown}
  components={{
    callout: Callout,
    details: Toggle,
    summary: ToggleTitle,
    h1: H1, h2: H2, h3: H3, h4: H4,
  }}
/>
```

---

## CSS カスタムプロパティ（カラーパレット）

`@plugin "notro-ui"` が以下の CSS 変数を `:root` に注入します。

| 変数 | デフォルト（ライト） | 用途 |
|---|---|---|
| `--nt-text-rgb` | `55 53 47` | 基本テキスト色（RGB チャンネル） |
| `--nt-color-blue` | `#337EA9` | テキスト青 |
| `--nt-color-blue-bg` | `#E7F3F8` | 背景青 |
| … 他 8 色 | | gray / brown / orange / yellow / green / purple / pink / red |

ダークモードは `@media (prefers-color-scheme: dark)` で自動切替します。

---

## nt-* ユーティリティクラス一覧

### テキスト色

```html
<span class="nt-color-blue">青テキスト</span>
<span class="nt-color-red">赤テキスト</span>
```

`nt-color-{gray|brown|orange|yellow|green|blue|purple|pink|red}`

### 背景色

```html
<div class="nt-color-blue_background">青背景</div>
```

`nt-color-{color}_background`

### テキスト透過スケール（ダークモード自動対応）

```html
<p class="nt-text">デフォルト</p>
<p class="nt-text-65">65% 透過</p>
<p class="nt-text-45">45% 透過</p>
```

`nt-text` / `nt-text-{80|75|70|65|60|55|50|45|40|35|30}`

### 背景・ボーダー透過スケール

```html
<div class="nt-bg-04 nt-border border rounded">...</div>
```

`nt-bg-{02|03|04|05|06|07|09|10|12|15|18}`
`nt-border` / `nt-border-{06|07|12|15|18|30}`

### TOC インデント

`nt-toc-level-{1|2|3|4}`

---

## コンポーネントの編集例

`npx notro add callout` で追加した `Callout.astro` は自由に編集できます：

```astro
---
// src/components/notion/callout/Callout.astro
import { colorToClass } from 'notro/utils';

interface Props {
  icon?: string;
  color?: string;
  class?: string;
}

const { icon, color, class: className } = Astro.props;
const colorClass = colorToClass(color) || 'nt-color-gray_background';
---

<!-- nt-* クラスと Tailwind クラスを組み合わせて自由にスタイリング -->
<div
  role="note"
  class:list={[
    colorClass,
    'flex gap-3 rounded-lg border px-4 py-3',
    'border-black/[0.06] dark:border-white/[0.08]',
    className,
  ]}
>
  {icon && (
    <span data-callout-icon aria-hidden="true" class="mt-0.5 shrink-0 text-xl leading-none">
      {icon}
    </span>
  )}
  <div data-callout-body class="min-w-0 flex-1 text-sm leading-relaxed">
    <slot />
  </div>
</div>
```

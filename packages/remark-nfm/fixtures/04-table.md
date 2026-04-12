# Table Blocks

## Standard GFM table

| Header 1 | Header 2  | Header 3   |
|----------|-----------|------------|
| Cell 1   | Cell 2    | Cell 3     |
| Cell 4   | Cell 5    | Cell 6     |
| Cell 7   | Cell 8    | Cell 9     |

## Table with alignment

| Left-aligned | Center-aligned | Right-aligned |
|:-------------|:--------------:|--------------:|
| left         | center         | right         |
| text         | text           | text          |

## Notion raw HTML table (with links in cells)

Notion exports tables with complex content as raw HTML. Links inside `<td>` cells use markdown syntax that must be converted to `<a>` tags.

<table>
<thead>
<tr>
<th>Package</th>
<th>Version</th>
<th>Documentation</th>
</tr>
</thead>
<tbody>
<tr>
<td>remark-nfm</td>
<td>0.0.3</td>
<td>[README](https://github.com/mosugi/notro/blob/main/packages/remark-nfm/README.md)</td>
</tr>
<tr>
<td>notro-loader</td>
<td>0.0.1</td>
<td>[README](https://github.com/mosugi/notro/blob/main/packages/notro-loader/README.md)</td>
</tr>
<tr>
<td>notro-ui</td>
<td>0.0.1</td>
<td>[README](https://github.com/mosugi/notro/blob/main/packages/notro-ui/README.md)</td>
</tr>
</tbody>
</table>

## Table with multiple links per cell

<table>
<thead>
<tr>
<th>Topic</th>
<th>Resources</th>
</tr>
</thead>
<tbody>
<tr>
<td>Astro</td>
<td>[Official Docs](https://docs.astro.build) and [GitHub](https://github.com/withastro/astro)</td>
</tr>
<tr>
<td>Notion API</td>
<td>[API Reference](https://developers.notion.com/reference) and [Changelog](https://developers.notion.com/changelog)</td>
</tr>
</tbody>
</table>

## Table with inline code and formatting

| Feature      | Status | Notes                          |
|--------------|--------|--------------------------------|
| `callout`    | ✅     | Supports nested callouts       |
| `toggle`     | ✅     | Tab-indented content dedented  |
| `columns`    | ✅     | Multi-column layouts           |
| `table`      | ✅     | Raw HTML + GFM tables          |
| `math`       | ✅     | Inline `$...$` and block `$$`  |

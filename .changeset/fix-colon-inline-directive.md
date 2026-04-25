---
"remark-notro": patch
---

Fix: colon in time formats (10:00, 18:30) no longer produces spurious `<div></div>` elements

`micromark-extension-directive` treats `:` (char code 58) as the trigger for
inline text directives, so time formats like `10:00` were parsed as an inline
directive named `00` (or `30` etc.), emitting an empty `<div>` element after the
digit before the colon.

The fix restricts the directive micromark extension to flow-level constructs
(container `:::callout` and leaf `::callout`) only, by removing the `text`
property from the extension object before registering it. Notion content never
uses inline text directives (`:name[...]`), so this change is safe and has no
functional impact on Notion rendering.

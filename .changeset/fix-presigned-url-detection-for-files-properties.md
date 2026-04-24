---
"notro-loader": patch
---

fix: detect presigned URLs in `files` type properties (e.g. FeaturedImage)

`hasNotionPresignedUrl` only checked `cover` and `icon` for file-type presigned
URLs. Properties of type `files` (e.g. a FeaturedImage column) also contain
expiring S3 presigned URLs but were not detected, causing stale entries to
remain in the store indefinitely.

Now all `files` type properties are checked, so entries with expired presigned
file URLs are evicted and re-fetched on the next build — consistent with the
existing handling for `cover` and `icon`.

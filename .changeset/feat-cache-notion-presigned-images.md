---
"notro-loader": minor
---

feat: download and cache Notion presigned file URLs at load time

Notion's `file` type URLs (S3 presigned) expire after ~1 hour. The loader
now downloads them at load time and saves them to `publicDir/notro-images/`
with a stable filename (SHA-256 of hostname+pathname). The stored URL is
replaced with a public path (`/notro-images/<hash>.<ext>`) that remains
valid indefinitely.

Fixes build-time 403 errors when `astro:assets` tries to fetch an expired
presigned URL, and broken images caused by URL expiry after the build.

Affected fields:
- `page.cover` (file type)
- `page.icon` (file type)
- `properties.*` of type `files` (e.g. FeaturedImage)
- Inline images in the markdown body

Closes #139

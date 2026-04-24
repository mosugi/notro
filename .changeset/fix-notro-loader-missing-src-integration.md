---
"notro-loader": patch
---

fix: include src/ root files in published package

The `files` field listed only subdirectories (`src/components`, `src/loader`, `src/utils`), so files directly under `src/` (`integration.ts`, `types.ts`, `env.d.ts`) were missing from the published package. Changed to `"src"` to include all files under it.

This caused `notro-loader/integration` to fail resolving `./src/integration.ts` at build time.

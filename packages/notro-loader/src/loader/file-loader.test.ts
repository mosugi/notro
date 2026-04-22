import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileLoader } from "./file-loader.ts";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

interface StoreEntry {
  id: string;
  data: Record<string, unknown>;
  digest?: string;
  body?: string;
  filePath?: string;
}

function createMockContext(rootDir: string) {
  const entries = new Map<string, StoreEntry>();
  const warnings: string[] = [];
  const infos: string[] = [];
  return {
    entries,
    warnings,
    infos,
    context: {
      collection: "posts",
      store: {
        get: (id: string) => entries.get(id),
        set: (entry: StoreEntry) => {
          entries.set(entry.id, entry);
        },
        delete: (id: string) => entries.delete(id),
        has: (id: string) => entries.has(id),
        keys: () => Array.from(entries.keys()),
        entries: () =>
          Array.from(entries.entries()).map(([id, e]) => [id, e] as const),
        clear: () => entries.clear(),
        addAssetImports: () => {},
        addModuleImport: () => {},
      },
      meta: {
        get: () => undefined,
        set: () => {},
        delete: () => {},
        has: () => false,
      },
      logger: {
        info: (msg: string) => infos.push(msg),
        warn: (msg: string) => warnings.push(msg),
        error: (msg: string) => warnings.push(msg),
        debug: () => {},
        label: "test",
        fork: () => ({}) as never,
        options: {} as never,
      },
      parseData: async ({ data }: { data: Record<string, unknown> }) => data,
      generateDigest: (data: string | Record<string, unknown>) =>
        typeof data === "string"
          ? `digest-${data.length}`
          : `digest-${Object.keys(data).length}`,
      renderMarkdown: async () => ({ html: "", metadata: {} }) as never,
      config: {
        root: pathToFileURL(rootDir + "/"),
      } as never,
      entryTypes: new Map(),
      refreshContextData: undefined,
    },
  };
}

let workspace: string;

beforeEach(async () => {
  workspace = await mkdtemp(join(tmpdir(), "notro-file-loader-"));
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

describe("fileLoader", () => {
  it("exposes parsed frontmatter verbatim plus the markdown body", async () => {
    const postsDir = join(workspace, "posts");
    await mkdir(postsDir, { recursive: true });
    await writeFile(
      join(postsDir, "hello.md"),
      `---
title: Hello, world
slug: hello
tags:
  - intro
  - demo
date: 2026-01-15
---

# Hello

Body text.
`,
      "utf-8",
    );

    const loader = fileLoader({ base: "posts" });
    const mock = createMockContext(workspace);
    await loader.load(mock.context as never);

    expect(mock.entries.size).toBe(1);
    const entry = mock.entries.get("hello")!;
    expect(entry.body).toContain("# Hello");

    const data = entry.data as {
      title: string;
      slug: string;
      tags: string[];
      date: string;
      markdown: string;
      createdTime: string;
      lastEditedTime: string;
    };
    expect(data.title).toBe("Hello, world");
    expect(data.slug).toBe("hello");
    expect(data.tags).toEqual(["intro", "demo"]);
    expect(data.date).toBe("2026-01-15");
    expect(data.markdown).toContain("# Hello");
    expect(typeof data.createdTime).toBe("string");
    expect(typeof data.lastEditedTime).toBe("string");
  });

  it("derives id from the filename stem when frontmatter has no slug", async () => {
    const postsDir = join(workspace, "posts");
    await mkdir(postsDir, { recursive: true });
    await writeFile(
      join(postsDir, "my-first-post.md"),
      "Just body text, no frontmatter.",
      "utf-8",
    );

    const loader = fileLoader({ base: "posts" });
    const mock = createMockContext(workspace);
    await loader.load(mock.context as never);

    expect(mock.entries.size).toBe(1);
    const entry = mock.entries.get("my-first-post")!;
    const data = entry.data as { markdown: string };
    expect(data.markdown).toBe("Just body text, no frontmatter.");
  });

  it("uses generateId when provided", async () => {
    const postsDir = join(workspace, "posts");
    await mkdir(postsDir, { recursive: true });
    await writeFile(
      join(postsDir, "a.md"),
      "---\ntitle: A\n---\nbody",
      "utf-8",
    );

    const loader = fileLoader({
      base: "posts",
      generateId: ({ stem }) => `custom-${stem}`,
    });
    const mock = createMockContext(workspace);
    await loader.load(mock.context as never);

    expect(mock.entries.has("custom-a")).toBe(true);
  });

  it("loads nested files recursively", async () => {
    const nested = join(workspace, "content", "blog", "series");
    await mkdir(nested, { recursive: true });
    await writeFile(
      join(workspace, "content", "top.md"),
      "---\nslug: top\ntitle: Top\n---\nbody",
      "utf-8",
    );
    await writeFile(
      join(nested, "deep.md"),
      "---\nslug: deep\ntitle: Deep\n---\nbody",
      "utf-8",
    );

    const loader = fileLoader({ base: "content" });
    const mock = createMockContext(workspace);
    await loader.load(mock.context as never);

    expect(mock.entries.has("top")).toBe(true);
    expect(mock.entries.has("deep")).toBe(true);
  });

  it("removes entries whose backing file has been deleted on reload", async () => {
    const postsDir = join(workspace, "posts");
    await mkdir(postsDir, { recursive: true });
    const filePath = join(postsDir, "a.md");
    await writeFile(filePath, "---\nslug: a\ntitle: A\n---\n", "utf-8");

    const loader = fileLoader({ base: "posts" });
    const mock = createMockContext(workspace);
    await loader.load(mock.context as never);
    expect(mock.entries.has("a")).toBe(true);

    await rm(filePath);
    await loader.load(mock.context as never);
    expect(mock.entries.has("a")).toBe(false);
  });

  it("warns when the base directory does not exist", async () => {
    const loader = fileLoader({ base: "missing-dir" });
    const mock = createMockContext(workspace);
    await loader.load(mock.context as never);
    expect(mock.warnings.some((w) => w.includes("does not exist"))).toBe(true);
    expect(mock.entries.size).toBe(0);
  });

  it("lets frontmatter override the filesystem-derived timestamps", async () => {
    const postsDir = join(workspace, "posts");
    await mkdir(postsDir, { recursive: true });
    await writeFile(
      join(postsDir, "dated.md"),
      `---
slug: dated
createdTime: 2020-01-01T00:00:00.000Z
lastEditedTime: 2021-06-15T12:00:00.000Z
---
body
`,
      "utf-8",
    );

    const loader = fileLoader({ base: "posts" });
    const mock = createMockContext(workspace);
    await loader.load(mock.context as never);

    const data = mock.entries.get("dated")!.data as {
      createdTime: string;
      lastEditedTime: string;
    };
    expect(data.createdTime).toBe("2020-01-01T00:00:00.000Z");
    expect(data.lastEditedTime).toBe("2021-06-15T12:00:00.000Z");
  });
});

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
  it("loads a markdown file and maps frontmatter to Notion-style properties", async () => {
    const postsDir = join(workspace, "posts");
    await mkdir(postsDir, { recursive: true });
    await writeFile(
      join(postsDir, "hello.md"),
      `---
title: Hello, world
slug: hello
description: A friendly greeting
public: true
tags:
  - intro
  - demo
category: Tutorial
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
    expect(entry).toBeDefined();
    expect(entry.body).toContain("# Hello");
    const data = entry.data as {
      markdown: string;
      properties: Record<string, { type: string } & Record<string, unknown>>;
    };
    expect(data.markdown).toContain("# Hello");

    const props = data.properties;
    expect(props.Name.type).toBe("title");
    expect((props.Name as { title: { plain_text: string }[] }).title[0].plain_text).toBe(
      "Hello, world",
    );
    expect(
      (props.Slug as { rich_text: { plain_text: string }[] }).rich_text[0]
        .plain_text,
    ).toBe("hello");
    expect(
      (props.Description as { rich_text: { plain_text: string }[] }).rich_text[0]
        .plain_text,
    ).toBe("A friendly greeting");
    expect((props.Public as { checkbox: boolean }).checkbox).toBe(true);
    expect(
      (props.Tags as { multi_select: { name: string }[] }).multi_select.map(
        (t) => t.name,
      ),
    ).toEqual(["intro", "demo"]);
    expect((props.Category as { select: { name: string } }).select.name).toBe(
      "Tutorial",
    );
    expect((props.Date as { date: { start: string } }).date.start).toBe(
      "2026-01-15",
    );
  });

  it("falls back to filename-derived title and slug when frontmatter is missing", async () => {
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
    expect(entry).toBeDefined();
    const data = entry.data as {
      properties: Record<string, { type: string } & Record<string, unknown>>;
    };
    expect(
      (data.properties.Name as { title: { plain_text: string }[] }).title[0]
        .plain_text,
    ).toBe("My First Post");
    // Slug is not set when frontmatter omits it, but ID falls back to filename stem.
    expect(data.properties.Slug).toBeUndefined();
  });

  it("defaults public to true when frontmatter omits it", async () => {
    const postsDir = join(workspace, "posts");
    await mkdir(postsDir, { recursive: true });
    await writeFile(
      join(postsDir, "draft.md"),
      `---
title: Draft
slug: draft
---
body
`,
      "utf-8",
    );

    const loader = fileLoader({ base: "posts" });
    const mock = createMockContext(workspace);
    await loader.load(mock.context as never);

    const entry = mock.entries.get("draft")!;
    const data = entry.data as {
      properties: { Public: { checkbox: boolean } };
    };
    expect(data.properties.Public.checkbox).toBe(true);
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

  it("applies the transform hook to customize properties", async () => {
    const postsDir = join(workspace, "posts");
    await mkdir(postsDir, { recursive: true });
    await writeFile(
      join(postsDir, "post.md"),
      `---
title: Custom
slug: custom
author: Alice
---
body`,
      "utf-8",
    );

    const loader = fileLoader({
      base: "posts",
      transform: ({ frontmatter, defaultProperties }) => ({
        ...defaultProperties,
        Author: {
          type: "rich_text",
          id: "Author",
          rich_text: [
            {
              type: "text",
              text: { content: String(frontmatter.author), link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: String(frontmatter.author),
              href: null,
            },
          ],
        },
      }),
    });

    const mock = createMockContext(workspace);
    await loader.load(mock.context as never);

    const entry = mock.entries.get("custom")!;
    const data = entry.data as {
      properties: {
        Author: { rich_text: { plain_text: string }[] };
      };
    };
    expect(data.properties.Author.rich_text[0].plain_text).toBe("Alice");
  });
});

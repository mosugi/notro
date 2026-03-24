#!/usr/bin/env node
/**
 * notro CLI — shadcn-style Notion Astro component manager
 *
 * Usage:
 *   npx notro init              Initialize notro in your project
 *   npx notro list              List all available components
 *   npx notro add <name...>     Add component(s) to your project
 *   npx notro update <name...>  Update component(s) to the latest version
 *   npx notro remove <name...>  Remove component(s) from your project
 */

import {
  mkdirSync,
  existsSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENTS_SRC = join(__dirname, '../src/components/notion');
const { version: VERSION } = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);

// ── Registry ─────────────────────────────────────────────────────────────────
//
// Each entry describes one addable component unit:
//
//   name        CLI identifier used in `notro add <name>`
//   description Human-readable description shown in `notro list`
//   dir         Subdirectory created under src/components/notion/
//   files       Source .astro files to copy (relative to src/components/notion/)
//   exports     { ExportName: 'FileName.astro' } — generates index.ts named exports
//   components  { key: ExportName }              — NotionMarkdownRenderer components prop map
//
const registry = [
  {
    name: 'callout',
    description: 'Callout block — colored background, icon, role="note"',
    dir: 'callout',
    files: ['Callout.astro'],
    exports: { Callout: 'Callout.astro' },
    components: { callout: 'Callout' },
  },
  {
    name: 'toggle',
    description: 'Collapsible toggle block (details/summary)',
    dir: 'toggle',
    files: ['Toggle.astro', 'ToggleTitle.astro'],
    exports: { Toggle: 'Toggle.astro', ToggleTitle: 'ToggleTitle.astro' },
    components: { details: 'Toggle', summary: 'ToggleTitle' },
  },
  {
    name: 'image',
    description: 'Image block — caption, accessible alt fallback, decorative support',
    dir: 'image',
    files: ['ImageBlock.astro'],
    exports: { ImageBlock: 'ImageBlock.astro' },
    components: { img: 'ImageBlock' },
  },
  {
    name: 'table',
    description: 'Table block — header row/column support',
    dir: 'table',
    files: ['TableBlock.astro', 'TableRow.astro', 'TableCell.astro'],
    exports: {
      TableBlock: 'TableBlock.astro',
      TableRow: 'TableRow.astro',
      TableCell: 'TableCell.astro',
    },
    components: { table: 'TableBlock', tr: 'TableRow', td: 'TableCell' },
  },
  {
    name: 'columns',
    description: 'Multi-column layout — role="group"',
    dir: 'columns',
    files: ['Columns.astro', 'Column.astro'],
    exports: { Columns: 'Columns.astro', Column: 'Column.astro' },
    components: { columns: 'Columns', column: 'Column' },
  },
  {
    name: 'headings',
    description: 'H1–H4 headings with Notion color attribute support',
    dir: 'headings',
    files: ['H1.astro', 'H2.astro', 'H3.astro', 'H4.astro'],
    exports: { H1: 'H1.astro', H2: 'H2.astro', H3: 'H3.astro', H4: 'H4.astro' },
    components: { h1: 'H1', h2: 'H2', h3: 'H3', h4: 'H4' },
  },
  {
    name: 'quote',
    description: 'Blockquote block',
    dir: 'quote',
    files: ['Quote.astro'],
    exports: { Quote: 'Quote.astro' },
    components: { blockquote: 'Quote' },
  },
  {
    name: 'file',
    description: 'File download block',
    dir: 'file',
    files: ['FileBlock.astro'],
    exports: { FileBlock: 'FileBlock.astro' },
    components: { file: 'FileBlock' },
  },
  {
    name: 'pdf',
    description: 'PDF embed block',
    dir: 'pdf',
    files: ['PdfBlock.astro'],
    exports: { PdfBlock: 'PdfBlock.astro' },
    components: { pdf: 'PdfBlock' },
  },
  {
    name: 'audio',
    description: 'Audio player block',
    dir: 'audio',
    files: ['Audio.astro'],
    exports: { Audio: 'Audio.astro' },
    components: { audio: 'Audio' },
  },
  {
    name: 'video',
    description: 'Video player block',
    dir: 'video',
    files: ['Video.astro'],
    exports: { Video: 'Video.astro' },
    components: { video: 'Video' },
  },
  {
    name: 'page-ref',
    description: 'Notion page reference link',
    dir: 'page-ref',
    files: ['PageRef.astro'],
    exports: { PageRef: 'PageRef.astro' },
    components: { page: 'PageRef' },
  },
  {
    name: 'database-ref',
    description: 'Notion database reference link',
    dir: 'database-ref',
    files: ['DatabaseRef.astro'],
    exports: { DatabaseRef: 'DatabaseRef.astro' },
    components: { database: 'DatabaseRef' },
  },
  {
    name: 'toc',
    description: 'Table of contents block',
    dir: 'toc',
    files: ['TableOfContents.astro'],
    exports: { TableOfContents: 'TableOfContents.astro' },
    components: { table_of_contents: 'TableOfContents' },
  },
];

// ── Terminal colors ───────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  gray:   '\x1b[90m',
};

const ok   = (msg) => console.log(`  ${C.green}✓${C.reset} ${msg}`);
const info = (msg) => console.log(`  ${C.cyan}→${C.reset} ${msg}`);
const warn = (msg) => console.warn(`  ${C.yellow}!${C.reset} ${msg}`);
const fail = (msg) => { console.error(`  ${C.red}✗${C.reset} ${msg}`); process.exit(1); };

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Rewrite local relative imports so copied files work without the full source
 * tree.
 *
 *   import ... from './colors'  →  import ... from 'notro/utils'
 *   (colorToClass is exported from the notro/utils entry point)
 */
function rewriteImports(source) {
  return source.replace(/from\s+['"]\.\/colors['"]/g, "from 'notro/utils'");
}

/**
 * Generate an index.ts that re-exports each .astro file as a named export.
 *
 * Example output:
 *   export { default as Callout } from './Callout.astro';
 */
function generateIndex(exportsMap) {
  return Object.entries(exportsMap)
    .map(([name, file]) => `export { default as ${name} } from './${file}';`)
    .join('\n') + '\n';
}

/** Resolve the absolute destination directory for a component. */
function componentDir(cwd, dirName) {
  return join(cwd, 'src/components/notion', dirName);
}

/** Lookup a component entry or exit with a helpful error. */
function findComponent(name) {
  const c = registry.find((r) => r.name === name);
  if (!c) {
    fail(
      `Unknown component: "${name}"\n` +
      `  Run ${C.cyan}notro list${C.reset} to see available components.`,
    );
  }
  return c;
}

// ── Commands ──────────────────────────────────────────────────────────────────

function cmdVersion() {
  console.log(`notro v${VERSION}`);
}

// ─────────────────────────────────────────────────────
//  notro list
// ─────────────────────────────────────────────────────
function cmdList() {
  console.log(`\n${C.bold}notro components${C.reset}\n`);
  const pad = Math.max(...registry.map((c) => c.name.length));
  for (const c of registry) {
    console.log(
      `  ${C.cyan}${c.name.padEnd(pad + 2)}${C.reset}${C.dim}${c.description}${C.reset}`,
    );
  }
  console.log(
    `\n${C.gray}Run: npx notro add <component>${C.reset}\n`,
  );
}

// ─────────────────────────────────────────────────────
//  notro init
// ─────────────────────────────────────────────────────
function cmdInit() {
  const cwd = process.cwd();
  console.log(`\n${C.bold}Initializing notro${C.reset}\n`);

  const isAstro =
    existsSync(join(cwd, 'astro.config.mjs')) ||
    existsSync(join(cwd, 'astro.config.ts'));
  if (!isAstro) {
    warn('No astro.config.mjs found — make sure you are in an Astro project root.');
  }

  const base = join(cwd, 'src/components/notion');
  if (!existsSync(base)) {
    mkdirSync(base, { recursive: true });
    ok('Created src/components/notion/');
  } else {
    info('src/components/notion/ already exists');
  }

  console.log(`\n${C.bold}CSS setup${C.reset}\n`);
  console.log(
    `  Add the following to your global CSS file:\n`,
  );
  console.log(`  ${C.gray}/* src/styles/global.css */${C.reset}`);
  console.log(`  ${C.cyan}@plugin "notro-theme";${C.reset}\n`);

  console.log(
    `${C.bold}Done!${C.reset} ` +
    `Run ${C.cyan}npx notro add <component>${C.reset} to add your first component.\n`,
  );
}

// ─────────────────────────────────────────────────────
//  notro add / update
// ─────────────────────────────────────────────────────
function cmdAdd(names, { update = false } = {}) {
  if (names.length === 0) {
    fail(
      `Usage: notro ${update ? 'update' : 'add'} <component> [component...]\n` +
      `  Run ${C.cyan}notro list${C.reset} to see available components.`,
    );
  }

  const cwd = process.cwd();
  const components = names.map(findComponent);
  const verb = update ? 'Updating' : 'Adding';

  console.log(`\n${C.bold}${verb} ${components.length} component(s)${C.reset}\n`);

  for (const c of components) {
    const dir = componentDir(cwd, c.dir);
    mkdirSync(dir, { recursive: true });

    for (const file of c.files) {
      const srcPath = join(COMPONENTS_SRC, file);
      if (!existsSync(srcPath)) {
        fail(`Source file not found: ${srcPath}`);
      }

      const destPath = join(dir, file);
      if (!update && existsSync(destPath)) {
        warn(`${c.dir}/${file} already exists — skipping (use ${C.cyan}update${C.reset} to overwrite)`);
        continue;
      }

      const source = readFileSync(srcPath, 'utf-8');
      writeFileSync(destPath, rewriteImports(source), 'utf-8');
      ok(`${C.dim}src/components/notion/${C.reset}${c.dir}/${file}`);
    }

    // Always (re)write index.ts so named exports stay up to date
    const indexPath = join(dir, 'index.ts');
    writeFileSync(indexPath, generateIndex(c.exports), 'utf-8');
    ok(`${C.dim}src/components/notion/${C.reset}${c.dir}/index.ts ${C.dim}(named exports)${C.reset}`);
  }

  // ── Usage snippet ─────────────────────────────────
  console.log(`\n${C.bold}Usage${C.reset}\n`);

  const importLines = components.map(
    (c) =>
      `import { ${Object.keys(c.exports).join(', ')} } from "@/components/notion/${c.dir}";`,
  );

  const componentEntries = components.flatMap((c) =>
    Object.entries(c.components).map(([k, v]) => `    ${k}: ${v}`),
  );

  for (const line of importLines) {
    console.log(`  ${C.cyan}${line}${C.reset}`);
  }
  console.log();
  console.log(`  <NotionMarkdownRenderer`);
  console.log(`    markdown={markdown}`);
  console.log(`    components={{`);
  for (const entry of componentEntries) {
    console.log(`  ${entry}`);
  }
  console.log(`    }}`);
  console.log(`  />\n`);
}

// ─────────────────────────────────────────────────────
//  notro remove
// ─────────────────────────────────────────────────────
function cmdRemove(names) {
  if (names.length === 0) {
    fail('Usage: notro remove <component> [component...]');
  }

  const cwd = process.cwd();
  const components = names.map(findComponent);

  console.log(`\n${C.bold}Removing ${components.length} component(s)${C.reset}\n`);

  for (const c of components) {
    const dir = componentDir(cwd, c.dir);
    if (!existsSync(dir)) {
      warn(`${c.dir}/ not found — skipping`);
      continue;
    }
    rmSync(dir, { recursive: true, force: true });
    ok(`Removed ${C.dim}src/components/notion/${C.reset}${c.dir}/`);
  }
  console.log();
}

// ── Entry ─────────────────────────────────────────────────────────────────────

const [cmd, ...rest] = process.argv.slice(2);

switch (cmd) {
  case '--version':
  case '-v':
    cmdVersion();
    break;
  case 'list':
    cmdList();
    break;
  case 'init':
    cmdInit();
    break;
  case 'add':
    cmdAdd(rest);
    break;
  case 'update':
    cmdAdd(rest, { update: true });
    break;
  case 'remove':
    cmdRemove(rest);
    break;
  default:
    console.log(`\n${C.bold}notro${C.reset} v${VERSION}`);
    console.log(`${C.dim}Notion Astro component manager${C.reset}\n`);
    console.log('Usage:\n');
    console.log(`  ${C.cyan}notro init${C.reset}             Initialize notro in your project`);
    console.log(`  ${C.cyan}notro list${C.reset}             List available components`);
    console.log(`  ${C.cyan}notro add${C.reset} ${C.dim}<name...>${C.reset}    Add component(s) to your project`);
    console.log(`  ${C.cyan}notro update${C.reset} ${C.dim}<name...>${C.reset} Update component(s) to latest`);
    console.log(`  ${C.cyan}notro remove${C.reset} ${C.dim}<name...>${C.reset} Remove component(s)`);
    console.log(`\n  ${C.gray}Example: npx notro@latest add callout toggle image${C.reset}\n`);
}

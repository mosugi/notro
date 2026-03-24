#!/usr/bin/env node
/**
 * notro CLI
 *
 * shadcn-style component manager for Notion Astro components.
 *
 * Usage:
 *   npx notro list              List all available components
 *   npx notro add <name...>     Copy component(s) to your project
 */

import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENTS_SRC = join(__dirname, '../src/components/notion');

// ── Component registry ──────────────────────────────────────────────────────
// Each entry declares:
//   files  - component .astro files to copy (relative to src/components/notion)
//   deps   - other registry entries that must also be copied (optional)
//   key    - the key used in NotionMarkdownRenderer's `components` prop
const registry = [
  {
    name: 'callout',
    description: 'Callout block with colored background and icon',
    files: ['Callout.astro'],
    key: 'callout',
  },
  {
    name: 'toggle',
    description: 'Collapsible toggle block (details/summary)',
    files: ['Toggle.astro', 'ToggleTitle.astro'],
    key: 'details',
    extraKeys: ['summary'],
  },
  {
    name: 'image',
    description: 'Image block with caption and accessible alt text',
    files: ['ImageBlock.astro'],
    key: 'img',
  },
  {
    name: 'table',
    description: 'Table with header row/column support',
    files: ['TableBlock.astro', 'TableRow.astro', 'TableCell.astro'],
    key: 'table',
    extraKeys: ['tr', 'td'],
  },
  {
    name: 'columns',
    description: 'Multi-column layout block',
    files: ['Columns.astro', 'Column.astro'],
    key: 'columns',
    extraKeys: ['column'],
  },
  {
    name: 'h1',
    description: 'Heading 1 with Notion color attribute support',
    files: ['H1.astro'],
    key: 'h1',
  },
  {
    name: 'h2',
    description: 'Heading 2 with Notion color attribute support',
    files: ['H2.astro'],
    key: 'h2',
  },
  {
    name: 'h3',
    description: 'Heading 3 with Notion color attribute support',
    files: ['H3.astro'],
    key: 'h3',
  },
  {
    name: 'h4',
    description: 'Heading 4 with Notion color attribute support',
    files: ['H4.astro'],
    key: 'h4',
  },
  {
    name: 'quote',
    description: 'Blockquote block',
    files: ['Quote.astro'],
    key: 'blockquote',
  },
  {
    name: 'file',
    description: 'File download block',
    files: ['FileBlock.astro'],
    key: 'file',
  },
  {
    name: 'pdf',
    description: 'PDF embed block',
    files: ['PdfBlock.astro'],
    key: 'pdf',
  },
  {
    name: 'audio',
    description: 'Audio player block',
    files: ['Audio.astro'],
    key: 'audio',
  },
  {
    name: 'video',
    description: 'Video player block',
    files: ['Video.astro'],
    key: 'video',
  },
  {
    name: 'page-ref',
    description: 'Notion page reference link',
    files: ['PageRef.astro'],
    key: 'page',
  },
  {
    name: 'database-ref',
    description: 'Notion database reference link',
    files: ['DatabaseRef.astro'],
    key: 'database',
  },
  {
    name: 'toc',
    description: 'Table of contents block',
    files: ['TableOfContents.astro'],
    key: 'table_of_contents',
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const CYAN   = '\x1b[36m';
const YELLOW = '\x1b[33m';
const DIM    = '\x1b[2m';
const BOLD   = '\x1b[1m';

function ok(msg)   { console.log(`${GREEN}✓${RESET} ${msg}`); }
function warn(msg) { console.warn(`${YELLOW}!${RESET} ${msg}`); }
function err(msg)  { console.error(`\x1b[31m✗${RESET} ${msg}`); }

/**
 * Rewrite relative local imports to use the notro package
 * so copied files work without requiring the full source tree.
 *
 * ./colors  →  notro/utils  (colorToClass is exported from notro/utils)
 */
function rewriteImports(source) {
  return source.replace(
    /from\s+['"]\.\/colors['"]/g,
    "from 'notro/utils'",
  );
}

// ── Commands ─────────────────────────────────────────────────────────────────

function cmdList() {
  console.log(`\n${BOLD}Available notro components${RESET}\n`);
  const maxLen = Math.max(...registry.map(c => c.name.length));
  for (const c of registry) {
    console.log(`  ${CYAN}${c.name.padEnd(maxLen + 2)}${RESET}${DIM}${c.description}${RESET}`);
  }
  console.log();
}

async function cmdAdd(names) {
  if (names.length === 0) {
    err('Usage: notro add <component> [component...]');
    err('Run "notro list" to see available components.');
    process.exit(1);
  }

  const { readFileSync } = await import('node:fs');
  const cwd = process.cwd();
  const destDir = join(cwd, 'src/components/notion');

  // Validate all names first
  const components = [];
  for (const name of names) {
    const c = registry.find(r => r.name === name);
    if (!c) {
      err(`Unknown component: "${name}". Run "notro list" to see available components.`);
      process.exit(1);
    }
    components.push(c);
  }

  // Create destination directory if needed
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
    ok(`Created ${destDir}`);
  }

  // Copy files
  const copiedFiles = [];
  for (const c of components) {
    for (const file of c.files) {
      const srcPath = join(COMPONENTS_SRC, file);
      const destPath = join(destDir, file);

      if (!existsSync(srcPath)) {
        err(`Source file not found: ${srcPath}`);
        process.exit(1);
      }

      // Rewrite relative imports before writing
      const source = readFileSync(srcPath, 'utf-8');
      const rewritten = rewriteImports(source);

      const { writeFileSync } = await import('node:fs');
      if (existsSync(destPath)) {
        warn(`Overwriting existing file: src/components/notion/${file}`);
      }
      writeFileSync(destPath, rewritten, 'utf-8');
      ok(`${file} → src/components/notion/${file}`);
      copiedFiles.push({ component: c, file });
    }
  }

  // Print usage instructions
  console.log(`\n${BOLD}Next steps${RESET}\n`);
  console.log('Import your customized components and pass them to NotionMarkdownRenderer:\n');

  const imports = components.flatMap(c =>
    c.files.map(f => {
      const name = f.replace('.astro', '');
      return `import ${name} from "@/components/notion/${f}";`;
    })
  );

  const componentMap = components.flatMap(c => {
    const mainFile = c.files[0].replace('.astro', '');
    const entries = [[c.key, mainFile]];
    if (c.extraKeys) {
      c.extraKeys.forEach((k, i) => {
        const file = (c.files[i + 1] ?? c.files[0]).replace('.astro', '');
        entries.push([k, file]);
      });
    }
    return entries;
  });

  const importBlock = imports.join('\n');
  const propsBlock = componentMap.map(([k, v]) => `    ${k}: ${v}`).join(',\n');

  console.log(`${DIM}---${RESET}`);
  console.log(importBlock);
  console.log(`\n<NotionMarkdownRenderer`);
  console.log(`  markdown={markdown}`);
  console.log(`  components={{`);
  console.log(propsBlock);
  console.log(`  }}`);
  console.log(`/>`);
  console.log(`${DIM}---${RESET}\n`);
}

// ── Entry ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];

if (command === 'list') {
  cmdList();
} else if (command === 'add') {
  await cmdAdd(args.slice(1));
} else {
  console.log(`\n${BOLD}notro${RESET} — Notion Astro component manager\n`);
  console.log('Usage:');
  console.log(`  ${CYAN}notro list${RESET}          List all available components`);
  console.log(`  ${CYAN}notro add <name>${RESET}    Copy a component to your project\n`);
  console.log('Examples:');
  console.log(`  ${DIM}npx notro add callout${RESET}`);
  console.log(`  ${DIM}npx notro add callout toggle image${RESET}\n`);
}

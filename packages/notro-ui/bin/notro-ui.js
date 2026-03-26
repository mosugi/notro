#!/usr/bin/env node
/**
 * notro-ui CLI
 *
 * Usage:
 *   notro-ui init [--out-dir <dir>]   Copy ALL components to src/components/notro/
 *   notro-ui add <component>           Copy a single component file
 *   notro-ui list                      List available components
 *
 * Examples:
 *   notro-ui init
 *   notro-ui add callout
 *   notro-ui add toggle
 */

import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, basename } from 'node:path';
import {
  copyFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, '..', 'src', 'templates');

// All template files (excluding theme.css which goes to styles/)
const COMPONENT_FILES = readdirSync(TEMPLATES_DIR).filter(
  (f) => f !== 'theme.css',
);

const COMPONENT_NAMES = COMPONENT_FILES.map((f) =>
  f.replace(/\.(astro|ts)$/, '').toLowerCase(),
);

function printHelp() {
  console.log(`
notro-ui — Notion block component installer

Usage:
  notro-ui init [--out-dir <dir>]    Copy ALL components (default: src/components/notro/)
  notro-ui add <component>            Copy a single component
  notro-ui list                       List available components

Components:
  ${COMPONENT_NAMES.join(', ')}
`);
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`  Created ${dir}`);
  }
}

function copyTemplate(filename, destDir) {
  const src = join(TEMPLATES_DIR, filename);
  const dest = join(destDir, filename);
  const existed = existsSync(dest);
  copyFileSync(src, dest);
  console.log(`  ${existed ? 'Updated' : 'Added  '} ${dest}`);
}

function initCommand(args) {
  const outDirFlag = args.indexOf('--out-dir');
  const outDir = outDirFlag >= 0
    ? resolve(process.cwd(), args[outDirFlag + 1])
    : resolve(process.cwd(), 'src', 'components', 'notro');

  const stylesDir = resolve(process.cwd(), 'src', 'styles');

  console.log('\nnotro-ui init\n');

  ensureDir(outDir);
  ensureDir(stylesDir);

  // Copy all component files
  for (const file of COMPONENT_FILES) {
    copyTemplate(file, outDir);
  }

  // Copy theme.css to src/styles/
  const themeSrc = join(TEMPLATES_DIR, 'theme.css');
  const themeDest = join(stylesDir, 'notro-theme.css');
  const themeExisted = existsSync(themeDest);
  copyFileSync(themeSrc, themeDest);
  console.log(`  ${themeExisted ? 'Updated' : 'Added  '} ${themeDest}`);

  console.log(`
Done! ${COMPONENT_FILES.length} files installed.

Next steps:
  1. Add to your main CSS file (e.g. src/styles/global.css):
       @import "./notro-theme.css";

  2. Import in your page:
       import { NotroContents } from 'notro';
       import { notroComponents } from '../components/notro';

  3. Use it:
       <NotroContents markdown={markdown} {linkToPages} components={notroComponents} />

  To override a component:
       components={{ ...notroComponents, callout: MyCallout }}
`);
}

function addCommand(name) {
  if (!name) {
    console.error('Error: specify a component name.\n  notro-ui add callout');
    process.exit(1);
  }

  const outDir = resolve(process.cwd(), 'src', 'components', 'notro');

  if (!existsSync(outDir)) {
    console.error(
      `Error: ${outDir} not found.\nRun "notro-ui init" first to set up the components directory.`,
    );
    process.exit(1);
  }

  // Find matching file(s) — name is case-insensitive
  const matches = COMPONENT_FILES.filter(
    (f) => f.toLowerCase().startsWith(name.toLowerCase()),
  );

  if (matches.length === 0) {
    console.error(
      `Error: no component matching "${name}".\nRun "notro-ui list" to see available components.`,
    );
    process.exit(1);
  }

  console.log('\nnotro-ui add\n');

  for (const file of matches) {
    copyTemplate(file, outDir);
  }

  console.log('\nDone!');
}

function listCommand() {
  console.log('\nAvailable components:\n');
  for (const name of COMPONENT_NAMES) {
    console.log(`  ${name}`);
  }
  console.log();
}

// ── Main ─────────────────────────────────────────────────────────────────────

const [, , command, ...args] = process.argv;

switch (command) {
  case 'init':
    initCommand(args);
    break;
  case 'add':
    addCommand(args[0]);
    break;
  case 'list':
    listCommand();
    break;
  default:
    printHelp();
}

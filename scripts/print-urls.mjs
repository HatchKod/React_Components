#!/usr/bin/env node
// Prints the full live URL for every subtopic, ready to paste into
// Admin -> Course Editor -> Hands-on Task -> Interactive Component URL.
//
// Usage: node scripts/print-urls.mjs hatchkod-components.pages.dev

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const domain = process.argv[2];

if (!domain) {
  console.error('Usage: node scripts/print-urls.mjs <your-project-name>.pages.dev');
  process.exit(1);
}

const manifestPath = path.join(ROOT, 'site-dist', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const lines = manifest.map((m) => `${m.slug}\thttps://${domain}/${m.slug}/\t${m.sourcePath}`);
const output = ['slug\turl\tsource', ...lines].join('\n');

writeFileSync(path.join(ROOT, 'site-dist', 'urls.tsv'), output);
console.log(output);

#!/usr/bin/env node
// Discovers every subtopic component, builds it, and copies the output into
// site-dist/<mX-tY-sZ>/ so the whole thing can be deployed as one Cloudflare
// Pages project. Each subtopic ends up reachable at /<mX-tY-sZ>/.

import {
  existsSync,
  mkdirSync,
  rmSync,
  cpSync,
  copyFileSync,
  readdirSync,
  writeFileSync,
  symlinkSync,
  unlinkSync,
} from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'site-dist');

const SKIP_DIR_NAMES = new Set(['node_modules', 'dist', '.vite', '.git', 'site-dist']);
const WRAPPER_DIR_NAMES = new Set(['preview-app', 'app']);

function findEntryFile(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  if (entries.some((e) => e.isFile() && e.name === 'index.html')) return 'index.html';
  const htmlFiles = entries.filter((e) => e.isFile() && e.name.endsWith('.html'));
  return htmlFiles.length === 1 ? htmlFiles[0].name : null;
}

function walk(dir, found) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const entryFile = findEntryFile(full);
    if (entryFile) {
      found.push({ dir: full, entryFile });
    }
    walk(full, found);
  }
  return found;
}

function extractNumber(segment) {
  const match = segment.match(/(\d+)/);
  return match ? match[1] : null;
}

function deriveSlug(buildRoot) {
  const relSegments = path.relative(ROOT, buildRoot).split(path.sep);

  // The subtopic-naming segment is the build root itself, unless the build
  // root is a generic wrapper folder (preview-app/app) - then it's the parent.
  const lastSeg = relSegments[relSegments.length - 1];
  const subtopicSeg = WRAPPER_DIR_NAMES.has(lastSeg)
    ? relSegments[relSegments.length - 2]
    : lastSeg;

  const moduleSeg = relSegments.find((s) => /^module/i.test(s));
  const topicSeg = relSegments.find((s) => /^topic/i.test(s));

  const moduleNum = moduleSeg && extractNumber(moduleSeg);
  const topicNum = topicSeg && extractNumber(topicSeg);
  const subtopicNum = subtopicSeg && extractNumber(subtopicSeg);

  if (!moduleNum || !topicNum || !subtopicNum) {
    throw new Error(`Could not derive mX-tY-sZ slug for: ${buildRoot}`);
  }
  return `m${moduleNum}-t${topicNum}-s${subtopicNum}`;
}

// Returns { outputDir, entryFile } - entryFile is the file to expose as
// index.html once copied into the destination.
function buildOne(buildRoot, entryFile) {
  const hasPackageJson = existsSync(path.join(buildRoot, 'package.json'));

  if (!hasPackageJson) {
    // Static CDN/Babel component - no build step, copy the folder as-is.
    return { outputDir: buildRoot, entryFile };
  }

  const nodeModules = path.join(buildRoot, 'node_modules');
  if (!existsSync(nodeModules)) {
    execSync('npm install', { cwd: buildRoot, stdio: 'inherit' });
  }

  // Several "preview-app" wrappers import a sibling .jsx file that lives one
  // directory above them (e.g. ../../VariableExplorer.jsx). Node's module
  // resolution for bare imports ("react") only walks *up* from the importing
  // file, so it never finds preview-app/node_modules from that outer file.
  // A temporary symlink one level up makes it resolvable during the build.
  const parentDir = path.dirname(buildRoot);
  const parentNodeModules = path.join(parentDir, 'node_modules');
  const isWrapper = WRAPPER_DIR_NAMES.has(path.basename(buildRoot));
  const tempSymlinkCreated = isWrapper && !existsSync(parentNodeModules);
  if (tempSymlinkCreated) {
    symlinkSync(nodeModules, parentNodeModules, 'dir');
  }

  try {
    // Relative base so assets resolve correctly no matter what sub-path this
    // ends up served from (Vite defaults to absolute "/" base, which would
    // break once nested under /mX-tY-sZ/).
    execSync('npx vite build --base ./', { cwd: buildRoot, stdio: 'inherit' });
  } finally {
    if (tempSymlinkCreated) {
      unlinkSync(parentNodeModules);
    }
  }

  const distDir = path.join(buildRoot, 'dist');
  if (!existsSync(distDir)) {
    throw new Error(`Expected a dist/ folder after build in: ${buildRoot}`);
  }
  return { outputDir: distDir, entryFile: 'index.html' };
}

const DRY_RUN = process.argv.includes('--dry-run');

function main() {
  const found = walk(ROOT, []);
  if (found.length === 0) {
    console.error('No component entry points found - nothing to build.');
    process.exit(1);
  }

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const manifest = [];
  const bySlug = new Map();
  const failures = [];

  for (const { dir: buildRoot, entryFile } of found.sort((a, b) => a.dir.localeCompare(b.dir))) {
    const slug = deriveSlug(buildRoot);
    if (bySlug.has(slug)) {
      throw new Error(
        `Duplicate slug "${slug}" from ${buildRoot} and ${bySlug.get(slug)}`
      );
    }
    bySlug.set(slug, buildRoot);

    console.log(`\n=== ${DRY_RUN ? 'Resolving' : 'Building'} ${slug} (${path.relative(ROOT, buildRoot)}) ===`);

    if (!DRY_RUN) {
      try {
        const { outputDir, entryFile: outEntryFile } = buildOne(buildRoot, entryFile);
        const destDir = path.join(OUT_DIR, slug);
        mkdirSync(destDir, { recursive: true });
        cpSync(outputDir, destDir, { recursive: true });
        if (outEntryFile !== 'index.html') {
          copyFileSync(path.join(destDir, outEntryFile), path.join(destDir, 'index.html'));
        }
      } catch (err) {
        console.error(`\n!!! Failed to build ${slug} (${path.relative(ROOT, buildRoot)}): ${err.message}`);
        failures.push({ slug, sourcePath: path.relative(ROOT, buildRoot), error: err.message });
        continue;
      }
    }

    manifest.push({
      slug,
      sourcePath: path.relative(ROOT, buildRoot),
    });
  }

  manifest.sort((a, b) => a.slug.localeCompare(b.slug, undefined, { numeric: true }));

  writeFileSync(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  const listItems = manifest
    .map((m) => `<li><a href="/${m.slug}/">${m.slug}</a> <small>${m.sourcePath}</small></li>`)
    .join('\n');
  writeFileSync(
    path.join(OUT_DIR, 'index.html'),
    `<!doctype html><html><head><meta charset="utf-8"><title>HatchKod Components</title></head>` +
      `<body><h1>HatchKod Components (${manifest.length})</h1><ul>${listItems}</ul></body></html>`
  );

  console.log(`\nBuilt ${manifest.length} subtopics into ${path.relative(ROOT, OUT_DIR)}/`);
  console.log('Deploy with: npx wrangler pages deploy site-dist --project-name=<your-project-name>');
  console.log('Then run: node scripts/print-urls.mjs <your-project-name>.pages.dev');

  if (failures.length > 0) {
    console.error(`\n!!! ${failures.length} subtopic(s) FAILED to build and were skipped (the other ${manifest.length} still deployed):`);
    for (const f of failures) {
      console.error(`  - ${f.slug} (${f.sourcePath}): ${f.error}`);
    }
    // Exit 0 on purpose: a broken subtopic should not take the other
    // successfully built subtopics down with it. The failure list above
    // is printed loudly so it shows up in the Cloudflare build log.
  }
}

main();

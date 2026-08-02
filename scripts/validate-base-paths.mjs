import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const sourceRoot = new URL('src/', root).pathname;
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (/\.(?:astro|ts)$/.test(entry.name)) files.push(path);
  }
  return files;
}

for (const path of await walk(sourceRoot)) {
  const body = await readFile(path, 'utf8');
  for (const pattern of [/\bhref\s*=\s*["']\/(?!\/)/g, /\bsrc\s*=\s*["']\/(?!\/)/g]) {
    for (const match of body.matchAll(pattern)) errors.push(`${path}: root-absolute asset or link at byte ${match.index}`);
  }
}

const config = await readFile(new URL('astro.config.mjs', root), 'utf8');
if (!config.includes("site: 'https://maxwell3919.github.io'")) errors.push('astro.config.mjs: missing canonical Pages site');
if (!config.includes("base: '/DFT-Research-Workflow'")) errors.push('astro.config.mjs: missing project base');

if (errors.length > 0) {
  console.error(`Base-path validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Base-path validation passed: project base configured and no root-absolute href/src attributes found.');

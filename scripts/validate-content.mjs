import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const validatorPath = fileURLToPath(import.meta.url);
const requiredFiles = [
  'AGENTS.md',
  'README.md',
  'docs/architecture.md',
  'docs/content-contract.md',
  '.github/workflows/deploy.yml',
  'src/pages/index.astro',
  'src/pages/workflow.astro',
  'src/pages/evidence.astro',
  'src/pages/registry.astro',
  'src/pages/stages/[id].astro',
  'src/pages/branches/index.astro',
  'src/pages/branches/[id].astro',
  'src/pages/data/operations.json.ts',
  'src/lib/paths.ts',
  'scripts/validate-base-paths.mjs',
];
const errors = [];

for (const file of requiredFiles) {
  try { await access(new URL(file, root)); } catch { errors.push(`missing required file: ${file}`); }
}

const textExtensions = new Set(['.md', '.astro', '.ts', '.json', '.mjs', '.css', '.yml']);
const prohibited = [
  { pattern: /POTCAR\s+(?:content|body)/i, label: 'licensed POTCAR content marker' },
  { pattern: /BEGIN (?:OPENSSH|RSA|EC) PRIVATE KEY/, label: 'private key material' },
  { pattern: /gh[opsu]_[A-Za-z0-9]{20,}/, label: 'GitHub token-like material' },
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    if (['.git', 'node_modules', 'dist', '.astro'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path)); else paths.push(path);
  }
  return paths;
}

for (const path of await walk(new URL('.', root).pathname)) {
  if (path === validatorPath) continue;
  const extension = path.slice(path.lastIndexOf('.'));
  if (!textExtensions.has(extension)) continue;
  const body = await readFile(path, 'utf8');
  for (const item of prohibited) {
    if (item.pattern.test(body)) errors.push(`${path}: ${item.label}`);
  }
}

const readme = await readFile(new URL('README.md', root), 'utf8');
for (const boundary of ['not a workflow engine', 'scientific acceptance', 'github pages']) {
  if (!readme.toLowerCase().includes(boundary)) errors.push(`README missing boundary: ${boundary}`);
}

if (errors.length > 0) {
  console.error(`Content contract validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Content contract valid: ${requiredFiles.length} required files and restricted-material scan passed.`);

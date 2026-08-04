import { createHash } from 'node:crypto';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const root = resolve(new URL('../', import.meta.url).pathname);
const casesRoot = join(root, 'examples', 'cases');
const output = join(root, 'workflow', 'case-file-hashes.json');

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

const records = [];
for (const path of (await listFiles(casesRoot)).sort()) {
  const bytes = await readFile(path);
  records.push({
    path: relative(root, path),
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: (await stat(path)).size,
  });
}

const ledger = {
  schema_version: 1,
  scope: 'Every regular file committed below examples/cases, including raw-text outputs, inputs, parsers, figures, and per-case manifests.',
  update_command: 'node scripts/update-case-file-hashes.mjs',
  files: records,
};

await writeFile(output, `${JSON.stringify(ledger, null, 2)}\n`);
console.log(`Wrote ${records.length} hash-bound case files to ${relative(root, output)}.`);

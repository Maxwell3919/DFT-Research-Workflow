import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const registry = JSON.parse(await readFile(new URL('workflow/tools.json', root), 'utf8'));
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const topics = new Set(workflow.sections.flatMap((section) => section.groups.flatMap((group) => group.topics.map((topic) => topic.slug))));
const guideTools = new Set();

for (const file of (await readdir(new URL('src/content/practical-guides/', root))).filter((entry) => entry.endsWith('.md'))) {
  const text = await readFile(new URL(`src/content/practical-guides/${file}`, root), 'utf8');
  const block = text.match(/tools:\n((?:\s+- .+\n?)+)/)?.[1] ?? '';
  for (const match of block.matchAll(/^\s+-\s+([a-z0-9-]+)$/gm)) guideTools.add(match[1]);
}

if (registry.schema_version !== 1 || !String(registry.authority).includes('secondary tool')) errors.push('registry authority');
if (!String(registry.scope_note).includes('not research operations')) errors.push('scope boundary');

const slugs = new Set();
const names = new Set();
const urls = new Set();
const accessKinds = new Set(['open-source', 'restricted-license', 'registration-required', 'free-proprietary']);
for (const tool of registry.tools ?? []) {
  if (!slug.test(tool.slug) || slugs.has(tool.slug)) errors.push(`${tool.slug}: slug`);
  slugs.add(tool.slug);
  if (!tool.name || names.has(tool.name)) errors.push(`${tool.slug}: name`);
  names.add(tool.name);
  if (!accessKinds.has(tool.access)) errors.push(`${tool.slug}: access`);
  for (const key of ['homepage', 'documentation']) if (!String(tool[key]).startsWith('https://')) errors.push(`${tool.slug}: ${key}`);
  for (const url of [tool.homepage, tool.documentation, tool.source_repository].filter(Boolean)) urls.add(url);
  for (const topic of tool.topics ?? []) if (!topics.has(topic)) errors.push(`${tool.slug}: unknown topic ${topic}`);
}
for (const tool of guideTools) if (!slugs.has(tool)) errors.push(`practical tool missing: ${tool}`);
if (registry.tools.length !== 17 || urls.size !== 49) errors.push(`expected 17/49, found ${registry.tools.length}/${urls.size}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Tool registry valid: 17 identity-reviewed tools, 49 official URLs, resolved A-E topics, and complete practical-tool coverage.`);

import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const registry = JSON.parse(await readFile(new URL('workflow/tools.json', root), 'utf8'));
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const topics = new Set(workflow.sections.flatMap((section) => section.groups.flatMap((group) => group.topics.map((topic) => topic.slug))));
const guideTools = new Set();

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

for (const file of (await readdir(new URL('src/content/practical-guides/', root))).filter((entry) => entry.endsWith('.md'))) {
  const text = await readFile(new URL(`src/content/practical-guides/${file}`, root), 'utf8');
  const block = text.match(/tools:\n((?:\s+- .+\n?)+)/)?.[1] ?? '';
  for (const match of block.matchAll(/^\s+-\s+([a-z0-9-]+)$/gm)) guideTools.add(match[1]);
}

if (registry.schema_version !== 1 || !String(registry.authority).includes('secondary tool')) errors.push('registry authority');
if (!String(registry.scope_note).includes('not research operations')) errors.push('scope boundary');
if (!/^\d{4}-\d{2}-\d{2}$/.test(registry.verified_at ?? '')) errors.push('registry verified_at');

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
  if (typeof tool.role !== 'string' || !tool.role.trim()) errors.push(`${tool.slug}: role`);

  const toolTopics = Array.isArray(tool.topics) ? tool.topics : [];
  if (!toolTopics.length) errors.push(`${tool.slug}: topics`);
  for (const topic of toolTopics) if (!topics.has(topic)) errors.push(`${tool.slug}: unknown topic ${topic}`);

  const start = tool.getting_started ?? {};
  if (typeof start.label !== 'string' || !start.label.trim()) errors.push(`${tool.slug}: getting_started.label`);

  const resources = [
    ['homepage', tool.homepage],
    ['documentation', tool.documentation],
    ['source_repository', tool.source_repository],
    ['getting_started.url', start.url],
  ];
  for (const [key, url] of resources) {
    if (key === 'source_repository' && !url) continue;
    if (!isHttpsUrl(url)) errors.push(`${tool.slug}: ${key}`);
    if (url) urls.add(url);
  }
}
for (const tool of guideTools) if (!slugs.has(tool)) errors.push(`practical tool missing: ${tool}`);
if (registry.tools.length !== 17 || urls.size !== 49) errors.push(`expected 17/49, found ${registry.tools.length}/${urls.size}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Tool registry valid: 17 identity-reviewed tools, 17 curated start links, 49 deduplicated HTTPS resource URLs, resolved A-E topics, and complete practical-tool coverage.');

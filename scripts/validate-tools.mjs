import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const registry = JSON.parse(await readFile(new URL('workflow/tools.json', root), 'utf8'));
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const librarySource = await readFile(new URL('src/lib/tools.ts', root), 'utf8');
const indexSource = await readFile(new URL('src/pages/tools/index.astro', root), 'utf8');
const detailSource = await readFile(new URL('src/pages/tools/[slug].astro', root), 'utf8');
const topicPageSource = await readFile(new URL('src/pages/operations/[slug].astro', root), 'utf8');
const practicalPageSource = await readFile(new URL('src/pages/operations/[topic]/[category]/[slug].astro', root), 'utf8');
const topicSlugs = new Set(workflow.sections.flatMap((section) => section.groups.flatMap((group) => group.topics.map((topic) => topic.slug))));
const allowedAccess = new Set(['open', 'registration', 'institutional', 'subscription', 'commercial', 'mixed', 'restricted', 'free-proprietary']);
const allowedLinkRoles = new Set(['homepage', 'docs', 'tutorial', 'source', 'download', 'data', 'manual', 'standard', 'community']);
const allowedEditorialStates = new Set(['reviewed', 'catalog', 'candidate']);
const forbiddenHeavyFields = new Set(['category', 'role', 'use_when', 'first_action', 'first_human_action', 'input_objects', 'output_objects', 'verify', 'inspect', 'bring_back', 'boundary', 'source_id', 'link_label', 'subcategory']);
const requiredBodyResources = [
  'fermisurfer', 'vmd', 'molstar', 'plumed', 'alamode', 'tdep', 'shengbte', 'perturbo', 'z2pack',
  'transiesta-tbtrans', 'doped', 'bidb', 'slurm', 'ro-crate', 'bagit', 'datacite-schema',
  'nist-uncertainty', 'iupac-gold-book',
];

const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const stringArray = (value) => Array.isArray(value) && value.length > 0 && value.every(nonempty) && new Set(value).size === value.length;
const exactKeys = (value, allowed, label) => {
  for (const key of Object.keys(value ?? {})) if (!allowed.has(key)) errors.push(`${label}: unexpected key ${key}`);
};

if (registry.schema_version !== 3) errors.push('schema_version must be 3');
if (!String(registry.authority).includes('Canonical human-facing Tools & Resources')) errors.push('canonical authority boundary');
for (const phrase of ['not research operations', 'rankings', 'compatibility promises', 'scientifically valid']) {
  if (!String(registry.scope_note).includes(phrase)) errors.push(`scope_note missing ${phrase}`);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(registry.reviewed_at ?? '')) errors.push('reviewed_at');

const groupIds = new Set();
for (const group of registry.task_groups ?? []) {
  exactKeys(group, new Set(['id', 'title', 'intro']), `task group ${group.id ?? 'unknown'}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(group.id ?? '') || groupIds.has(group.id)) errors.push(`${group.id}: task group id`);
  groupIds.add(group.id);
  if (!nonempty(group.title) || !nonempty(group.intro)) errors.push(`${group.id}: task group title or intro`);
}
if (groupIds.size < 2) errors.push('task-organized catalog requires multiple task groups');

const slugs = new Set();
const names = new Set();
const globalUrls = new Map();
const coveredTopics = new Set();
const detailSlugs = new Set();
const resources = registry.resources ?? [];
for (const resource of resources) {
  const label = resource.slug ?? 'unknown';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(label) || slugs.has(label)) errors.push(`${label}: duplicate or invalid slug`);
  slugs.add(label);
  if (!nonempty(resource.name) || names.has(resource.name)) errors.push(`${label}: duplicate or missing name`);
  names.add(resource.name);
  if (!nonempty(resource.one_line) || resource.one_line.split(/\s+/).length > 30) errors.push(`${label}: one_line must be concise`);
  for (const key of forbiddenHeavyFields) if (key in resource) errors.push(`${label}: retired heavy field ${key}`);
  if (!stringArray(resource.task_groups) || resource.task_groups.some((id) => !groupIds.has(id))) errors.push(`${label}: task_groups`);
  if (!stringArray(resource.kind_tags)) errors.push(`${label}: kind_tags`);
  if (!stringArray(resource.interface_tags)) errors.push(`${label}: interface_tags`);
  if (!allowedAccess.has(resource.access)) errors.push(`${label}: access ${resource.access}`);
  if (!stringArray(resource.topics) || resource.topics.some((slug) => !topicSlugs.has(slug))) errors.push(`${label}: topics`);
  for (const topic of resource.topics ?? []) coveredTopics.add(topic);
  if (!Array.isArray(resource.aliases) || resource.aliases.some((alias) => !nonempty(alias))) errors.push(`${label}: aliases`);
  if (!allowedEditorialStates.has(resource.editorial_state)) errors.push(`${label}: editorial_state`);
  if (resource.detail === true) detailSlugs.add(label);
  else if (resource.detail !== undefined) errors.push(`${label}: detail must be true or omitted`);
  if (resource.caveat !== undefined && !nonempty(resource.caveat)) errors.push(`${label}: caveat`);
  if (resource.language !== undefined && !/^[a-z]{2}(?:-[A-Z]{2})?$/.test(resource.language)) errors.push(`${label}: language`);
  if (!Array.isArray(resource.links) || resource.links.length < 1) errors.push(`${label}: links`);
  const localUrls = new Set();
  for (const link of resource.links ?? []) {
    exactKeys(link, new Set(['role', 'label', 'url']), `${label} link`);
    if (!allowedLinkRoles.has(link.role) || !nonempty(link.label)) errors.push(`${label}: link role or label`);
    if (localUrls.has(link.url)) errors.push(`${label}: duplicate link URL`);
    localUrls.add(link.url);
    try {
      const parsed = new URL(link.url);
      if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && String(resource.caveat).includes('HTTP-only'))) {
        errors.push(`${label}: non-HTTPS URL without explicit legacy caveat`);
      }
    } catch {
      errors.push(`${label}: invalid URL ${link.url}`);
    }
    const owner = globalUrls.get(link.url);
    if (owner && owner !== label) errors.push(`${label}: URL already belongs to ${owner}; use one entity with multiple link roles`);
    globalUrls.set(link.url, label);
  }
}
if (resources.length <= detailSlugs.size) errors.push('catalog-only resources are missing');
for (const topic of topicSlugs) if (!coveredTopics.has(topic)) errors.push(`workflow topic has no resource: ${topic}`);
for (const slug of requiredBodyResources) if (!slugs.has(slug)) errors.push(`body-mentioned resource is not recoverable: ${slug}`);

const adapterSlugs = new Set();
for (const adapter of registry.tools ?? []) {
  exactKeys(adapter, new Set(['slug']), `tools adapter ${adapter.slug ?? 'unknown'}`);
  if (!detailSlugs.has(adapter.slug) || adapterSlugs.has(adapter.slug)) errors.push(`${adapter.slug}: invalid or duplicate detail adapter`);
  adapterSlugs.add(adapter.slug);
}
if (JSON.stringify([...adapterSlugs].sort()) !== JSON.stringify([...detailSlugs].sort())) errors.push('slug-only compatibility adapters must exactly match detail resources');

const guideTools = new Set();
for (const file of (await readdir(new URL('src/content/practical-guides/', root))).filter((entry) => entry.endsWith('.md'))) {
  const text = await readFile(new URL(`src/content/practical-guides/${file}`, root), 'utf8');
  const block = text.match(/tools:\n((?:\s+- .+\n?)+)/)?.[1] ?? '';
  for (const match of block.matchAll(/^\s+-\s+([a-z0-9-]+)$/gm)) guideTools.add(match[1]);
}
for (const slug of guideTools) if (!slugs.has(slug)) errors.push(`practical guide references unknown resource: ${slug}`);

for (const marker of ['getResources', 'getDetailedResources', 'getResourcePath', 'getResourceTopics', 'getResourcesForTopic', 'getResourcesForTaskGroup']) {
  if (!librarySource.includes(marker)) errors.push(`resource library missing ${marker}`);
}
for (const marker of [
  'Tools & Resources',
  'data-tools-resources',
  'data-topic-resource-index',
  'data-resource-task',
  'class="resource-table"',
  '<th scope="col">Resource</th>',
  '<th scope="col">Best used for</th>',
  '<th scope="col">Access</th>',
  '<th scope="col">Used in</th>',
  'data-resource',
  'data-resource-link',
  'data-resource-detail-link',
  'visibleTopicLimit',
]) {
  if (!indexSource.includes(marker)) errors.push(`catalog source missing ${marker}`);
}
if (indexSource.includes('Research tasks:')) errors.push('catalog must not repeat the retired Research tasks label for every resource');
for (const slug of topicSlugs) {
  if (!indexSource.includes(`'${slug}':`)) errors.push(`catalog compact Used in label missing: ${slug}`);
}
for (const source of [topicPageSource, practicalPageSource]) {
  for (const marker of ['getResourcePath', 'class="tool-tag"', 'href={withBase(getResourcePath(resource))}', '{resource.name}']) {
    if (!source.includes(marker)) errors.push(`operation-to-resource renderer missing ${marker}`);
  }
}
for (const marker of ['getDetailedResources', 'data-resource-detail', 'Official entry points', 'Where in the research workflow', 'What to verify', 'data-tool-verify']) {
  if (!detailSource.includes(marker)) errors.push(`detail source missing ${marker}`);
}
for (const source of [indexSource, detailSource]) {
  if (source.includes('client:') || /<script(?:\s|>)/i.test(source)) errors.push('Tools & Resources pages must remain static');
}

if (errors.length) {
  console.error(`Tools & Resources validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Tools & Resources valid: ${resources.length} canonical resources, ${detailSlugs.size} selective depth pages, ${groupIds.size} task groups, ${globalUrls.size} unique official or primary links, all ${topicSlugs.size} workflow topics covered, and ${requiredBodyResources.length} body-mentioned resource identities recoverable.`);

import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const operations = JSON.parse(await readFile(new URL('ontology/operations.json', root), 'utf8')).operations;
const legacy = JSON.parse(await readFile(new URL('ontology/legacy-operations.json', root), 'utf8')).entries;
const recipes = JSON.parse(await readFile(new URL('recipes/index.json', root), 'utf8')).recipes;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const expectedSections = ['A', 'B', 'C', 'D', 'E'];
const expectedDGroups = ['D1', 'D2', 'D3', 'D4', 'D5'];

if (workflow.schema_version !== 1) errors.push('workflow registry schema_version must be 1');
if (workflow.authority !== 'reader-facing A–E workflow topic registry') errors.push('workflow registry authority statement mismatch');
if (!String(workflow.scope_note).includes('not presented as the number of DFT operations')) errors.push('workflow registry must reject a public operation-count interpretation');
if (!Array.isArray(workflow.sections)) errors.push('workflow registry sections must be an array');

const sectionIds = workflow.sections.map((section) => section.id);
if (JSON.stringify(sectionIds) !== JSON.stringify(expectedSections)) errors.push(`workflow sections must be A–E in order: ${JSON.stringify(sectionIds)}`);
const sectionSlugs = workflow.sections.map((section) => section.slug);
if (new Set(sectionSlugs).size !== sectionSlugs.length) errors.push('workflow section slugs must be unique');

const topics = [];
for (const section of workflow.sections) {
  if (!slugPattern.test(section.slug)) errors.push(`invalid section slug: ${section.slug}`);
  if (typeof section.title !== 'string' || section.title.length === 0) errors.push(`section ${section.id} has no title`);
  if (typeof section.summary !== 'string' || section.summary.length === 0) errors.push(`section ${section.id} has no summary`);
  const expectedRole = section.id === 'D' ? 'branching-library' : 'backbone';
  if (section.role !== expectedRole) errors.push(`section ${section.id} role must be ${expectedRole}`);
  if (!Array.isArray(section.groups) || section.groups.length === 0) errors.push(`section ${section.id} must contain groups`);

  const groupIds = section.groups.map((group) => group.id);
  if (section.id === 'D') {
    if (JSON.stringify(groupIds) !== JSON.stringify(expectedDGroups)) errors.push(`section D groups must be D1–D5: ${JSON.stringify(groupIds)}`);
  } else if (JSON.stringify(groupIds) !== JSON.stringify([section.id])) {
    errors.push(`section ${section.id} must use one same-letter group`);
  }

  for (const group of section.groups) {
    if (!slugPattern.test(group.slug)) errors.push(`invalid group slug: ${group.slug}`);
    if (typeof group.title !== 'string' || group.title.length === 0) errors.push(`group ${group.id} has no title`);
    if (typeof group.summary !== 'string' || group.summary.length === 0) errors.push(`group ${group.id} has no summary`);
    if (!Array.isArray(group.topics) || group.topics.length === 0) errors.push(`group ${group.id} must contain topics`);
    for (const topic of group.topics) {
      const keys = Object.keys(topic).sort();
      if (JSON.stringify(keys) !== JSON.stringify(['slug', 'title'])) errors.push(`${topic.slug ?? group.id}: topic records may contain only slug and title`);
      if (!slugPattern.test(topic.slug)) errors.push(`invalid topic slug: ${topic.slug}`);
      if (typeof topic.title !== 'string' || topic.title.length === 0) errors.push(`${topic.slug}: topic has no title`);
      if (/^(?:O\d{2}|\d{2})\b/.test(topic.title)) errors.push(`${topic.slug}: public topic title must not expose a numbered taxonomy`);
      topics.push({ ...topic, section: section.id, group: group.id });
    }
  }
}

const topicSlugs = topics.map((topic) => topic.slug);
if (new Set(topicSlugs).size !== topicSlugs.length) errors.push('workflow topic slugs must be unique');
const topicTitles = topics.map((topic) => topic.title);
if (new Set(topicTitles).size !== topicTitles.length) errors.push('workflow topic titles must be unique');

const oldSlugs = new Set([...operations.map((operation) => operation.slug), ...legacy.map((entry) => entry.slug)]);
for (const slug of topicSlugs) if (oldSlugs.has(slug)) errors.push(`${slug}: new topic route collides with a transitional route`);

const topicSet = new Set(topicSlugs);
const operationSet = new Set(operations.map((operation) => operation.id));
const legacySet = new Set(legacy.map((entry) => entry.slug));
const recipeSet = new Set(recipes.map((recipe) => recipe.slug));
for (const [topicSlug, sources] of Object.entries(workflow.migration_sources ?? {})) {
  if (!topicSet.has(topicSlug)) errors.push(`migration source key does not resolve to a workflow topic: ${topicSlug}`);
  for (const id of sources.core_operations ?? []) if (!operationSet.has(id)) errors.push(`${topicSlug}: unknown transitional core operation ${id}`);
  for (const slug of sources.legacy_routes ?? []) if (!legacySet.has(slug)) errors.push(`${topicSlug}: unknown legacy route ${slug}`);
  for (const slug of sources.recipes ?? []) if (!recipeSet.has(slug)) errors.push(`${topicSlug}: unknown transitional recipe ${slug}`);
}

if (errors.length > 0) {
  console.error(`A–E workflow validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('A–E workflow registry valid: stable sections, navigation groups, unique topic routes, resolved migration references, and no collision with transitional URLs.');

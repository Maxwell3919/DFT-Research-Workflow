import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const builtMode = process.argv.includes('--built');
const compatibility = JSON.parse(await readFile(new URL('workflow/resource-landscape.json', root), 'utf8'));
const registry = JSON.parse(await readFile(new URL('workflow/tools.json', root), 'utf8'));
const sourcePointer = JSON.parse(await readFile(new URL('sources/resource-landscape-links.json', root), 'utf8'));
const legacyPageSource = await readFile(new URL('src/pages/operations/resource-landscape.astro', root), 'utf8');
const catalogSource = await readFile(new URL('src/pages/tools/index.astro', root), 'utf8');
const groupIds = new Set((registry.task_groups ?? []).map((group) => group.id));
const resourceSlugs = new Set((registry.resources ?? []).map((resource) => resource.slug));
const requiredAliases = [
  'structures-data', 'visual-symmetry', 'electronic-properties', 'electronic-structure-codes',
  'specialist-tools', 'lattice-dynamics', 'pseudopotentials-basis', 'method-inputs', 'literature-learning',
];

if (compatibility.schema_version !== 2) errors.push('compatibility schema_version must be 2');
if (compatibility.canonical_registry !== 'workflow/tools.json' || compatibility.canonical_path !== 'tools/' || compatibility.legacy_path !== 'operations/resource-landscape/') {
  errors.push('canonical registry or route pointer');
}
if ('categories' in compatibility) errors.push('legacy compatibility file must not duplicate canonical resources');
const aliases = compatibility.anchor_aliases ?? {};
for (const alias of requiredAliases) {
  if (!groupIds.has(aliases[alias])) errors.push(`legacy anchor ${alias} does not resolve to a canonical task group`);
}
for (const alias of Object.keys(aliases)) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(alias)) errors.push(`invalid legacy anchor ${alias}`);
}

if (sourcePointer.schema_version !== 2 || sourcePointer.canonical_registry !== 'workflow/tools.json') errors.push('source compatibility pointer');
if ('sources' in sourcePointer) errors.push('source pointer must not duplicate canonical resource links');
if (sourcePointer.reviewed_at !== registry.reviewed_at) errors.push('source pointer reviewed_at differs from canonical registry');

for (const marker of ["import ToolsResourcesPage from '../tools/index.astro'", '<ToolsResourcesPage compatibilityRoute={true} />']) {
  if (!legacyPageSource.includes(marker)) errors.push(`legacy route source missing ${marker}`);
}
if (legacyPageSource.includes('workflow/resource-landscape.json') || legacyPageSource.includes('sources/resource-landscape-links.json')) {
  errors.push('legacy route still renders a second resource system');
}
for (const marker of ['data-tools-resources', 'data-resource-task', 'data-resource', 'data-resource-link']) {
  if (!catalogSource.includes(marker)) errors.push(`canonical catalog source missing ${marker}`);
}
if (catalogSource.includes('client:') || /<script(?:\s|>)/i.test(catalogSource)) errors.push('canonical catalog must remain static');

if (builtMode) {
  let legacyHtml = '';
  let catalogHtml = '';
  try { legacyHtml = await readFile(new URL('dist/operations/resource-landscape/index.html', root), 'utf8'); }
  catch (error) { errors.push(`built legacy route missing: ${error.message}`); }
  try { catalogHtml = await readFile(new URL('dist/tools/index.html', root), 'utf8'); }
  catch (error) { errors.push(`built canonical catalog missing: ${error.message}`); }
  if (!legacyHtml.includes('data-tools-resources') || !legacyHtml.includes('data-resource-landscape-compatibility')) errors.push('built legacy route does not reuse the canonical renderer');
  if (/http-equiv="refresh"/i.test(legacyHtml)) errors.push('built legacy route must not use a fragment-dropping meta refresh');
  if (!catalogHtml.includes('data-tools-resources')) errors.push('built canonical catalog marker missing');
  for (const alias of requiredAliases) {
    if (!catalogHtml.includes(`id="${alias}"`)) errors.push(`built canonical compatibility anchor missing: ${alias}`);
    if (!legacyHtml.includes(`id="${alias}"`)) errors.push(`built legacy compatibility anchor missing: ${alias}`);
  }
  for (const slug of resourceSlugs) if (!catalogHtml.includes(`data-resource="${slug}"`)) errors.push(`built resource missing: ${slug}`);
}

if (errors.length) {
  console.error(`Resource Landscape compatibility validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Resource Landscape compatibility valid: one canonical Tools & Resources registry and renderer with ${registry.resources.length} resources, ${Object.keys(aliases).length} legacy anchors, and no duplicate resource/source schema.`);

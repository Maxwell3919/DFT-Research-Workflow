import { readFile, readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';

const root = new URL('../', import.meta.url);
const errors = [];

async function readJson(path) {
  try {
    return JSON.parse(await readFile(new URL(path, root), 'utf8'));
  } catch (error) {
    errors.push(`${path}: ${error}`);
    return null;
  }
}

const operationsDocument = await readJson('ontology/operations.json');
const relationsDocument = await readJson('ontology/relations.json');
const tagsDocument = await readJson('ontology/tags.json');
const legacyDocument = await readJson('ontology/legacy-operations.json');
const recipesDocument = await readJson('recipes/index.json');

const operations = operationsDocument?.operations ?? [];
const expectedIds = Array.from({ length: 24 }, (_, index) => `O${String(index + 1).padStart(2, '0')}`);
const lifecycleOrder = [
  'source-and-identity',
  'model-preparation',
  'protocol-design',
  'computation',
  'analysis-and-comparison',
  'evidence-and-claim',
  'preservation',
];
const requiredOperationFields = [
  'id', 'order', 'slug', 'name', 'lifecycle', 'definition', 'inputs', 'outputs',
  'requirement', 'repeatability', 'dependencies', 'alternatives', 'exclusions',
];

if (operations.length !== 24) errors.push(`ontology must contain exactly 24 operations, found ${operations.length}`);
const operationIds = operations.map((operation) => operation.id);
const operationSlugs = operations.map((operation) => operation.slug);
if (JSON.stringify(operationIds) !== JSON.stringify(expectedIds)) {
  errors.push(`operation IDs must be continuous O01-O24: ${JSON.stringify(operationIds)}`);
}
if (new Set(operationSlugs).size !== operationSlugs.length) errors.push('duplicate core-operation slug');

for (const [index, operation] of operations.entries()) {
  const keys = Object.keys(operation).sort();
  if (JSON.stringify(keys) !== JSON.stringify([...requiredOperationFields].sort())) {
    errors.push(`${operation.id ?? `operation-${index}`}: fields must be exactly ${requiredOperationFields.join(', ')}`);
  }
  if (operation.order !== index + 1) errors.push(`${operation.id}: order must be ${index + 1}`);
  if (operation.slug !== `${operation.id.toLowerCase()}-${operation.slug?.slice(4)}` || !/^o\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(operation.slug ?? '')) {
    errors.push(`${operation.id}: invalid explicit slug ${JSON.stringify(operation.slug)}`);
  }
  if (!lifecycleOrder.includes(operation.lifecycle)) errors.push(`${operation.id}: unknown lifecycle ${operation.lifecycle}`);
  if (!operation.name || /^Study\b/.test(operation.name)) errors.push(`${operation.id}: operation name must be an explicit action, not a study topic`);
  if (!operation.definition || operation.definition.length < 30) errors.push(`${operation.id}: definition is missing or too short`);
  for (const field of ['inputs', 'outputs', 'dependencies', 'alternatives', 'exclusions']) {
    if (!Array.isArray(operation[field])) errors.push(`${operation.id}: ${field} must be an array`);
  }
  for (const dependency of operation.dependencies ?? []) {
    if (!expectedIds.includes(dependency)) errors.push(`${operation.id}: unknown dependency ${dependency}`);
  }
}

const lifecycleCounts = Object.fromEntries(lifecycleOrder.map((lifecycle) => [
  lifecycle,
  operations.filter((operation) => operation.lifecycle === lifecycle).length,
]));
const expectedLifecycleCounts = {
  'source-and-identity': 4,
  'model-preparation': 2,
  'protocol-design': 4,
  computation: 7,
  'analysis-and-comparison': 2,
  'evidence-and-claim': 3,
  preservation: 2,
};
if (JSON.stringify(lifecycleCounts) !== JSON.stringify(expectedLifecycleCounts)) {
  errors.push(`lifecycle counts mismatch: ${JSON.stringify(lifecycleCounts)}`);
}

const crossCutting = operationsDocument?.ontology?.cross_cutting_operations ?? [];
for (const operationId of ['O09', 'O12', 'O20', 'O21', 'O22', 'O23', 'O24']) {
  if (!crossCutting.includes(operationId)) errors.push(`cross-cutting set is missing ${operationId}`);
}

const legacyEntries = legacyDocument?.entries ?? [];
if (legacyEntries.length !== 35) errors.push(`legacy compatibility map must contain 35 entries, found ${legacyEntries.length}`);
const legacyNumbers = legacyEntries.map((entry) => entry.number);
if (JSON.stringify(legacyNumbers) !== JSON.stringify(Array.from({ length: 35 }, (_, index) => index))) {
  errors.push(`legacy numbers must be continuous 00-34: ${JSON.stringify(legacyNumbers)}`);
}
const legacySlugs = legacyEntries.map((entry) => entry.slug);
if (new Set(legacySlugs).size !== legacySlugs.length) errors.push('duplicate legacy slug');
for (const entry of legacyEntries) {
  if (entry.display_number !== String(entry.number).padStart(2, '0')) errors.push(`${entry.slug}: invalid display number`);
  if (!Array.isArray(entry.maps_to) || entry.maps_to.length === 0) errors.push(`${entry.slug}: maps_to must be non-empty`);
  for (const operationId of entry.maps_to ?? []) {
    if (!expectedIds.includes(operationId)) errors.push(`${entry.slug}: unknown mapped operation ${operationId}`);
  }
}
for (const slug of legacySlugs) {
  if (operationSlugs.includes(slug)) errors.push(`core and legacy slug collision: ${slug}`);
}

try {
  const legacyDirectory = new URL('src/content/operations/', root).pathname;
  const legacyFiles = (await readdir(legacyDirectory)).filter((name) => name.endsWith('.md')).sort();
  const expectedLegacyFiles = legacySlugs.map((slug) => `${slug}.md`).sort();
  if (JSON.stringify(legacyFiles) !== JSON.stringify(expectedLegacyFiles)) {
    errors.push('legacy Markdown compatibility files do not match ontology/legacy-operations.json');
  }
  for (const filename of legacyFiles) {
    const source = await readFile(join(legacyDirectory, filename), 'utf8');
    const slug = source.match(/^slug:\s*(.+)$/m)?.[1]?.trim();
    if (slug !== basename(filename, '.md')) errors.push(`${filename}: frontmatter slug mismatch`);
  }
} catch (error) {
  errors.push(`legacy Markdown compatibility directory: ${error}`);
}

const tagSets = {
  system_types: new Set(tagsDocument?.system_types ?? []),
  scientific_targets: new Set(tagsDocument?.scientific_targets ?? []),
  methods: new Set(tagsDocument?.methods ?? []),
};
for (const [name, values] of Object.entries(tagSets)) {
  if (values.size === 0) errors.push(`tag family ${name} must be non-empty`);
}

const recipes = recipesDocument?.recipes ?? [];
if (recipes.length < 12) errors.push(`recipe registry must contain at least 12 representative workflows, found ${recipes.length}`);
const recipeSlugs = recipes.map((recipe) => recipe.slug);
if (new Set(recipeSlugs).size !== recipeSlugs.length) errors.push('duplicate recipe slug');
for (const recipe of recipes) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recipe.slug ?? '')) errors.push(`invalid recipe slug ${recipe.slug}`);
  if (recipe.status !== 'scaffold') errors.push(`${recipe.slug}: recipe status must be scaffold`);
  if (!Array.isArray(recipe.operations) || recipe.operations.length === 0) errors.push(`${recipe.slug}: operations must be non-empty`);
  for (const operationId of recipe.operations ?? []) {
    if (!expectedIds.includes(operationId)) errors.push(`${recipe.slug}: unknown operation ${operationId}`);
  }
  for (const tag of recipe.system_types ?? []) {
    if (!tagSets.system_types.has(tag)) errors.push(`${recipe.slug}: unknown system type ${tag}`);
  }
  for (const tag of recipe.scientific_targets ?? []) {
    if (!tagSets.scientific_targets.has(tag)) errors.push(`${recipe.slug}: unknown scientific target ${tag}`);
  }
  for (const tag of recipe.methods ?? []) {
    if (!tagSets.methods.has(tag)) errors.push(`${recipe.slug}: unknown method ${tag}`);
  }
}

const relationTypes = new Set(relationsDocument?.relation_types ?? []);
for (const relation of relationsDocument?.relations ?? []) {
  if (!relationTypes.has(relation.relation)) errors.push(`unknown relation type ${relation.relation}`);
  if (/^O\d{2}$/.test(relation.source) && !expectedIds.includes(relation.source)) errors.push(`unknown relation source ${relation.source}`);
  if (/^O\d{2}$/.test(relation.target) && !expectedIds.includes(relation.target)) errors.push(`unknown relation target ${relation.target}`);
}

if (errors.length > 0) {
  console.error(`Operation ontology validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Operation ontology valid: 24 core operations, ${recipes.length} recipe scaffolds, 35 legacy route mappings, seven lifecycle projections, and typed tags/relations.`);

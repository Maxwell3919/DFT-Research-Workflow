import { access, readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const rootPath = new URL('.', root).pathname;
const sourcePath = new URL('src/', root).pathname;
const validatorPath = fileURLToPath(import.meta.url);
const errors = [];
const requiredFiles = [
  'AGENTS.md',
  'README.md',
  'docs/architecture.md',
  'docs/content-contract.md',
  'docs/content-population-plan.md',
  'docs/audits/2026-08-03-content-scaffold-framework-audit.md',
  'workflow/topics.json',
  'ontology/operations.json',
  'ontology/relations.json',
  'ontology/tags.json',
  'ontology/legacy-operations.json',
  'recipes/index.json',
  'src/content.config.ts',
  'src/content/topics/.gitkeep',
  'src/lib/workflow.ts',
  'src/lib/operations.ts',
  'src/lib/paths.ts',
  'src/layouts/BaseLayout.astro',
  'src/pages/index.astro',
  'src/pages/404.astro',
  'src/pages/operations/index.astro',
  'src/pages/operations/[slug].astro',
  'src/pages/recipes/index.astro',
  'src/pages/recipes/[slug].astro',
  'src/pages/framework/index.astro',
  'src/pages/framework/[slug].astro',
  'src/styles/global.css',
  'scripts/validate-workflow.mjs',
  'scripts/validate-operations.mjs',
  'scripts/validate-public-site.mjs',
  'scripts/validate-base-paths.mjs',
  'scripts/smoke-browser.mjs',
  '.github/workflows/validate.yml',
  '.github/workflows/deploy.yml',
];
const retiredFiles = [
  'src/components/EvidenceLadder.astro',
  'src/components/StageRail.astro',
  'src/components/WorkflowExplorer.astro',
  'src/data/branches.ts',
  'src/data/operations.json',
  'src/data/stages.json',
  'src/types.ts',
  'src/pages/workflow.astro',
  'src/pages/evidence.astro',
  'src/pages/registry.astro',
  'src/pages/branches/index.astro',
  'src/pages/branches/[id].astro',
  'src/pages/stages/[id].astro',
  'src/pages/data/operations.json.ts',
];

async function exists(url) {
  try { await access(url); return true; } catch { return false; }
}

for (const file of requiredFiles) if (!await exists(new URL(file, root))) errors.push(`missing required file: ${file}`);
for (const file of retiredFiles) if (await exists(new URL(file, root))) errors.push(`retired architecture file remains: ${file}`);

async function walk(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', '.astro'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path)); else paths.push(path);
  }
  return paths;
}

const textExtensions = new Set(['.md', '.astro', '.ts', '.json', '.mjs', '.css', '.yml']);
const prohibitedMaterial = [
  [/BEGIN (?:OPENSSH|RSA|EC) PRIVATE KEY/, 'private key material'],
  [/gh[opsu]_[A-Za-z0-9]{20,}/, 'GitHub token-like material'],
  [/github_pat_[A-Za-z0-9_]{20,}/, 'GitHub token-like material'],
];
for (const path of await walk(rootPath)) {
  if (path === validatorPath || !textExtensions.has(extname(path))) continue;
  const body = await readFile(path, 'utf8');
  for (const [pattern, label] of prohibitedMaterial) if (pattern.test(body)) errors.push(`${path}: ${label}`);
}

for (const path of await walk(sourcePath)) {
  if (!['.md', '.astro', '.ts', '.css'].includes(extname(path))) continue;
  const body = await readFile(path, 'utf8');
  if (/[\u3400-\u9fff]/u.test(body)) errors.push(`${path}: public source contains CJK text`);
}

const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const topicSlugs = workflow.sections.flatMap((section) => section.groups.flatMap((group) => group.topics.map((topic) => topic.slug)));

const home = await readFile(new URL('src/pages/index.astro', root), 'utf8');
const intro = home.match(/<p class="home-intro">([\s\S]*?)<\/p>/)?.[1] ?? '';
const wordCount = (intro.replace(/<[^>]+>/g, ' ').match(/[A-Za-z]+(?:[-–][A-Za-z]+)*/g) ?? []).length;
if (wordCount < 80 || wordCount > 170) errors.push(`home introduction must contain 80–170 English words, found ${wordCount}`);
if (/24 typed core|former 35 chapter URLs|operations\.length/.test(home)) errors.push('home must not advertise a numbered operation taxonomy');
if (!home.includes("import { workflowSections } from '../lib/workflow'")) errors.push('home must read A–E sections from the workflow registry helper');
if (!home.includes('workflowSections.map')) errors.push('home must render the workflow map from workflowSections');

const directory = await readFile(new URL('src/pages/operations/index.astro', root), 'utf8');
if (!directory.includes("import { workflowSections } from '../../lib/workflow'")) errors.push('workflow directory must import workflowSections');
if (!directory.includes('workflowSections.map')) errors.push('workflow directory must be registry-driven');
for (const title of topicSlugs) if (directory.includes(`>${title}<`)) errors.push(`workflow directory must not hard-code topic slug ${title}`);

const layout = await readFile(new URL('src/layouts/BaseLayout.astro', root), 'utf8');
const navigationBlock = layout.match(/const navigation = \[([\s\S]*?)\] as const/)?.[1] ?? '';
const navigationLabels = [...navigationBlock.matchAll(/label: '([^']+)'/g)].map((match) => match[1]);
if (JSON.stringify(navigationLabels) !== JSON.stringify(['Home', 'Operations', 'Workflow Recipes', 'Framework', 'Tools'])) errors.push(`primary navigation mismatch: ${JSON.stringify(navigationLabels)}`);

function frontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  return Object.fromEntries(match[1].split('\n').filter(Boolean).map((line) => {
    const [key, ...value] = line.split(':');
    return [key.trim(), value.join(':').trim().replace(/^['"]|['"]$/g, '')];
  }));
}

async function readNarratives(directory) {
  const names = (await readdir(new URL(directory, root))).filter((name) => name.endsWith('.md')).sort();
  return Promise.all(names.map(async (name) => ({ name, data: frontmatter(await readFile(new URL(`${directory}${name}`, root), 'utf8')) })));
}

const operations = JSON.parse(await readFile(new URL('ontology/operations.json', root), 'utf8')).operations;
const recipes = JSON.parse(await readFile(new URL('recipes/index.json', root), 'utf8')).recipes;
const coreNarratives = await readNarratives('src/content/core-operations/');
const recipeNarratives = await readNarratives('src/content/recipes/');
const frameworkNarratives = await readNarratives('src/content/framework/');
const topicNarratives = await readNarratives('src/content/topics/');
const expectedCoreIds = operations.map((operation) => operation.id).sort();
const expectedCoreFiles = operations.map((operation) => `${operation.slug}.md`).sort();
const expectedRecipeSlugs = recipes.map((recipe) => recipe.slug).sort();
const expectedRecipeFiles = expectedRecipeSlugs.map((slug) => `${slug}.md`);
const expectedFramework = ['workflow-model', 'lifecycle-and-operation-map', 'relations-and-feedback-loops', 'tags-and-methods', 'evidence-provenance-and-reproducibility'];
const prohibitedAuthorityFields = new Set(['title', 'lifecycle', 'definition', 'inputs', 'outputs', 'dependencies', 'alternatives', 'exclusions', 'operations', 'system_types', 'scientific_targets', 'methods']);

if (JSON.stringify(coreNarratives.map((entry) => entry.name)) !== JSON.stringify(expectedCoreFiles)) errors.push('transitional narrative filenames do not match transitional source slugs');
if (JSON.stringify(coreNarratives.map((entry) => entry.data.operation_id).sort()) !== JSON.stringify(expectedCoreIds)) errors.push('transitional narratives do not bind the current migration source exactly once');
if (JSON.stringify(recipeNarratives.map((entry) => entry.name)) !== JSON.stringify(expectedRecipeFiles)) errors.push('transitional recipe filenames do not match recipe slugs');
if (JSON.stringify(recipeNarratives.map((entry) => entry.data.recipe_slug).sort()) !== JSON.stringify(expectedRecipeSlugs)) errors.push('transitional recipe narratives do not bind the current recipe source exactly once');
if (JSON.stringify(frameworkNarratives.map((entry) => entry.data.slug).sort()) !== JSON.stringify([...expectedFramework].sort())) errors.push('framework narratives must bind the current framework routes exactly once');
for (const entry of [...coreNarratives, ...recipeNarratives]) {
  for (const key of Object.keys(entry.data)) if (prohibitedAuthorityFields.has(key)) errors.push(`${entry.name}: narrative frontmatter duplicates migration-source field ${key}`);
  if (!['scaffold', 'draft', 'reviewed'].includes(entry.data.status)) errors.push(`${entry.name}: invalid internal status`);
}
for (const entry of frameworkNarratives) if (!['scaffold', 'draft', 'reviewed'].includes(entry.data.status)) errors.push(`${entry.name}: invalid framework status`);

const topicNarrativeSlugs = topicNarratives.map((entry) => entry.data.topic_slug);
if (new Set(topicNarrativeSlugs).size !== topicNarrativeSlugs.length) errors.push('topic narratives must use unique topic_slug bindings');
for (const entry of topicNarratives) {
  if (!topicSlugs.includes(entry.data.topic_slug)) errors.push(`${entry.name}: topic_slug does not resolve in workflow/topics.json`);
  if (!['draft', 'reviewed'].includes(entry.data.status)) errors.push(`${entry.name}: invalid topic status`);
  for (const key of Object.keys(entry.data)) if (!['topic_slug', 'status'].includes(key)) errors.push(`${entry.name}: topic frontmatter may contain only topic_slug and status`);
}

const operationPage = await readFile(new URL('src/pages/operations/[slug].astro', root), 'utf8');
const recipePage = await readFile(new URL('src/pages/recipes/[slug].astro', root), 'utf8');
const frameworkPage = await readFile(new URL('src/pages/framework/[slug].astro', root), 'utf8');
const mechanicalPatterns = [
  /operation-contract/,
  /<dt>Inputs<\/dt>/,
  /<dt>Outputs<\/dt>/,
  /<dt>Requirement<\/dt>/,
  /<dt>Repeatability<\/dt>/,
  /<dt>Dependencies<\/dt>/,
  /Alternative implementations/,
  /<dt>Exclusions<\/dt>/,
  /Detailed content/,
];
for (const [name, source] of [['workflow topic page', operationPage], ['recipe page', recipePage], ['framework page', frameworkPage]]) {
  for (const pattern of mechanicalPatterns) if (pattern.test(source)) errors.push(`${name} restores fixed page contract ${pattern}`);
}
if (!operationPage.includes("getCollection('topics')")) errors.push('workflow topic route must support optional topic narratives');
if (!operationPage.includes('getWorkflowTopics()')) errors.push('workflow topic routes must be generated from the A–E registry');
if (/data-previous|data-next/.test(operationPage)) errors.push('transitional numbered routes must not expose previous/next adjacency');

const componentDirectory = new URL('src/components/', root);
if (await exists(componentDirectory)) {
  const componentFiles = await readdir(componentDirectory);
  if (componentFiles.length > 0) errors.push(`unreferenced component files remain: ${componentFiles.join(', ')}`);
}

const css = await readFile(new URL('src/styles/global.css', root), 'utf8');
const astroSources = (await walk(sourcePath)).filter((path) => path.endsWith('.astro'));
const astroBody = (await Promise.all(astroSources.map((path) => readFile(path, 'utf8')))).join('\n');
const cssClasses = [...new Set([...css.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((match) => match[1]))];
for (const className of cssClasses) if (!new RegExp(`\\b${className}\\b`).test(astroBody)) errors.push(`unused CSS class: ${className}`);

const architecture = await readFile(new URL('docs/architecture.md', root), 'utf8');
for (const statement of ['researcher-scale tasks', 'D · Target Calculations', 'Natural topic organization', 'Migration compatibility', 'Talos handoff']) {
  if (!architecture.includes(statement)) errors.push(`architecture is missing required statement: ${statement}`);
}
const writingPolicy = await readFile(new URL('docs/content-contract.md', root), 'utf8');
if (!writingPolicy.includes('There is no mandatory heading set')) errors.push('writing policy does not reject a mandatory heading set');
if (!writingPolicy.includes('Review does not require identical section names')) errors.push('writing policy does not protect natural organization during review');

if (errors.length > 0) {
  console.error(`Content validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Content policy valid: registry-driven A–E workflow, optional natural topic narratives, transitional route integrity, English source, Home copy ${wordCount} words, and no unused component classes.`);

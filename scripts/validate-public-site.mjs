import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const distPath = new URL('dist/', root).pathname;
const base = '/DFT-Research-Workflow/';
const errors = [];
const workflowDocument = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const operationsDocument = JSON.parse(await readFile(new URL('ontology/operations.json', root), 'utf8'));
const legacyDocument = JSON.parse(await readFile(new URL('ontology/legacy-operations.json', root), 'utf8'));
const recipesDocument = JSON.parse(await readFile(new URL('recipes/index.json', root), 'utf8'));
const workflowTopics = workflowDocument.sections.flatMap((section) =>
  section.groups.flatMap((group) => group.topics.map((topic) => ({ ...topic, section: section.id, group: group.id }))),
);
const topicSlugs = workflowTopics.map((topic) => topic.slug);
const transitionalOperations = operationsDocument.operations;
const legacyOperations = legacyDocument.entries;
const transitionalSlugs = transitionalOperations.map((operation) => operation.slug);
const legacySlugs = legacyOperations.map((operation) => operation.slug);
const recipes = recipesDocument.recipes;
const recipeSlugs = recipes.map((recipe) => recipe.slug);
const frameworkSlugs = ['workflow-model', 'lifecycle-and-operation-map', 'relations-and-feedback-loops', 'tags-and-methods', 'evidence-provenance-and-reproducibility'];
const prohibitedText = [
  'View contract',
  'Operation registry',
  'Automation maturity',
  'Candidate automation',
  'Claim ledger',
  '查看契约',
  '验证门',
];
const retiredPaths = ['workflow', 'branches', 'evidence', 'registry', 'stages'];

async function walk(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path)); else paths.push(path);
  }
  return paths;
}

function stripMarkup(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function outputPath(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === base) return join(distPath, 'index.html');
  if (!clean.startsWith(base)) return null;
  const relative = clean.slice(base.length);
  return clean.endsWith('/') ? join(distPath, relative, 'index.html') : join(distPath, relative);
}

const htmlFiles = (await walk(distPath)).filter((path) => path.endsWith('.html'));
const expectedHtmlCount = 4 + topicSlugs.length + transitionalSlugs.length + legacySlugs.length + recipeSlugs.length + frameworkSlugs.length + 1;
if (htmlFiles.length !== expectedHtmlCount) errors.push(`generated HTML route set mismatch: expected ${expectedHtmlCount}, found ${htmlFiles.length}`);

const htmlByPath = new Map();
for (const path of htmlFiles) {
  const html = await readFile(path, 'utf8');
  htmlByPath.set(path, html);
  const text = stripMarkup(html);
  if (!/<html lang="en">/.test(html)) errors.push(`${path}: html language must be English`);
  if (/[\u3400-\u9fff]/u.test(text)) errors.push(`${path}: public HTML contains CJK text`);
  if (/<script(?:\s|>)/i.test(html)) errors.push(`${path}: client-side script is not allowed`);
  if (/class="operation-contract"/.test(html)) errors.push(`${path}: fixed operation contract is not allowed`);
  for (const phrase of prohibitedText) if (text.toLowerCase().includes(phrase.toLowerCase())) errors.push(`${path}: prohibited public phrase ${JSON.stringify(phrase)}`);
  for (const href of [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1])) {
    if (/^(?:https?:|mailto:|#)/.test(href)) continue;
    if (!href.startsWith(base)) {
      errors.push(`${path}: internal link misses project base: ${href}`);
      continue;
    }
    const target = outputPath(href);
    if (target) {
      try { await access(target); } catch { errors.push(`${path}: broken internal link ${href}`); }
    }
  }
}

for (const retired of retiredPaths) {
  try {
    await access(join(distPath, retired));
    errors.push(`retired public path was generated: /${retired}/`);
  } catch {}
}

const home = htmlByPath.get(join(distPath, 'index.html')) ?? '';
const homeText = stripMarkup(home);
const homeNav = home.match(/<nav class="primary-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
const navLabels = [...homeNav.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map((match) => match[1].trim());
if (JSON.stringify(navLabels) !== JSON.stringify(['Home', 'Operations', 'Workflow Recipes', 'Framework'])) errors.push(`generated primary navigation mismatch: ${JSON.stringify(navLabels)}`);
for (const section of workflowDocument.sections) if (!homeText.includes(`${section.id} · ${section.title}`)) errors.push(`Home is missing ${section.id} · ${section.title}`);
if (/24 typed core operations|former 35 chapter URLs/.test(homeText)) errors.push('Home advertises a superseded numbered taxonomy');

const operationsDirectory = htmlByPath.get(join(distPath, 'operations', 'index.html')) ?? '';
const operationsText = stripMarkup(operationsDirectory);
for (const section of workflowDocument.sections) if (!operationsText.includes(`${section.id} · ${section.title}`)) errors.push(`Research Workflow directory is missing ${section.id} · ${section.title}`);
for (const section of workflowDocument.sections) {
  for (const group of section.groups) {
    if (section.id === 'D' && !operationsText.includes(`${group.id} · ${group.title}`)) errors.push(`Research Workflow directory is missing ${group.id} · ${group.title}`);
  }
}
if (/Core Operations|O01|O24|Operation 00/.test(operationsText)) errors.push('Research Workflow directory exposes a superseded numbered framework');
if (/\/operations\/o\d{2}-/.test(operationsDirectory)) errors.push('Research Workflow directory links transitional O routes as the current sequence');

const directoryTopicLinks = [...operationsDirectory.matchAll(new RegExp(`href="${base.replaceAll('/', '\\/')}operations\/([a-z0-9-]+)\/"`, 'g'))].map((match) => match[1]);
if (JSON.stringify(directoryTopicLinks) !== JSON.stringify(topicSlugs)) errors.push('Research Workflow directory topic links do not match workflow/topics.json order');

for (const topic of workflowTopics) {
  const path = join(distPath, 'operations', topic.slug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  const text = stripMarkup(html);
  if (!html) {
    errors.push(`missing A–E topic route: ${topic.slug}`);
    continue;
  }
  if (!text.includes(topic.title)) errors.push(`${topic.slug}: topic title mismatch`);
  if (!text.includes(`${topic.group} ·`)) errors.push(`${topic.slug}: topic group label missing`);
  if (text.includes('Transitional route')) errors.push(`${topic.slug}: current topic is rendered as a transitional route`);
  if (/Inputs|Outputs|Requirement|Repeatability|Alternative implementations|Exclusions/.test(text)) errors.push(`${topic.slug}: topic restores a fixed page contract`);
}

const recipesDirectory = htmlByPath.get(join(distPath, 'recipes', 'index.html')) ?? '';
for (const recipe of recipes) {
  const path = join(distPath, 'recipes', recipe.slug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  const text = stripMarkup(html);
  if (!html) errors.push(`missing generated recipe route: ${recipe.slug}`);
  if (!recipesDirectory.includes(`${base}recipes/${recipe.slug}/`)) errors.push(`recipes directory is missing ${recipe.slug}`);
  if (!text.includes(recipe.title)) errors.push(`${recipe.slug}: recipe title mismatch`);
  if (!text.includes('not an atomic operation or a universal execution sequence')) errors.push(`${recipe.slug}: missing research-workflow boundary`);
  if (/System tags|Target tags|Method tags|Operation coverage/.test(text)) errors.push(`${recipe.slug}: recipe restores a fixed metadata contract`);
}

const frameworkDirectory = htmlByPath.get(join(distPath, 'framework', 'index.html')) ?? '';
for (const slug of frameworkSlugs) {
  const path = join(distPath, 'framework', slug, 'index.html');
  if (!htmlByPath.has(path)) errors.push(`missing generated framework route: ${slug}`);
  if (!frameworkDirectory.includes(`${base}framework/${slug}/`)) errors.push(`framework directory is missing ${slug}`);
}

const migrationNotice = 'This URL is retained while useful material is migrated into the A–E workflow.';
for (const operation of transitionalOperations) {
  const path = join(distPath, 'operations', operation.slug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  if (!html) {
    errors.push(`missing transitional route: ${operation.slug}`);
    continue;
  }
  const text = stripMarkup(html);
  if (!text.includes(migrationNotice)) errors.push(`${operation.slug}: missing migration notice`);
  if (text.includes(`Core operation ${operation.id}`)) errors.push(`${operation.slug}: exposes superseded core identifier`);
  if (html.includes('data-previous') || html.includes('data-next')) errors.push(`${operation.slug}: transitional page participates in numbered adjacency`);
}

for (const legacy of legacyOperations) {
  const path = join(distPath, 'operations', legacy.slug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  if (!html) {
    errors.push(`missing legacy route: ${legacy.slug}`);
    continue;
  }
  const text = stripMarkup(html);
  if (!text.includes(migrationNotice)) errors.push(`${legacy.slug}: missing migration notice`);
  if (html.includes('data-previous') || html.includes('data-next')) errors.push(`${legacy.slug}: migration page participates in numbered adjacency`);
  if (html.includes('legacy-mapping')) errors.push(`${legacy.slug}: migration page exposes the old mapping taxonomy`);
}

if (!htmlByPath.has(join(distPath, '404.html'))) errors.push('custom English 404 page was not generated');

if (errors.length > 0) {
  console.error(`Generated-site validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Generated site valid: registry-driven A–E directory, stable topic routes, natural article layouts, research workflows, framework pages, and migration-safe old URLs.');

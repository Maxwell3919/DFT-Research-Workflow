import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const distPath = new URL('dist/', root).pathname;
const base = '/DFT-Research-Workflow/';
const errors = [];
const operationsDocument = JSON.parse(await readFile(new URL('ontology/operations.json', root), 'utf8'));
const legacyDocument = JSON.parse(await readFile(new URL('ontology/legacy-operations.json', root), 'utf8'));
const coreOperations = operationsDocument.operations;
const legacyOperations = legacyDocument.entries;
const coreSlugs = coreOperations.map((operation) => operation.slug);
const legacySlugs = legacyOperations.map((operation) => operation.slug);
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
const expectedHtmlCount = 2 + coreSlugs.length + legacySlugs.length + 1;
if (htmlFiles.length !== expectedHtmlCount) {
  errors.push(`expected ${expectedHtmlCount} generated HTML files (Home, Operations, 24 core, 35 legacy, 404), found ${htmlFiles.length}`);
}

const htmlByPath = new Map();
for (const path of htmlFiles) {
  const html = await readFile(path, 'utf8');
  htmlByPath.set(path, html);
  const text = stripMarkup(html);
  if (!/<html lang="en">/.test(html)) errors.push(`${path}: html language must be English`);
  if (/[\u3400-\u9fff]/u.test(text)) errors.push(`${path}: public HTML contains CJK text`);
  if (/<script(?:\s|>)/i.test(html)) errors.push(`${path}: client-side script is not allowed`);
  for (const phrase of prohibitedText) {
    if (text.toLowerCase().includes(phrase.toLowerCase())) errors.push(`${path}: prohibited public phrase ${JSON.stringify(phrase)}`);
  }
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
const homeNav = home.match(/<nav class="primary-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
const navLabels = [...homeNav.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map((match) => match[1].trim());
if (JSON.stringify(navLabels) !== JSON.stringify(['Home', 'Operations'])) {
  errors.push(`generated primary navigation mismatch: ${JSON.stringify(navLabels)}`);
}
if (!stripMarkup(home).includes('24 typed core operations')) errors.push('Home does not identify the 24-operation authority');
if (!stripMarkup(home).includes('former 35 chapter URLs')) errors.push('Home does not state the legacy compatibility boundary');

const directoryPath = join(distPath, 'operations', 'index.html');
const directory = htmlByPath.get(directoryPath) ?? '';
const directoryHrefs = [...directory.matchAll(/href="([^"]*\/operations\/o\d{2}-[^"]+\/?)"/g)].map((match) => match[1]);
const expectedHrefs = coreSlugs.map((slug) => `${base}operations/${slug}/`);
if (JSON.stringify(directoryHrefs) !== JSON.stringify(expectedHrefs)) {
  errors.push('Core Operations directory must contain all 24 core links in O01–O24 order');
}
for (const heading of [
  'Source and Identity',
  'Model Preparation',
  'Protocol Design',
  'Computation',
  'Analysis and Comparison',
  'Evidence and Claim',
  'Preservation',
]) {
  if (!directory.includes(heading)) errors.push(`Core Operations directory is missing lifecycle heading ${heading}`);
}

for (let index = 0; index < coreOperations.length; index += 1) {
  const operation = coreOperations[index];
  const path = join(distPath, 'operations', operation.slug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  if (!html) {
    errors.push(`missing generated core-operation route: ${operation.slug}`);
    continue;
  }
  const text = stripMarkup(html);
  if (!text.includes(`Core operation ${operation.id}`)) errors.push(`${operation.slug}: missing core-operation label`);
  if (!text.includes(operation.definition)) errors.push(`${operation.slug}: definition mismatch`);
  const previousCount = (html.match(/data-previous/g) ?? []).length;
  const nextCount = (html.match(/data-next/g) ?? []).length;
  if (previousCount !== (index === 0 ? 0 : 1)) errors.push(`${operation.slug}: previous link boundary mismatch`);
  if (nextCount !== (index === coreOperations.length - 1 ? 0 : 1)) errors.push(`${operation.slug}: next link boundary mismatch`);
  if (index > 0 && !html.includes(`${base}operations/${coreOperations[index - 1].slug}/`)) errors.push(`${operation.slug}: previous href mismatch`);
  if (index < coreOperations.length - 1 && !html.includes(`${base}operations/${coreOperations[index + 1].slug}/`)) errors.push(`${operation.slug}: next href mismatch`);
}

for (const legacy of legacyOperations) {
  const path = join(distPath, 'operations', legacy.slug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  if (!html) {
    errors.push(`missing generated legacy route: ${legacy.slug}`);
    continue;
  }
  const text = stripMarkup(html);
  if (!text.includes('Legacy route retained for compatibility.')) errors.push(`${legacy.slug}: missing compatibility notice`);
  if (html.includes('data-previous') || html.includes('data-next')) errors.push(`${legacy.slug}: legacy page must not participate in core adjacency`);
  for (const operationId of legacy.maps_to) {
    const mapped = coreOperations.find((operation) => operation.id === operationId);
    if (!mapped || !html.includes(`${base}operations/${mapped.slug}/`)) errors.push(`${legacy.slug}: missing mapped link ${operationId}`);
  }
}

if (!htmlByPath.has(join(distPath, '404.html'))) errors.push('custom English 404 page was not generated');

if (errors.length > 0) {
  console.error(`Generated-site validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Generated site valid: ${expectedHtmlCount} English no-JS pages, 24 core routes with adjacency, 35 legacy mappings, base-safe links, and no retired public paths.`);

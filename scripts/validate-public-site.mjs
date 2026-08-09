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
const toolsDocument = JSON.parse(await readFile(new URL('workflow/tools.json', root), 'utf8'));
const practicalEvidence = JSON.parse(await readFile(new URL('workflow/practical-evidence.json', root), 'utf8'));
const workflowTopics = workflowDocument.sections.flatMap((section) =>
  section.groups.flatMap((group) => group.topics.map((topic) => ({ ...topic, section: section.id, group: group.id }))),
);
const topicSlugs = workflowTopics.map((topic) => topic.slug);
const transitionalOperations = operationsDocument.operations;
const legacyOperations = legacyDocument.entries;
const transitionalSlugs = transitionalOperations.map((operation) => operation.slug);
const legacySlugs = legacyOperations.map((operation) => operation.slug);
const recipes = recipesDocument.legacy_recipe_redirects;
const recipeSlugs = recipes.map((recipe) => recipe.slug);
const workedWorkflows = recipesDocument.workflows;
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
const retiredPracticalRedirects = [
  ['operations/electron-phonon-coupling/guides/check-epc-channel-ledger', 'operations/electron-phonon-coupling/'],
  ['operations/conventional-superconductivity/guides/check-superconductivity-moment-ledger', 'operations/conventional-superconductivity/'],
  ['operations/lattice-thermal-transport/guides/check-lattice-transport-tensor-ledger', 'operations/lattice-thermal-transport/'],
  ['operations/anharmonic-phonons/guides/check-anharmonic-linewidth-ledger', 'operations/anharmonic-phonons/'],
  ['operations/independent-particle-optical-properties/examples/check-optical-spectrum-comparison-ledger', 'operations/independent-particle-optical-properties/'],
  ['operations/time-dependent-response-and-spectroscopy/examples/check-time-dependent-response-ledger', 'operations/time-dependent-response-and-spectroscopy/'],
  ['operations/quasiparticle-corrections/examples/check-quasiparticle-comparison-ledger', 'operations/quasiparticle-corrections/'],
  ['operations/ab-initio-molecular-dynamics/examples/check-aimd-segment-ledger', 'operations/ab-initio-molecular-dynamics/'],
  ['operations/finite-temperature-structural-sampling/examples/check-structural-sampling-window-overlap', 'operations/finite-temperature-structural-sampling/'],
  ['operations/reaction-paths-and-transition-states/examples/check-reaction-path-barrier-ledger', 'operations/reaction-paths-and-transition-states/'],
  ['operations/diffusion-barriers/examples/check-diffusion-network-ledger', 'operations/diffusion-barriers/'],
  ['operations/electrostatic-potential-and-band-alignment/guides/assemble-a-potential-lineup', 'operations/electrostatic-potential-and-band-alignment/'],
  ['operations/chemical-bonding-analysis/guides/integrate-a-declared-cohp-energy-window', 'operations/chemical-bonding-analysis/'],
  ['operations/magnetic-configuration-and-ground-state-comparison/guides/compare-enumerated-magnetic-candidates', 'operations/magnetic-configuration-and-ground-state-comparison/'],
];

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split('\n')) {
    const scalar = line.match(/^([a-z_]+):\s*(.+)$/);
    if (scalar) data[scalar[1]] = scalar[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return data;
}

const practicalDirectory = new URL('src/content/practical-guides/', root);
const practicalFiles = (await readdir(practicalDirectory)).filter((name) => name.endsWith('.md')).sort();
const practicalGuides = [];
const practicalSegments = {
  implementation: 'guides',
  'worked-example': 'examples',
  'visual-note': 'notes',
};
for (const file of practicalFiles) {
  const source = await readFile(new URL(`src/content/practical-guides/${file}`, root), 'utf8');
  const data = parseFrontmatter(source);
  practicalGuides.push({
    ...data,
    segment: practicalSegments[data.kind],
  });
}

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
const expectedHtmlCount = 4 + topicSlugs.length + transitionalSlugs.length + legacySlugs.length + recipeSlugs.length + frameworkSlugs.length + practicalGuides.length + toolsDocument.tools.length + 2 + workedWorkflows.length + 1 + retiredPracticalRedirects.length;
if (htmlFiles.length !== expectedHtmlCount) errors.push(`generated HTML route set mismatch: expected ${expectedHtmlCount}, found ${htmlFiles.length}`);

const htmlByPath = new Map();
for (const path of htmlFiles) {
  const html = await readFile(path, 'utf8');
  htmlByPath.set(path, html);
  const text = stripMarkup(html);
  const isStaticRedirect = /<meta http-equiv="refresh"/i.test(html);
  if (!isStaticRedirect && !/<html lang="en">/.test(html)) errors.push(`${path}: html language must be English`);
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
  for (const src of [...html.matchAll(/(?:src|poster)="([^"]+)"/g)].map((match) => match[1])) {
    if (/^(?:https?:|data:)/.test(src)) continue;
    if (!src.startsWith(base)) {
      errors.push(`${path}: media path misses project base: ${src}`);
      continue;
    }
    const target = outputPath(src);
    if (target) {
      try { await access(target); } catch { errors.push(`${path}: broken media path ${src}`); }
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
if (JSON.stringify(navLabels) !== JSON.stringify(['Home', 'Research Workflow', 'Worked Workflows', 'Tools'])) errors.push(`generated primary navigation mismatch: ${JSON.stringify(navLabels)}`);
for (const phrase of ['Scientific Question', 'Required Observable', 'Supported Scientific Conclusion', 'This is a dependency map, not a one-way pipeline.', 'Numerical convergence loop', 'Electronic self-consistency']) {
  if (!homeText.includes(phrase)) errors.push(`Home is missing ${phrase}`);
}
for (const section of workflowDocument.sections) if (!home.includes(`aria-label="${section.id}, ${section.title}"`)) errors.push(`Home is missing ${section.id}, ${section.title}`);
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

const practicalParentPaths = new Set();
for (const guide of practicalGuides) {
  if (!guide.segment) {
    errors.push(`${guide.guide_slug}: invalid practical kind ${guide.kind}`);
    continue;
  }
  const path = join(distPath, 'operations', guide.topic_slug, guide.segment, guide.guide_slug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  const text = stripMarkup(html);
  if (!html) {
    errors.push(`missing practical route: ${guide.guide_slug}`);
    continue;
  }
  if (!text.includes(guide.title)) errors.push(`${guide.guide_slug}: practical title mismatch`);
  if (!text.includes('Execution checks confirm only the bounded software or analysis assertions made by this page.')) {
    errors.push(`${guide.guide_slug}: missing execution evidence boundary`);
  }
  if (!html.includes('class="guide-meta"')) errors.push(`${guide.guide_slug}: missing guide metadata`);
  const evidenceRecord = practicalEvidence.guides.find((record) => record.guide_slug === guide.guide_slug);
  if ((evidenceRecord?.media_ids?.length ?? 0) > 0 && !html.includes('class="guide-media"')) errors.push(`${guide.guide_slug}: missing declared media`);
  if (evidenceRecord?.evidence_class === 'real-execution') {
    if (!evidenceRecord.case_id || !text.includes('Evidence scope.') || !text.includes(evidenceRecord.case_id)) {
      errors.push(`${guide.guide_slug}: real-execution page is not visibly bound to its terminal-first case`);
    }
    if (!text.includes('Claim ceiling.')) errors.push(`${guide.guide_slug}: natural-language claim ceiling is not rendered`);
  }
  const parentHref = `${base}operations/${guide.topic_slug}/`;
  if (!html.includes(parentHref)) errors.push(`${guide.guide_slug}: missing parent-topic link`);
  practicalParentPaths.add(guide.topic_slug);
}

for (const parentSlug of practicalParentPaths) {
  const path = join(distPath, 'operations', parentSlug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  const text = stripMarkup(html);
  if (!text.includes('Practical resources')) errors.push(`${parentSlug}: missing practical resource section`);
  const childGuides = practicalGuides.filter((guide) => guide.topic_slug === parentSlug);
  for (const guide of childGuides) {
    const href = `${base}operations/${guide.topic_slug}/${guide.segment}/${guide.guide_slug}/`;
    if (!html.includes(href)) errors.push(`${parentSlug}: missing practical child link ${guide.guide_slug}`);
  }
}

const recipesDirectory = htmlByPath.get(join(distPath, 'recipes', 'index.html')) ?? '';
for (const recipe of recipes) {
  const path = join(distPath, 'recipes', recipe.slug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  if (!html) errors.push(`missing generated recipe route: ${recipe.slug}`);
  if (!html.includes(`${base}workflows/`)) errors.push(`${recipe.slug}: legacy recipe does not point to Worked Workflows`);
}
if (!recipesDirectory.includes('Worked Workflows')) errors.push('recipes directory is not a migration surface to Worked Workflows');

const workflowDirectory = htmlByPath.get(join(distPath, 'workflows', 'index.html')) ?? '';
for (const workflow of workedWorkflows) {
  const path = join(distPath, 'workflows', workflow.slug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  const text = stripMarkup(html);
  if (!html) errors.push(`missing Worked Workflow route: ${workflow.slug}`);
  if (!workflowDirectory.includes(`${base}workflows/${workflow.slug}/`)) errors.push(`Worked Workflows directory is missing ${workflow.slug}`);
  if (!text.includes(workflow.title)) errors.push(`${workflow.slug}: workflow title mismatch`);
  for (const phrase of ['Recorded commands and output', 'Inputs, outputs, tables, and figures', 'What this case supports', 'What this case does not support']) {
    if (!text.includes(phrase)) errors.push(`${workflow.slug}: missing terminal-first section ${phrase}`);
  }
  if (!html.includes('data:image/png;base64,')) errors.push(`${workflow.slug}: no case-derived PNG is rendered`);
  for (const phrase of ['Inputs and identity', 'Program completion', 'Electronic solver and ionic or structural checks', 'Artifacts and stage ancestry', 'Observable convergence', 'Claim boundary', 'No material-level claim is made']) {
    if (!text.includes(phrase)) errors.push(`${workflow.slug}: natural-language evidence boundary is missing ${phrase}`);
  }
  if (/\bG[0-5]\b/.test(text)) errors.push(`${workflow.slug}: exposes internal evidence gate codes`);
}

for (const [route, target] of retiredPracticalRedirects) {
  const html = htmlByPath.get(join(distPath, route, 'index.html')) ?? '';
  const targetHref = `${base}${target}`;
  if (!html) errors.push(`missing retired practical redirect: ${route}`);
  if (!html.includes(`content="0;url=${targetHref}"`) || !html.includes(`href="${targetHref}"`)) {
    errors.push(`${route}: retired practical redirect target mismatch`);
  }
}

for (const slug of frameworkSlugs) {
  const path = join(distPath, 'framework', slug, 'index.html');
  if (!htmlByPath.has(path)) errors.push(`missing generated framework route: ${slug}`);
  const text = stripMarkup(htmlByPath.get(path) ?? '');
  if (!text.includes('Moved to')) errors.push(`${slug}: framework route is not a migration surface`);
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

console.log(`Generated site valid: registry-driven A–E directory, ${practicalGuides.length} practical subpages, two terminal-first Worked Workflows, and migration-safe Framework/recipe/numbered URLs.`);

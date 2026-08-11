import { existsSync as existsForManualAcceptance, readFileSync as readFileForManualAcceptance } from 'node:fs';
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const distPath = new URL('dist/', root).pathname;
const base = '/DFT-Research-Workflow/';
const siblingPagesBases = ['/Electronic-Structure-Learning/'];
const errors = [];
const workflowDocument = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const operationsDocument = JSON.parse(await readFile(new URL('ontology/operations.json', root), 'utf8'));
const legacyDocument = JSON.parse(await readFile(new URL('ontology/legacy-operations.json', root), 'utf8'));
const recipesDocument = JSON.parse(await readFile(new URL('recipes/index.json', root), 'utf8'));
const toolsDocument = JSON.parse(await readFile(new URL('workflow/tools.json', root), 'utf8'));
const practicalEvidence = JSON.parse(await readFile(new URL('workflow/practical-evidence.json', root), 'utf8'));
const workflowTopics = workflowDocument.sections.flatMap((section) =>
  section.groups.flatMap((group) => group.topics.map((topic) => ({
    ...topic,
    section: section.id,
    sectionTitle: section.title,
    group: group.id,
    groupTitle: group.title,
  }))),
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
const resourceLandscapeResources = toolsDocument.resources;
const expectedNonEnglishResourceTitleIds = ['whut-materials-simulation-cn'];
const nonEnglishResourceTitles = resourceLandscapeResources.filter((resource) => /[\u3400-\u9fff]/u.test(resource.name));
if (JSON.stringify(nonEnglishResourceTitles.map((resource) => resource.slug)) !== JSON.stringify(expectedNonEnglishResourceTitleIds)) {
  errors.push(`non-English resource title inventory changed: ${JSON.stringify(nonEnglishResourceTitles.map((resource) => resource.slug))}`);
}
const nonEnglishResourceTitleById = new Map(nonEnglishResourceTitles.map((resource) => [resource.slug, resource.name]));

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
    .replace(/&amp;/g, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripDeclaredNonEnglishResourceTitles(html, path) {
  let cjkAuditHtml = html;
  for (const match of html.matchAll(/<span\b[^>]*\bdata-resource-title(?:-reference)?="([^"]+)"[^>]*>[\s\S]*?<\/span>/gi)) {
    const [element, resourceId] = match;
    const title = stripMarkup(element);
    if (!/[\u3400-\u9fff]/u.test(title)) continue;
    const expectedTitle = nonEnglishResourceTitleById.get(resourceId);
    const language = element.match(/\blang="([^"]+)"/i)?.[1] ?? '';
    if (!expectedTitle || normalizedText(title) !== normalizedText(expectedTitle) || language !== 'zh-CN') {
      errors.push(`${path}: undeclared or incorrectly marked non-English resource title ${resourceId}`);
      continue;
    }
    cjkAuditHtml = cjkAuditHtml.replace(element, ' ');
  }
  return cjkAuditHtml;
}

function dataList(tag, attribute) {
  const value = tag.match(new RegExp(`\\b${attribute}="([^"]*)"`, 'i'))?.[1] ?? '';
  return value === '' ? [] : value.split(',').map((entry) => entry.trim()).filter(Boolean);
}

function normalizedText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function outputPath(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === base) return join(distPath, 'index.html');
  if (!clean.startsWith(base)) return null;
  const relative = clean.slice(base.length);
  return clean.endsWith('/') ? join(distPath, relative, 'index.html') : join(distPath, relative);
}

const htmlFiles = (await walk(distPath)).filter((path) => path.endsWith('.html'));
const supportingOperationRoutes = ['troubleshooting', 'software-bridge', 'resource-landscape'];
const standaloneSupportRoutes = ['quick-reference', 'troubleshooting'];
const expectedHtmlCount = 4 + topicSlugs.length + transitionalSlugs.length + legacySlugs.length + recipeSlugs.length + frameworkSlugs.length + practicalGuides.length + toolsDocument.resources.filter((resource) => resource.detail).length + 2 + workedWorkflows.length + 1 + retiredPracticalRedirects.length + supportingOperationRoutes.length + standaloneSupportRoutes.length;
if (htmlFiles.length !== expectedHtmlCount) errors.push(`generated HTML route set mismatch: expected ${expectedHtmlCount}, found ${htmlFiles.length}`);

const htmlByPath = new Map();
for (const path of htmlFiles) {
  const html = await readFile(path, 'utf8');
  htmlByPath.set(path, html);
  const text = stripMarkup(html);
  const cjkAuditText = stripMarkup(stripDeclaredNonEnglishResourceTitles(html, path));
  const isStaticRedirect = /<meta http-equiv="refresh"/i.test(html);
  if (!isStaticRedirect && !/<html lang="en">/.test(html)) errors.push(`${path}: html language must be English`);
  if (/[\u3400-\u9fff]/u.test(cjkAuditText)) errors.push(`${path}: public HTML contains undeclared CJK text`);
  const scripts = [...html.matchAll(/<script\b[\s\S]*?<\/script>/gi)].map((match) => match[0]);
  const validScriptBoundary = isStaticRedirect
    ? scripts.length === 0 || (scripts.length === 1 && /\bdata-copy-enhancement(?:\s|>)/i.test(scripts[0]))
    : scripts.length === 1 && /\bdata-copy-enhancement(?:\s|>)/i.test(scripts[0]);
  if (!validScriptBoundary) {
    errors.push(`${path}: only the single Copy progressive-enhancement script is allowed`);
  }
  if (/class="operation-contract"/.test(html)) errors.push(`${path}: fixed operation contract is not allowed`);
  for (const phrase of prohibitedText) if (text.toLowerCase().includes(phrase.toLowerCase())) errors.push(`${path}: prohibited public phrase ${JSON.stringify(phrase)}`);
  for (const href of [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1])) {
    if (/^(?:https?:|mailto:|#)/.test(href)) continue;
    if (siblingPagesBases.some((siblingBase) => href.startsWith(siblingBase))) continue;
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

for (const slug of supportingOperationRoutes) {
  if (!htmlByPath.has(join(distPath, 'operations', slug, 'index.html'))) {
    errors.push(`missing supporting operation route: ${slug}`);
  }
}

const expectedWorkedWorkflowSlugs = ['silicon-ground-state-electronic-structure', 'aluminium-metallic-electronic-structure'];
if (JSON.stringify(workedWorkflows.map((entry) => entry.slug)) !== JSON.stringify(expectedWorkedWorkflowSlugs)) errors.push(`Worked Workflow routes do not match the frozen Silicon/Aluminium order: ${JSON.stringify(workedWorkflows.map((entry) => entry.slug))}`);
const workflowsDirectoryHtml = htmlByPath.get(join(distPath, 'workflows', 'index.html')) ?? '';
const workflowsDirectoryText = stripMarkup(workflowsDirectoryHtml);
if (!workflowsDirectoryText.includes('Choose a case by its material and scientific question, then open it.')) errors.push('Worked Workflows directory is missing its direct first action');
if (/Exact commands, hashes, manifests, and replay records/i.test(workflowsDirectoryText)) errors.push('Worked Workflows directory exposes internal reproducibility packaging as its introduction');
for (const entry of workedWorkflows) {
  const html = htmlByPath.get(join(distPath, 'workflows', entry.slug, 'index.html')) ?? '';
  const text = stripMarkup(html);
  const routeHref = `${base}workflows/${entry.slug}/`;
  if (!html) errors.push(`${entry.slug}: built Worked Workflow route is missing`);
  if (!workflowsDirectoryHtml.includes(`href="${routeHref}"`)) errors.push(`${entry.slug}: Worked Workflows directory link is missing`);
  const routeMarkers = [...html.matchAll(/\bdata-reader-route="([^"]+)"/g)].map((match) => match[1]);
  if (JSON.stringify(routeMarkers) !== JSON.stringify([entry.slug])) errors.push(`${entry.slug}: expected exactly one matching data-reader-route marker`);
  const tags = [...html.matchAll(/<(?:li|section|article)\b[^>]*\bdata-reader-stage="[^"]+"[^>]*>/gi)].map((match) => match[0]);
  const renderedIds = tags.map((tag) => tag.match(/\bdata-reader-stage="([^"]+)"/i)?.[1]);
  const expectedStages = entry.reader_route?.stages ?? [];
  if (JSON.stringify(renderedIds) !== JSON.stringify(expectedStages.map((stage) => stage.id))) errors.push(`${entry.slug}: rendered reader_route stage order mismatch: ${JSON.stringify(renderedIds)}`);
  for (let index = 0; index < expectedStages.length; index += 1) {
    const stage = expectedStages[index];
    const tag = tags[index] ?? '';
    for (const [attribute, field] of [['data-topic-slugs', 'topic_slugs'], ['data-case-files', 'case_files'], ['data-execution-route-ids', 'execution_route_ids'], ['data-command-stages', 'command_stages'], ['data-artifact-paths', 'artifact_paths']]) {
      if (JSON.stringify(dataList(tag, attribute)) !== JSON.stringify(stage[field])) errors.push(`${entry.slug}/${stage.id}: rendered ${attribute} does not match recipes/index.json`);
    }
    for (const slug of stage.topic_slugs ?? []) if (!html.includes(`href="${base}operations/${slug}/"`)) errors.push(`${entry.slug}/${stage.id}: topic route link is missing for ${slug}`);
    for (const path of [...(stage.case_files ?? []), ...(stage.artifact_paths ?? [])]) {
      const normalizedPath = path.startsWith('examples/cases/') ? path : `${entry.start_here.case_root}/${path}`;
      const blobPattern = new RegExp(`href="https:\\/\\/github\\.com\\/Maxwell3919\\/DFT-Research-Workflow\\/blob\\/[a-f0-9]{40}\\/${normalizedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i');
      if (!blobPattern.test(html)) errors.push(`${entry.slug}/${stage.id}: exact-revision GitHub blob link is missing for ${normalizedPath}`);
    }
  }
  for (const boundary of [entry.evidence_boundary, entry.continuity_boundary, entry.claim_boundary]) if (!text.includes(normalizedText(boundary))) errors.push(`${entry.slug}: reviewed evidence/continuity/claim boundary is missing`);
  if (!html.includes(`data-history-kind="${entry.history_kind}"`)) errors.push(`${entry.slug}: rendered history_kind mismatch`);
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
if (JSON.stringify(navLabels) !== JSON.stringify(['Home', 'Research Workflow', 'Worked Workflows', 'Tools &amp; Resources', 'Troubleshooting'])) errors.push(`generated primary navigation mismatch: ${JSON.stringify(navLabels)}`);
for (const phrase of [
  'Scientific Question',
  'Required Observable',
  'Supported Scientific Conclusion',
  'Move from a question to a defensible claim',
  'Where execution evidence exists, practical guides and worked workflows identify the file to prepare',
  'SCF convergence is one inner numerical condition.',
  'Start the Research Workflow',
  'Follow a Worked Workflow',
  'Find a Tool',
]) {
  if (!homeText.includes(phrase)) errors.push(`Home is missing ${phrase}`);
}
if (home.indexOf('class="manual-entries"') > home.indexOf('class="question-chain"')) errors.push('Home must offer a direct starting action before the workflow map');
for (const section of workflowDocument.sections) {
  const escapedTitle = section.title.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  if (!home.includes(`aria-label="${section.id}, ${escapedTitle}"`)) errors.push(`Home is missing ${section.id}, ${section.title}`);
}
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

const topicListMarkup = [...operationsDirectory.matchAll(/<ul[^>]*class="[^"]*\btopic-list\b[^"]*"[^>]*>([\s\S]*?)<\/ul>/g)]
  .map((match) => match[1])
  .join('');
const directoryTopicLinks = [...topicListMarkup.matchAll(new RegExp(`href="${base.replaceAll('/', '\\/')}operations\/([a-z0-9-]+)\/"`, 'g'))].map((match) => match[1]);
if (JSON.stringify(directoryTopicLinks) !== JSON.stringify(topicSlugs)) errors.push('Research Workflow directory topic links do not match workflow/topics.json order');

const observableSelectionMarkup = operationsDirectory.match(/<section[^>]*class="[^"]*\bobservable-selection\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? '';
const observableExampleSlugs = [...observableSelectionMarkup.matchAll(new RegExp(`href="${base.replaceAll('/', '\\/')}operations\/([a-z0-9-]+)\/"`, 'g'))].map((match) => match[1]);
for (const slug of [
  'relative-and-formation-energies',
  'optimize-structure',
  'harmonic-phonons',
  'fermi-surface-and-full-brillouin-zone-analysis',
  'electron-phonon-coupling',
]) {
  if (!observableExampleSlugs.includes(slug)) errors.push(`Research Workflow observable examples are missing ${slug}`);
}

for (const topic of workflowTopics) {
  const path = join(distPath, 'operations', topic.slug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  const text = stripMarkup(html);
  if (!html) {
    errors.push(`missing A–E topic route: ${topic.slug}`);
    continue;
  }
  if (!text.includes(topic.title)) errors.push(`${topic.slug}: topic title mismatch`);
  const operationLabel = stripMarkup(html.match(/<p class="operation-label">[\s\S]*?<\/p>/)?.[0] ?? '');
  const expectedOperationLabel = topic.section === 'D'
    ? `${topic.group} · ${topic.groupTitle}`
    : `${topic.section} · ${topic.sectionTitle}`;
  if (operationLabel !== expectedOperationLabel) {
    errors.push(`${topic.slug}: expected operation label ${JSON.stringify(expectedOperationLabel)}, found ${JSON.stringify(operationLabel)}`);
  }
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
  const evidenceRecord = practicalEvidence.guides.find((record) => record.guide_slug === guide.guide_slug);
  const hasExecutionBoundary = text.includes('It tests only the bounded software or analysis behaviour described here; it does not establish numerical convergence, model validity, or a material property.');
  const hasInterfaceBoundary = evidenceRecord?.evidence_class === 'real-interface-walkthrough'
    && text.includes('This walkthrough establishes an actual browser route to a declared COD record and an actual browser viewer state for a declared expanded teaching object.');
  if (!hasExecutionBoundary && !hasInterfaceBoundary) {
    errors.push(`${guide.guide_slug}: missing execution evidence boundary`);
  }
  if (!/class="[^"]*\bguide-meta\b[^"]*"/.test(html)) errors.push(`${guide.guide_slug}: missing lightweight guide metadata`);
  if ((evidenceRecord?.media_ids?.length ?? 0) > 0 && !html.includes('class="guide-media"')) errors.push(`${guide.guide_slug}: missing declared media`);
  if (evidenceRecord?.evidence_class === 'real-execution') {
    if (evidenceRecord.case_id && (!text.includes('Open the exact case record') || !html.includes(evidenceRecord.case_id))) {
      errors.push(`${guide.guide_slug}: declared file-backed case is not available from the reproducibility note`);
    }
    if (!text.includes('does not establish numerical convergence, model validity, or a material property')) errors.push(`${guide.guide_slug}: natural-language scientific limit is not rendered`);
  }
  const parentHref = `${base}operations/${guide.topic_slug}/`;
  if (!html.includes(parentHref)) errors.push(`${guide.guide_slug}: missing parent-topic link`);
  practicalParentPaths.add(guide.topic_slug);
}

for (const parentSlug of practicalParentPaths) {
  const path = join(distPath, 'operations', parentSlug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  const text = stripMarkup(html);
  const childGuides = practicalGuides.filter((guide) => {
    const evidence = practicalEvidence.guides.find((record) => record.guide_slug === guide.guide_slug);
    return guide.topic_slug === parentSlug && evidence?.evidence_class !== 'synthetic-only';
  });
  if (childGuides.length === 0) continue;
  if (!text.includes('Practical resources')) errors.push(`${parentSlug}: missing practical resource section`);
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
  for (const phrase of ['Open the starting sources', 'Follow the calculation', 'Reproduce the exact published evidence', 'Complete artifact appendix', 'What this case supports', 'What this case does not support']) {
    if (!text.includes(phrase)) errors.push(`${workflow.slug}: missing human-first workflow section ${phrase}`);
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

const notFoundHtml = htmlByPath.get(join(distPath, '404.html')) ?? '';
if (!notFoundHtml) errors.push('custom English 404 page was not generated');
else {
  if (!notFoundHtml.includes(`href="${base}"`) || !notFoundHtml.includes(`href="${base}operations/"`)) errors.push('custom 404 page does not offer Home and Research Workflow recovery actions');
  if (stripMarkup(notFoundHtml).includes('Browse the Operations directory')) errors.push('custom 404 page uses the retired Operations-directory label');
}

// DRW_MANUAL_HANDOFF_ACCEPTANCE
{
  const possibleRoots = [
    'dist/DFT-Research-Workflow',
    'dist',
  ];
  const builtRoot = possibleRoots.find((root) =>
    existsForManualAcceptance(root + '/workflows/silicon-ground-state-electronic-structure/index.html')
  );
  if (!builtRoot) {
    errors.push('built Silicon workflow page is missing for manual acceptance');
  } else {
    const siliconHtml = readFileForManualAcceptance(
      builtRoot + '/workflows/silicon-ground-state-electronic-structure/index.html',
      'utf8'
    );
    const sourceIndex = siliconHtml.indexOf('Open the starting sources');
    const routeIndex = siliconHtml.indexOf('Follow the calculation');
    const evidenceIndex = siliconHtml.indexOf('Reproduce the exact published evidence');
    if (!(sourceIndex >= 0 && routeIndex > sourceIndex && evidenceIndex > routeIndex)) {
      errors.push('worked workflow must render starting sources, then the calculation route, then exact evidence');
    }
    for (const visibleInternal of [
      '>History kind<',
      '>Coverage:<',
      '>Evidence class<',
      '>Record kind<',
      '>Route ID<',
    ]) {
      if (siliconHtml.includes(visibleInternal)) {
        errors.push('worked workflow exposes internal label ' + visibleInternal);
      }
    }
    if (/>\s*(obtain-material-structure|test-numerical-convergence|calculate-reference-ground-state)\s*<\/a>/.test(siliconHtml)) {
      errors.push('worked workflow exposes raw topic slugs as link labels');
    }
    for (const retiredToken of ['qe_manual_handoff.py', 'prepare-reference', 'audit-scf', 'extract-runtime', 'package-study']) {
      if (siliconHtml.includes(retiredToken)) errors.push('built Silicon reader route exposes retired helper token ' + retiredToken);
    }

    const guideRoutes = [
      [
        'operations/calculate-reference-ground-state/guides/prepare-fixed-geometry-reference-calculation',
        'accepted-geometry.inc',
      ],
      [
        'operations/test-numerical-convergence/guides/converge-basis-cutoffs-and-grids',
        'convergence has been achieved',
      ],
      [
        'operations/calculate-reference-ground-state/guides/package-reusable-reference-state-lineage',
        'sha256sum',
      ],
    ];
    for (const [route, token] of guideRoutes) {
      const guidePath = builtRoot + '/' + route + '/index.html';
      if (!existsForManualAcceptance(guidePath)) {
        errors.push('built practical guide is missing: ' + route);
      } else if (!readFileForManualAcceptance(guidePath, 'utf8').includes(token)) {
        errors.push('built practical guide ' + route + ' is missing ' + token);
      }
    }
  }
}


if (errors.length > 0) {
  console.error(`Generated-site validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Generated site valid: registry-driven A–E directory, ${practicalGuides.length} practical subpages, two human-first Worked Workflows with bounded evidence appendices, and migration-safe Framework/recipe/numbered URLs.`);

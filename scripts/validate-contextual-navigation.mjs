import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const validateBuilt = process.argv.includes('--built');
const navigation = JSON.parse(await readFile(new URL('workflow/contextual-navigation.json', root), 'utf8'));
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const tools = JSON.parse(await readFile(new URL('workflow/tools.json', root), 'utf8'));
const componentSource = await readFile(new URL('src/components/ContextualLinks.astro', root), 'utf8');
const resolverSource = await readFile(new URL('src/lib/contextual-navigation.ts', root), 'utf8');
const topicRouteSource = await readFile(new URL('src/pages/operations/[slug].astro', root), 'utf8');
const practicalRouteSource = await readFile(new URL('src/pages/operations/[topic]/[category]/[slug].astro', root), 'utf8');
const toolRouteSource = await readFile(new URL('src/pages/tools/[slug].astro', root), 'utf8');
const operationsSource = await readFile(new URL('src/pages/operations/index.astro', root), 'utf8');
const troubleshootingSource = await readFile(new URL('src/pages/operations/troubleshooting.astro', root), 'utf8');
const softwareBridgeSource = await readFile(new URL('src/pages/operations/software-bridge.astro', root), 'utf8');

const topicSlugs = new Set(workflow.sections.flatMap((section) => section.groups.flatMap((group) => group.topics.map((topic) => topic.slug))));
const toolSlugs = new Set(tools.tools.map((tool) => tool.slug));
const relations = new Set(['Next', 'Target branch', 'Related check', 'If this fails', 'Use another code']);
const supportTargets = new Map([
  ['troubleshooting', new Set(['job-stops-before-completion', 'scf-does-not-converge', 'imaginary-phonon-frequencies'])],
  ['software-bridge', new Set([null])],
]);
const supportPaths = new Map([
  ['troubleshooting', 'operations/troubleshooting/'],
  ['software-bridge', 'operations/software-bridge/'],
]);
const siteBase = '/DFT-Research-Workflow/';

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function frontmatterValue(source, key) {
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)?.[1] ?? '';
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return frontmatter.match(new RegExp(`^${escapedKey}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? '';
}

const guideDirectory = new URL('src/content/practical-guides/', root);
const guideFiles = (await readdir(guideDirectory)).filter((name) => name.endsWith('.md')).sort();
const guideBySlug = new Map();
for (const file of guideFiles) {
  const source = await readFile(new URL(`src/content/practical-guides/${file}`, root), 'utf8');
  const guide = {
    guide_slug: frontmatterValue(source, 'guide_slug'),
    topic_slug: frontmatterValue(source, 'topic_slug'),
    kind: frontmatterValue(source, 'kind'),
    status: frontmatterValue(source, 'status'),
  };
  if (guideBySlug.has(guide.guide_slug)) errors.push(`${file}: duplicate guide_slug ${guide.guide_slug}`);
  guideBySlug.set(guide.guide_slug, guide);
}

function sourceKey(source) {
  if (source?.kind === 'practical') return `practical:${source.guide_slug}`;
  return `${source?.kind}:${source?.slug}`;
}

function targetKey(target) {
  if (target?.kind === 'topic') return `topic:${target.slug}`;
  return `support:${target?.route}${target?.anchor ? `#${target.anchor}` : ''}`;
}

function targetPath(target) {
  if (target.kind === 'topic') return `operations/${target.slug}/`;
  const route = supportPaths.get(target.route);
  return target.anchor ? `${route}#${target.anchor}` : route;
}

function guideRoute(guide) {
  const segment = guide.kind === 'worked-example' ? 'examples' : guide.kind === 'visual-note' ? 'notes' : 'guides';
  return `operations/${guide.topic_slug}/${segment}/${guide.guide_slug}/`;
}

function sourcePath(source) {
  if (source.kind === 'topic') return `operations/${source.slug}/`;
  if (source.kind === 'tool') return `tools/${source.slug}/`;
  const guide = guideBySlug.get(source.guide_slug);
  return guide ? guideRoute(guide) : null;
}

function exactKeys(value, allowed, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${label}: expected an object`);
    return;
  }
  for (const key of Object.keys(value)) if (!allowed.has(key)) errors.push(`${label}: unexpected key ${key}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const expected = new Map([
  ['topic:obtain-material-structure', ['Next|topic:build-or-modify-computational-model']],
  ['topic:calculate-reference-ground-state', ['Target branch|topic:fermi-surface-and-full-brillouin-zone-analysis', 'Target branch|topic:density-of-states-and-projected-density-of-states']],
  ['topic:fermi-surface-and-full-brillouin-zone-analysis', ['Related check|topic:density-of-states-and-projected-density-of-states']],
  ['topic:density-of-states-and-projected-density-of-states', ['Related check|topic:fermi-surface-and-full-brillouin-zone-analysis']],
  ['topic:harmonic-phonons', ['If this fails|support:troubleshooting#imaginary-phonon-frequencies']],
  ['practical:audit-a-qe-calculation', ['If this fails|support:troubleshooting#scf-does-not-converge', 'If this fails|support:troubleshooting#job-stops-before-completion']],
  ['practical:inspect-qe-hpc-calculations-from-the-terminal', ['If this fails|support:troubleshooting#scf-does-not-converge', 'If this fails|support:troubleshooting#job-stops-before-completion']],
  ['tool:quantum-espresso', ['Use another code|support:software-bridge']],
  ['tool:vasp', ['Use another code|support:software-bridge']],
  ['tool:abinit', ['Use another code|support:software-bridge']],
  ['tool:cp2k', ['Use another code|support:software-bridge']],
]);

exactKeys(navigation, new Set(['schema_version', 'role', 'boundary', 'pages']), 'contextual navigation');
if (navigation.schema_version !== 1) errors.push(`schema_version must be 1, found ${navigation.schema_version}`);
if (navigation.role !== 'build-time-contextual-cross-index') errors.push('role must remain build-time-contextual-cross-index');
if (!navigation.boundary?.includes('Choose only the branch required by the scientific question') || !navigation.boundary?.includes('not a new taxonomy') || !navigation.boundary?.includes('required order')) errors.push('boundary must require question-selected branches and reject a new taxonomy and required order');
if (!Array.isArray(navigation.pages) || navigation.pages.length !== expected.size) errors.push(`expected ${expected.size} contextual source pages`);

const seenSources = new Set();
for (const [pageIndex, page] of (navigation.pages ?? []).entries()) {
  exactKeys(page, new Set(['source', 'links']), `pages[${pageIndex}]`);
  const key = sourceKey(page.source);
  if (seenSources.has(key)) errors.push(`${key}: duplicate source`);
  seenSources.add(key);

  if (page.source?.kind === 'topic') {
    exactKeys(page.source, new Set(['kind', 'slug']), `${key} source`);
    if (!topicSlugs.has(page.source.slug)) errors.push(`${key}: unresolved topic source`);
  } else if (page.source?.kind === 'tool') {
    exactKeys(page.source, new Set(['kind', 'slug']), `${key} source`);
    if (!toolSlugs.has(page.source.slug)) errors.push(`${key}: unresolved tool source`);
  } else if (page.source?.kind === 'practical') {
    exactKeys(page.source, new Set(['kind', 'guide_slug']), `${key} source`);
    const guide = guideBySlug.get(page.source.guide_slug);
    if (!guide) errors.push(`${key}: unresolved practical source`);
    else if (guide.status !== 'reviewed') errors.push(`${key}: practical source is not reviewed`);
  } else {
    errors.push(`${key}: source kind must be topic, practical, or tool`);
  }

  if (!Array.isArray(page.links) || page.links.length < 1 || page.links.length > 3) errors.push(`${key}: must contain one to three links`);
  const seenTargets = new Set();
  const actualMappings = [];
  for (const [linkIndex, link] of (page.links ?? []).entries()) {
    exactKeys(link, new Set(['relation', 'title', 'target', 'note']), `${key} links[${linkIndex}]`);
    if (!relations.has(link.relation)) errors.push(`${key}: unknown relation ${link.relation}`);
    if (!nonempty(link.title) || !nonempty(link.note)) errors.push(`${key}: link title and note are required`);
    if (/https?:\/\/|(?:^|\s)\/(?:operations|tools)\//i.test(`${link.title} ${link.note}`)) errors.push(`${key}: contains a raw or external route string`);

    const target = targetKey(link.target);
    actualMappings.push(`${link.relation}|${target}`);
    if (seenTargets.has(target)) errors.push(`${key}: duplicate target ${target}`);
    seenTargets.add(target);
    if (target === key) errors.push(`${key}: self-link is not allowed`);

    if (link.target?.kind === 'topic') {
      exactKeys(link.target, new Set(['kind', 'slug']), `${key} target`);
      if (!topicSlugs.has(link.target.slug)) errors.push(`${key}: unresolved topic target ${link.target.slug}`);
    } else if (link.target?.kind === 'support') {
      exactKeys(link.target, new Set(['kind', 'route', 'anchor']), `${key} target`);
      const anchors = supportTargets.get(link.target.route);
      const anchor = link.target.anchor ?? null;
      if (!anchors || !anchors.has(anchor)) errors.push(`${key}: unsupported route or anchor ${target}`);
    } else {
      errors.push(`${key}: target kind must be topic or support`);
    }

    if (link.relation === 'If this fails' && !/preserve/i.test(link.note)) errors.push(`${key}: failure link must preserve adverse evidence before retry`);
  }

  const expectedMappings = expected.get(key);
  if (!expectedMappings) errors.push(`${key}: source is outside the bounded cross-index`);
  else if (JSON.stringify(actualMappings) !== JSON.stringify(expectedMappings)) errors.push(`${key}: mapping differs from the reviewed cross-index`);
}
for (const key of expected.keys()) if (!seenSources.has(key)) errors.push(`missing contextual source ${key}`);

const sourceContracts = [
  [componentSource, ['data-contextual-navigation', 'data-contextual-source', 'data-contextual-link', 'Continue from here', 'navigation.boundary']],
  [resolverSource, ['getContextualNavigation', 'boundary: definition.boundary', 'operations/troubleshooting/', 'operations/software-bridge/']],
  [topicRouteSource, ['ContextualLinks', 'getContextualNavigation', "page.kind === 'topic'", 'AuthoritativeReferences']],
  [practicalRouteSource, ['ContextualLinks', 'getContextualNavigation', 'guide.data.guide_slug']],
  [toolRouteSource, ['ContextualLinks', 'getContextualNavigation', 'What to verify', 'data-tool-verify']],
  [operationsSource, ['data-workflow-support-links', "withBase('operations/troubleshooting/')", "withBase('operations/software-bridge/')"]],
];
for (const [source, markers] of sourceContracts) for (const marker of markers) if (!source.includes(marker)) errors.push(`source contract is missing ${marker}`);
for (const forbidden of ['client:load', 'client:idle', 'client:visible', 'client:only', '<script']) {
  if (componentSource.includes(forbidden)) errors.push(`contextual renderer must remain static and contains ${forbidden}`);
}
if (/card/i.test(componentSource)) errors.push('contextual renderer must remain prose/list navigation, not a card component');
for (const anchor of supportTargets.get('troubleshooting')) {
  if (!troubleshootingSource.includes(`'${anchor}'`)) errors.push(`Troubleshooting source is missing stable anchor ${anchor}`);
}
if (!softwareBridgeSource.includes('data-software-bridge')) errors.push('Software Bridge source contract is missing');

async function htmlFiles(directoryUrl, relative = '') {
  const entries = await readdir(new URL(relative, directoryUrl), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = `${relative}${entry.name}`;
    if (entry.isDirectory()) files.push(...await htmlFiles(directoryUrl, `${child}/`));
    else if (entry.name === 'index.html') files.push(child);
  }
  return files;
}

if (validateBuilt) {
  const expectedBuiltSources = new Set();
  for (const page of navigation.pages ?? []) {
    const key = sourceKey(page.source);
    const path = sourcePath(page.source);
    if (!path) continue;
    const builtPath = `${path}index.html`;
    expectedBuiltSources.add(builtPath);
    let html = '';
    try {
      html = await readFile(new URL(`dist/${builtPath}`, root), 'utf8');
    } catch (error) {
      errors.push(`${key}: built source route is missing: ${error.message}`);
      continue;
    }
    const block = html.match(new RegExp(`<nav[^>]*data-contextual-navigation[^>]*data-contextual-source="${escapeRegExp(key)}"[^>]*>[\\s\\S]*?<\\/nav>`))?.[0];
    if (!block) {
      errors.push(`${key}: built contextual block is missing`);
      continue;
    }
    const linkCount = (block.match(/data-contextual-link/g) ?? []).length;
    if (linkCount !== page.links.length || linkCount > 3) errors.push(`${key}: built link count is ${linkCount}, expected ${page.links.length}`);
    if (/<script|astro-island/i.test(block)) errors.push(`${key}: built block contains client behaviour`);
    for (const link of page.links) {
      const href = `${siteBase}${targetPath(link.target)}`;
      if (!block.includes(`href="${href}"`)) errors.push(`${key}: built block is missing ${href}`);
      if (!block.includes(`data-contextual-relation="${link.relation}"`)) errors.push(`${key}: built block is missing relation ${link.relation}`);
      if (!block.includes(link.title)) errors.push(`${key}: built block is missing title ${link.title}`);
    }
  }

  for (const directory of ['operations/', 'tools/']) {
    let files = [];
    try {
      files = await htmlFiles(new URL(`dist/${directory}`, root));
    } catch (error) {
      errors.push(`cannot scan built ${directory}: ${error.message}`);
      continue;
    }
    for (const file of files) {
      const relative = `${directory}${file}`;
      const html = await readFile(new URL(`dist/${relative}`, root), 'utf8');
      const blocks = (html.match(/data-contextual-navigation/g) ?? []).length;
      if (expectedBuiltSources.has(relative) && blocks !== 1) errors.push(`${relative}: expected one contextual block, found ${blocks}`);
      if (!expectedBuiltSources.has(relative) && blocks !== 0) errors.push(`${relative}: unlisted or transitional route renders contextual navigation`);
    }
  }

  let troubleshootingHtml = '';
  let bridgeHtml = '';
  let operationsHtml = '';
  try { troubleshootingHtml = await readFile(new URL('dist/operations/troubleshooting/index.html', root), 'utf8'); } catch (error) { errors.push(`built Troubleshooting route is missing: ${error.message}`); }
  try { bridgeHtml = await readFile(new URL('dist/operations/software-bridge/index.html', root), 'utf8'); } catch (error) { errors.push(`built Software Bridge route is missing: ${error.message}`); }
  try { operationsHtml = await readFile(new URL('dist/operations/index.html', root), 'utf8'); } catch (error) { errors.push(`built Research Workflow route is missing: ${error.message}`); }
  for (const anchor of supportTargets.get('troubleshooting')) if (!troubleshootingHtml.includes(`id="${anchor}"`)) errors.push(`built Troubleshooting route is missing #${anchor}`);
  if (!bridgeHtml.includes('data-software-bridge')) errors.push('built Software Bridge route is missing its static marker');
  if (!operationsHtml.includes('data-workflow-support-links')) errors.push('built Research Workflow route is missing the support sentence');
  for (const path of ['operations/troubleshooting/', 'operations/software-bridge/']) if (!operationsHtml.includes(`href="${siteBase}${path}"`)) errors.push(`built Research Workflow route is missing ${path}`);
}

if (errors.length > 0) {
  console.error(`Contextual navigation validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Contextual navigation valid${validateBuilt ? ' in source and built HTML' : ''}: 11 bounded source pages, 14 static links, at most 2 links per page, stable support anchors, no raw routes, and preserved authority and tool-verification markers.`);

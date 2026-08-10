import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const validateBuilt = process.argv.includes('--built');
const data = JSON.parse(await readFile(new URL('workflow/troubleshooting.json', root), 'utf8'));
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const routeSource = await readFile(new URL('src/pages/operations/troubleshooting.astro', root), 'utf8');
const topics = workflow.sections.flatMap((section) => section.groups.flatMap((group) => group.topics));
const topicSlugs = new Set(topics.map((topic) => topic.slug));
const expectedRecordSlugs = [
  'job-stops-before-completion',
  'input-or-method-rejected',
  'scf-does-not-converge',
  'eigensolver-or-fermi-level-error',
  'restart-or-parent-artifact-rejected',
  'io-memory-or-parallel-failure',
  'geometry-looks-physically-wrong',
  'geometry-optimization-stalls',
  'symmetry-or-kq-mapping-mismatch',
  'imaginary-phonon-frequencies',
];
const expectedSourceIds = [
  'qe-pw-troubleshooting',
  'qe-ph-troubleshooting',
  'vasp-electronic-convergence-troubleshooting',
  'vasp-imaginary-phonon-modes',
  'abinit-ground-state-faq',
  'abinit-general-faq',
  'abinit-dfpt-faq',
  'gpaw-convergence-issues',
  'cp2k-scf-convergence-guide',
];
const requiredRecordFields = [
  'slug',
  'title',
  'symptom',
  'first_check',
  'cause_classes',
  'inspect',
  'safe_next_action',
  'preserve_before_retry',
  'do_not_conclude',
  'related_topic_slugs',
  'official_source_ids',
];
const allowedTopKeys = new Set(['schema_version', 'role', 'public_heading', 'intro', 'boundary', 'sources', 'records']);
const allowedRecordKeys = new Set(requiredRecordFields);
const allowedSourceKeys = new Set(['id', 'title', 'organization', 'url', 'accessed_at']);
const allowedHosts = new Set([
  'www.quantum-espresso.org',
  'vasp.at',
  'docs.abinit.org',
  'gpaw.readthedocs.io',
  'manual.cp2k.org',
]);

function nonemptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function checkUniqueStrings(values, label, minimum = 1) {
  if (!Array.isArray(values) || values.length < minimum) {
    errors.push(`${label}: expected at least ${minimum} entries`);
    return;
  }
  if (values.some((value) => !nonemptyString(value))) errors.push(`${label}: contains an empty or non-string entry`);
  if (new Set(values).size !== values.length) errors.push(`${label}: contains duplicate entries`);
}

function recordText(record) {
  return requiredRecordFields
    .filter((field) => !['slug', 'related_topic_slugs', 'official_source_ids'].includes(field))
    .flatMap((field) => Array.isArray(record[field]) ? record[field] : [record[field]])
    .join(' ');
}

if (topics.length !== 46) errors.push(`A-E registry must contain 46 topics, found ${topics.length}`);
if (data.schema_version !== 1) errors.push(`schema_version must be 1, found ${data.schema_version}`);
if (data.role !== 'symptom-first-static-support-route') errors.push('role must be symptom-first-static-support-route');
if (data.public_heading !== 'Troubleshoot a calculation') errors.push('public heading changed');
if (!nonemptyString(data.intro) || !nonemptyString(data.boundary)) errors.push('intro and boundary are required');
for (const key of Object.keys(data)) if (!allowedTopKeys.has(key)) errors.push(`unexpected top-level key ${key}`);

if (JSON.stringify((data.sources ?? []).map((source) => source.id)) !== JSON.stringify(expectedSourceIds)) {
  errors.push('official source identity or order differs from the reviewed nine-source contract');
}
const sourceById = new Map();
for (const source of data.sources ?? []) {
  for (const key of Object.keys(source)) if (!allowedSourceKeys.has(key)) errors.push(`${source.id ?? 'unknown source'}: unexpected key ${key}`);
  for (const key of allowedSourceKeys) if (!nonemptyString(source[key])) errors.push(`${source.id ?? 'unknown source'}: missing ${key}`);
  if (sourceById.has(source.id)) errors.push(`${source.id}: duplicate source ID`);
  sourceById.set(source.id, source);
  try {
    const parsed = new URL(source.url);
    if (parsed.protocol !== 'https:' || !allowedHosts.has(parsed.hostname)) errors.push(`${source.id}: URL is not an allowed official HTTPS document`);
  } catch {
    errors.push(`${source.id}: invalid URL ${source.url}`);
  }
  if (source.accessed_at !== '2026-08-10') errors.push(`${source.id}: accessed_at must preserve the reviewed 2026-08-10 check date`);
}

if (JSON.stringify((data.records ?? []).map((record) => record.slug)) !== JSON.stringify(expectedRecordSlugs)) {
  errors.push('symptom identity or order differs from the reviewed ten-record contract');
}
const usedSourceIds = new Set();
for (const record of data.records ?? []) {
  for (const field of requiredRecordFields) {
    const value = record[field];
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) errors.push(`${record.slug ?? 'unknown'}: missing ${field}`);
  }
  for (const key of Object.keys(record)) if (!allowedRecordKeys.has(key)) errors.push(`${record.slug ?? 'unknown'}: unexpected key ${key}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug ?? '')) errors.push(`${record.slug ?? 'unknown'}: invalid stable anchor`);
  checkUniqueStrings(record.cause_classes, `${record.slug}: cause_classes`, 2);
  checkUniqueStrings(record.inspect, `${record.slug}: inspect`, 2);
  checkUniqueStrings(record.safe_next_action, `${record.slug}: safe_next_action`, 1);
  checkUniqueStrings(record.preserve_before_retry, `${record.slug}: preserve_before_retry`, 1);
  checkUniqueStrings(record.related_topic_slugs, `${record.slug}: related_topic_slugs`, 1);
  checkUniqueStrings(record.official_source_ids, `${record.slug}: official_source_ids`, 1);
  for (const slug of record.related_topic_slugs ?? []) if (!topicSlugs.has(slug)) errors.push(`${record.slug}: unresolved topic ${slug}`);
  for (const id of record.official_source_ids ?? []) {
    if (!sourceById.has(id)) errors.push(`${record.slug}: unresolved official source ${id}`);
    usedSourceIds.add(id);
  }
  const text = recordText(record);
  if (/\b\d+(?:\.\d+)?\s*(?:eV|Ry|Ha|K|cm\^-?1|cm-1|angstrom|percent)\b/i.test(text)) errors.push(`${record.slug}: contains an unreviewed magic numerical value`);
  if (/```|\$\s+\S+|pretend output|sample output/i.test(text)) errors.push(`${record.slug}: contains terminal-like or synthetic-output content`);
}
for (const id of sourceById.keys()) if (!usedSourceIds.has(id)) errors.push(`${id}: official source is unused`);

const jobBoundary = data.records?.find((record) => record.slug === 'job-stops-before-completion')?.do_not_conclude ?? '';
const scfBoundary = data.records?.find((record) => record.slug === 'scf-does-not-converge')?.do_not_conclude ?? '';
const phononRecord = data.records?.find((record) => record.slug === 'imaginary-phonon-frequencies');
const phononBoundary = phononRecord?.do_not_conclude ?? '';
if (!jobBoundary.includes('no usable DFT evidence')) errors.push('job-stop boundary must state that no usable DFT evidence may exist');
if (!scfBoundary.includes('does not establish the lowest relevant state')) errors.push('SCF boundary must separate solver convergence from reference-state acceptance');
if (!phononRecord?.symptom?.includes('dynamical-matrix eigenvalues are negative') || !phononRecord?.symptom?.includes('corresponding to imaginary phonon frequencies')) errors.push('imaginary-frequency symptom must distinguish negative dynamical-matrix eigenvalues from the corresponding imaginary frequencies');
if (!phononBoundary.includes('alone does not prove a physical instability')) errors.push('imaginary-frequency boundary must reject automatic instability claims');

for (const marker of ['data-troubleshooting-index', 'data-symptom-record', 'data-primary-actions', 'data-claim-boundary', 'data-secondary-evidence', 'workflowSections', 'withBase', 'troubleshootingData']) {
  if (!routeSource.includes(marker)) errors.push(`route source is missing fail-closed static marker ${marker}`);
}
for (const forbidden of ['client:load', 'client:idle', 'client:visible', 'client:only', '<script']) {
  if (routeSource.includes(forbidden)) errors.push(`route must remain static and contains ${forbidden}`);
}

if (validateBuilt) {
  let html = '';
  try {
    html = await readFile(new URL('dist/operations/troubleshooting/index.html', root), 'utf8');
  } catch (error) {
    errors.push(`built troubleshooting route is missing: ${error.message}`);
  }
  if (html) {
    if (!/<html[^>]+lang="en"/i.test(html)) errors.push('built route does not declare English');
    if (!html.includes('Troubleshoot a calculation')) errors.push('built route is missing its public heading');
    if ((html.match(/data-symptom-record=/g) ?? []).length !== 10) errors.push('built route does not contain exactly ten symptom records');
    if ((html.match(/data-primary-actions/g) ?? []).length !== 10) errors.push('built route does not expose one primary-action sequence per symptom');
    if ((html.match(/data-secondary-evidence/g) ?? []).length !== 10) errors.push('built route does not contain one secondary-evidence disclosure per symptom');
    for (const slug of expectedRecordSlugs) {
      if (!html.includes(`id="${slug}"`)) errors.push(`built route is missing anchor #${slug}`);
    }
    for (const source of data.sources ?? []) {
      if (!html.includes(`href="${source.url}"`)) errors.push(`built route is missing official source URL ${source.id}`);
    }
    const relatedTopics = new Set((data.records ?? []).flatMap((record) => record.related_topic_slugs));
    for (const slug of relatedTopics) {
      if (!html.includes(`/DFT-Research-Workflow/operations/${slug}/`)) errors.push(`built route is missing resolved topic URL ${slug}`);
    }
    if (html.includes('<astro-island')) errors.push('built route contains client hydration');
  }
}

if (errors.length > 0) {
  console.error(`Troubleshooting validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Troubleshooting validation passed: ${expectedRecordSlugs.length} symptom records, ${expectedSourceIds.length} official sources, ${topics.length}-topic fail-closed resolution${validateBuilt ? ', and static built route' : ''}.`);

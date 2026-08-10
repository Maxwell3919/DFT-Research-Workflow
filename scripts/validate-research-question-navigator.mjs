import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const navigator = JSON.parse(await readFile(new URL('workflow/research-question-navigator.json', root), 'utf8'));
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const topics = workflow.sections.flatMap((section) =>
  section.groups.flatMap((group) => group.topics.map((topic) => ({ ...topic, section: section.id, group: group.id }))),
);
const topicBySlug = new Map(topics.map((topic) => [topic.slug, topic]));

function frontmatterValue(source, key) {
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)?.[1] ?? '';
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = frontmatter.match(new RegExp(`^${escapedKey}:\\s*(.+)$`, 'm'));
  return match?.[1].trim().replace(/^['"]|['"]$/g, '') ?? '';
}

const guideDirectory = new URL('src/content/practical-guides/', root);
const guideFiles = (await readdir(guideDirectory)).filter((name) => name.endsWith('.md')).sort();
const guides = [];
const guideBySlug = new Map();

for (const file of guideFiles) {
  const source = await readFile(new URL(`src/content/practical-guides/${file}`, root), 'utf8');
  const guide = {
    file,
    guide_slug: frontmatterValue(source, 'guide_slug'),
    topic_slug: frontmatterValue(source, 'topic_slug'),
    kind: frontmatterValue(source, 'kind'),
    status: frontmatterValue(source, 'status'),
  };
  guides.push(guide);
  if (guideBySlug.has(guide.guide_slug)) errors.push(`${file}: duplicate guide_slug ${guide.guide_slug}`);
  guideBySlug.set(guide.guide_slug, guide);
}

const expectedMappings = new Map([
  ['local-minimum', ['optimize-structure', 'guide', 'choose-relaxed-degrees-and-constraints']],
  ['formation-energy', ['relative-and-formation-energies', 'guide', 'build-comparable-energy-ledger']],
  ['decomposition-stability', ['compositional-phase-stability-and-convex-hulls', 'guide', 'rebuild-oqmd-li-p-convex-hull']],
  ['metallicity', ['fermi-surface-and-full-brillouin-zone-analysis', 'guide', 'compare-full-zone-isovalue-and-band-path']],
  ['dynamical-stability', ['harmonic-phonons', 'guide', 'check-harmonic-mode-ledger']],
  ['conventional-superconductivity', ['electron-phonon-coupling', 'no-guide', null]],
  ['surface-energy', ['surface-energy-and-work-function', 'guide', 'build-surface-energy-ledger']],
  ['work-function', ['surface-energy-and-work-function', 'guide', 'extract-work-function-potential']],
  ['adsorption', ['adsorption-energies', 'guide', 'build-adsorption-energy-ledger']],
  ['charge-redistribution', ['charge-density-and-charge-redistribution', 'guide', 'check-charge-difference-closure']],
]);
const expectedRelatedTopics = new Map([
  ['decomposition-stability', ['equation-of-state-and-structural-phase-stability']],
  ['metallicity', ['density-of-states-and-projected-density-of-states']],
  ['conventional-superconductivity', ['harmonic-phonons', 'conventional-superconductivity']],
]);
const requiredQuestionFields = [
  'id',
  'question',
  'required_observable',
  'topic_slug',
  'prerequisites',
  'first_action',
  'validation_requirement',
  'claim_limitation',
  'common_human_route',
  'what_to_inspect',
];
const allowedTopLevelKeys = new Set(['schema_version', 'role', 'public_heading', 'intro', 'boundary', 'questions']);
const allowedQuestionKeys = new Set([...requiredQuestionFields, 'related_topics']);
const forbiddenIdentityKeys = new Set(['sections', 'groups', 'topics', 'operations', 'route', 'href', 'url', 'topic_title', 'guide_title']);

function walkForForbiddenKeys(value, path = 'navigator') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkForForbiddenKeys(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenIdentityKeys.has(key)) errors.push(`${path}: forbidden duplicate-taxonomy or route key ${key}`);
    walkForForbiddenKeys(child, `${path}.${key}`);
  }
}

if (topics.length !== 46) errors.push(`current A-E registry must contain 46 topics, found ${topics.length}`);
if (guides.length !== 51) errors.push(`current practical collection must contain 51 guides, found ${guides.length}`);
if (navigator.schema_version !== 1) errors.push(`schema_version must be 1, found ${navigator.schema_version}`);
if (navigator.role !== 'editorial-question-to-existing-route-bridge') errors.push('navigator role must remain an editorial bridge');
if (navigator.public_heading !== 'Start from the research question') errors.push('public heading must be Start from the research question');
if (!navigator.intro?.trim() || !navigator.boundary?.includes('not a new taxonomy')) errors.push('navigator must state its question-led scope and no-new-taxonomy boundary');
for (const key of Object.keys(navigator)) if (!allowedTopLevelKeys.has(key)) errors.push(`unexpected top-level key ${key}`);
walkForForbiddenKeys(navigator);

if (!Array.isArray(navigator.questions) || navigator.questions.length !== 10) {
  errors.push(`navigator must contain exactly 10 questions, found ${navigator.questions?.length ?? 'none'}`);
}

const seenIds = new Set();
const seenQuestions = new Set();
for (const question of navigator.questions ?? []) {
  for (const key of requiredQuestionFields) {
    const value = question[key];
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) errors.push(`${question.id ?? 'unknown'}: missing ${key}`);
  }
  for (const key of Object.keys(question)) if (!allowedQuestionKeys.has(key)) errors.push(`${question.id ?? 'unknown'}: unexpected key ${key}`);
  if (seenIds.has(question.id)) errors.push(`duplicate question id ${question.id}`);
  if (seenQuestions.has(question.question)) errors.push(`duplicate public question ${question.question}`);
  seenIds.add(question.id);
  seenQuestions.add(question.question);

  const expected = expectedMappings.get(question.id);
  if (!expected) {
    errors.push(`${question.id}: not one of the 10 bounded research questions`);
    continue;
  }
  const [expectedTopic, expectedActionType, expectedGuide] = expected;
  if (question.topic_slug !== expectedTopic) errors.push(`${question.id}: expected topic ${expectedTopic}, found ${question.topic_slug}`);
  if (!topicBySlug.has(question.topic_slug)) errors.push(`${question.id}: unresolved topic_slug ${question.topic_slug}`);
  if (question.first_action?.type !== expectedActionType) errors.push(`${question.id}: expected ${expectedActionType} first action`);

  const relatedSlugs = (question.related_topics ?? []).map((related) => related.topic_slug);
  const expectedRelated = expectedRelatedTopics.get(question.id) ?? [];
  if (JSON.stringify(relatedSlugs) !== JSON.stringify(expectedRelated)) {
    errors.push(`${question.id}: related topics must be ${JSON.stringify(expectedRelated)}, found ${JSON.stringify(relatedSlugs)}`);
  }
  for (const related of question.related_topics ?? []) {
    if (!topicBySlug.has(related.topic_slug)) errors.push(`${question.id}: unresolved related topic ${related.topic_slug}`);
    if (!related.context?.trim()) errors.push(`${question.id}: related topic ${related.topic_slug} lacks context`);
  }

  if (question.first_action?.type === 'guide') {
    if (question.first_action.guide_slug !== expectedGuide) errors.push(`${question.id}: expected guide ${expectedGuide}, found ${question.first_action.guide_slug}`);
    const guide = guideBySlug.get(question.first_action.guide_slug);
    if (!guide) {
      errors.push(`${question.id}: unresolved guide ${question.first_action.guide_slug}`);
    } else {
      if (guide.topic_slug !== question.topic_slug) errors.push(`${question.id}: guide parent is ${guide.topic_slug}, not ${question.topic_slug}`);
      if (guide.kind !== question.first_action.guide_kind) errors.push(`${question.id}: guide kind is ${guide.kind}, not ${question.first_action.guide_kind}`);
      if (guide.status !== 'reviewed') errors.push(`${question.id}: guide ${guide.guide_slug} is not reviewed`);
    }
    if (!question.first_action.evidence_boundary?.trim()) errors.push(`${question.id}: guide action lacks an evidence boundary`);
  } else if (question.first_action?.type === 'no-guide') {
    if (!question.first_action.statement?.includes('No reviewed hands-on practical guide is published')) errors.push(`${question.id}: no-guide state is not explicit`);
    if (guides.some((guide) => guide.topic_slug === question.topic_slug)) errors.push(`${question.id}: claims no guide although its primary topic has one`);
  } else {
    errors.push(`${question.id}: first_action type must be guide or no-guide`);
  }
}

for (const id of expectedMappings.keys()) if (!seenIds.has(id)) errors.push(`missing bounded research question ${id}`);
for (const question of navigator.questions ?? []) {
  if (!question.common_human_route?.trim() || !question.what_to_inspect?.trim()) errors.push(`${question.id}: human route or inspection guidance missing`);
  if (/^Use (the )?(API|Python)/i.test(question.common_human_route)) errors.push(`${question.id}: programmatic route presented before human workflow`);
}

const formation = navigator.questions?.find((question) => question.id === 'formation-energy');
const hull = navigator.questions?.find((question) => question.id === 'decomposition-stability');
if (!formation?.claim_limitation.includes('negative formation energy does not establish convex-hull stability')) errors.push('formation energy must remain distinct from convex-hull stability');
if (!formation?.first_action?.evidence_boundary?.includes('synthetic A2B3 ledger fixture')) errors.push('formation-energy first action must identify the synthetic A2B3 fixture');
if (!hull?.required_observable.includes('lower convex envelope') || !hull?.claim_limitation.includes('conditional on the declared phase set')) errors.push('decomposition stability must retain convex-hull phase-set boundaries');

const localOptimization = navigator.questions?.find((question) => question.id === 'local-minimum');
if (!localOptimization?.question.includes('declared geometry-optimization conditions been satisfied')) errors.push('geometry route must ask whether the declared optimization conditions were satisfied rather than claim a minimum');
if (!localOptimization?.required_observable.includes('every relevant force component') || !localOptimization?.required_observable.includes('stress for relaxed cell degrees of freedom')) errors.push('geometry route must always require force evidence and require stress only for relaxed cell degrees of freedom');

const metallicity = navigator.questions?.find((question) => question.id === 'metallicity');
if (!metallicity?.required_observable.includes('full-zone') || !metallicity?.claim_limitation.includes('high-symmetry band path alone')) errors.push('metallicity must require full-zone evidence and reject a path-only claim');

const phonons = navigator.questions?.find((question) => question.id === 'dynamical-stability');
if (!phonons?.first_action?.evidence_boundary?.includes('Gamma-point') || !phonons?.claim_limitation.includes('full-Brillouin-zone dynamical stability')) errors.push('phonon route must expose the Gamma-only guide limitation');

const superconductivity = navigator.questions?.find((question) => question.id === 'conventional-superconductivity');
if (superconductivity?.first_action?.type !== 'no-guide') errors.push('EPC route must retain an honest no-guide state');
if (!superconductivity?.prerequisites.includes('metallic full-zone reference state') || !superconductivity?.prerequisites.includes('dynamically qualified phonons')) errors.push('EPC route must require metallic and phonon parents');
if (guides.some((guide) => ['electron-phonon-coupling', 'conventional-superconductivity'].includes(guide.topic_slug))) errors.push('EPC no-guide assertion no longer matches the practical collection');

if (errors.length > 0) {
  console.error(`Research Question Navigator validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Research Question Navigator valid: 10 question-to-observable routes with explicit human routes, inspection objects, guide evidence limits, EPC no-guide state, and scientific claim boundaries.');

import { access, readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const sourceManifest = JSON.parse(await readFile(new URL('sources/practical-guide-links.json', root), 'utf8'));
const mediaManifest = JSON.parse(await readFile(new URL('workflow/practical-guide-media.json', root), 'utf8'));
const topicSlugs = new Set(
  workflow.sections.flatMap((section) =>
    section.groups.flatMap((group) => group.topics.map((topic) => topic.slug)),
  ),
);
const sourceById = new Map(sourceManifest.sources.map((source) => [source.id, source]));
const sourcesByGuide = new Map(sourceManifest.guides.map((guide) => [guide.guide_slug, guide.source_ids]));
const mediaById = new Map(mediaManifest.assets.map((asset) => [asset.id, asset]));

const requiredGuideSlugs = new Set([
  'ase-build-repeat-cells',
  'ase-surfaces-vacuum-adsorbates',
  'pymatgen-structure-transformations',
  'two-dimensional-monolayer-model',
  'converge-basis-cutoffs-and-grids',
  'converge-k-points-and-smearing',
  'converge-finite-size-vacuum-and-images',
  'converge-q-meshes-and-response-grids',
]);
const requiredParentMinimum = new Map([
  ['build-or-modify-computational-model', 4],
  ['test-numerical-convergence', 4],
]);
const reviewRequirements = new Map([
  ['docs/reviews/2026-08-03-practical-guides-model-building-pilot.md', [
    'reviewed within the declared educational and execution scope',
    'The scripts calculate no electronic energy',
    'Execution success is not numerical convergence',
    'None of those checks establishes numerical convergence',
  ]],
  ['docs/reviews/2026-08-03-test-numerical-convergence.md', [
    'reviewed within the declared educational and execution scope',
    'The scripts calculate no electronic energy',
    'Execution success is not numerical convergence',
    'None of those checks establishes numerical convergence for a real calculation',
    'They are conceptual diagrams, not plots of calculated data.',
  ]],
]);

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { data: {}, body: source };
  const data = {};
  let activeArray = null;
  for (const rawLine of match[1].split('\n')) {
    const arrayItem = rawLine.match(/^\s+-\s+(.+)$/);
    if (arrayItem && activeArray) {
      data[activeArray].push(arrayItem[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }
    const scalar = rawLine.match(/^([a-z_]+):(?:\s*(.*))?$/);
    if (!scalar) continue;
    const [, key, rawValue = ''] = scalar;
    if (rawValue.trim() === '') {
      data[key] = [];
      activeArray = key;
    } else {
      data[key] = rawValue.trim().replace(/^['"]|['"]$/g, '');
      activeArray = null;
    }
  }
  return { data, body: source.slice(match[0].length) };
}

function extractUrls(source) {
  return new Set(
    (source.match(/https?:\/\/[^\s<>()\]"']+/g) ?? [])
      .map((url) => url.replace(/[.,;:]+$/u, '')),
  );
}

function difference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort();
}

const directory = new URL('src/content/practical-guides/', root);
const files = (await readdir(directory)).filter((name) => name.endsWith('.md')).sort();
const guides = [];
const guideSlugs = new Set();
const guideCountsByParent = new Map();
const usedMediaIds = new Set();
const allowedKinds = new Set(['implementation', 'worked-example', 'visual-note']);

for (const file of files) {
  const path = `src/content/practical-guides/${file}`;
  const source = await readFile(new URL(path, root), 'utf8');
  const { data, body } = parseFrontmatter(source);
  guides.push({ file, path, data, body });

  if (!topicSlugs.has(data.topic_slug)) errors.push(`${file}: unknown parent topic ${data.topic_slug}`);
  if (!data.guide_slug) errors.push(`${file}: missing guide_slug`);
  if (guideSlugs.has(data.guide_slug)) errors.push(`${file}: duplicate guide_slug ${data.guide_slug}`);
  guideSlugs.add(data.guide_slug);
  guideCountsByParent.set(data.topic_slug, (guideCountsByParent.get(data.topic_slug) ?? 0) + 1);
  if (!allowedKinds.has(data.kind)) errors.push(`${file}: invalid kind ${data.kind}`);
  if (data.status !== 'reviewed') errors.push(`${file}: practical page must be reviewed`);
  if (!Array.isArray(data.tools) || data.tools.length === 0) errors.push(`${file}: missing tools`);
  if (!Array.isArray(data.tested_versions) || data.tested_versions.length === 0) errors.push(`${file}: missing tested_versions`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.reviewed_at ?? '')) errors.push(`${file}: invalid reviewed_at`);
  if (!data.summary || data.summary.length < 20) errors.push(`${file}: summary is too short`);

  for (const requiredPhrase of ['What this guide verifies', 'Official sources']) {
    if (data.kind === 'implementation' && !body.includes(requiredPhrase)) errors.push(`${file}: missing ${requiredPhrase}`);
  }
  if (data.kind === 'worked-example' && !body.includes('What this example does not establish')) {
    errors.push(`${file}: worked example is missing its claim boundary`);
  }
  if (/^## (?:Inputs|Outputs|Requirement|Repeatability|Dependencies|Alternatives|Exclusions)$/m.test(body)) {
    errors.push(`${file}: restores a fixed article contract`);
  }
  if (/universal recommended|universally sufficient/i.test(body)) errors.push(`${file}: suggests a universal parameter rule`);

  try {
    await access(new URL(data.execution_script, root));
  } catch {
    errors.push(`${file}: missing execution script ${data.execution_script}`);
  }
  try {
    await access(new URL(data.review, root));
  } catch {
    errors.push(`${file}: missing review record ${data.review}`);
  }

  const manifestSourceIds = sourcesByGuide.get(data.guide_slug) ?? [];
  if (JSON.stringify(data.source_ids) !== JSON.stringify(manifestSourceIds)) {
    errors.push(`${file}: source_ids do not match sources/practical-guide-links.json`);
  }
  const expectedUrls = new Set(data.source_ids.map((id) => sourceById.get(id)?.url).filter(Boolean));
  if (expectedUrls.size !== data.source_ids.length) errors.push(`${file}: unresolved source_id`);
  const actualUrls = extractUrls(body);
  const missingUrls = difference(expectedUrls, actualUrls);
  const undeclaredUrls = difference(actualUrls, expectedUrls);
  if (missingUrls.length) errors.push(`${file}: missing declared source URLs: ${missingUrls.join(', ')}`);
  if (undeclaredUrls.length) errors.push(`${file}: undeclared external URLs: ${undeclaredUrls.join(', ')}`);

  if (!Array.isArray(data.media_ids) || data.media_ids.length === 0) errors.push(`${file}: missing media_ids`);
  for (const mediaId of data.media_ids ?? []) {
    if (usedMediaIds.has(mediaId)) errors.push(`${mediaId}: media asset is reused by more than one page`);
    usedMediaIds.add(mediaId);
    const asset = mediaById.get(mediaId);
    if (!asset) {
      errors.push(`${file}: unresolved media_id ${mediaId}`);
      continue;
    }
    if (asset.guide_slug !== data.guide_slug) errors.push(`${file}: media ${mediaId} belongs to ${asset.guide_slug}`);
    if (!asset.alt || !asset.caption || !asset.reuse_basis || !asset.created_at) errors.push(`${mediaId}: incomplete media provenance`);
    if (asset.provenance_type !== 'original' && (!asset.source_url || !asset.accessed_at)) {
      errors.push(`${mediaId}: external media lacks source or access date`);
    }
    try {
      await access(new URL(`public/${asset.path}`, root));
    } catch {
      errors.push(`${mediaId}: missing media file public/${asset.path}`);
    }
  }
}

for (const slug of requiredGuideSlugs) if (!guideSlugs.has(slug)) errors.push(`missing required reviewed practical page ${slug}`);
for (const [parent, minimum] of requiredParentMinimum) {
  const count = guideCountsByParent.get(parent) ?? 0;
  if (count < minimum) errors.push(`${parent}: expected at least ${minimum} practical pages, found ${count}`);
}

for (const source of sourceManifest.sources) {
  if (!['page', 'doi'].includes(source.kind)) errors.push(`${source.id}: invalid practical source kind ${source.kind}`);
  if (!source.url.startsWith('https://')) errors.push(`${source.id}: practical source is not HTTPS`);
}
if (sourceById.size !== sourceManifest.sources.length) errors.push('duplicate practical source IDs');
if (mediaById.size !== mediaManifest.assets.length) errors.push('duplicate practical media IDs');
if (sourceManifest.guides.length !== guides.length) errors.push('practical source manifest guide count mismatch');
for (const manifestGuide of sourceManifest.guides) {
  if (!guideSlugs.has(manifestGuide.guide_slug)) errors.push(`source manifest contains unknown guide ${manifestGuide.guide_slug}`);
}
for (const asset of mediaManifest.assets) {
  if (!guideSlugs.has(asset.guide_slug)) errors.push(`${asset.id}: media manifest references unknown guide ${asset.guide_slug}`);
  if (!usedMediaIds.has(asset.id)) errors.push(`${asset.id}: orphaned media manifest entry`);
}

const reviewPaths = new Set(guides.map((guide) => guide.data.review));
for (const reviewPath of reviewPaths) {
  const review = await readFile(new URL(reviewPath, root), 'utf8');
  const normalizedReview = review.toLowerCase();
  const requirements = reviewRequirements.get(reviewPath);
  if (!requirements) {
    errors.push(`${reviewPath}: no practical review requirements declared`);
    continue;
  }
  for (const statement of requirements) {
    if (!normalizedReview.includes(statement.toLowerCase())) errors.push(`${reviewPath}: missing review boundary ${JSON.stringify(statement)}`);
  }
}

if (errors.length > 0) {
  console.error(`Practical-guide validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Practical guides valid: ${guides.length} reviewed pages across ${guideCountsByParent.size} parent topics with execution scripts, exact official or primary sources, original-media provenance, and review-specific claim boundaries.`);

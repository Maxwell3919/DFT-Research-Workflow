import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const topicSlugs = new Set(
  workflow.sections.flatMap((section) =>
    section.groups.flatMap((group) => group.topics.map((topic) => topic.slug)),
  ),
);

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { data: {}, body: source };
  const data = Object.fromEntries(
    match[1]
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [key, ...value] = line.split(':');
        return [key.trim(), value.join(':').trim().replace(/^['"]|['"]$/g, '')];
      }),
  );
  return { data, body: source.slice(match[0].length) };
}

const topicDirectory = new URL('src/content/topics/', root);
const files = (await readdir(topicDirectory)).filter((name) => name.endsWith('.md')).sort();
const reviewed = new Map();

for (const file of files) {
  const source = await readFile(new URL(`src/content/topics/${file}`, root), 'utf8');
  const { data, body } = parseFrontmatter(source);
  if (!topicSlugs.has(data.topic_slug)) errors.push(`${file}: unresolved topic_slug ${data.topic_slug}`);
  if (data.status === 'reviewed') reviewed.set(data.topic_slug, { file, body });
}

const structureTopic = reviewed.get('obtain-material-structure');
if (!structureTopic) {
  errors.push('obtain-material-structure must have one reviewed narrative');
} else {
  const { body, file } = structureTopic;
  const requiredSections = [
    '## Start with the origin of the structure',
    '## Preserve the source before transforming it',
    '## Read the crystallographic representation, not just the picture',
    '## Experimental and calculated structures answer different questions',
    '## Establish chemical and crystallographic identity',
    '## Treat format conversion as a scientific transformation',
    '## Symmetry is tolerance-dependent',
    '## Inspect geometry before trusting automated checks',
    '## Compare sources when the decision matters',
    '## The result of this task',
    '## Sources and standards',
  ];
  for (const heading of requiredSections) if (!body.includes(heading)) errors.push(`${file}: missing topic-specific section ${heading}`);

  const requiredBoundaries = [
    'A structure file is not yet a computational model.',
    'A **generated or hypothetical structure** is not experimental evidence.',
    'A value below one is therefore not a small numerical defect to be rounded away.',
    'Choosing that representation belongs to **Build or Modify a Computational Model**.',
    'They are not a certificate that the structure is suitable for a particular DFT calculation.',
    'It should not silently replace partial occupancy, choose a magnetic order, add vacuum, construct a supercell, select a defect configuration, or claim that the source phase is stable.',
  ];
  for (const statement of requiredBoundaries) if (!body.includes(statement)) errors.push(`${file}: missing scientific boundary ${JSON.stringify(statement)}`);

  const requiredSources = [
    'https://doi.org/10.1107/S010876739101067X',
    'https://www.iucr.org/resources/cif/documentation',
    'https://www.iucr.org/resources/cif/dictionaries/browse/cif_core1',
    'https://checkcif.iucr.org/',
    'https://docs.materialsproject.org/methodology/materials-methodology/understanding-structures-and-properties-in-the-materials-project',
    'https://docs.materialsproject.org/downloading-data/using-the-api/querying-data',
    'https://docs.materialsproject.org/frequently-asked-questions',
    'https://www.crystallography.net/cod/',
    'https://spglib.readthedocs.io/en/v2.7.0/api/autodoc/spglib.html',
  ];
  for (const source of requiredSources) if (!body.includes(source)) errors.push(`${file}: missing reviewed source ${source}`);

  for (const forbiddenHeading of ['## Inputs', '## Outputs', '## Requirement', '## Repeatability', '## Dependencies', '## Alternatives', '## Exclusions']) {
    if (body.includes(forbiddenHeading)) errors.push(`${file}: restores fixed heading ${forbiddenHeading}`);
  }
  if (/Detailed content for this operation|stable destination is reserved/i.test(body)) errors.push(`${file}: reviewed article still contains placeholder prose`);
}

if (errors.length > 0) {
  console.error(`Reviewed-topic validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Reviewed topics valid: ${reviewed.size} reviewed narrative(s), including Obtain a Material Structure with topic-specific boundaries and official sources.`);

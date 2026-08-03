import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const articlePath = 'src/content/topics/surface-energy-and-work-function.md';
const reviewPath = 'docs/reviews/2026-08-04-surface-energy-and-work-function.md';
const manifestPath = 'sources/reviewed-links.json';
const errors = [];
const article = await readFile(new URL(articlePath, root), 'utf8');
const review = await readFile(new URL(reviewPath, root), 'utf8');
const manifest = JSON.parse(await readFile(new URL(manifestPath, root), 'utf8'));

for (const statement of ['topic_slug: surface-energy-and-work-function', 'status: reviewed']) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing frontmatter ${JSON.stringify(statement)}`);
}
const headings = article.match(/^## /gm) ?? [];
if (headings.length !== 24) errors.push(`${articlePath}: expected 24 natural sections, found ${headings.length}`);

for (const statement of [
  'A Miller index identifies an orientation, not a unique surface.',
  'The factor two counts the two equivalent surfaces.',
  'One equation determines only the sum of the two surface excesses.',
  'the surface free energy becomes a grand-potential excess.',
  'The derived `γ` then drifts linearly with slab thickness',
  'An ideal unreconstructed polar termination can then have a divergent electrostatic energy',
  'Converge both against slab thickness, vacuum, lateral cell, k sampling',
  'The expression is meaningful only when the vacuum reference is flat',
  'the left and right plateaus may be unequal',
  'ionization potential `E_vac - E_VBM` and electron affinity `E_vac - E_CBM`',
  'The Wulff shape is an equilibrium construction.',
  'It is not a rerun of InterMat',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing scientific distinction ${JSON.stringify(statement)}`);
}

if (/^## (?:Inputs|Outputs|Requirement|Repeatability|Dependencies|Alternatives|Exclusions)$/m.test(article)) errors.push(`${articlePath}: restores a fixed article contract`);
if (/Detailed content for this operation|stable destination is reserved/i.test(article)) errors.push(`${articlePath}: contains placeholder prose`);
if (/(?:use|choose|set|apply|recommend)[^.!?]{0,80}universal (?:slab|vacuum|cutoff|k[- ]?mesh|smearing|force|dipole|work function)/i.test(article)) errors.push(`${articlePath}: suggests a universal surface prescription`);

const expectedSources = [
  'https://doi.org/10.1088/0953-8984/8/36/005',
  'https://doi.org/10.1103/PhysRevB.49.16798',
  'https://doi.org/10.1103/PhysRevB.59.12301',
  'https://doi.org/10.1088/0022-3719/12/22/036',
  'https://doi.org/10.1103/PhysRev.82.87',
  'https://doi.org/10.1103/PhysRevB.65.035406',
  'https://doi.org/10.1103/PhysRevApplied.19.037001',
  'https://doi.org/10.1116/1.4934685',
  'https://doi.org/10.1039/D4DD00031E',
  'https://vasp.at/wiki/Computing_the_work_function',
  'https://gpaw.readthedocs.io/tutorialsexercises/electrostatics/dipole_correction/dipole.html',
];
const record = manifest.topics.find((topic) => topic.topic_slug === 'surface-energy-and-work-function');
if (!record) {
  errors.push(`${manifestPath}: missing surface topic record`);
} else {
  if (record.article !== articlePath || record.review !== reviewPath) errors.push(`${manifestPath}: article or review path mismatch`);
  if (JSON.stringify(record.links.map((entry) => entry.url)) !== JSON.stringify(expectedSources)) errors.push(`${manifestPath}: exact source set or order mismatch`);
}
for (const source of expectedSources) {
  if (!article.includes(source)) errors.push(`${articlePath}: missing reviewed source ${source}`);
  if (!review.includes(source)) errors.push(`${reviewPath}: missing reviewed source ${source}`);
}

for (const statement of [
  'reviewed within the declared educational and execution scope',
  'The first two scripts execute no DFT code and ingest no material data.',
  'The repository does not claim to have rerun the underlying InterMat calculations.',
  'Execution success is not surface or work-function convergence for a real calculation.',
  'It does not establish a real surface energy',
  'The first two are conceptual plots of invented data.',
]) {
  if (!review.toLowerCase().includes(statement.toLowerCase())) errors.push(`${reviewPath}: missing review boundary ${JSON.stringify(statement)}`);
}

if (errors.length > 0) {
  console.error(`Reviewed surface validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Reviewed surface topic valid: 24 natural sections, exact 11-source coverage, slab/reference/polarity/plateau/semiconductor boundaries, and no universal numerical prescription.');

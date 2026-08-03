import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const articlePath = 'src/content/topics/relative-and-formation-energies.md';
const reviewPath = 'docs/reviews/2026-08-03-relative-and-formation-energies.md';
const manifestPath = 'sources/reviewed-links.json';
const errors = [];
const article = await readFile(new URL(articlePath, root), 'utf8');
const review = await readFile(new URL(reviewPath, root), 'utf8');
const manifest = JSON.parse(await readFile(new URL(manifestPath, root), 'utf8'));

for (const statement of [
  'topic_slug: relative-and-formation-energies',
  'status: reviewed',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing frontmatter ${JSON.stringify(statement)}`);
}

const headings = article.match(/^## /gm) ?? [];
if (headings.length !== 17) errors.push(`${articlePath}: expected 17 natural sections, found ${headings.length}`);

for (const statement of [
  'ΔE_rel(i | r) = [E_i - E_r] / N',
  'ΔE_rxn = Σ_j ν_j E_j',
  'ΔE_f = E_compound - Σ_i n_i μ_i^ref',
  'F(T,V) = E_DFT(V) + F_vib(T,V) + F_el(T,V) + F_other(T,V)',
  'G(T,p) = min_V [F(T,V) + pV]',
  'Numerical smearing used for Brillouin-zone integration is not automatically `F_el` at a physical temperature.',
  'The acceptance criterion belongs to the target difference and intended conclusion, not to a universal cutoff or mesh.',
  'A compound can have a negative formation energy and still decompose exothermically into other compounds.',
  'Formation energy alone establishes neither equilibrium stability nor experimental synthesizability.',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing scientific distinction ${JSON.stringify(statement)}`);
}

for (const heading of [
  '## Inputs',
  '## Outputs',
  '## Requirement',
  '## Repeatability',
  '## Dependencies',
  '## Alternatives',
  '## Exclusions',
]) {
  if (article.includes(heading)) errors.push(`${articlePath}: restores fixed heading ${heading}`);
}

if (/Detailed content for this operation|stable destination is reserved/i.test(article)) {
  errors.push(`${articlePath}: reviewed article still contains placeholder prose`);
}
if (/(?:use|choose|set|apply|recommend)[^.!?]{0,80}universal (?:cutoff|k[- ]?mesh|q[- ]?mesh|vacuum|supercell|smearing|force threshold|SCF threshold|Hubbard U|mu\*)/i.test(article)) {
  errors.push(`${articlePath}: suggests a universal numerical prescription`);
}

const expectedSources = [
  'https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds',
  'https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/thermodynamic-stability',
  'https://goldbook.iupac.org/terms/view/G02629',
  'https://phonopy.github.io/phonopy/formulation.html',
  'https://doi.org/10.1103/PhysRev.136.B864',
  'https://doi.org/10.1103/PhysRev.140.A1133',
  'https://doi.org/10.1103/PhysRev.137.A1441',
  'https://doi.org/10.1103/PhysRevB.84.045115',
  'https://doi.org/10.1103/PhysRevB.85.115104',
  'https://doi.org/10.1038/s41524-018-0143-2',
];
const manifestRecord = manifest.topics.find((topic) => topic.topic_slug === 'relative-and-formation-energies');
if (!manifestRecord) {
  errors.push(`${manifestPath}: missing topic record`);
} else {
  if (manifestRecord.article !== articlePath) errors.push(`${manifestPath}: article path mismatch`);
  if (manifestRecord.review !== reviewPath) errors.push(`${manifestPath}: review path mismatch`);
  if (JSON.stringify(manifestRecord.links.map((entry) => entry.url)) !== JSON.stringify(expectedSources)) errors.push(`${manifestPath}: exact source set or order mismatch`);
}

for (const source of expectedSources) {
  if (!article.includes(source)) errors.push(`${articlePath}: missing reviewed source ${source}`);
  if (!review.includes(source)) errors.push(`${reviewPath}: missing reviewed source ${source}`);
}

for (const statement of [
  'reviewed within the declared educational and execution scope',
  'The scripts use Python 3.12 standard-library arithmetic.',
  'Execution success is not energy convergence for a real calculation.',
  'It does not establish a real formation energy',
  'They are conceptual diagrams, not plots of calculated data.',
]) {
  if (!review.toLowerCase().includes(statement.toLowerCase())) errors.push(`${reviewPath}: missing review boundary ${JSON.stringify(statement)}`);
}

if (errors.length > 0) {
  console.error(`Reviewed energy-comparison validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Reviewed energy comparison valid: 17 natural sections, exact 10-source coverage, explicit reference and normalization equations, formation-versus-stability boundary, and no universal numerical prescription.');

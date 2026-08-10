import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const articlePath = 'src/content/topics/adsorption-energies.md';
const reviewPath = 'docs/reviews/2026-08-04-adsorption-energies.md';
const manifestPath = 'sources/reviewed-links.json';
const errors = [];
const article = await readFile(new URL(articlePath, root), 'utf8');
const review = await readFile(new URL(reviewPath, root), 'utf8');
const manifest = JSON.parse(await readFile(new URL(manifestPath, root), 'utf8'));

for (const statement of ['topic_slug: adsorption-energies', 'status: reviewed']) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing frontmatter ${JSON.stringify(statement)}`);
}
const headings = article.match(/^## /gm) ?? [];
if (headings.length < 8 || headings.length > 14) {
  errors.push(`${articlePath}: expected 8-14 continuous manual sections, found ${headings.length}`);
}

for (const statement of [
  'The final relaxed structure is the state being measured',
  'Some literature defines a positive binding energy as the negative of this expression.',
  'Do not compare an average at one coverage with a differential value at another.',
  'Adsorption energy compares relaxed reactants and product under a written reaction.',
  'State whether coverage means site fraction, adsorbates per surface atom, molecules per area, or surface-cell stoichiometry.',
  'One adsorbate in a larger cell changes both coverage and image separation.',
  'The molecule may be a poor numerical or chemical reference',
  'In atom-centred bases, the combined system can use basis functions on the other fragment',
  'A normal program exit establishes only that the executable reached an exit path.',
  'Satisfaction of the declared SCF residual criterion is only an inner numerical condition.',
  'Numerical convergence of an adsorption energy should be assessed only after coverage and adsorbate order, charge ensemble, electrostatic boundary treatment, and relaxation constraints are fixed.',
  'A schematic thermodynamic ledger is',
  'It does not make a neutral vacuum slab a constant-potential electrochemical interface.',
  'this repository did not rerun the calculations',
  'A migration, dissociation, desorption, or reaction barrier requires a path',
  'one negative energy',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing scientific distinction ${JSON.stringify(statement)}`);
}

if (/^## (?:Inputs|Outputs|Requirement|Repeatability|Dependencies|Alternatives|Exclusions)$/m.test(article)) errors.push(`${articlePath}: restores a fixed article contract`);
if (/Detailed content for this operation|stable destination is reserved/i.test(article)) errors.push(`${articlePath}: contains placeholder prose`);
if (/(?:use|choose|set|apply|recommend)[^.!?]{0,80}universal (?:cutoff|k[- ]?mesh|slab|vacuum|coverage|cell|smearing|force|SCF|adsorption height|correction)/i.test(article)) errors.push(`${articlePath}: suggests a universal adsorption prescription`);

const expectedSources = [
  'https://doi.org/10.1021/acs.jpcc.7b12258',
  'https://cmr.fysik.dtu.dk/adsorption/adsorption.html',
  'https://wiki.fysik.dtu.dk/cmr-files/adsorption.db',
  'https://cmr.fysik.dtu.dk/index.html',
  'https://doi.org/10.1103/PhysRevB.85.235149',
  'https://doi.org/10.1103/PhysRevB.46.16067',
  'https://doi.org/10.1021/ja3080117',
  'https://doi.org/10.1021/ja407293b',
  'https://doi.org/10.1021/jp047349j',
  'https://doi.org/10.1103/PhysRevB.65.035406',
  'https://doi.org/10.1080/00268977000101561',
  'https://doi.org/10.1063/1.1329672',
  'https://docs.ase-lib.org/ase/build/surface.html',
  'https://pymatgen.org/pymatgen.core.html#pymatgen.core.adsorption.AdsorbateSiteFinder',
];
const record = manifest.topics.find((topic) => topic.topic_slug === 'adsorption-energies');
if (!record) {
  errors.push(`${manifestPath}: missing adsorption topic record`);
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
  'The repository does not claim to have rerun the underlying CMR calculations.',
  'Execution success is not adsorption-energy convergence for a real calculation.',
  'It does not establish a real adsorption configuration',
  'The first two media assets are conceptual plots of invented data.',
]) {
  if (!review.toLowerCase().includes(statement.toLowerCase())) errors.push(`${reviewPath}: missing review boundary ${JSON.stringify(statement)}`);
}

if (errors.length > 0) {
  console.error(`Reviewed adsorption validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Reviewed adsorption topic valid: ${headings.length} continuous manual sections, exact 14-source coverage, reaction/sign/site/coverage/reference/free-energy/kinetics boundaries, and no universal numerical prescription.`);

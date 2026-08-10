import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const articlePath = 'src/content/topics/defect-formation-energies-and-charge-states.md';
const reviewPath = 'docs/reviews/2026-08-04-defect-formation-energies-and-charge-states.md';
const manifestPath = 'sources/reviewed-links.json';
const errors = [];
const article = await readFile(new URL(articlePath, root), 'utf8');
const review = await readFile(new URL(reviewPath, root), 'utf8');
const manifest = JSON.parse(await readFile(new URL(manifestPath, root), 'utf8'));

for (const statement of ['topic_slug: defect-formation-energies-and-charge-states', 'status: reviewed']) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing frontmatter ${JSON.stringify(statement)}`);
}
const headings = article.match(/^## /gm) ?? [];
if (headings.length < 12 || headings.length > 26) {
  errors.push(`${articlePath}: expected 12-26 natural sections, found ${headings.length}`);
}

for (const statement of [
  'Its primary result is therefore a formation energy as a function of atomic and electron chemical potentials, not a single intrinsic “defect energy.”',
  'Call it a formation free energy only when the declared thermal and statistical-mechanical contributions are included.',
  'The result is energy per defect supercell, normally reported per defect rather than per atom.',
  'These allowed domains come from phase stability, not from selecting arbitrary “rich” and “poor” numbers.',
  'An equilibrium Fermi level must instead satisfy charge neutrality together with all included charged defects, dopants, electrons, and holes.',
  'A periodic charged supercell is not an isolated charged defect',
  'An electrostatic correction targets only the terms in its derivation.',
  'adding another independent potential-alignment term can double count it.',
  'Only crossings on the lower envelope delimit thermodynamically stable charge states.',
  'A Kohn–Sham eigenvalue is neither automatically a thermodynamic transition level nor an optical excitation energy.',
  'A static `E_f` may approximate only one enthalpic part of `G_f`',
  'A low equilibrium formation energy does not supply a migration barrier or equilibration time.',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing scientific distinction ${JSON.stringify(statement)}`);
}

if (/^## (?:Inputs|Outputs|Requirement|Repeatability|Dependencies|Alternatives|Exclusions)$/m.test(article)) {
  errors.push(`${articlePath}: restores a fixed article contract`);
}
if (/Detailed content for this operation|stable destination is reserved/i.test(article)) errors.push(`${articlePath}: contains placeholder prose`);
if (/(?:use|choose|set|apply|recommend)[^.!?]{0,80}universal (?:supercell|cutoff|k[- ]?mesh|correction|dielectric|force|formation energy|concentration)/i.test(article)) {
  errors.push(`${articlePath}: suggests a universal defect prescription`);
}

const expectedSources = [
  'https://doi.org/10.1103/PhysRevLett.67.2339',
  'https://doi.org/10.1063/1.1682673',
  'https://doi.org/10.1103/RevModPhys.86.253',
  'https://doi.org/10.1103/PhysRevLett.102.016402',
  'https://doi.org/10.1103/PhysRevB.89.195205',
  'https://doi.org/10.1103/PhysRevB.51.4014',
  'https://doi.org/10.1103/PhysRevB.78.235104',
  'https://doi.org/10.1039/D3CS00432E',
  'https://doi.org/10.1016/j.cpc.2018.01.004',
  'https://doped.readthedocs.io/en/stable/doped.thermodynamics.html',
];
const record = manifest.topics.find((topic) => topic.topic_slug === 'defect-formation-energies-and-charge-states');
if (!record) {
  errors.push(`${manifestPath}: missing defect topic record`);
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
  'The scripts execute no DFT code and ingest no material data.',
  'Execution success is not defect convergence for a real calculation.',
  'It does not establish a real defect configuration',
  'They are conceptual plots of invented data',
]) {
  if (!review.toLowerCase().includes(statement.toLowerCase())) errors.push(`${reviewPath}: missing review boundary ${JSON.stringify(statement)}`);
}

if (errors.length > 0) {
  console.error(`Reviewed defect validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Reviewed defect topic valid: ${headings.length} natural sections, exact 10-source coverage, reservoir/correction/envelope/neutrality boundaries, and no universal numerical prescription.`);

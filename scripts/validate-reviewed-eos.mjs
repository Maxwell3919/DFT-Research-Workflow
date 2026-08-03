import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const articlePath = 'src/content/topics/equation-of-state-and-structural-phase-stability.md';
const reviewPath = 'docs/reviews/2026-08-03-equation-of-state-and-structural-phase-stability.md';
const manifestPath = 'sources/reviewed-links.json';
const errors = [];
const article = await readFile(new URL(articlePath, root), 'utf8');
const review = await readFile(new URL(reviewPath, root), 'utf8');
const manifest = JSON.parse(await readFile(new URL(manifestPath, root), 'utf8'));

for (const statement of ['topic_slug: equation-of-state-and-structural-phase-stability', 'status: reviewed']) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing frontmatter ${JSON.stringify(statement)}`);
}
const headings = article.match(/^## /gm) ?? [];
if (headings.length !== 19) errors.push(`${articlePath}: expected 19 natural sections, found ${headings.length}`);

for (const statement of [
  'P(V) = -∂E(V) / ∂V',
  'B(V) = -V ∂P/∂V = V ∂²E/∂V²',
  'x = (V₀ / V)^(2/3)',
  'H_i(p) = min_V [E_i(V) + pV]',
  'H_α(p_t) = H_β(p_t)',
  'G_i(T,p) = min_V [E_i(V) + F_vib,i(T,V) + F_el,i(T,V) + F_other,i(T,V) + pV]',
  'A clamped-ion curvature and a relaxed-ion curvature are different response quantities.',
  'There is no universal number of points or percentage volume range.',
  'An intersection of two `E(V)` curves at one common volume is not generally the transition condition.',
  'An EOS analysis does not calculate a transformation pathway or rate.',
  'A positive fitted bulk modulus shows positive curvature along the sampled hydrostatic direction near the fitted minimum.',
  'Numerical occupation smearing is not automatically `F_el`.',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing scientific distinction ${JSON.stringify(statement)}`);
}

if (/^## (?:Inputs|Outputs|Requirement|Repeatability|Dependencies|Alternatives|Exclusions)$/m.test(article)) {
  errors.push(`${articlePath}: restores a fixed article contract`);
}
if (/Detailed content for this operation|stable destination is reserved/i.test(article)) errors.push(`${articlePath}: contains placeholder prose`);
if (/(?:use|choose|set|apply|recommend)[^.!?]{0,80}universal (?:point count|volume range|pressure range|cutoff|k[- ]?mesh|smearing|force threshold|stress threshold|fit form)/i.test(article)) {
  errors.push(`${articlePath}: suggests a universal EOS prescription`);
}

const expectedSources = [
  'https://doi.org/10.1103/PhysRev.71.809',
  'https://doi.org/10.1073/pnas.30.9.244',
  'https://doi.org/10.1029/JB092iB09p09319',
  'https://doi.org/10.1103/PhysRevB.90.224104',
  'https://docs.ase-lib.org/ase/eos.html',
  'https://vasp.at/wiki/Volume_relaxation',
  'https://phonopy.github.io/phonopy/qha.html',
  'https://goldbook.iupac.org/terms/view/H02752',
];
const record = manifest.topics.find((topic) => topic.topic_slug === 'equation-of-state-and-structural-phase-stability');
if (!record) {
  errors.push(`${manifestPath}: missing EOS topic record`);
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
  'They execute no DFT code and ingest no material data.',
  'Execution success is not EOS convergence for a real calculation.',
  'It does not establish a real equilibrium volume',
  'They are conceptual diagrams, not plots of calculated data.',
]) {
  if (!review.toLowerCase().includes(statement.toLowerCase())) errors.push(`${reviewPath}: missing review boundary ${JSON.stringify(statement)}`);
}

if (errors.length > 0) {
  console.error(`Reviewed EOS validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Reviewed EOS valid: 19 natural sections, exact 8-source coverage, derivative and common-pressure equations, hydrostatic-versus-stability boundaries, and no universal numerical prescription.');

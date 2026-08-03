import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const articlePath = 'src/content/topics/compositional-phase-stability-and-convex-hulls.md';
const reviewPath = 'docs/reviews/2026-08-04-compositional-phase-stability-and-convex-hulls.md';
const dataPath = 'examples/practical-guides/data/oqmd-li-p-binary-20260804.json';
const manifestPath = 'sources/reviewed-links.json';
const errors = [];
const article = await readFile(new URL(articlePath, root), 'utf8');
const review = await readFile(new URL(reviewPath, root), 'utf8');
const snapshot = JSON.parse(await readFile(new URL(dataPath, root), 'utf8'));
const manifest = JSON.parse(await readFile(new URL(manifestPath, root), 'utf8'));

for (const statement of ['topic_slug: compositional-phase-stability-and-convex-hulls', 'status: reviewed']) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing frontmatter ${JSON.stringify(statement)}`);
}
const headings = article.match(/^## /gm) ?? [];
if (headings.length !== 21) errors.push(`${articlePath}: expected 21 natural sections, found ${headings.length}`);

for (const statement of [
  'A negative `ΔE_f` means that this particular elemental decomposition is energetically uphill within the model.',
  'Every point on it is a macroscopic mixture of its endpoints, not an interpolated homogeneous crystal structure.',
  'E_above_hull,k = G_k - E_hull(x_k)',
  'A computed hull is monotonic with respect to adding candidates',
  'SCF convergence of each record is necessary but does not establish convergence of `E_above_hull` or decomposition identity.',
  'Φ = G - Σ_{i in R} μ_i N_i',
  'A stability polygon in chemical-potential space must not be read as a range of bulk compositions',
  'These distributions do not provide a universal energy-above-hull threshold',
  'This is a real public DFT-data case, not a claim that this project reran the underlying calculations.',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing scientific distinction ${JSON.stringify(statement)}`);
}

if (/^## (?:Inputs|Outputs|Requirement|Repeatability|Dependencies|Alternatives|Exclusions)$/m.test(article)) {
  errors.push(`${articlePath}: restores a fixed article contract`);
}
if (/Detailed content for this operation|stable destination is reserved/i.test(article)) errors.push(`${articlePath}: contains placeholder prose`);
if (/(?:use|choose|set|apply|recommend)[^.!?]{0,80}universal (?:energy|threshold|cutoff|k[- ]?mesh|smearing|candidate count|temperature)/i.test(article)) {
  errors.push(`${articlePath}: suggests a universal hull prescription`);
}

const expectedSources = [
  'https://doi.org/10.1021/cm702327g',
  'https://doi.org/10.1038/s41524-018-0143-2',
  'https://doi.org/10.1126/sciadv.1600225',
  'https://doi.org/10.1103/PhysRevB.84.045115',
  'https://doi.org/10.1021/jacs.1c06229',
  'https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds',
  'https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/thermodynamic-stability',
  'https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/chemical-potential-diagrams-cpds',
  'https://pymatgen.org/pymatgen.analysis.html#module-pymatgen.analysis.phase_diagram',
  'https://doi.org/10.1007/s11837-013-0755-4',
];
const record = manifest.topics.find((topic) => topic.topic_slug === 'compositional-phase-stability-and-convex-hulls');
if (!record) {
  errors.push(`${manifestPath}: missing convex-hull topic record`);
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
  'The repository does not claim to have rerun the underlying OQMD calculations.',
  'Execution success is not DFT convergence for a real calculation.',
  'It does not independently establish OQMD accuracy',
  'They are plots of a real public DFT database snapshot',
]) {
  if (!review.toLowerCase().includes(statement.toLowerCase())) errors.push(`${reviewPath}: missing review boundary ${JSON.stringify(statement)}`);
}

if (snapshot.entries?.length !== 46 || snapshot.fields?.length !== 9) errors.push(`${dataPath}: expected 46 rows and 9 fields`);
for (const key of ['source_url', 'retrieved_at', 'source_timestamp', 'api_version', 'license', 'license_url']) {
  if (!snapshot[key]) errors.push(`${dataPath}: missing provenance field ${key}`);
}
if (snapshot.license !== 'CC BY 4.0' || !snapshot.source_url.startsWith('https://oqmd.org/oqmdapi/formationenergy?')) {
  errors.push(`${dataPath}: licence or exact OQMD query provenance changed`);
}

if (errors.length > 0) {
  console.error(`Reviewed convex-hull validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Reviewed convex hull valid: 21 natural sections, exact 10-source coverage, closed/open-system and formation/hull boundaries, a 46-row attributed OQMD snapshot, and no universal numerical prescription.');

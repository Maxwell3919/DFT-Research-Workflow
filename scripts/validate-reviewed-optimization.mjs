import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const articlePath = 'src/content/topics/optimize-structure.md';
const reviewPath = 'docs/reviews/2026-08-03-optimize-structure.md';
const errors = [];
const article = await readFile(new URL(articlePath, root), 'utf8');
const review = await readFile(new URL(reviewPath, root), 'utf8');
const normalizedReview = review.replace(/\s+/g, ' ').toLowerCase();

for (const statement of [
  'topic_slug: optimize-structure',
  'status: reviewed',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing frontmatter ${JSON.stringify(statement)}`);
}

for (const heading of [
  '## Follow the common route from model to accepted geometry',
  '## Define the quantity and variables being optimized',
  '## Begin from physically credible starting structures',
  '## Make forces and stress trustworthy enough to drive motion',
  '## Read energy, force, stress, and displacement together',
  '## Optimizer stopping is not proof of a physical minimum',
  '## Verify the final candidate independently',
  '## Preserve an optimization evidence package',
  '## What this task does not establish',
  '## Sources and methods',
]) {
  if (!article.includes(heading)) errors.push(`${articlePath}: missing topic-specific section ${heading}`);
}

for (const statement of [
  'This route is common, not universal.',
  'Normal program termination does not establish SCF convergence.',
  'SCF convergence does not establish ionic optimization convergence.',
  'Ionic optimization convergence does not identify the lowest relevant state.',
  'The lowest identified state is not automatically the scientifically appropriate reference state.',
  'A fixed-cell relaxation minimizes the electronic energy with respect to selected atomic coordinates while holding the lattice fixed.',
  'Those are different physical problems.',
  'Empty numerical space is part of the boundary model, not a material coordinate seeking an equilibrium length.',
  'A constrained stationary point is stationary only in the active subspace.',
  'Local optimizers normally find a nearby basin, not the global minimum of a complicated potential-energy surface.',
  'A total energy that appears smooth is not sufficient when force or stress noise is comparable to the intended stopping criterion.',
  'Do not interpret a state switch as ordinary optimizer noise.',
  'The optimizer is a numerical strategy, not the definition of the scientific task.',
  'Hitting the maximum number of steps is program termination, not structural convergence.',
  'A stopping message means that the implemented criteria were satisfied in the active subspace, or that another termination condition was reached.',
  'Different final basins are not failed calculations.',
  'After the optimizer stops, run a fresh energy-and-gradient evaluation on the exact final structure using the declared verification settings.',
  'The B-stage convergence study is an initial baseline rather than a permanent certificate.',
  'Optimization is not a universal prerequisite for every reference-state calculation.',
  'A final structure alone is not a reproducible optimization result.',
  'It also does not replace **Calculate the Reference Ground State**.',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing scientific boundary ${JSON.stringify(statement)}`);
}

for (const source of [
  'https://www.quantum-espresso.org/Doc/INPUT_PW.html',
  'https://docs.ase-lib.org/ase/optimize.html',
  'https://docs.ase-lib.org/ase/constraints.html',
  'https://vasp.at/wiki/Structure_optimization',
  'https://vasp.at/wiki/ISIF',
  'https://manual.cp2k.org/trunk/methods/optimization/geometry_and_cell_opt.html',
  'https://doi.org/10.1080/00268976900100941',
  'https://doi.org/10.1103/PhysRevB.32.3780',
  'https://doi.org/10.1103/PhysRevLett.97.170201',
  'https://doi.org/10.1021/jp970984n',
]) {
  if (!article.includes(source)) errors.push(`${articlePath}: missing reviewed source ${source}`);
  if (!review.includes(source)) errors.push(`${reviewPath}: missing reviewed source ${source}`);
}

for (const statement of [
  'reviewed within the declared educational and execution scope',
  'without restoring those identifiers as parallel reader-facing operations',
  'The scripts calculate no electronic energy with a DFT code',
  'Execution success is not structural convergence for a real calculation',
  'None of those checks establishes a local or global minimum for a real calculation',
  'examples/practical-guides/silicon_qe_relax.py',
  'examples/practical-guides/silicon_qe_restarts.py',
  'conceptual teaching fixtures, not declared companions',
  'None of those checks establishes structural convergence, a local or global minimum, reference-ground-state identity, physical stability, method accuracy, transferability, or scientific support for any real DFT study.',
]) {
  if (!normalizedReview.includes(statement.toLowerCase())) errors.push(`${reviewPath}: missing review boundary ${JSON.stringify(statement)}`);
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
if (/universal force threshold|universal stress threshold|universally sufficient force|universally sufficient stress/i.test(article)) {
  errors.push(`${articlePath}: suggests a universal optimization threshold`);
}

if (errors.length > 0) {
  console.error(`Reviewed optimization validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Reviewed optimization valid: operation-first common route, four distinct convergence/state gates, exact 10-source coverage, active-subspace and local-minimum boundaries, O13/O14/O20 migration boundary, and no universal threshold prescription.');

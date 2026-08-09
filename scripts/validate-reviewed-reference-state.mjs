import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const articlePath = 'src/content/topics/calculate-reference-ground-state.md';
const reviewPath = 'docs/reviews/2026-08-03-calculate-reference-ground-state.md';
const errors = [];
const article = await readFile(new URL(articlePath, root), 'utf8');
const review = await readFile(new URL(reviewPath, root), 'utf8');
const normalizedReview = review.replace(/\s+/g, ' ').toLowerCase();

for (const statement of [
  'topic_slug: calculate-reference-ground-state',
  'status: reviewed',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing frontmatter ${JSON.stringify(statement)}`);
}

for (const heading of [
  '## Define the reference state operationally',
  '## Freeze geometry and method identity',
  '## Perform a final fixed-geometry state calculation',
  '## Enumerate candidate electronic states',
  '## Separate a fresh start from a continuation',
  '## Choose occupations and electronic temperature deliberately',
  '## Preserve charge and electrostatic boundary conditions',
  '## Control spin, magnetization, and relativistic branches',
  '## Distinguish internal SCF convergence from state verification',
  '## Diagnose oscillation, charge sloshing, and false convergence',
  '## Compare candidate energies under one common evaluator',
  '## Re-evaluate forces and stress on the fixed structure',
  '## Verify state identity after convergence',
  '## Define the reference energy and normalization',
  '## Repeat critical states from independent initializations',
  '## Package charge density and wavefunction lineage',
  '## Hand the reference state to target calculations',
  '## Preserve a reference-state evidence package',
  '## What this task does not establish',
  '## Sources and methods',
]) {
  if (!article.includes(heading)) errors.push(`${articlePath}: missing topic-specific section ${heading}`);
}

for (const statement of [
  'A successful SCF solution is not automatically the global electronic ground state.',
  'The reference calculation is fixed-geometry',
  'This calculation is not simply “the last SCF in the relaxation.”',
  'One arbitrary initialization is not a search strategy.',
  'Restart success means that a compatible stored state was accepted and the calculation completed.',
  'A smearing width chosen for Brillouin-zone integration is not automatically a physical temperature.',
  'Energy values from different charges or electrostatic references are not directly ranked',
  'Initial moments guide the solver toward candidate magnetic states; they do not define the final state by themselves.',
  'A small final residual does not identify which self-consistent basin was reached.',
  'Increasing the iteration limit does not repair an unstable state evaluator.',
  'The lowest accepted candidate among the tested inventory is the current reference.',
  'not a universal workflow law',
  'This same-geometry ranking answers a fixed-nuclei',
  'For magnetostructural ordering',
  'Force and stress verification does not establish vibrational, dynamical, thermal, or thermodynamic stability.',
  'State identity should be checked from outputs, not inferred from input labels.',
  'The reference energy is a provenance anchor for one state, not a standalone physical observable.',
  'Repeated convergence to one state strengthens operational robustness but still does not prove exhaustive global minimality.',
  'A file being readable is not evidence that it is scientifically compatible.',
  'The reference state closes the common C-stage backbone and opens the D-stage branching library.',
  'A single “SCF converged” line is not a reference-state record.',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing scientific boundary ${JSON.stringify(statement)}`);
}

for (const source of [
  'https://www.quantum-espresso.org/Doc/INPUT_PW.html',
  'https://vasp.at/wiki/Electronic_minimization',
  'https://vasp.at/wiki/Electronic_ground-state_properties',
  'https://vasp.at/wiki/ISTART',
  'https://vasp.at/wiki/ICHARG',
  'https://vasp.at/wiki/MAGMOM',
  'https://vasp.at/wiki/LCHARG',
  'https://vasp.at/wiki/LWAVE',
  'https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/SCF.html',
  'https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT.html',
  'https://docs.abinit.org/tutorial/base1/',
  'https://doi.org/10.1103/PhysRev.136.B864',
  'https://doi.org/10.1103/PhysRev.140.A1133',
  'https://doi.org/10.1103/PhysRev.137.A1441',
  'https://doi.org/10.1088/1361-648X/ab31c0',
]) {
  if (!article.includes(source)) errors.push(`${articlePath}: missing reviewed source ${source}`);
  if (!review.includes(source)) errors.push(`${reviewPath}: missing reviewed source ${source}`);
}

for (const statement of [
  'reviewed within the declared educational and execution scope',
  'without restoring those identifiers as parallel reader-facing operations',
  'The scripts calculate no electronic energy with a DFT code',
  'Execution success is not reference-ground-state verification for a real calculation',
  'None of those checks establishes global ground-state identity for a real calculation',
  'examples/practical-guides/silicon_qe_convergence.py',
  'examples/practical-guides/silicon_qe_restarts.py',
  'they are not declared execution evidence',
  'None of those checks establishes a real reference ground state, exhaustive global ground-state identity, SCF convergence, force or stress accuracy, physical stability, method accuracy, transferability, or scientific support for any real DFT study.',
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
if (/universal SCF threshold|universal energy tolerance|universally sufficient SCF|universal number of candidate states/i.test(article)) {
  errors.push(`${articlePath}: suggests a universal reference-state threshold`);
}

if (errors.length > 0) {
  console.error(`Reviewed reference-state validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Reviewed reference state valid: 20 natural sections, exact 15-source coverage, fixed-geometry and candidate-set boundaries, O13/O20 migration boundary, and no universal threshold prescription.');

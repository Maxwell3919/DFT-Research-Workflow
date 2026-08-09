import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const articlePath = 'src/content/topics/test-numerical-convergence.md';
const reviewPath = 'docs/reviews/2026-08-03-test-numerical-convergence.md';
const errors = [];
const article = await readFile(new URL(articlePath, root), 'utf8');
const review = await readFile(new URL(reviewPath, root), 'utf8');
const normalizedReview = review.replace(/\s+/g, ' ').toLowerCase();

for (const statement of [
  'topic_slug: test-numerical-convergence',
  'status: reviewed',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing frontmatter ${JSON.stringify(statement)}`);
}

for (const heading of [
  '## Begin with the claim and the observable',
  '## Separate completion, solver convergence, and observable convergence',
  '## Define tolerances in the units of the decision',
  '## Preserve the same physical state across a sweep',
  '## Converge coupled numerical controls together',
  '## Test differences and derivatives directly',
  '## Treat k-point sampling and occupations as one problem',
  '## Test finite-size behaviour within a declared boundary model',
  '## Converge response grids and interpolation separately',
  '## Expect non-monotonic and anisotropic behaviour',
  '## Estimate residual numerical uncertainty',
  '## Choose a stopping point, not a universal maximum',
  '## Limit the reuse of convergence evidence',
  '## Preserve a convergence evidence package',
  '## What this task does not establish',
  '## Sources and methods',
]) {
  if (!article.includes(heading)) errors.push(`${articlePath}: missing topic-specific section ${heading}`);
}

for (const statement of [
  'It is not a property of an input file in isolation.',
  'Neither result alone establishes that the target observable is stable',
  'Only the third line is numerical convergence.',
  'A fixed decimal count is not a scientific tolerance.',
  'Do not average over state switches and call the result converged.',
  'A recommended library cutoff is useful prior evidence, not a substitute for the present model and observable.',
  'At B, the purpose is to establish a documented baseline',
  'Geometry is not passive.',
  'A smearing width used as an integration device is not automatically a physical electronic temperature.',
  'An apparently smooth interpolated curve is not evidence that the underlying coarse grid is sufficient.',
  'A single small difference between the final two settings is therefore weak evidence.',
  'The most expensive tested setting is not automatically the correct production setting.',
  'The durable output of this task is not one parameter list.',
  'Numerical convergence does not establish that the physical model is appropriate',
  'Under the declared model, method, implementation, and tested controls, the named observable is stable within the reported residual numerical uncertainty.',
]) {
  if (!article.includes(statement)) errors.push(`${articlePath}: missing scientific boundary ${JSON.stringify(statement)}`);
}

for (const source of [
  'https://www.quantum-espresso.org/Doc/INPUT_PW.html',
  'https://www.quantum-espresso.org/Doc/INPUT_PH.html',
  'https://doi.org/10.1103/PhysRevB.13.5188',
  'https://doi.org/10.1103/PhysRevB.40.3616',
  'https://doi.org/10.1103/PhysRevB.49.16223',
  'https://doi.org/10.1126/science.aad3000',
  'https://doi.org/10.1038/s41524-018-0127-2',
  'https://archive.materialscloud.org/record/2021.76',
  'https://doi.org/10.1016/j.cpc.2018.01.012',
  'https://doi.org/10.1103/PhysRevB.73.233103',
  'https://doi.org/10.1103/RevModPhys.86.253',
  'https://doi.org/10.1103/RevModPhys.73.515',
]) {
  if (!article.includes(source)) errors.push(`${articlePath}: missing reviewed source ${source}`);
  if (!review.includes(source)) errors.push(`${reviewPath}: missing reviewed source ${source}`);
}

for (const statement of [
  'reviewed within the declared educational and execution scope',
  'does not restore them as parallel reader-facing operations',
  'The scripts calculate no electronic energy',
  'Execution success is not numerical convergence',
  'None of those checks establishes numerical convergence for a real calculation',
  'Current declared companion bindings are:',
  'does not execute QE or inspect inputs',
  'None of those checks establishes numerical convergence, physical robustness, method accuracy, transferability, or scientific support for any real DFT study.',
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
if (/universal cutoff|universal k-point|universal smearing|universal vacuum|universal q mesh/i.test(article)) {
  errors.push(`${articlePath}: suggests a universal numerical setting`);
}

if (errors.length > 0) {
  console.error(`Reviewed convergence validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Reviewed convergence valid: 16 natural sections, observable-specific boundaries, exact 12-source coverage, O09/O20 migration boundary, and no universal parameter prescription.');

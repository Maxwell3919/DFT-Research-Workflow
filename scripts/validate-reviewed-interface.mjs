import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const articlePath = 'src/content/topics/interface-and-heterostructure-energetics.md';
const reviewPath = 'docs/reviews/2026-08-04-interface-and-heterostructure-energetics.md';
const article = await readFile(new URL(articlePath, root), 'utf8');
const review = await readFile(new URL(reviewPath, root), 'utf8');
const manifest = JSON.parse(await readFile(new URL('sources/reviewed-links.json', root), 'utf8'));
const expected = ['https://doi.org/10.1063/1.333084','https://doi.org/10.1038/s41524-019-0160-9','https://pymatgen.org/pymatgen.analysis.interfaces.html','https://doi.org/10.1039/D4DD00031E','https://doi.org/10.1103/PhysRevB.91.165413','https://arxiv.org/abs/1504.06192','https://doi.org/10.1103/PhysRevB.68.125403','https://doi.org/10.1038/s41467-024-45003-w','https://www.2dhub.org/bidb/bidb.html','https://doi.org/10.1038/s41699-021-00200-9'];
const required = ['status: reviewed','reservoir-dependent excess-energy question','A negative interaction or adhesion energy per interface cell is also not automatically','A normal program exit establishes only that the executable reached an exit path.','state identity and the requested observable require separate checks.','Numerical convergence of the requested energy difference should be assessed only after the interface state, reference-energy cycle, electrostatic boundary treatment, and relaxation constraints are fixed.','this project did not rerun it','It does not establish the global interface structure'];
const errors=[];
for (const s of required) if (!article.includes(s)) errors.push(`article missing ${s}`);
const record=manifest.topics.find((x)=>x.topic_slug==='interface-and-heterostructure-energetics');
if (!record || JSON.stringify(record.links.map((x)=>x.url))!==JSON.stringify(expected)) errors.push('reviewed source manifest mismatch');
for (const url of expected) if (!article.includes(url)||!review.includes(url)) errors.push(`source not represented ${url}`);
if (!review.includes('The repository does not claim to have rerun the underlying calculations.')) errors.push('review lacks public-data boundary');
if (/universal (?:cutoff|k mesh|vacuum|supercell|force threshold)/i.test(article)) errors.push('universal numerical prescription');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Reviewed interface topic valid: exact sources, state/ledger/boundary distinctions, no universal numerical prescription.');

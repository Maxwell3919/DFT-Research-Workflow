import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const article = await readFile(new URL('src/content/topics/magnetic-configuration-and-ground-state-comparison.md', root), 'utf8');
const review = await readFile(new URL('docs/reviews/2026-08-04-magnetic-configuration-and-ground-state-comparison.md', root), 'utf8');
const manifest = JSON.parse(await readFile(new URL('sources/reviewed-links.json', root), 'utf8'));
const expected = ['https://doi.org/10.1103/PhysRev.136.B864','https://doi.org/10.1103/PhysRev.140.A1133','https://doi.org/10.1103/PhysRevB.57.1505','https://doi.org/10.1103/PhysRevB.62.11556','https://www.quantum-espresso.org/Doc/INPUT_PW.html','https://vasp.at/wiki/MAGMOM'];
const required = ['Magnetic order belongs to the calculation object','Initial moments generate candidates; they are not final evidence','Candidate completeness controls the strength of a ground-state claim','It does not establish a complete magnetic ground state'];
const errors = [];
for (const phrase of required) if (!article.includes(phrase)) errors.push(phrase);
const record = manifest.topics.find((topic) => topic.topic_slug === 'magnetic-configuration-and-ground-state-comparison');
if (!record || JSON.stringify(record.links.map((link) => link.url)) !== JSON.stringify(expected)) errors.push('manifest');
for (const url of expected) if (!article.includes(url) || !review.includes(url)) errors.push(url);
if (!review.includes('Execution success is not magnetic convergence')) errors.push('review boundary');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Reviewed magnetic-ground-state topic valid: candidate/state/model/completeness boundaries.');

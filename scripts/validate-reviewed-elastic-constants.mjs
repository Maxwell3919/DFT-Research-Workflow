import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const article = await readFile(new URL('src/content/topics/elastic-constants-and-mechanical-properties.md', root), 'utf8');
const review = await readFile(new URL('docs/reviews/2026-08-04-elastic-constants-and-mechanical-properties.md', root), 'utf8');
const manifest = JSON.parse(await readFile(new URL('sources/reviewed-links.json', root), 'utf8'));
const expected = ['https://doi.org/10.1103/PhysRev.136.B864','https://doi.org/10.1103/PhysRev.140.A1133','https://doi.org/10.1103/PhysRevB.32.3780','https://doi.org/10.1103/PhysRevB.90.224104','https://vasp.at/wiki/Phonons_from_finite_differences','https://vasp.at/py4vasp/latest/calculation/elastic_modulus/'];
const required = ['The elastic tensor is an energy curvature with declared variables','Internal relaxation defines a different physical response','Elastic stability is local and conditional','It does not establish finite-strain strength'];
const errors = [];
for (const phrase of required) if (!article.includes(phrase)) errors.push(phrase);
const record = manifest.topics.find((topic) => topic.topic_slug === 'elastic-constants-and-mechanical-properties');
if (!record || JSON.stringify(record.links.map((link) => link.url)) !== JSON.stringify(expected)) errors.push('manifest');
for (const url of expected) if (!article.includes(url) || !review.includes(url)) errors.push(url);
if (!review.includes('Execution success is not stress convergence')) errors.push('review boundary');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Reviewed elastic-constants topic valid: tensor/convention/relaxation/stability boundaries.');

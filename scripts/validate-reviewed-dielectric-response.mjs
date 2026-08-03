import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const article = await readFile(new URL('src/content/topics/dielectric-response-and-born-effective-charges.md', root), 'utf8');
const review = await readFile(new URL('docs/reviews/2026-08-04-dielectric-response-and-born-effective-charges.md', root), 'utf8');
const manifest = JSON.parse(await readFile(new URL('sources/reviewed-links.json', root), 'utf8'));
const expected = ['https://doi.org/10.1103/PhysRev.136.B864','https://doi.org/10.1103/PhysRev.140.A1133','https://doi.org/10.1103/RevModPhys.73.515','https://doi.org/10.1103/PhysRevB.55.10355','https://www.quantum-espresso.org/Doc/INPUT_PH.html','https://vasp.at/wiki/Born_effective_charges','https://vasp.at/wiki/Electric_field_response_from_density-functional-perturbation_theory'];
const required = ['Separate the response functions before comparing numbers','Born effective charge is a dynamical tensor','State and electrical boundary condition are inputs to the observable','It does not establish optical absorption'];
const errors=[]; for (const phrase of required) if (!article.includes(phrase)) errors.push(phrase);
const record=manifest.topics.find((topic)=>topic.topic_slug==='dielectric-response-and-born-effective-charges');
if (!record || JSON.stringify(record.links.map((link)=>link.url))!==JSON.stringify(expected)) errors.push('manifest');
for (const url of expected) if (!article.includes(url)||!review.includes(url)) errors.push(url);
if (!review.includes('Execution success is not dielectric-response convergence')) errors.push('review boundary');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Reviewed dielectric-response topic valid: tensor, boundary-condition, and response-scope boundaries.');

import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const article = await readFile(new URL('src/content/topics/magnetic-anisotropy-and-exchange-interactions.md', root), 'utf8');
const review = await readFile(new URL('docs/reviews/2026-08-04-magnetic-anisotropy-and-exchange-interactions.md', root), 'utf8');
const manifest = JSON.parse(await readFile(new URL('sources/reviewed-links.json', root), 'utf8'));
const expected = ['https://doi.org/10.1103/PhysRev.136.B864','https://doi.org/10.1103/PhysRev.140.A1133','https://doi.org/10.1016/0304-8853%2887%2990721-9','https://www.quantum-espresso.org/Doc/INPUT_PW.html','https://vasp.at/wiki/Determining_the_Magnetic_Anisotropy','https://vasp.at/wiki/LSORBIT'];
const required = ['Direction is a physical variable only when it is coupled to the lattice','Exchange parameters are a reduced model, not raw energy differences renamed','Establish a compatible SOC reference before subtracting micro-energy differences','It does not establish a complete magnetic Hamiltonian'];
const errors = [];
for (const phrase of required) if (!article.includes(phrase)) errors.push(phrase);
const record = manifest.topics.find((topic) => topic.topic_slug === 'magnetic-anisotropy-and-exchange-interactions');
if (!record || JSON.stringify(record.links.map((link) => link.url)) !== JSON.stringify(expected)) errors.push('manifest');
for (const url of expected) if (!article.includes(url) || !review.includes(url)) errors.push(url);
if (!review.includes('Execution success is not magnetic convergence')) errors.push('review boundary');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Reviewed magnetic-anisotropy/exchange topic valid: SOC directional, model-mapping, and finite-temperature boundaries.');

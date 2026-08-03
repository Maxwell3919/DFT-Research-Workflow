import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const article = await readFile(new URL('src/content/topics/chemical-bonding-analysis.md', root), 'utf8');
const review = await readFile(new URL('docs/reviews/2026-08-04-chemical-bonding-analysis.md', root), 'utf8');
const manifest = JSON.parse(await readFile(new URL('sources/reviewed-links.json', root), 'utf8'));
const expected = ['https://doi.org/10.1021/j100135a014','https://doi.org/10.1021/jp202489s','https://doi.org/10.1063/1.458517','https://doi.org/10.1002/anie.199718081','https://doi.org/10.1007/s002140000233','https://schmeling.ac.rwth-aachen.de/cohp/'];
const required = ['A bonding indicator is a projection, partition, or topology—not the total energy','Orbital-pair curves need a faithful reconstruction of the calculated state','Localization and density topology answer different real-space questions','It does not establish a unique bond order'];
const errors = [];
for (const phrase of required) if (!article.includes(phrase)) errors.push(phrase);
const record = manifest.topics.find((topic) => topic.topic_slug === 'chemical-bonding-analysis');
if (!record || JSON.stringify(record.links.map((link) => link.url)) !== JSON.stringify(expected)) errors.push('manifest');
for (const url of expected) if (!article.includes(url) || !review.includes(url)) errors.push(url);
if (!review.includes('Execution success is not a projection-quality result')) errors.push('review boundary');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Reviewed chemical-bonding topic valid: exact sources, representation/projection/localization/topology boundaries.');

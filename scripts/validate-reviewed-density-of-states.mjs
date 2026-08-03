import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const article = await readFile(new URL('src/content/topics/density-of-states-and-projected-density-of-states.md', root), 'utf8');
const review = await readFile(new URL('docs/reviews/2026-08-04-density-of-states-and-projected-density-of-states.md', root), 'utf8');
const manifest = JSON.parse(await readFile(new URL('sources/reviewed-links.json', root), 'utf8'));
const expected = [
  'https://doi.org/10.1007/BF01341914', 'https://doi.org/10.1103/PhysRev.140.A1133',
  'https://doi.org/10.1103/PhysRevB.49.16223', 'https://doi.org/10.1103/PhysRevB.40.3616',
  'https://doi.org/10.1103/PhysRevLett.82.3296', 'https://www.quantum-espresso.org/Doc/INPUT_DOS.html',
  'https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html', 'https://vasp.at/wiki/DOSCAR', 'https://vasp.at/wiki/LORBIT',
];
const required = ['status: reviewed', 'A DOS is a full-zone integration, not a band path', 'Projected DOS is a partition chosen by a projector', 'Increasing it merges nearby peaks', 'a smooth curve may be a consequence of the chosen kernel', 'DOS is not a measured spectral function', 'It does not establish a band-edge location'];
const errors = [];
for (const phrase of required) if (!article.includes(phrase)) errors.push(`article missing ${phrase}`);
if ((article.match(/^## /gm) ?? []).length !== 10) errors.push('article natural-section count changed');
const record = manifest.topics.find((topic) => topic.topic_slug === 'density-of-states-and-projected-density-of-states');
if (!record || JSON.stringify(record.links.map((link) => link.url)) !== JSON.stringify(expected)) errors.push('reviewed source manifest mismatch');
for (const url of expected) if (!article.includes(url) || !review.includes(url)) errors.push(`source not represented ${url}`);
if (!review.includes('Execution success is not DOS convergence')) errors.push('review lacks execution boundary');
if (/universal (?:mesh|broadening|energy grid|empty-band count)/i.test(article)) errors.push('universal numerical prescription');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Reviewed DOS/PDOS topic valid: exact sources, integration/projection/spectral boundaries, no universal numerical prescription.');

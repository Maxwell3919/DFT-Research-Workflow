import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const articlePath = 'src/content/topics/band-structure.md';
const reviewPath = 'docs/reviews/2026-08-04-band-structure.md';
const article = await readFile(new URL(articlePath, root), 'utf8');
const review = await readFile(new URL(reviewPath, root), 'utf8');
const manifest = JSON.parse(await readFile(new URL('sources/reviewed-links.json', root), 'utf8'));

const expected = [
  'https://doi.org/10.1007/BF01341914',
  'https://doi.org/10.1103/PhysRev.140.A1133',
  'https://doi.org/10.1016/j.commatsci.2010.05.010',
  'https://doi.org/10.1016/j.commatsci.2016.01.017',
  'https://seekpath.readthedocs.io/en/latest/',
  'https://www.quantum-espresso.org/Doc/INPUT_BANDS.html',
  'https://quantum-espresso.org/Doc/pp_user_guide/node8.html',
  'https://doi.org/10.1103/PhysRevB.56.12847',
  'https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/notes_interpolations/',
  'https://doi.org/10.1103/PhysRev.139.A796',
  'https://doi.org/10.1063/1.1564060',
];
const required = [
  'status: reviewed',
  'A path is a visual cut, not a full-zone search',
  'Subtracting the Fermi energy',
  'A spin-polarized calculation can have separate spin channels',
  'Compare interpolated and directly calculated eigenvalues at held-out path points',
  'SCF convergence at one mesh does not show',
  'For a single specified eigenvalue model, define',
  'It does not establish a complete full-zone electronic topology',
];
const errors = [];
for (const phrase of required) if (!article.includes(phrase)) errors.push(`article missing ${phrase}`);
if ((article.match(/^## /gm) ?? []).length !== 12) errors.push('article natural-section count changed');
const record = manifest.topics.find((topic) => topic.topic_slug === 'band-structure');
if (!record || JSON.stringify(record.links.map((link) => link.url)) !== JSON.stringify(expected)) errors.push('reviewed source manifest mismatch');
for (const url of expected) if (!article.includes(url) || !review.includes(url)) errors.push(`source not represented ${url}`);
for (const phrase of [
  'reviewed within the declared educational and execution scope',
  'bounded real Silicon execution',
  'COD 9013102 → spglib/SeeK-path → QE 7.5 SCF and band path → `bands.x` output',
  'The paired full-zone comparison remains an invented teaching fixture',
  'not numerical convergence',
]) if (!review.includes(phrase)) errors.push(`review missing ${phrase}`);
if (/universal (?:path density|k mesh|empty-band count|smearing|cutoff|force threshold|gap tolerance)/i.test(article)) errors.push('universal numerical prescription');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Reviewed band-structure topic valid: exact sources, path/full-zone and reference/interpolation boundaries, no universal numerical prescription.');

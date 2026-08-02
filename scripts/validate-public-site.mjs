import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const distPath = new URL('dist/', root).pathname;
const base = '/DFT-Research-Workflow/';
const errors = [];
const expectedSlugs = ["00-scientific-question","01-project-initialization","02-source-structures","03-structure-standardization","04-computational-model","05-candidate-configurations","06-electronic-structure-method","07-core-treatment-and-basis","08-boundary-conditions","09-convergence-tests","10-workflow-planning","11-inputs-and-preflight","12-runtime-and-hpc-resources","13-submit-monitor-and-control","14-ground-state-scf","15-structure-optimization","16-high-accuracy-static","17-status-and-initial-results","18-bands-dos-and-fermi-surfaces","19-charge-potential-and-bonding","20-magnetism","21-equations-of-state-and-phase-stability","22-elastic-mechanical-and-piezoelectric","23-phonons-and-harmonic-vibrations","24-anharmonicity-and-thermal-transport","25-electron-phonon-and-superconductivity","26-defects-doping-and-disorder","27-surfaces-interfaces-and-adsorption","28-reaction-paths-and-barriers","29-dielectric-polarization-and-response","30-optical-and-excited-state-properties","31-wannier-topology-and-transport","32-molecular-dynamics-and-sampling","33-beyond-kohn-sham-dft","34-postprocessing-validation-and-reuse"];
const prohibitedText = [
  'View contract',
  'Operation registry',
  'Evidence gate',
  'Automation maturity',
  'Candidate automation',
  'Claim ledger',
  '查看契约',
  '验证门',
];
const retiredPaths = ['workflow', 'branches', 'evidence', 'registry', 'stages'];

async function walk(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path)); else paths.push(path);
  }
  return paths;
}

function stripMarkup(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function outputPath(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === base) return join(distPath, 'index.html');
  if (!clean.startsWith(base)) return null;
  const relative = clean.slice(base.length);
  return clean.endsWith('/') ? join(distPath, relative, 'index.html') : join(distPath, relative);
}

const htmlFiles = (await walk(distPath)).filter((path) => path.endsWith('.html'));
if (htmlFiles.length !== 38) errors.push(`expected 38 generated HTML files (Home, Operations, 35 chapters, 404), found ${htmlFiles.length}`);

const htmlByPath = new Map();
for (const path of htmlFiles) {
  const html = await readFile(path, 'utf8');
  htmlByPath.set(path, html);
  if (!/<html lang="en">/.test(html)) errors.push(`${path}: html language must be English`);
  if (/[\u3400-\u9fff]/u.test(stripMarkup(html))) errors.push(`${path}: public HTML contains CJK text`);
  if (/<script(?:\s|>)/i.test(html)) errors.push(`${path}: client-side script is not allowed`);
  for (const phrase of prohibitedText) {
    if (stripMarkup(html).toLowerCase().includes(phrase.toLowerCase())) errors.push(`${path}: prohibited public phrase ${JSON.stringify(phrase)}`);
  }
  for (const href of [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1])) {
    if (/^(?:https?:|mailto:|#)/.test(href)) continue;
    if (!href.startsWith(base)) {
      errors.push(`${path}: internal link misses project base: ${href}`);
      continue;
    }
    const target = outputPath(href);
    if (target) {
      try { await access(target); } catch { errors.push(`${path}: broken internal link ${href}`); }
    }
  }
}

for (const retired of retiredPaths) {
  try {
    await access(join(distPath, retired));
    errors.push(`retired public path was generated: /${retired}/`);
  } catch {}
}

const home = htmlByPath.get(join(distPath, 'index.html')) ?? '';
const homeNav = home.match(/<nav class="primary-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
const navLabels = [...homeNav.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map((match) => match[1].trim());
if (JSON.stringify(navLabels) !== JSON.stringify(['Home', 'Operations'])) errors.push(`generated primary navigation mismatch: ${JSON.stringify(navLabels)}`);

const directoryPath = join(distPath, 'operations', 'index.html');
const directory = htmlByPath.get(directoryPath) ?? '';
const directoryHrefs = [...directory.matchAll(/href="([^"]*\/operations\/\d{2}-[^"]+\/?)"/g)].map((match) => match[1]);
const expectedHrefs = expectedSlugs.map((slug) => `${base}operations/${slug}/`);
if (JSON.stringify(directoryHrefs) !== JSON.stringify(expectedHrefs)) errors.push('Operations directory must contain all 35 chapter links in 00–34 order');
if (!directory.includes('Part I · Common DFT Workflow') || !directory.includes('Part II · Property Workflows') || !directory.includes('Part III · Closing the Loop')) {
  errors.push('Operations directory is missing one or more Part headings');
}

for (let index = 0; index < expectedSlugs.length; index += 1) {
  const slug = expectedSlugs[index];
  const path = join(distPath, 'operations', slug, 'index.html');
  const html = htmlByPath.get(path) ?? '';
  if (!html) {
    errors.push(`missing generated operation route: ${slug}`);
    continue;
  }
  if (!html.includes('This chapter has not yet been written.')) errors.push(`${slug}: missing neutral scaffold sentence`);
  const previousCount = (html.match(/data-previous/g) ?? []).length;
  const nextCount = (html.match(/data-next/g) ?? []).length;
  if (previousCount !== (index === 0 ? 0 : 1)) errors.push(`${slug}: previous link boundary mismatch`);
  if (nextCount !== (index === 34 ? 0 : 1)) errors.push(`${slug}: next link boundary mismatch`);
  if (index > 0 && !html.includes(`${base}operations/${expectedSlugs[index - 1]}/`)) errors.push(`${slug}: previous href mismatch`);
  if (index < 34 && !html.includes(`${base}operations/${expectedSlugs[index + 1]}/`)) errors.push(`${slug}: next href mismatch`);
}

if (!htmlByPath.has(join(distPath, '404.html'))) errors.push('custom English 404 page was not generated');

if (errors.length > 0) {
  console.error(`Generated-site validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Generated site valid: 38 English no-JS pages, Home + Operations navigation, 35 ordered routes, previous/next links, base-safe internal links, no retired public paths.');

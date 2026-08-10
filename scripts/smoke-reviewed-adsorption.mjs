import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/adsorption-energies/';
const phrases = [
  'Use an adsorption calculation when the question is the energetic change for moving a specified species',
  'Write a balanced energy ledger',
  'Balance atoms, charge, electrons, protons, and other reservoirs before evaluation.',
  'Do not compare an average at one coverage with a differential value at another.',
  'Adsorption energy compares relaxed reactants and product under a written reaction.',
  'The final relaxed structure is the state being measured',
  'One adsorbate in a larger cell changes both coverage and image separation.',
  'A normal program exit establishes only that the executable reached an exit path.',
  'Satisfaction of the declared SCF residual criterion is only an inner numerical condition.',
  'Numerical convergence of an adsorption energy should be assessed only after coverage and adsorbate order',
  'one static adsorption energy does not predict an isotherm.',
  'It does not make a neutral vacuum slab a constant-potential electrochemical interface.',
  'this repository did not rerun the calculations.',
  'A negative endpoint energy does not show that adsorption is fast, reversible, selective, or experimentally realized.',
  'It does not establish a global minimum, equilibrium coverage, kinetics, operando state, catalytic activity, selectivity, or method accuracy',
  'Sources and methods',
];
const domains = ['doi.org', 'cmr.fysik.dtu.dk', 'docs.ase-lib.org', 'pymatgen.org'];

async function inspect(page, width) {
  const result = await page.evaluate(() => ({
    language: document.documentElement.lang,
    title: document.querySelector('h1')?.textContent?.trim(),
    text: document.body.innerText,
    links: [...document.querySelectorAll('.article-content a')].map((link) => link.href),
    headings: document.querySelectorAll('.article-content h2').length,
    cards: document.querySelectorAll('.practical-card-list li').length,
    hasArticle: Boolean(document.querySelector('.article-content')),
    hasPlaceholder: document.body.innerText.includes('This stable destination is reserved for a later reviewed content batch.'),
    hasContract: Boolean(document.querySelector('.operation-contract')),
    scripts: document.querySelectorAll('script').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (result.language !== 'en' || result.title !== 'Adsorption Energies') throw new Error(`adsorption identity mismatch: ${result.title}`);
  if (!result.hasArticle || result.hasPlaceholder || result.hasContract) throw new Error('reviewed adsorption narrative was not rendered naturally');
  if (result.scripts !== 0 || result.overflow) throw new Error(`adsorption page is not static or overflows at ${width}px`);
  if (result.headings < 8 || result.headings > 14 || result.cards !== 3) throw new Error(`adsorption counts mismatch: ${result.headings} sections outside 8..14, ${result.cards} cards`);
  for (const phrase of phrases) if (!result.text.includes(phrase)) throw new Error(`adsorption page is missing ${phrase}`);
  for (const domain of domains) if (!result.links.some((link) => link.includes(domain))) throw new Error(`adsorption page is missing ${domain}`);
  return result;
}

async function capture(page, path) {
  await page.waitForFunction(() => document.documentElement.scrollWidth > 0 && document.documentElement.scrollHeight > 0, { timeout: 15000 });
  const size = await page.evaluate(() => ({ width: Math.ceil(Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)), height: Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)) }));
  await page.screenshot({ path, captureBeyondViewport: true, clip: { x: 0, y: 0, ...size } });
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  let response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`adsorption desktop returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`adsorption mobile returned ${response?.status()}`);
  await inspect(page, 390);

  const noJs = await browser.newPage();
  await noJs.setCacheEnabled(false);
  await noJs.setJavaScriptEnabled(false);
  response = await noJs.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`adsorption no-JavaScript returned ${response?.status()}`);
  const text = await noJs.$eval('body', (body) => body.innerText);
  for (const phrase of ['Balance atoms, charge, electrons, protons, and other reservoirs before evaluation.', 'A normal program exit establishes only that the executable reached an exit path.', 'A negative endpoint energy does not show that adsorption is fast, reversible, selective, or experimentally realized.', 'Sources and methods']) if (!text.includes(phrase)) throw new Error(`adsorption no-JavaScript missing ${phrase}`);

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'load' });
    await capture(page, join(artifactDirectory, 'topic-adsorption-energies-desktop.png'));
    await writeFile(join(artifactDirectory, 'reviewed-adsorption-summary.json'), `${JSON.stringify({ site_url: base, route, natural_sections: desktop.headings, practical_cards: desktop.cards, source_links: desktop.links.length, desktop_width: 1440, mobile_width: 390, no_javascript: true, fixed_contract: false, reaction_and_sign_boundary: desktop.text.includes('Balance atoms, charge, electrons, protons, and other reservoirs before evaluation.'), coverage_and_cell_boundary: desktop.text.includes('One adsorbate in a larger cell changes both coverage and image separation.'), program_vs_solver_boundary: desktop.text.includes('A normal program exit establishes only that the executable reached an exit path.') && desktop.text.includes('Satisfaction of the declared SCF residual criterion is only an inner numerical condition.'), thermodynamics_and_kinetics_boundary: desktop.text.includes('A negative endpoint energy does not show that adsorption is fast, reversible, selective, or experimentally realized.') }, null, 2)}\n`);
  }
  console.log(`Reviewed adsorption smoke passed: ${desktop.headings} natural sections, 3 practical cards, rendered sources, 1440px/390px no-overflow, no-JavaScript reading, and reaction/coverage/program-versus-solver/free-energy/kinetics boundaries.`);
} finally {
  await browser.close();
}

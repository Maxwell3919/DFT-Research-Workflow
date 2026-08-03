import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/surface-energy-and-work-function/';
const phrases = [
  'A surface calculation replaces bulk translational symmetry',
  'Surface energy is an excess per area',
  'An asymmetric slab supplies a sum, not two separate energies',
  'Open stoichiometry requires chemical potentials',
  'The bulk reference can create thickness drift',
  'Polar surfaces may not possess the naive slab limit',
  'Work function is referenced to field-free vacuum',
  'Asymmetric slabs can have two work functions',
  'Semiconductor surfaces require an electronic reference choice',
  'Real Si data illustrate comparison without proving agreement',
  'What this topic establishes',
  'Sources and methods',
];
const domains = ['doi.org', 'vasp.at', 'gpaw.readthedocs.io'];

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
  if (result.language !== 'en' || result.title !== 'Surface Energy and Work Function') throw new Error(`surface identity mismatch: ${result.title}`);
  if (!result.hasArticle || result.hasPlaceholder || result.hasContract) throw new Error('reviewed surface narrative was not rendered naturally');
  if (result.scripts !== 0 || result.overflow) throw new Error(`surface page is not static or overflows at ${width}px`);
  if (result.headings !== 24 || result.cards !== 3) throw new Error(`surface counts mismatch: ${result.headings} sections, ${result.cards} cards`);
  for (const phrase of phrases) if (!result.text.includes(phrase)) throw new Error(`surface page is missing ${phrase}`);
  for (const domain of domains) if (!result.links.some((link) => link.includes(domain))) throw new Error(`surface page is missing ${domain}`);
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
  if (response?.status() !== 200) throw new Error(`surface desktop returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`surface mobile returned ${response?.status()}`);
  await inspect(page, 390);

  const noJs = await browser.newPage();
  await noJs.setCacheEnabled(false);
  await noJs.setJavaScriptEnabled(false);
  response = await noJs.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`surface no-JavaScript returned ${response?.status()}`);
  const text = await noJs.$eval('body', (body) => body.innerText);
  for (const phrase of ['Surface energy is an excess per area', 'Work function is referenced to field-free vacuum', 'Sources and methods']) if (!text.includes(phrase)) throw new Error(`surface no-JavaScript missing ${phrase}`);

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'load' });
    await capture(page, join(artifactDirectory, 'topic-surface-energy-work-function-desktop.png'));
    await writeFile(join(artifactDirectory, 'reviewed-surfaces-summary.json'), `${JSON.stringify({ site_url: base, route, natural_sections: desktop.headings, practical_cards: desktop.cards, source_links: desktop.links.length, desktop_width: 1440, mobile_width: 390, no_javascript: true, fixed_contract: false, surface_reference_boundary: true, plateau_boundary: true, semiconductor_boundary: true }, null, 2)}\n`);
  }
  console.log('Reviewed surface smoke passed: 24 natural sections, 3 practical cards, rendered sources, 1440px/390px no-overflow, no-JavaScript reading, and surface-reference/plateau/semiconductor boundaries.');
} finally {
  await browser.close();
}

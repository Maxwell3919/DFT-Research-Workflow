import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/compositional-phase-stability-and-convex-hulls/';
const phrases = [
  'Use a compositional convex hull when the question is whether a represented phase can lower its thermodynamic potential',
  'Start from a candidate ledger',
  'It does not exclude decomposition into compounds.',
  'Build and inspect the lower envelope',
  'Every point on it is a macroscopic mixture of its endpoints',
  'Do not clamp a materially negative value to zero',
  'A computed hull is monotonic with respect to adding candidates',
  'SCF convergence is necessary but does not establish convergence of energy above hull or decomposition identity.',
  'A stability polygon in chemical-potential space must not be read as a range of bulk compositions.',
  'do not provide a universal energy-above-hull threshold',
  'This is a real public DFT-data case, not a claim that this project reran the underlying calculations.',
  'It does not establish exhaustive search, mechanical or phonon stability',
  'Sources and methods',
];
const domains = ['doi.org', 'docs.materialsproject.org', 'pymatgen.org'];

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
    scripts: document.querySelectorAll('script:not([data-copy-enhancement])').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (result.language !== 'en' || result.title !== 'Compositional Phase Stability and Convex Hulls') throw new Error(`convex-hull identity mismatch: ${result.title}`);
  if (!result.hasArticle || result.hasPlaceholder || result.hasContract) throw new Error('reviewed convex-hull narrative was not rendered naturally');
  if (result.scripts !== 0 || result.overflow) throw new Error(`convex-hull page is not static or overflows at ${width}px`);
  if (result.headings < 8 || result.headings > 12 || result.cards !== 2) throw new Error(`convex-hull counts mismatch: ${result.headings} sections outside 8..12, ${result.cards} cards`);
  for (const phrase of phrases) if (!result.text.includes(phrase)) throw new Error(`convex-hull page is missing ${phrase}`);
  for (const domain of domains) if (!result.links.some((link) => link.includes(domain))) throw new Error(`convex-hull page is missing ${domain}`);
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
  if (response?.status() !== 200) throw new Error(`convex-hull desktop returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`convex-hull mobile returned ${response?.status()}`);
  await inspect(page, 390);

  const noJs = await browser.newPage();
  await noJs.setCacheEnabled(false);
  await noJs.setJavaScriptEnabled(false);
  response = await noJs.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`convex-hull no-JavaScript returned ${response?.status()}`);
  const text = await noJs.$eval('body', (body) => body.innerText);
  for (const phrase of ['It does not exclude decomposition into compounds.', 'A computed hull is monotonic with respect to adding candidates', 'Sources and methods']) if (!text.includes(phrase)) throw new Error(`convex-hull no-JavaScript missing ${phrase}`);

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'load' });
    await capture(page, join(artifactDirectory, 'topic-compositional-convex-hulls-desktop.png'));
    await writeFile(join(artifactDirectory, 'reviewed-convex-hulls-summary.json'), `${JSON.stringify({ site_url: base, route, natural_sections: desktop.headings, practical_cards: desktop.cards, source_links: desktop.links.length, desktop_width: 1440, mobile_width: 390, no_javascript: true, fixed_contract: false, formation_vs_hull_boundary: desktop.text.includes('It does not exclude decomposition into compounds.'), candidate_set_boundary: desktop.text.includes('A computed hull is monotonic with respect to adding candidates'), target_convergence_boundary: desktop.text.includes('SCF convergence is necessary but does not establish convergence of energy above hull or decomposition identity.') }, null, 2)}\n`);
  }
  console.log(`Reviewed convex-hull smoke passed: ${desktop.headings} natural sections, 2 practical cards, rendered sources, 1440px/390px no-overflow, no-JavaScript reading, and formation/candidate-set/target-convergence boundaries.`);
} finally {
  await browser.close();
}

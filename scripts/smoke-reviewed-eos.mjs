import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/equation-of-state-and-structural-phase-stability/';
const phrases = [
  'Use an equation of state when you need an equilibrium volume',
  'The equation of state is a derivative relation',
  'Decide what changes when volume changes',
  'Preserve phase and electronic identity across the series',
  'Fit a model, not a decorative curve',
  'Compare phases at one common pressure',
  'Each phase normally minimizes at a different volume. The pressure, potential, and normalization must be common.',
  'Metastability and hysteresis are not equilibrium boundaries',
  'Hydrostatic curvature does not prove structural stability',
  'Temperature changes the potential being minimized',
  'Decide what the curves may support next',
  'Sources and methods',
];
const domains = ['doi.org', 'docs.ase-lib.org', 'vasp.at', 'phonopy.github.io', 'openstax.org'];

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
  if (result.language !== 'en' || result.title !== 'Equation of State and Structural Phase Stability') throw new Error(`EOS identity mismatch: ${result.title}`);
  if (!result.hasArticle || result.hasPlaceholder || result.hasContract) throw new Error('reviewed EOS narrative was not rendered naturally');
  if (result.scripts !== 0 || result.overflow) throw new Error(`EOS page is not static or overflows at ${width}px`);
  if (result.headings < 12 || result.headings > 24 || result.cards !== 0) throw new Error(`EOS counts mismatch: ${result.headings} sections, ${result.cards} synthetic-only cards`);
  for (const phrase of phrases) if (!result.text.includes(phrase)) throw new Error(`EOS page is missing ${phrase}`);
  for (const domain of domains) if (!result.links.some((link) => link.includes(domain))) throw new Error(`EOS page is missing ${domain}`);
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
  if (response?.status() !== 200) throw new Error(`EOS desktop returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`EOS mobile returned ${response?.status()}`);
  await inspect(page, 390);

  const noJs = await browser.newPage();
  await noJs.setCacheEnabled(false);
  await noJs.setJavaScriptEnabled(false);
  response = await noJs.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`EOS no-JavaScript returned ${response?.status()}`);
  const text = await noJs.$eval('body', (body) => body.innerText);
  for (const phrase of ['The equation of state is a derivative relation', 'Hydrostatic curvature does not prove structural stability', 'Sources and methods']) if (!text.includes(phrase)) throw new Error(`EOS no-JavaScript missing ${phrase}`);

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'load' });
    await capture(page, join(artifactDirectory, 'topic-equation-of-state-desktop.png'));
    await writeFile(join(artifactDirectory, 'reviewed-eos-summary.json'), `${JSON.stringify({ site_url: base, route, natural_sections: desktop.headings, practical_cards: desktop.cards, source_links: desktop.links.length, desktop_width: 1440, mobile_width: 390, no_javascript: true, fixed_contract: false, common_pressure_boundary: true, hydrostatic_stability_boundary: true }, null, 2)}\n`);
  }
  console.log(`Reviewed EOS smoke passed: ${desktop.headings} natural sections, no synthetic-only primary cards, rendered sources, 1440px/390px no-overflow, no-JavaScript reading, and common-pressure/stability boundaries.`);
} finally {
  await browser.close();
}

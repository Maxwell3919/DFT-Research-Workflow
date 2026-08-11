import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/relative-and-formation-energies/';
const requiredPhrases = [
  'Use relative or formation energies when the scientific question is a comparison',
  'A raw total energy is not yet a comparable result',
  'Relative energies compare a bounded candidate set',
  'Balance a reaction before evaluating its energy',
  'Formation energy is a special reference reaction',
  'Normalize only after the stoichiometry is clear',
  'Keep electronic energy, enthalpy, and free energy distinct',
  'Numerical smearing used for Brillouin-zone integration is not automatically',
  'A negative formation energy is not a phase-stability proof',
  'Formation energy alone establishes neither equilibrium stability nor experimental synthesizability.',
  'Decide what may continue',
  'Sources and methods',
];
const requiredDomains = ['docs.materialsproject.org', 'openstax.org', 'phonopy.github.io', 'doi.org'];

async function inspect(page, expectedWidth) {
  const result = await page.evaluate(() => ({
    language: document.documentElement.lang,
    title: document.querySelector('h1')?.textContent?.trim(),
    text: document.body.innerText,
    links: [...document.querySelectorAll('.article-content a')].map((link) => link.href),
    headings: [...document.querySelectorAll('.article-content h2')].map((heading) => heading.textContent?.trim()),
    cards: document.querySelectorAll('.practical-card-list li').length,
    hasArticle: Boolean(document.querySelector('.article-content')),
    hasPlaceholder: document.body.innerText.includes('This stable destination is reserved for a later reviewed content batch.'),
    hasContract: Boolean(document.querySelector('.operation-contract')),
    hasScript: Boolean(document.querySelector('script:not([data-copy-enhancement])')),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (result.language !== 'en') throw new Error('energy overview language is not English');
  if (result.title !== 'Relative Energies and Formation Energies') throw new Error(`energy title mismatch: ${result.title}`);
  if (!result.hasArticle || result.hasPlaceholder) throw new Error('reviewed energy narrative was not rendered');
  if (result.hasContract) throw new Error('energy overview exposes a fixed contract');
  if (result.hasScript) throw new Error('energy overview contains client-side script');
  if (result.overflow) throw new Error(`energy overview overflows at ${expectedWidth}px`);
  if (result.headings.length < 12 || result.headings.length > 24) throw new Error(`energy overview has ${result.headings.length} sections outside the natural 12-24 range`);
  if (result.cards !== 0) throw new Error(`energy overview exposes ${result.cards} synthetic-only practical cards instead of 0`);
  for (const phrase of requiredPhrases) if (!result.text.includes(phrase)) throw new Error(`energy overview is missing ${phrase}`);
  for (const domain of requiredDomains) if (!result.links.some((link) => link.includes(domain))) throw new Error(`energy overview is missing source domain ${domain}`);
  return result;
}

async function captureStablePage(page, path) {
  await page.waitForFunction(() => document.documentElement.scrollWidth > 0 && document.documentElement.scrollHeight > 0, { timeout: 15000 });
  const dimensions = await page.evaluate(() => ({
    width: Math.ceil(Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)),
    height: Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)),
  }));
  if (dimensions.width < 1 || dimensions.height < 1) throw new Error(`invalid screenshot dimensions ${JSON.stringify(dimensions)}`);
  await page.screenshot({ path, captureBeyondViewport: true, clip: { x: 0, y: 0, width: dimensions.width, height: dimensions.height } });
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  let response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`energy desktop route returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`energy mobile route returned ${response?.status()}`);
  await inspect(page, 390);

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  response = await noJsPage.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`energy no-JavaScript route returned ${response?.status()}`);
  const noJsText = await noJsPage.$eval('body', (body) => body.innerText);
  for (const phrase of ['A raw total energy is not yet a comparable result', 'Formation energy alone establishes neither equilibrium stability nor experimental synthesizability.', 'Sources and methods']) {
    if (!noJsText.includes(phrase)) throw new Error(`energy no-JavaScript page is missing ${phrase}`);
  }

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'load' });
    await captureStablePage(page, join(artifactDirectory, 'topic-relative-and-formation-energies-desktop.png'));
    await writeFile(join(artifactDirectory, 'reviewed-energies-summary.json'), `${JSON.stringify({
      site_url: base,
      route,
      natural_sections: desktop.headings.length,
      practical_cards: desktop.cards,
      source_links: desktop.links.length,
      desktop_width: 1440,
      mobile_width: 390,
      no_javascript: true,
      fixed_contract: false,
      raw_total_energy_kept_distinct: desktop.text.includes('raw total energy is an internal value'),
      formation_stability_distinction: desktop.text.includes('not a phase-stability proof'),
    }, null, 2)}\n`);
  }
  console.log(`Reviewed energy smoke passed: ${desktop.headings.length} natural sections, no synthetic-only primary cards, rendered sources, 1440px/390px no-overflow, no-JavaScript reading, and formation-versus-stability language.`);
} finally {
  await browser.close();
}

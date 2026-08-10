import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const parentRoute = '/operations/equation-of-state-and-structural-phase-stability/';
const guides = [
  { route: `${parentRoute}guides/design-traceable-energy-volume-series/`, title: 'Design a Traceable Energy–Volume Series', phrase: 'Use this guide before fitting an EOS.', tools: ['python'], versions: ['Python 3.12'], boundary: 'It does not generate structures, run or relax DFT, test pressure convergence, fit an EOS, or establish structural stability.' },
  { route: `${parentRoute}examples/fit-and-challenge-equation-of-state/`, title: 'Fit and Challenge an Equation of State', phrase: 'Use this fixture after a traceable energy-volume table has passed branch and convergence checks.', tools: ['python', 'ase'], versions: ['Python 3.12', 'ASE 3.29.0'], boundary: 'It does not run DFT, validate the point series, select a universally preferred EOS, calculate a physical equilibrium volume or modulus, establish elastic or phonon stability, or predict a transition.' },
  { route: `${parentRoute}examples/compare-phase-enthalpies-common-pressure/`, title: 'Compare Phase Enthalpies at Common Pressure', phrase: 'Use this fixture after two phase branches have been fitted over a common supported pressure interval.', tools: ['python', 'ase'], versions: ['Python 3.12', 'ASE 3.29.0'], boundary: 'The fixture contains no DFT run, pathway, barrier, nucleation model, phonons, elastic tensor, finite-temperature contribution, or experimental pressure calibration.' },
];

async function inspect(page, guide, width) {
  const response = await page.goto(`${base}${guide.route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`${guide.route} returned ${response?.status()}`);
  const result = await page.evaluate(() => ({ language: document.documentElement.lang, title: document.querySelector('h1')?.textContent?.trim(), text: document.body.innerText, links: [...document.querySelectorAll('.article-content a')].map((link) => link.href), images: [...document.querySelectorAll('.guide-media img')].map((image) => image.alt), tools: [...document.querySelectorAll('.tool-tag')].map((tag) => tag.textContent?.trim()), meta: Boolean(document.querySelector('.guide-meta')), evidence: Boolean(document.querySelector('.evidence-note')), scripts: document.querySelectorAll('script:not([data-copy-enhancement])').length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 }));
  if (result.language !== 'en' || result.title !== guide.title) throw new Error(`${guide.route}: identity mismatch`);
  if (!result.text.includes(guide.phrase) || !result.text.includes(guide.boundary)) throw new Error(`${guide.route}: missing claim or boundary`);
  for (const version of guide.versions) if (!result.text.includes(version)) throw new Error(`${guide.route}: missing ${version}`);
  for (const tool of guide.tools) if (!result.tools.includes(tool)) throw new Error(`${guide.route}: missing ${tool}`);
  if (!result.meta || !result.evidence || result.images.length !== 0) throw new Error(`${guide.route}: metadata/evidence missing or synthetic media returned`);
  if (!result.links.some((link) => link.startsWith('https://')) || result.scripts !== 0 || result.overflow) throw new Error(`${guide.route}: sources, static boundary, or ${width}px layout failed`);
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
  let response = await page.goto(`${base}${parentRoute}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`EOS parent returned ${response?.status()}`);
  const parent = await page.evaluate(() => ({ cards: document.querySelectorAll('.practical-card-list li').length, links: [...document.querySelectorAll('.practical-card-list a')].map((link) => link.href), scripts: document.querySelectorAll('script:not([data-copy-enhancement])').length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 }));
  if (parent.cards !== 0 || parent.scripts !== 0 || parent.overflow) throw new Error(`EOS parent mismatch: ${JSON.stringify(parent)}`);
  for (const guide of guides) if (parent.links.includes(`${base}${guide.route}`)) throw new Error(`EOS parent promotes synthetic-only route ${guide.route}`);
  const desktop = [];
  for (const guide of guides) desktop.push(await inspect(page, guide, 1440));
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  for (const guide of guides) await inspect(page, guide, 390);

  const noJs = await browser.newPage();
  await noJs.setCacheEnabled(false);
  await noJs.setJavaScriptEnabled(false);
  for (const guide of guides) {
    response = await noJs.goto(`${base}${guide.route}`, { waitUntil: 'load' });
    if (response?.status() !== 200) throw new Error(`${guide.route}: no-JavaScript ${response?.status()}`);
    const text = await noJs.$eval('body', (body) => body.innerText);
    if (!text.includes(guide.title) || !text.includes(guide.phrase)) throw new Error(`${guide.route}: no-JavaScript incomplete`);
  }
  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${guides[1].route}`, { waitUntil: 'load' });
    await capture(page, join(artifactDirectory, 'eos-guide-fit-sensitivity-desktop.png'));
    await writeFile(join(artifactDirectory, 'eos-guides-summary.json'), `${JSON.stringify({ site_url: base, parent_route: parentRoute, parent_cards: parent.cards, routes: guides.map((guide) => guide.route), source_links: desktop.reduce((sum, result) => sum + result.links.length, 0), original_media: desktop.reduce((sum, result) => sum + result.images.length, 0), desktop_width: 1440, mobile_width: 390, no_javascript: true, deterministic_synthetic_eos_only: true }, null, 2)}\n`);
  }
  console.log('EOS guide smoke passed: synthetic-only routes remain directly readable but are absent from the primary parent list, have no filler figures, retain pinned Python/ASE metadata and sources, and pass 1440px/390px plus no-JavaScript checks.');
} finally {
  await browser.close();
}

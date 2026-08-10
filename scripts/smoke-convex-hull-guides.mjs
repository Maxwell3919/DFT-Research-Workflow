import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const parentRoute = '/operations/compositional-phase-stability-and-convex-hulls/';
const guides = [
  { route: `${parentRoute}examples/rebuild-oqmd-li-p-convex-hull/`, title: 'Rebuild a Li–P Convex Hull from an OQMD Snapshot', phrase: 'Use this worked example to reconstruct a binary hull from a frozen public-data table.', boundary: 'It does not validate OQMD energies, prove candidate completeness or mutual convergence for a new claim, establish finite-temperature or pressure stability, or predict synthesis.', mediaCount: 0 },
  { route: `${parentRoute}examples/stress-test-hull-phase-set/`, title: 'Stress-Test a Hull Against a Missing Competitor', phrase: 'Use this example after rebuilding the full frozen Li-P hull.', boundary: 'It does not show that LiP should be excluded, that Li4P3 is a physical ground state, or that the full frozen OQMD phase set is exhaustive.', mediaCount: 1 },
];

async function loadMedia(page) {
  const loaded = await page.$eval('.guide-media img', async (image) => {
    image.loading = 'eager';
    image.scrollIntoView({ block: 'center' });
    try {
      await image.decode();
    } catch {
      return false;
    }
    return image.complete && image.naturalWidth > 0;
  });
  if (!loaded) throw new Error('guide media could not be decoded');
}

async function inspect(page, guide, width) {
  const response = await page.goto(`${base}${guide.route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`${guide.route} returned ${response?.status()}`);
  if (guide.mediaCount > 0) await loadMedia(page);
  const result = await page.evaluate(() => ({ language: document.documentElement.lang, title: document.querySelector('h1')?.textContent?.trim(), text: document.body.innerText, links: [...document.querySelectorAll('.article-content a')].map((link) => link.href), images: [...document.querySelectorAll('.guide-media img')].map((image) => ({ alt: image.alt, loaded: image.complete && image.naturalWidth > 0 })), tools: [...document.querySelectorAll('.tool-tag')].map((tag) => tag.textContent?.trim()), meta: Boolean(document.querySelector('.guide-meta')), evidence: Boolean(document.querySelector('.evidence-note')), scripts: document.querySelectorAll('script:not([data-copy-enhancement])').length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 }));
  if (result.language !== 'en' || result.title !== guide.title) throw new Error(`${guide.route}: identity mismatch`);
  if (!result.text.includes(guide.phrase) || !result.text.includes(guide.boundary)) throw new Error(`${guide.route}: missing claim or boundary`);
  if (!result.text.includes('Python 3.12') || !result.tools.includes('python')) throw new Error(`${guide.route}: pinned execution metadata missing`);
  if (!result.meta || !result.evidence || result.images.length !== guide.mediaCount || result.images.some((image) => !image.alt || !image.loaded)) throw new Error(`${guide.route}: metadata, evidence, or declared real-data media mismatch`);
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
  if (response?.status() !== 200) throw new Error(`convex-hull parent returned ${response?.status()}`);
  const parent = await page.evaluate(() => ({ cards: document.querySelectorAll('.practical-card-list li').length, links: [...document.querySelectorAll('.practical-card-list a')].map((link) => link.href), scripts: document.querySelectorAll('script:not([data-copy-enhancement])').length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 }));
  if (parent.cards !== 2 || parent.scripts !== 0 || parent.overflow) throw new Error(`convex-hull parent mismatch: ${JSON.stringify(parent)}`);
  for (const guide of guides) if (!parent.links.includes(`${base}${guide.route}`)) throw new Error(`convex-hull parent missing ${guide.route}`);
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
    const state = await noJs.evaluate(() => ({ text: document.body.innerText, images: [...document.images].every((image) => image.complete && image.naturalWidth > 0) }));
    if (!state.text.includes(guide.title) || !state.text.includes(guide.phrase) || !state.images) throw new Error(`${guide.route}: no-JavaScript incomplete`);
  }
  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${guides[1].route}`, { waitUntil: 'load' });
    await loadMedia(page);
    await capture(page, join(artifactDirectory, 'convex-hull-guide-real-oqmd-desktop.png'));
    await writeFile(join(artifactDirectory, 'convex-hull-guides-summary.json'), `${JSON.stringify({ site_url: base, parent_route: parentRoute, parent_cards: parent.cards, routes: guides.map((guide) => guide.route), source_links: desktop.reduce((sum, result) => sum + result.links.length, 0), original_real_data_media: desktop.reduce((sum, result) => sum + result.images.length, 0), desktop_width: 1440, mobile_width: 390, no_javascript: true, frozen_oqmd_rows: 46, dft_executed_by_project: false }, null, 2)}\n`);
  }
  console.log('Convex-hull guide smoke passed: parent cards, 2 static guides, attributed real-data media, pinned Python metadata, 1440px/390px layout, and no-JavaScript reading.');
} finally {
  await browser.close();
}

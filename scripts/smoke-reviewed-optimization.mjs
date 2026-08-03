import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/optimize-structure/';
const requiredPhrases = [
  'Structure optimization searches for a stationary structure',
  'Define the quantity and variables being optimized',
  'Empty numerical space is part of the boundary model, not a material coordinate seeking an equilibrium length.',
  'A constrained stationary point is stationary only in the active subspace.',
  'Local optimizers normally find a nearby basin, not the global minimum',
  'Make forces and stress trustworthy enough to drive motion',
  'Do not interpret a state switch as ordinary optimizer noise.',
  'Hitting the maximum number of steps is program termination, not structural convergence.',
  'Optimizer stopping is not proof of a physical minimum',
  'Different final basins are not failed calculations.',
  'Verify the final candidate independently',
  'A final structure alone is not a reproducible optimization result.',
  'What this task does not establish',
  'Calculate the Reference Ground State',
  'Sources and methods',
];
const requiredDomains = [
  'quantum-espresso.org',
  'docs.ase-lib.org',
  'vasp.at',
  'manual.cp2k.org',
  'doi.org',
];

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
    hasScript: Boolean(document.querySelector('script')),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));

  if (result.language !== 'en') throw new Error('optimization overview language is not English');
  if (result.title !== 'Optimize the Structure') throw new Error(`optimization overview title mismatch: ${result.title}`);
  if (!result.hasArticle || result.hasPlaceholder) throw new Error('reviewed optimization narrative was not rendered');
  if (result.hasContract) throw new Error('optimization overview exposes a fixed contract');
  if (result.hasScript) throw new Error('optimization overview contains client-side script');
  if (result.overflow) throw new Error(`optimization overview overflows at ${expectedWidth}px`);
  if (result.headings.length !== 18) throw new Error(`optimization overview has ${result.headings.length} sections instead of 18`);
  if (result.cards !== 4) throw new Error(`optimization overview exposes ${result.cards} practical cards instead of 4`);
  for (const phrase of requiredPhrases) {
    if (!result.text.includes(phrase)) throw new Error(`optimization overview is missing ${phrase}`);
  }
  for (const domain of requiredDomains) {
    if (!result.links.some((link) => link.includes(domain))) throw new Error(`optimization overview is missing source domain ${domain}`);
  }
  return result;
}

async function captureStablePage(page, path) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const body = document.body;
    return root.scrollWidth > 0 && root.scrollHeight > 0 && body.scrollWidth > 0 && body.scrollHeight > 0;
  }, { timeout: 15000 });
  const dimensions = await page.evaluate(() => ({
    width: Math.ceil(Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)),
    height: Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)),
  }));
  if (dimensions.width < 1 || dimensions.height < 1) throw new Error(`invalid screenshot dimensions ${JSON.stringify(dimensions)}`);
  await page.screenshot({
    path,
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: dimensions.width, height: dimensions.height },
  });
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);

  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  let response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  if (response?.status() !== 200) throw new Error(`optimization overview desktop route returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  if (response?.status() !== 200) throw new Error(`optimization overview mobile route returned ${response?.status()}`);
  await inspect(page, 390);

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  response = await noJsPage.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  if (response?.status() !== 200) throw new Error(`optimization overview no-JavaScript route returned ${response?.status()}`);
  const noJsText = await noJsPage.$eval('body', (body) => body.innerText);
  for (const phrase of [
    'Structure optimization searches for a stationary structure',
    'Optimizer stopping is not proof of a physical minimum',
    'Sources and methods',
  ]) {
    if (!noJsText.includes(phrase)) throw new Error(`optimization overview no-JavaScript page is missing ${phrase}`);
  }

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
    await captureStablePage(page, join(artifactDirectory, 'topic-optimize-structure-desktop.png'));
    await writeFile(join(artifactDirectory, 'reviewed-optimization-summary.json'), `${JSON.stringify({
      site_url: base,
      route,
      natural_sections: desktop.headings.length,
      practical_cards: desktop.cards,
      source_links: desktop.links.length,
      desktop_width: 1440,
      mobile_width: 390,
      no_javascript: true,
      fixed_contract: false,
      ground_state_task_kept_separate: desktop.text.includes('Calculate the Reference Ground State'),
    }, null, 2)}\n`);
  }

  console.log(`Reviewed optimization smoke passed: ${desktop.headings.length} natural sections, 4 practical cards, rendered sources, 1440px/390px no-overflow, no-JavaScript reading, and a separate reference-ground-state boundary.`);
} finally {
  await browser.close();
}

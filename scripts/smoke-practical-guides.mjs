import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const parentRoute = '/operations/build-or-modify-computational-model/';
const guides = [
  {
    route: '/operations/build-or-modify-computational-model/guides/ase-build-repeat-cells/',
    title: 'Build and Repeat Cells with ASE',
    tool: 'ase',
    version: 'ASE 3.29.0',
    phrase: 'An integer repeat of an unchanged perfect crystal can be an equivalent periodic representation.',
  },
  {
    route: '/operations/build-or-modify-computational-model/guides/ase-surfaces-vacuum-adsorbates/',
    title: 'Construct Surfaces, Vacuum, and Adsorbates with ASE',
    tool: 'ase',
    version: 'ASE 3.29.0',
    phrase: 'A surface builder produces a starting model, not a validated surface.',
  },
  {
    route: '/operations/build-or-modify-computational-model/guides/pymatgen-structure-transformations/',
    title: 'Apply Structure Transformations with pymatgen',
    tool: 'pymatgen',
    version: 'pymatgen-core 2026.7.31',
    phrase: 'The transformation class does not decide whether the operation preserves the same physical model.',
  },
  {
    route: '/operations/build-or-modify-computational-model/examples/two-dimensional-monolayer-model/',
    title: 'Build a Two-Dimensional Monolayer Model',
    tool: 'ase',
    version: 'ASE 3.29.0',
    phrase: 'It is not derived from an experimental file',
  },
];

async function inspectGuide(page, guide, width) {
  const response = await page.goto(`${base}${guide.route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`${guide.route} returned ${response?.status()}`);
  const result = await page.evaluate(() => ({
    language: document.documentElement.lang,
    title: document.querySelector('h1')?.textContent?.trim(),
    text: document.body.innerText,
    links: [...document.querySelectorAll('.article-content a')].map((link) => link.href),
    images: [...document.querySelectorAll('.guide-media img')].map((image) => ({ src: image.src, alt: image.alt })),
    toolTags: [...document.querySelectorAll('.tool-tag')].map((tag) => tag.textContent?.trim()),
    hasMeta: Boolean(document.querySelector('.guide-meta')),
    hasEvidence: Boolean(document.querySelector('.evidence-note')),
    hasScript: Boolean(document.querySelector('script')),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (result.language !== 'en') throw new Error(`${guide.route}: language is not English`);
  if (result.title !== guide.title) throw new Error(`${guide.route}: title mismatch ${result.title}`);
  if (!result.text.includes(guide.phrase)) throw new Error(`${guide.route}: missing scientific boundary phrase`);
  if (!result.text.includes(guide.version)) throw new Error(`${guide.route}: missing tested version ${guide.version}`);
  if (!result.toolTags.includes(guide.tool)) throw new Error(`${guide.route}: missing tool tag ${guide.tool}`);
  if (!result.hasMeta || !result.hasEvidence) throw new Error(`${guide.route}: missing metadata or evidence boundary`);
  if (result.images.length !== 1 || !result.images[0].alt) throw new Error(`${guide.route}: missing one accessible original diagram`);
  if (!result.links.some((link) => link.startsWith('https://'))) throw new Error(`${guide.route}: missing official source links`);
  if (result.hasScript) throw new Error(`${guide.route}: client-side script is present`);
  if (result.overflow) throw new Error(`${guide.route}: horizontal overflow at ${width}px`);
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

  let response = await page.goto(`${base}${parentRoute}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`practical parent returned ${response?.status()}`);
  const parent = await page.evaluate(() => ({
    text: document.body.innerText,
    links: [...document.querySelectorAll('.practical-card-list a')].map((link) => link.href),
    cards: document.querySelectorAll('.practical-card-list li').length,
    scripts: document.querySelectorAll('script').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (!parent.text.includes('Practical resources') || !parent.text.includes('Practical Guides') || !parent.text.includes('Worked Examples')) {
    throw new Error('parent topic is missing practical resource groups');
  }
  if (parent.cards !== 4) throw new Error(`parent topic has ${parent.cards} practical cards instead of 4`);
  for (const guide of guides) if (!parent.links.includes(`${base}${guide.route}`)) throw new Error(`parent topic is missing ${guide.route}`);
  if (parent.scripts !== 0 || parent.overflow) throw new Error('parent practical interface is not static or overflows');

  const desktopResults = [];
  for (const guide of guides) desktopResults.push(await inspectGuide(page, guide, 1440));

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  for (const guide of guides) await inspectGuide(page, guide, 390);

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  for (const guide of guides) {
    response = await noJsPage.goto(`${base}${guide.route}`, { waitUntil: 'load' });
    if (response?.status() !== 200) throw new Error(`${guide.route}: no-JavaScript response ${response?.status()}`);
    const text = await noJsPage.$eval('body', (body) => body.innerText);
    if (!text.includes(guide.title) || !text.includes(guide.phrase)) throw new Error(`${guide.route}: no-JavaScript content incomplete`);
  }

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${parentRoute}`, { waitUntil: 'load' });
    await captureStablePage(page, join(artifactDirectory, 'practical-guides-parent-desktop.png'));
    await page.goto(`${base}${guides[3].route}`, { waitUntil: 'load' });
    await captureStablePage(page, join(artifactDirectory, 'practical-guide-monolayer-desktop.png'));
    await writeFile(join(artifactDirectory, 'practical-guides-summary.json'), `${JSON.stringify({
      site_url: base,
      parent_route: parentRoute,
      parent_cards: parent.cards,
      routes: guides.map((guide) => guide.route),
      source_links: desktopResults.reduce((sum, result) => sum + result.links.length, 0),
      original_media: desktopResults.reduce((sum, result) => sum + result.images.length, 0),
      desktop_width: 1440,
      mobile_width: 390,
      no_javascript: true,
    }, null, 2)}\n`);
  }

  console.log('Practical guide smoke passed: parent cards, 4 static routes, pinned versions, official links, original media, 1440px/390px layout, and no-JavaScript reading.');
} finally {
  await browser.close();
}

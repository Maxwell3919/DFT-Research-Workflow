import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/build-or-modify-computational-model/';
const requiredOperationalSections = [
  'Start from the question and the checked source',
    'Optional automation: preserve and compare repeated transformations',
  'Distinguish representation changes from model changes',
  'Check the child object before calculation',
  'Match the model family to the unresolved alternatives',
  'Decide which candidates continue',
  'The result of this task',
  'Sources and methods',
];
const requiredOperationalContract = {
  checkedSource: [
    'Keep the source unchanged.',
    'record its identifier, checksum, composition, cell, atom order',
    'Open the parent with cell boundaries and periodic images visible',
  ],
  declaredTransformation: [
    'For every candidate preserve: parent identifier and checksum; tool and version; operation or script; transformation parameters and site mapping',
    'Write each child to a new file, reopen that file',
  ],
  childObject: [
    'exported filename and checksum',
    'visual/numerical observations',
    'Record atom mapping and the exact transformation',
  ],
  identityAndGeometryChecks: [
    'Inspect composition, cell, periodicity, orientation, replication, vacuum direction',
    'A generated candidate is not a predicted ground state',
  ],
  decisionAndNext: [
    'Promote only reopened files with explicit lineage',
    'choose the DFT method and setup',
    'test numerical convergence',
  ],
};
const requiredToolDomains = [
  'docs.ase-lib.org',
  'pymatgen.org',
];
const requiredSourceDomains = [
  'doi.org',
];

async function inspect(page, expectedWidth) {
  const result = await page.evaluate(() => ({
    language: document.documentElement.lang,
    title: document.querySelector('h1')?.textContent?.trim(),
    text: document.body.innerText,
    links: [...document.querySelectorAll('.article-content a')].map((link) => link.href),
    headings: [...document.querySelectorAll('.article-content h2')].map((heading) => heading.textContent?.trim()),
    hasArticle: Boolean(document.querySelector('.article-content')),
    hasPlaceholder: document.body.innerText.includes('This stable destination is reserved for a later reviewed content batch.'),
    hasContract: Boolean(document.querySelector('.operation-contract')),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));

  if (result.language !== 'en') throw new Error('model-building article language is not English');
  if (result.title !== 'Build or Modify a Computational Model') throw new Error(`model-building article title mismatch: ${result.title}`);
  if (!result.hasArticle || result.hasPlaceholder) throw new Error('reviewed model-building narrative was not rendered');
  if (result.hasContract) throw new Error('reviewed model-building article exposes a fixed contract');
  if (result.overflow) throw new Error(`model-building article overflows at ${expectedWidth}px`);
  for (const section of requiredOperationalSections) {
    if (!result.headings.includes(section)) throw new Error(`model-building article is missing operational section ${section}`);
  }
  for (const [stage, phrases] of Object.entries(requiredOperationalContract)) {
    for (const phrase of phrases) {
      if (!result.text.includes(phrase)) throw new Error(`model-building ${stage} contract is missing ${phrase}`);
    }
  }
  for (const domain of requiredToolDomains) {
    if (!result.links.some((link) => link.includes(domain))) throw new Error(`model-building article is missing tool link domain ${domain}`);
  }
  for (const domain of requiredSourceDomains) {
    if (!result.links.some((link) => link.includes(domain))) throw new Error(`model-building article is missing source link domain ${domain}`);
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
  let response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`model-building desktop route returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`model-building mobile route returned ${response?.status()}`);
  await inspect(page, 390);

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  response = await noJsPage.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`model-building no-JavaScript route returned ${response?.status()}`);
  const noJsText = await noJsPage.$eval('body', (body) => body.innerText);
  for (const phrase of ['A computational model is the explicit system', 'One ordered cell is not a random alloy.', 'Sources and methods']) {
    if (!noJsText.includes(phrase)) throw new Error(`model-building no-JavaScript page is missing ${phrase}`);
  }

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'load' });
    await captureStablePage(page, join(artifactDirectory, 'topic-build-computational-model-desktop.png'));
    await writeFile(join(artifactDirectory, 'reviewed-model-summary.json'), `${JSON.stringify({
      site_url: base,
      route,
      natural_sections: desktop.headings.length,
      source_links: desktop.links.length,
      desktop_width: 1440,
      mobile_width: 390,
      no_javascript: true,
      fixed_contract: false,
    }, null, 2)}\n`);
  }

  console.log(`Reviewed model-building smoke passed: operation-first source/transform/child/check/decision contract, ${desktop.headings.length} topic sections, rendered tool and source links, 1440px and 390px no-overflow, and no-JavaScript reading.`);
} finally {
  await browser.close();
}

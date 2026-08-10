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
    'models/records/source.sha256',
    'sha256sum structures/si-cod-9013102/working/9013102-as-downloaded.cif',
    'The checksum binds the parent bytes.',
  ],
  declaredTransformation: [
    'candidate identifier',
    'parent identifier and checksum',
    'tool, version, script, and command',
    'transformation parameters and matrix',
  ],
  childObject: [
    'output filename and checksum',
    'find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum',
    'candidate-files.sha256',
  ],
  identityAndGeometryChecks: [
    'composition, atom count, atom order, and site mapping',
    'cell vectors, volume, periodic directions, and shortest relevant image separations',
    'A generated candidate is not a predicted ground state.',
  ],
  decisionAndNext: [
    'Promote a candidate only when its source lineage, transformation, composition, geometry, periodicity, charge, constraints, and unresolved alternatives are explicit.',
    'Next, choose the exchange–correlation treatment',
    'Then test the numerical controls against the quantity that will be used.',
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

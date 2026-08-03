import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/build-or-modify-computational-model/';
const requiredPhrases = [
  'A computational model is the explicit system that a calculation is asked to represent.',
  'Separate equivalent representations from changes to the physical model',
  'Choose dimensionality and periodicity explicitly',
  'Let the supercell encode the relevant length scale',
  'Build interfaces and heterostructures as families of candidates',
  'One ordered cell is not a random alloy.',
  'Constraints are assumptions written into the model.',
  'Generate candidates broadly, then reduce them transparently',
  'Sources and methods',
];
const requiredDomains = [
  'docs.ase-lib.org',
  'pymatgen.org',
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
  if (result.headings.length < 12) throw new Error(`model-building article has only ${result.headings.length} natural topic sections`);
  for (const phrase of requiredPhrases) {
    if (!result.text.includes(phrase)) throw new Error(`model-building article is missing ${phrase}`);
  }
  for (const domain of requiredDomains) {
    if (!result.links.some((link) => link.includes(domain))) throw new Error(`model-building article is missing source domain ${domain}`);
  }
  return result;
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);

  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  let response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  if (response?.status() !== 200) throw new Error(`model-building desktop route returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  if (response?.status() !== 200) throw new Error(`model-building mobile route returned ${response?.status()}`);
  await inspect(page, 390);

  const noJsPage = await browser.newPage();
  await noJsPage.setJavaScriptEnabled(false);
  response = await noJsPage.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  if (response?.status() !== 200) throw new Error(`model-building no-JavaScript route returned ${response?.status()}`);
  const noJsText = await noJsPage.$eval('body', (body) => body.innerText);
  for (const phrase of ['A computational model is the explicit system', 'One ordered cell is not a random alloy.', 'Sources and methods']) {
    if (!noJsText.includes(phrase)) throw new Error(`model-building no-JavaScript page is missing ${phrase}`);
  }

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({
      path: join(artifactDirectory, 'topic-build-computational-model-desktop.png'),
      fullPage: true,
    });
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

  console.log(`Reviewed model-building smoke passed: natural article rendering, ${desktop.headings.length} topic sections, rendered source links, 1440px and 390px no-overflow, and no-JavaScript reading.`);
} finally {
  await browser.close();
}

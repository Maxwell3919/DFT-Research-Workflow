import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/test-numerical-convergence/';
const requiredPhrases = [
  'Numerical convergence asks whether a reported quantity is stable enough',
  'Separate completion, solver convergence, and observable convergence',
  'Only the third line is numerical convergence.',
  'Do not average over state switches and call the result converged.',
  'Converge coupled numerical controls together',
  'A smearing width used as an integration device is not automatically a physical electronic temperature.',
  'An apparently smooth interpolated curve is not evidence that the underlying coarse grid is sufficient.',
  'A single small difference between the final two settings is therefore weak evidence.',
  'Choose a stopping point, not a universal maximum',
  'The durable output of this task is not one parameter list.',
  'What this task does not establish',
  'Sources and methods',
];
const requiredDomains = [
  'quantum-espresso.org',
  'doi.org',
  'archive.materialscloud.org',
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

  if (result.language !== 'en') throw new Error('convergence overview language is not English');
  if (result.title !== 'Test Numerical Convergence') throw new Error(`convergence overview title mismatch: ${result.title}`);
  if (!result.hasArticle || result.hasPlaceholder) throw new Error('reviewed convergence narrative was not rendered');
  if (result.hasContract) throw new Error('convergence overview exposes a fixed contract');
  if (result.hasScript) throw new Error('convergence overview contains client-side script');
  if (result.overflow) throw new Error(`convergence overview overflows at ${expectedWidth}px`);
  if (result.headings.length !== 16) throw new Error(`convergence overview has ${result.headings.length} sections instead of 16`);
  if (result.cards !== 4) throw new Error(`convergence overview exposes ${result.cards} practical cards instead of 4`);
  for (const phrase of requiredPhrases) {
    if (!result.text.includes(phrase)) throw new Error(`convergence overview is missing ${phrase}`);
  }
  for (const domain of requiredDomains) {
    if (!result.links.some((link) => link.includes(domain))) throw new Error(`convergence overview is missing source domain ${domain}`);
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
  if (response?.status() !== 200) throw new Error(`convergence overview desktop route returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  if (response?.status() !== 200) throw new Error(`convergence overview mobile route returned ${response?.status()}`);
  await inspect(page, 390);

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  response = await noJsPage.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  if (response?.status() !== 200) throw new Error(`convergence overview no-JavaScript route returned ${response?.status()}`);
  const noJsText = await noJsPage.$eval('body', (body) => body.innerText);
  for (const phrase of [
    'Numerical convergence asks whether a reported quantity is stable enough',
    'Only the third line is numerical convergence.',
    'Sources and methods',
  ]) {
    if (!noJsText.includes(phrase)) throw new Error(`convergence overview no-JavaScript page is missing ${phrase}`);
  }

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
    await captureStablePage(page, join(artifactDirectory, 'topic-test-numerical-convergence-desktop.png'));
    await writeFile(join(artifactDirectory, 'reviewed-convergence-summary.json'), `${JSON.stringify({
      site_url: base,
      route,
      natural_sections: desktop.headings.length,
      practical_cards: desktop.cards,
      source_links: desktop.links.length,
      desktop_width: 1440,
      mobile_width: 390,
      no_javascript: true,
      fixed_contract: false,
    }, null, 2)}\n`);
  }

  console.log(`Reviewed convergence smoke passed: ${desktop.headings.length} natural sections, 4 practical cards, rendered sources, 1440px/390px no-overflow, and no-JavaScript reading.`);
} finally {
  await browser.close();
}

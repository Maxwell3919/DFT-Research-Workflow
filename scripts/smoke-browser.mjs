import { readFile } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const base = process.env.SITE_URL ?? 'http://127.0.0.1:4322';
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const operations = JSON.parse(await readFile(new URL('../src/data/operations.json', import.meta.url), 'utf8'));
const expectedAssisted = operations.filter((operation) => operation.automation_maturity === 'assisted').length;
const requiredRoutes = [
  '/', '/workflow/', '/stages/convergence/', '/branches/vibrations-response/',
  '/evidence/', '/registry/', '/data/operations.json',
];

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  for (const route of requiredRoutes) {
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle0' });
    if (!response?.ok()) throw new Error(`${route}: HTTP ${response?.status() ?? 'no response'}`);
  }

  await page.goto(`${base}/workflow/`, { waitUntil: 'networkidle0' });
  const allCards = await page.$$eval('[data-operation]', (cards) => cards.length);
  if (allCards !== operations.length) throw new Error(`expected ${operations.length} operation cards, found ${allCards}`);

  await page.click('[data-filter="assisted"]');
  await page.waitForFunction(
    (expected) => [...document.querySelectorAll('[data-operation]')].filter((card) => !card.hidden).length === expected,
    {},
    expectedAssisted,
  );
  const interaction = await page.evaluate(() => ({
    visible: [...document.querySelectorAll('[data-operation]')].filter((card) => !card.hidden).length,
    readout: document.querySelector('[data-filter-readout]')?.textContent ?? '',
    pressed: document.querySelector('[data-filter="assisted"]')?.getAttribute('aria-pressed'),
  }));
  if (interaction.visible !== expectedAssisted || interaction.pressed !== 'true' || !interaction.readout.includes(String(expectedAssisted))) {
    throw new Error(`filter interaction mismatch: ${JSON.stringify(interaction)}`);
  }

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(`${base}/workflow/`, { waitUntil: 'networkidle0' });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (mobileOverflow) throw new Error('workflow route has horizontal overflow at 390px');

  const noJsPage = await browser.newPage();
  await noJsPage.setJavaScriptEnabled(false);
  await noJsPage.goto(`${base}/workflow/`, { waitUntil: 'networkidle0' });
  const noJsCards = await noJsPage.$$eval('[data-operation]', (cards) => cards.filter((card) => !card.hidden).length);
  if (noJsCards !== operations.length) throw new Error(`no-JS route exposes ${noJsCards}/${operations.length} operations`);

  console.log(`Browser smoke passed: ${requiredRoutes.length} routes, ${allCards} cards, assisted filter ${expectedAssisted}, 390px no overflow, no-JS ${noJsCards}/${operations.length}.`);
} finally {
  await browser.close();
}

import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const route = '/operations/';
const expectedIds = [
  'local-minimum',
  'formation-energy',
  'decomposition-stability',
  'metallicity',
  'dynamical-stability',
  'conventional-superconductivity',
  'surface-energy',
  'work-function',
  'adsorption',
  'charge-redistribution',
];

async function inspect(page, expectedWidth) {
  const result = await page.evaluate(() => {
    const navigator = document.querySelector('[data-research-question-navigator]');
    const rows = [...document.querySelectorAll('[data-research-question]')];
    return {
      language: document.documentElement.lang,
      heading: navigator?.querySelector('h2')?.textContent?.trim(),
      columns: [...navigator?.querySelectorAll('thead th') ?? []].map((cell) => cell.textContent?.trim()),
      rows: rows.map((row) => ({
        id: row.dataset.researchQuestion,
        question: row.querySelector('th')?.textContent?.trim(),
        observable: row.querySelector('td')?.textContent?.trim(),
        href: row.querySelector('a')?.href,
        linkBox: (() => {
          const rect = row.querySelector('a')?.getBoundingClientRect();
          return rect ? { width: rect.width, height: rect.height } : null;
        })(),
      })),
      legacyLabels: ['Common human route', 'What to inspect', 'Before starting', 'First practical action', 'Does not establish']
        .filter((label) => navigator?.textContent?.includes(label)),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      width: window.innerWidth,
    };
  });

  if (result.language !== 'en') throw new Error('Research Question Navigator page language is not English');
  if (result.heading !== 'Start from the research question') throw new Error(`Navigator heading mismatch: ${result.heading}`);
  if (JSON.stringify(result.columns) !== JSON.stringify(['Question', 'Observable or evidence', 'Start here'])) {
    throw new Error(`Navigator columns are not compact: ${JSON.stringify(result.columns)}`);
  }
  if (result.rows.length !== 10) throw new Error(`Navigator rendered ${result.rows.length} rows at ${expectedWidth}px`);
  if (JSON.stringify(result.rows.map((row) => row.id)) !== JSON.stringify(expectedIds)) throw new Error('Navigator row identity or order changed');
  if (result.legacyLabels.length > 0) throw new Error(`Navigator still renders heavy fields: ${result.legacyLabels.join(', ')}`);
  if (result.overflow || result.width !== expectedWidth) throw new Error(`Navigator overflows or uses the wrong viewport at ${expectedWidth}px`);
  for (const row of result.rows) {
    if (!row.question || !row.observable || !row.href || !row.href.includes('/DFT-Research-Workflow/operations/')) {
      throw new Error(`${row.id}: incomplete question, observable, or route`);
    }
    if (!row.linkBox || row.linkBox.width <= 0 || row.linkBox.height <= 0) throw new Error(`${row.id}: route is not clickable`);
  }
  return result;
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  for (const width of [1440, 1280, 1024, 768, 430, 390, 360]) {
    await page.setViewport({ width, height: width > 768 ? 900 : 844, deviceScaleFactor: 1 });
    const response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
    if (response?.status() !== 200) throw new Error(`Navigator route returned ${response?.status()} at ${width}px`);
    await inspect(page, width);
  }

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  await noJsPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  const response = await noJsPage.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`Navigator no-JavaScript route returned ${response?.status()}`);
  await inspect(noJsPage, 390);

  console.log('Research Question Navigator smoke passed: 10 compact question-observable-route rows at 1440/1280/1024/768/430/390/360 px and complete no-JavaScript rendering.');
} finally {
  await browser.close();
}

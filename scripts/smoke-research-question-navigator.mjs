import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const route = '/operations/';
const expectedFields = [
  'Required observable',
  'Go to',
  'Common human route',
  'What to inspect',
  'Before starting',
  'First practical action',
  'Validate',
  'Does not establish',
];
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

async function fetchTarget(href) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(href, { signal: AbortSignal.timeout(10_000) });
      return { href, status: response.status };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 300));
    }
  }
  const detail = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`Navigator click target transport failed after 3 attempts: ${href}: ${detail}`);
}

async function inspect(page, expectedWidth) {
  const result = await page.evaluate((fieldLabels) => {
    const navigator = document.querySelector('[data-research-question-navigator]');
    const rows = [...document.querySelectorAll('[data-research-question]')];
    const collisions = [];
    const rowData = rows.map((row) => {
      const elements = [...row.querySelectorAll('h3, .question-details > div > dt, .question-details > div > dd')];
      const rectangles = elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { label: element.textContent?.trim().slice(0, 60), left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      });
      for (let first = 0; first < rectangles.length; first += 1) {
        for (let second = first + 1; second < rectangles.length; second += 1) {
          const a = rectangles[first];
          const b = rectangles[second];
          const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (overlapWidth > 1 && overlapHeight > 1) collisions.push(`${row.dataset.researchQuestion}: ${a.label} <> ${b.label}`);
        }
      }
      const links = [...row.querySelectorAll('a')].map((link) => {
        const rect = link.getBoundingClientRect();
        return { href: link.href, text: link.textContent?.trim(), width: rect.width, height: rect.height };
      });
      const rowRect = row.getBoundingClientRect();
      return {
        id: row.dataset.researchQuestion,
        question: row.querySelector('h3')?.textContent?.trim(),
        fields: [...row.querySelectorAll('dt')].map((term) => term.textContent?.trim()),
        links,
        noGuide: row.querySelector('[data-no-guide]')?.textContent?.trim() ?? null,
        insideViewport: rowRect.left >= -1 && rowRect.right <= document.documentElement.clientWidth + 1,
      };
    });
    const navigatorRect = navigator?.getBoundingClientRect();
    return {
      language: document.documentElement.lang,
      heading: navigator?.querySelector('h2')?.textContent?.trim(),
      text: navigator?.textContent ?? '',
      rowData,
      collisions,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      navigatorInsideViewport: Boolean(navigatorRect && navigatorRect.left >= -1 && navigatorRect.right <= document.documentElement.clientWidth + 1),
      expectedFields: fieldLabels,
    };
  }, expectedFields);

  if (result.language !== 'en') throw new Error('Research Question Navigator page language is not English');
  if (result.heading !== 'Start from the research question') throw new Error(`Navigator heading mismatch: ${result.heading}`);
  if (result.rowData.length !== 10) throw new Error(`Navigator rendered ${result.rowData.length} rows at ${expectedWidth}px`);
  if (result.overflow || !result.navigatorInsideViewport) throw new Error(`Navigator overflows at ${expectedWidth}px`);
  if (result.collisions.length > 0) throw new Error(`Navigator text collision at ${expectedWidth}px: ${result.collisions.join('; ')}`);
  if (JSON.stringify(result.rowData.map((row) => row.id)) !== JSON.stringify(expectedIds)) throw new Error('Navigator row identity or order changed');

  for (const row of result.rowData) {
    if (!row.question) throw new Error(`${row.id}: missing public question`);
    if (JSON.stringify(row.fields) !== JSON.stringify(expectedFields)) throw new Error(`${row.id}: incomplete field set ${JSON.stringify(row.fields)}`);
    if (!row.insideViewport) throw new Error(`${row.id}: row escapes viewport at ${expectedWidth}px`);
    if (row.links.length < 1) throw new Error(`${row.id}: no direct target link`);
    for (const link of row.links) {
      if (!link.href.includes('/DFT-Research-Workflow/operations/')) throw new Error(`${row.id}: non-workflow click target ${link.href}`);
      if (!link.text || link.width <= 0 || link.height <= 0) throw new Error(`${row.id}: empty or non-clickable target ${link.href}`);
    }
  }

  const noGuideRows = result.rowData.filter((row) => row.noGuide);
  if (noGuideRows.length !== 1 || noGuideRows[0].id !== 'conventional-superconductivity') throw new Error('EPC must be the only no-guide row');
  if (!noGuideRows[0].noGuide.includes('No reviewed hands-on practical guide is published')) throw new Error('EPC no-guide state is not explicit');
  if (!result.text.includes('A high-symmetry band path alone is not full-Brillouin-zone evidence of metallicity')) throw new Error('Metallicity full-zone boundary is missing');
  if (!result.text.includes('one real Silicon Gamma-point mode ledger only')) throw new Error('Phonon Gamma-only guide boundary is missing');
  if (!result.text.includes('A negative formation energy does not establish convex-hull stability')) throw new Error('Formation-versus-hull boundary is missing');
  return result;
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  let desktop;
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
    const response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
    if (response?.status() !== 200) throw new Error(`Navigator route returned ${response?.status()} at ${viewport.width}px`);
    const result = await inspect(page, viewport.width);
    if (viewport.width === 1440) desktop = result;
  }

  const uniqueTargets = [...new Set(desktop.rowData.flatMap((row) => row.links.map((link) => link.href)))];
  const targetResults = [];
  for (const href of uniqueTargets) targetResults.push(await fetchTarget(href));
  const failedTargets = targetResults.filter((target) => target.status !== 200);
  if (failedTargets.length > 0) throw new Error(`Navigator click targets failed: ${JSON.stringify(failedTargets)}`);

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  await noJsPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  const noJsResponse = await noJsPage.goto(`${base}${route}`, { waitUntil: 'load' });
  if (noJsResponse?.status() !== 200) throw new Error(`Navigator no-JavaScript route returned ${noJsResponse?.status()}`);
  const noJs = await inspect(noJsPage, 390);
  if (noJs.rowData.some((row) => row.links.length < 1)) throw new Error('Navigator loses direct links without JavaScript');

  console.log(`Research Question Navigator smoke passed: 10 static rows, ${uniqueTargets.length} live click targets, 1440px/768px/390px no-overflow and no-collision layouts, and complete no-JavaScript rendering.`);
} finally {
  await browser.close();
}

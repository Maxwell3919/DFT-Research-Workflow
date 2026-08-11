import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const route = '/operations/troubleshooting/';

async function inspect(page, expectedWidth) {
  const result = await page.evaluate(() => {
    const heading = document.querySelector('main h1');
    const navLabels = [...document.querySelectorAll('.primary-nav a')].map((link) => link.textContent?.trim());
    const current = document.querySelector('.primary-nav a[aria-current="page"]');
    return {
      language: document.documentElement.lang,
      innerWidth: window.innerWidth,
      heading: heading?.textContent?.trim(),
      navLabels,
      currentLabel: current?.textContent?.trim(),
      h2Count: document.querySelectorAll('main h2').length,
      articleCount: document.querySelectorAll('main article').length,
      symptomCount: document.querySelectorAll('[data-symptom-record]').length,
      hydrated: Boolean(document.querySelector('main astro-island')),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  });

  if (result.language !== 'en') throw new Error('Troubleshooting route is not English');
  if (result.innerWidth !== expectedWidth) throw new Error(`Requested ${expectedWidth}px but browser rendered ${result.innerWidth}px`);
  if (result.heading !== 'Troubleshooting') throw new Error(`Troubleshooting heading mismatch: ${result.heading}`);
  if (result.navLabels.at(-1) !== 'Troubleshooting' || result.currentLabel !== 'Troubleshooting') throw new Error('Troubleshooting is not the active final primary-navigation item');
  if (result.h2Count !== 0 || result.articleCount !== 0 || result.symptomCount !== 0) throw new Error('Troubleshooting scaffold contains reader-facing case content');
  if (result.hydrated) throw new Error('Troubleshooting route contains client hydration');
  if (result.overflow) throw new Error(`Troubleshooting overflows at ${expectedWidth}px`);
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 1024, height: 900 },
    { width: 768, height: 1024 },
    { width: 430, height: 900 },
    { width: 390, height: 844 },
    { width: 360, height: 800 },
  ]) {
    await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
    const response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
    if (response?.status() !== 200) throw new Error(`Troubleshooting route returned ${response?.status()} at ${viewport.width}px`);
    await inspect(page, viewport.width);
  }

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  await noJsPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  const noJsResponse = await noJsPage.goto(`${base}${route}`, { waitUntil: 'load' });
  if (noJsResponse?.status() !== 200) throw new Error(`Troubleshooting no-JavaScript route returned ${noJsResponse?.status()}`);
  await inspect(noJsPage, 390);

  console.log('Troubleshooting smoke passed: empty scaffold, active final primary-navigation item, 1440/1024/768/430/390/360px layouts, and 390px no-JavaScript rendering.');
} finally {
  await browser.close();
}

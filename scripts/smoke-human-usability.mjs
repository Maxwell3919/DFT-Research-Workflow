import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const widths = [1440, 1280, 1024, 768, 430, 390, 360];
const representativeRoutes = [
  '/operations/',
  '/tools/',
  '/operations/obtain-material-structure/',
  '/operations/choose-dft-method-and-computational-setup/',
  '/operations/optimize-structure/',
  '/operations/harmonic-phonons/',
  '/operations/validate-results-and-scientific-conclusions/guides/inspect-qe-hpc-calculations-from-the-terminal/',
  '/workflows/silicon-ground-state-electronic-structure/',
  '/workflows/aluminium-metallic-electronic-structure/',
];

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  for (const width of widths) {
    await page.setViewport({ width, height: width > 768 ? 900 : 844, deviceScaleFactor: 1 });
    for (const route of representativeRoutes) {
      const response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
      if (response?.status() !== 200) throw new Error(`${route} returned ${response?.status()} at ${width}px`);
      const result = await page.evaluate(() => {
        const viewport = document.documentElement.clientWidth;
        const outside = [...document.querySelectorAll('main img, main figure, main table, main pre')]
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > viewport + 1;
          })
          .map((element) => `${element.tagName}:${element.className || element.getAttribute('data-stage-figure') || ''}`);
        const brokenImages = [...document.querySelectorAll('main img')]
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.getAttribute('src'));
        return {
          width: window.innerWidth,
          documentOverflow: document.documentElement.scrollWidth > viewport + 1,
          outside,
          brokenImages,
          nonCopyScripts: document.querySelectorAll('script:not([data-copy-enhancement])').length,
        };
      });
      if (result.width !== width || result.documentOverflow || result.outside.length > 0 || result.brokenImages.length > 0) {
        throw new Error(`${route} fails ${width}px layout: ${JSON.stringify(result)}`);
      }
      if (result.nonCopyScripts !== 0) throw new Error(`${route} has an unexpected client script`);
    }
  }

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(`${base}/tools/`, { waitUntil: 'load' });
  const catalog = await page.evaluate(() => ({
    resources: document.querySelectorAll('[data-resource]').length,
    groups: document.querySelectorAll('[data-resource-task]').length,
    detailLinks: document.querySelectorAll('[data-resource] h3 > a').length,
  }));
  if (catalog.resources !== 184 || catalog.groups !== 9 || catalog.detailLinks !== 18) {
    throw new Error(`Tools & Resources catalog mismatch: ${JSON.stringify(catalog)}`);
  }

  const terminalRoute = '/operations/validate-results-and-scientific-conclusions/guides/inspect-qe-hpc-calculations-from-the-terminal/';
  await page.goto(`${base}${terminalRoute}`, { waitUntil: 'load' });
  const copyState = await page.evaluate(() => ({
    blocks: document.querySelectorAll('pre[data-language="bash"] > code').length,
    buttons: document.querySelectorAll('.copy-code-button').length,
    proseButtons: [...document.querySelectorAll('pre:not([data-language]):not([data-copyable])')]
      .filter((pre) => pre.closest('.copyable-code')).length,
  }));
  if (copyState.blocks < 1 || copyState.buttons !== copyState.blocks || copyState.proseButtons !== 0) {
    throw new Error(`Copy controls do not match executable blocks: ${JSON.stringify(copyState)}`);
  }
  await page.click('.copy-code-button');
  await page.waitForFunction(() => document.querySelector('.copy-code-button')?.textContent === 'Copied');

  for (const [route, expectedFigures] of [
    ['/workflows/silicon-ground-state-electronic-structure/', 4],
    ['/workflows/aluminium-metallic-electronic-structure/', 2],
  ]) {
    await page.goto(`${base}${route}`, { waitUntil: 'load' });
    const figures = await page.evaluate(() => ({
      count: document.querySelectorAll('[data-stage-figure]').length,
      paths: [...document.querySelectorAll('[data-stage-figure]')].map((figure) => figure.getAttribute('data-stage-figure')),
      appendixOpen: document.querySelector('[data-reproducibility-appendix]')?.hasAttribute('open'),
    }));
    if (figures.count !== expectedFigures || new Set(figures.paths).size !== figures.paths.length || figures.appendixOpen) {
      throw new Error(`${route} figure or appendix state mismatch: ${JSON.stringify(figures)}`);
    }
  }

  const noJs = await browser.newPage();
  await noJs.setJavaScriptEnabled(false);
  await noJs.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await noJs.goto(`${base}${terminalRoute}`, { waitUntil: 'load' });
  const noJsState = await noJs.evaluate(() => ({
    codeBlocks: document.querySelectorAll('pre[data-language="bash"] > code').length,
    buttons: document.querySelectorAll('.copy-code-button').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (noJsState.codeBlocks < 1 || noJsState.buttons !== 0 || noJsState.overflow) {
    throw new Error(`No-JavaScript terminal route is incomplete: ${JSON.stringify(noJsState)}`);
  }

  console.log('Human usability smoke passed: 9 representative routes at 1440/1280/1024/768/430/390/360 px, dense 184-resource catalog, bounded Copy controls, six unique workflow figures, and complete no-JavaScript reading.');
} finally {
  await browser.close();
}

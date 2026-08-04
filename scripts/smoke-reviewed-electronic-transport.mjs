import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_BIN ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const routes = [
  {
    route: '/operations/electronic-transport/',
    title: 'Electronic Transport',
    text: 'The response starts from a distribution, not a band plot',
    extra: 'Replot a Published CoSb3 Transport Output',
    image: false,
  },
  {
    route: '/operations/electronic-transport/examples/replot-boltztrap-cosb3-transport/',
    title: 'Replot a Published CoSb3 Transport Output',
    text: 'Trace the source before interpreting the curves',
    extra: 'What this example does not establish',
    image: true,
  },
];

try {
  for (const width of [1440, 390]) {
    for (const expected of routes) {
      const page = await browser.newPage();
      await page.setCacheEnabled(false);
      await page.setViewport({ width, height: 844 });
      const response = await page.goto(base + expected.route, { waitUntil: 'load' });
      const state = await page.evaluate(async () => {
        const image = document.querySelector('.guide-media img');
        if (image) {
          image.loading = 'eager';
          image.scrollIntoView({ block: 'center' });
          try { await image.decode(); } catch {}
        }
        return {
          title: document.querySelector('h1')?.textContent?.trim(),
          text: document.body.innerText,
          scripts: document.scripts.length,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          images: [...document.images].map((item) => ({ src: item.src, complete: item.complete, width: item.naturalWidth })),
        };
      });
      const sourceFigure = state.images.find((image) => image.src.includes('boltztrap-cosb3-transport.svg'));
      if (
        response?.status() !== 200 ||
        state.title !== expected.title ||
        !state.text.includes(expected.text) ||
        !state.text.includes(expected.extra) ||
        state.scripts ||
        state.overflow ||
        (expected.image && (!sourceFigure?.complete || !sourceFigure.width))
      ) {
        throw new Error(`Electronic transport route failed at ${width}px: ${expected.route}`);
      }
      await page.close();
    }
  }
  for (const expected of routes) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setJavaScriptEnabled(false);
    const response = await page.goto(base + expected.route, { waitUntil: 'load' });
    const text = await page.$eval('body', (body) => body.innerText);
    if (response?.status() !== 200 || !text.includes(expected.title) || !text.includes(expected.text)) {
      throw new Error(`Electronic transport no-JavaScript failure: ${expected.route}`);
    }
    await page.close();
  }
  console.log('Reviewed electronic-transport smoke passed: overview, CoSb3 practical route and image, 1440px/390px no-overflow, and no-JavaScript reading.');
} finally {
  await browser.close();
}

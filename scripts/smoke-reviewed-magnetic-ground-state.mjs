import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN ?? '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const routes = [
  ['/operations/magnetic-configuration-and-ground-state-comparison/', 'Magnetic Configuration and Ground-State Comparison', 'Magnetic order belongs to the calculation object']
];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage(); await page.setCacheEnabled(false); await page.setViewport({ width, height: 844 });
    for (const [route, title, phrase] of routes) {
      const response = await page.goto(base + route, { waitUntil: 'load' });
      const state = await page.evaluate(async () => { const image = document.querySelector('.guide-media img'); if (image) { image.loading = 'eager'; image.scrollIntoView(); try { await image.decode(); } catch {} } return { title: document.querySelector('h1')?.textContent?.trim(), text: document.body.innerText, scripts: document.querySelectorAll('script:not([data-copy-enhancement])').length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, image: image ? image.complete && image.naturalWidth > 0 : true }; });
      if (response?.status() !== 200 || state.title !== title || !state.text.includes(phrase) || state.scripts || state.overflow || !state.image) throw Error(`${route} failed at ${width}px`);
    }
    await page.close();
  }
  const noJs = await browser.newPage(); await noJs.setCacheEnabled(false); await noJs.setJavaScriptEnabled(false);
  for (const [route, title, phrase] of routes) { const response = await noJs.goto(base + route, { waitUntil: 'load' }); const text = await noJs.$eval('body', (body) => body.innerText); if (response?.status() !== 200 || !text.includes(title) || !text.includes(phrase)) throw Error(`${route} no-JavaScript failure`); }
  console.log('Reviewed magnetic-ground-state smoke passed: parent topic, 1440px/390px no-overflow, and no-JavaScript reading.');
} finally { await browser.close(); }

import puppeteer from 'puppeteer-core';
import toolsRegistry from '../workflow/tools.json' with { type: 'json' };

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_BIN ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const verifiedAtLabel = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${toolsRegistry.verified_at}T00:00:00Z`));
const requiredHeadings = ['What', 'Where in DRW', 'Start here', 'Official documentation'];
const routes = [
  { route: '/tools/', title: 'Tools', phrase: 'Materials data services' },
  ...toolsRegistry.tools.map((tool) => ({
    route: `/tools/${tool.slug}/`,
    title: tool.name,
    phrase: tool.getting_started.label,
    startUrl: tool.getting_started.url,
  })),
];

function detailStateIsValid(route, state) {
  if (!route.startUrl) return true;
  return requiredHeadings.every((heading) => state.headings.includes(heading))
    && state.startLabel === route.phrase
    && state.startUrl === route.startUrl
    && state.text.includes(verifiedAtLabel)
    && state.text.includes('does not rank or endorse tools');
}

try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width, height: 844 });
    for (const route of routes) {
      const response = await page.goto(base + route.route, { waitUntil: 'load' });
      const state = await page.evaluate(() => ({
        title: document.querySelector('h1')?.textContent?.trim(),
        text: document.body.innerText,
        headings: [...document.querySelectorAll('h2')].map((heading) => heading.textContent?.trim()),
        startLabel: document.querySelector('[data-tool-start]')?.textContent?.trim(),
        startUrl: document.querySelector('[data-tool-start]')?.getAttribute('href'),
        scripts: document.scripts.length,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      }));
      if (response?.status() !== 200 || state.title !== route.title || !state.text.includes(route.phrase) || !detailStateIsValid(route, state) || state.scripts || state.overflow) {
        throw Error(`${route.route} ${width} ${JSON.stringify({ status: response?.status(), title: state.title, phrase: state.text.includes(route.phrase), detail: detailStateIsValid(route, state), scripts: state.scripts, overflow: state.overflow })}`);
      }
    }
    await page.close();
  }

  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setJavaScriptEnabled(false);
  for (const route of routes) {
    const response = await page.goto(base + route.route, { waitUntil: 'load' });
    const state = await page.evaluate(() => ({
      text: document.body.innerText,
      headings: [...document.querySelectorAll('h2')].map((heading) => heading.textContent?.trim()),
      startLabel: document.querySelector('[data-tool-start]')?.textContent?.trim(),
      startUrl: document.querySelector('[data-tool-start]')?.getAttribute('href'),
    }));
    if (response?.status() !== 200 || !state.text.includes(route.title) || !state.text.includes(route.phrase) || !detailStateIsValid(route, state)) {
      throw Error(`${route.route} no-js`);
    }
  }
  await page.close();
  console.log('Tools browser smoke passed: index and all 17 detail pages, curated start links and registry verification date, 1440px/390px no-overflow, and no-JavaScript reading.');
} finally {
  await browser.close();
}

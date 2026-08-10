import puppeteer from 'puppeteer-core';
import landscape from '../workflow/resource-landscape.json' with { type: 'json' };
import sources from '../sources/resource-landscape-links.json' with { type: 'json' };

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const route = '/operations/resource-landscape/';
const widths = [1440, 1024, 768, 430, 390, 360];
const resources = landscape.categories.flatMap((category) => category.resources);
const sourceById = new Map(sources.sources.map((source) => [source.id, source]));
const expectedCategoryIds = landscape.categories.map((category) => category.id);
const expectedAliases = ['method-inputs', 'electronic-structure-codes', 'lattice-dynamics'];
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN ?? '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

async function inspect(page) {
  return page.evaluate((aliasesToCheck) => {
    const categoryElements = [...document.querySelectorAll('[data-landscape-category]')];
    const resourceElements = [...document.querySelectorAll('[data-resource]')];
    const measured = [...document.querySelectorAll('main, [data-resource-landscape], [data-landscape-category], [data-resource]')];
    return {
      title: document.querySelector('h1')?.textContent?.trim(), language: document.documentElement.lang,
      categories: categoryElements.map((element) => element.getAttribute('data-landscape-category')),
      aliases: aliasesToCheck.map((id) => Boolean(document.getElementById(id))),
      resources: resourceElements.map((element) => ({ id: element.getAttribute('data-resource'), text: element.textContent?.replace(/\s+/g, ' ').trim(), link: element.querySelector('[data-resource-link]')?.getAttribute('href') })),
      scripts: document.scripts.length, islands: document.querySelectorAll('astro-island').length,
      navLinks: [...(document.querySelector('header nav')?.querySelectorAll('a') ?? [])].filter((link) => link.getAttribute('href')?.includes('/operations/resource-landscape/')).length,
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      elementOverflow: measured.some((element) => { const rectangle = element.getBoundingClientRect(); return rectangle.left < -1 || rectangle.right > window.innerWidth + 1; }),
      humanFields: ['Use when','First human action','Inspect','Bring back','Boundary'].every((label) =>
        [...document.querySelectorAll('.resource-body dt')].some((term) => term.textContent?.trim() === label)),
    };
  }, expectedAliases);
}

function matches(state) {
  if (state.title !== 'Resource Landscape' || state.language !== 'en' || JSON.stringify(state.categories) !== JSON.stringify(expectedCategoryIds)) return false;
  if (state.resources.length !== resources.length || state.scripts || state.islands || state.navLinks || state.documentOverflow || state.elementOverflow || !state.humanFields) return false;
  return resources.every((expected, index) => {
    const actual = state.resources[index];
    return actual?.id === expected.id && actual.text.includes(expected.name) && actual.text.includes(expected.access) && actual.text.includes(expected.interfaces.join(', ')) && actual.link === sourceById.get(expected.source_id)?.url;
  });
}

try {
  for (const javaScriptEnabled of [true, false]) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setJavaScriptEnabled(javaScriptEnabled);
    for (const width of widths) {
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
      const response = await page.goto(base + route, { waitUntil: 'load' });
      const state = await inspect(page);
      if (response?.status() !== 200 || !matches(state) || state.aliases.some((present) => !present)) throw Error(`${route} ${width}px ${javaScriptEnabled ? 'js' : 'no-js'} ${JSON.stringify({ status: response?.status(), title: state.title, categories: state.categories.length, aliases: state.aliases, resources: state.resources.length, scripts: state.scripts, islands: state.islands, overflow: state.documentOverflow || state.elementOverflow })}`);
    }
    await page.close();
  }
  console.log(`Resource Landscape browser smoke passed: ${resources.length} static resources, ${expectedCategoryIds.length} stable sections, exact links, six responsive widths, and no-JavaScript parity.`);
} finally { await browser.close(); }

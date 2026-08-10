import puppeteer from 'puppeteer-core';
import registry from '../workflow/tools.json' with { type: 'json' };
import compatibility from '../workflow/resource-landscape.json' with { type: 'json' };

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const legacyRoute = '/operations/resource-landscape/';
const aliases = Object.keys(compatibility.anchor_aliases);
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_BIN ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

async function inspect(page) {
  return page.evaluate((expectedAliases) => {
    const measured = [...document.querySelectorAll('main, [data-tools-resources], [data-resource-task], [data-resource]')];
    return {
      title: document.querySelector('h1')?.textContent?.trim(),
      canonical: Boolean(document.querySelector('[data-tools-resources]')),
      resources: document.querySelectorAll('[data-resource]').length,
      groups: document.querySelectorAll('[data-resource-task]').length,
      aliases: expectedAliases.map((id) => Boolean(document.getElementById(id))),
      oldFields: ['First human action', 'Inspect', 'Bring back', 'Boundary'].some((label) =>
        [...document.querySelectorAll('dt, h2, h3, summary')].some((element) => element.textContent?.trim() === label)),
      scripts: document.querySelectorAll('script:not([data-copy-enhancement])').length,
      islands: document.querySelectorAll('astro-island').length,
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      elementOverflow: measured.some((element) => {
        const rectangle = element.getBoundingClientRect();
        return rectangle.left < -1 || rectangle.right > window.innerWidth + 1;
      }),
      url: window.location.href,
    };
  }, aliases);
}

try {
  for (const mode of [
    { width: 1440, javaScriptEnabled: true },
    { width: 390, javaScriptEnabled: true },
    { width: 390, javaScriptEnabled: false },
  ]) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setJavaScriptEnabled(mode.javaScriptEnabled);
    await page.setViewport({ width: mode.width, height: mode.width === 390 ? 844 : 1000, deviceScaleFactor: 1 });
    const response = await page.goto(`${base}${legacyRoute}`, { waitUntil: 'load' });
    const state = await inspect(page);
    if (
      response?.status() !== 200
      || state.title !== 'Tools & Resources'
      || !state.canonical
      || state.resources !== registry.resources.length
      || state.groups !== registry.task_groups.length
      || state.aliases.some((present) => !present)
      || state.oldFields
      || state.scripts !== 0
      || state.islands !== 0
      || state.documentOverflow
      || state.elementOverflow
      || !new URL(state.url).pathname.endsWith(legacyRoute)
    ) {
      throw Error(`${legacyRoute} ${mode.width}px ${mode.javaScriptEnabled ? 'js' : 'no-js'} ${JSON.stringify({ status: response?.status(), title: state.title, canonical: state.canonical, resources: state.resources, groups: state.groups, aliases: state.aliases, oldFields: state.oldFields, scripts: state.scripts, islands: state.islands, overflow: state.documentOverflow || state.elementOverflow, url: state.url })}`);
    }
    await page.close();
  }

  const anchorPage = await browser.newPage();
  await anchorPage.setJavaScriptEnabled(false);
  await anchorPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  for (const alias of aliases) {
    await anchorPage.goto(`${base}${legacyRoute}#${alias}`, { waitUntil: 'load' });
    const state = await anchorPage.evaluate((id) => ({
      path: window.location.pathname,
      hash: window.location.hash,
      target: Boolean(document.getElementById(id)),
    }), alias);
    if (!state.path.endsWith(legacyRoute) || state.hash !== `#${alias}` || !state.target) {
      throw Error(`legacy anchor ${alias} did not resolve through the canonical renderer: ${JSON.stringify(state)}`);
    }
  }
  await anchorPage.close();

  console.log(`Resource Landscape compatibility smoke passed: the legacy route reuses the ${registry.resources.length}-entry canonical renderer, ${aliases.length} legacy anchors survive, and 1440/390px no-JavaScript reading remains static.`);
} finally {
  await browser.close();
}

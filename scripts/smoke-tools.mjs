import puppeteer from 'puppeteer-core';
import registry from '../workflow/tools.json' with { type: 'json' };

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const resources = registry.resources;
const detailSlugs = new Set(registry.tools.map((entry) => entry.slug));
const detailResources = resources.filter((resource) => detailSlugs.has(resource.slug));
const expectedResourceIds = resources.map((resource) => resource.slug);
const expectedGroupIds = registry.task_groups.map((group) => group.id);
const expectedLinkCount = resources.reduce((total, resource) => total + resource.links.length, 0);
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_BIN ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

function hasOverflow(state) {
  return state.documentOverflow || state.elementOverflow;
}

async function inspectIndex(page) {
  return page.evaluate(() => {
    const measured = [...document.querySelectorAll('main, [data-tools-resources], [data-resource-task], [data-resource]')];
    return {
      title: document.querySelector('h1')?.textContent?.trim(),
      resources: [...document.querySelectorAll('[data-resource]')].map((entry) => entry.getAttribute('data-resource')),
      groups: [...document.querySelectorAll('[data-resource-task]')].map((entry) => entry.getAttribute('data-resource-task')),
      topicRows: document.querySelectorAll('[data-topic-resource]').length,
      resourceLinks: document.querySelectorAll('[data-resource-link]').length,
      detailLinks: [...document.querySelectorAll('[data-resource] h3 a')].map((link) => link.getAttribute('href')),
      scripts: document.querySelectorAll('script:not([data-copy-enhancement])').length,
      islands: document.querySelectorAll('astro-island').length,
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      elementOverflow: measured.some((element) => {
        const rectangle = element.getBoundingClientRect();
        return rectangle.left < -1 || rectangle.right > window.innerWidth + 1;
      }),
      text: document.body.innerText,
    };
  });
}

async function inspectDetail(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-resource-detail]');
    const measured = [...document.querySelectorAll('main, [data-resource-detail], [data-resource-topics], [data-resource-link]')];
    return {
      slug: root?.getAttribute('data-resource-detail'),
      title: document.querySelector('h1')?.textContent?.trim(),
      resourceLinks: [...document.querySelectorAll('[data-resource-link]')].map((link) => link.getAttribute('href')),
      topicLinks: [...document.querySelectorAll('[data-resource-topics] a')].map((link) => link.getAttribute('href')),
      verify: document.querySelector('[data-tool-verify]')?.textContent?.trim(),
      scripts: document.querySelectorAll('script:not([data-copy-enhancement])').length,
      islands: document.querySelectorAll('astro-island').length,
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      elementOverflow: measured.some((element) => {
        const rectangle = element.getBoundingClientRect();
        return rectangle.left < -1 || rectangle.right > window.innerWidth + 1;
      }),
      text: document.body.innerText,
    };
  });
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

    const indexResponse = await page.goto(`${base}/tools/`, { waitUntil: 'load' });
    const index = await inspectIndex(page);
    const expectedDetailLinks = detailResources.map((resource) => `/DFT-Research-Workflow/tools/${resource.slug}/`);
    if (
      indexResponse?.status() !== 200
      || index.title !== 'Tools & Resources'
      || JSON.stringify(index.resources) !== JSON.stringify(expectedResourceIds)
      || JSON.stringify(index.groups) !== JSON.stringify(expectedGroupIds)
      || index.topicRows !== 46
      || index.resourceLinks !== expectedLinkCount
      || JSON.stringify(index.detailLinks) !== JSON.stringify(expectedDetailLinks)
      || index.scripts !== 0
      || index.islands !== 0
      || hasOverflow(index)
      || index.text.includes('First human action')
      || index.text.includes('Bring back')
    ) {
      throw Error(`/tools/ ${mode.width}px ${mode.javaScriptEnabled ? 'js' : 'no-js'} ${JSON.stringify({ status: indexResponse?.status(), title: index.title, resources: index.resources.length, groups: index.groups.length, topicRows: index.topicRows, resourceLinks: index.resourceLinks, detailLinks: index.detailLinks.length, scripts: index.scripts, islands: index.islands, overflow: hasOverflow(index) })}`);
    }

    for (const resource of detailResources) {
      const response = await page.goto(`${base}/tools/${resource.slug}/`, { waitUntil: 'load' });
      const detail = await inspectDetail(page);
      const expectedTopics = resource.topics.map((slug) => `/DFT-Research-Workflow/operations/${slug}/`);
      if (
        response?.status() !== 200
        || detail.slug !== resource.slug
        || detail.title !== resource.name
        || JSON.stringify(detail.resourceLinks) !== JSON.stringify(resource.links.map((link) => link.url))
        || JSON.stringify(detail.topicLinks) !== JSON.stringify(expectedTopics)
        || !detail.verify
        || detail.scripts !== 0
        || detail.islands !== 0
        || hasOverflow(detail)
        || detail.text.includes('First useful action')
        || detail.text.includes('Inputs and outputs')
      ) {
        throw Error(`/tools/${resource.slug}/ ${mode.width}px ${mode.javaScriptEnabled ? 'js' : 'no-js'} ${JSON.stringify({ status: response?.status(), slug: detail.slug, title: detail.title, resourceLinks: detail.resourceLinks.length, topicLinks: detail.topicLinks.length, verify: Boolean(detail.verify), scripts: detail.scripts, islands: detail.islands, overflow: hasOverflow(detail) })}`);
      }
    }
    await page.close();
  }
  console.log(`Tools & Resources browser smoke passed: ${resources.length} dense catalog entries, ${detailResources.length} selective depth pages, ${registry.task_groups.length} task groups, bidirectional topic links, 1440/390px containment, and 390px no-JavaScript parity.`);
} finally {
  await browser.close();
}

import puppeteer from 'puppeteer-core';
import registry from '../workflow/tools.json' with { type: 'json' };

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const resources = registry.resources;
const detailSlugs = new Set(registry.tools.map((entry) => entry.slug));
const detailResources = resources.filter((resource) => detailSlugs.has(resource.slug));
const expectedResourceIds = resources.map((resource) => resource.slug);
const expectedGroupIds = registry.task_groups.map((group) => group.id);
const expectedLinkCount = resources.reduce((total, resource) => total + resource.links.length, 0);
const allowDevScripts = process.env.ALLOW_DEV_SCRIPTS === '1';
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_BIN ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

function hasOverflow(state) {
  return state.documentOverflow || state.elementOverflow;
}

async function gotoWithRetry(page, url) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await page.goto(url, { waitUntil: 'load' });
    } catch (error) {
      lastError = error;
      if (!String(error).includes('ERR_ABORTED')) throw error;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw lastError;
}

async function inspectIndex(page) {
  return page.evaluate(() => {
    const measured = [...document.querySelectorAll('main, [data-tools-resources], [data-resource-task], [data-resource]')];
    const resourceRows = [...document.querySelectorAll('[data-resource]')];
    const resourceAnchors = resourceRows.map((entry) => entry.id);
    return {
      title: document.querySelector('h1')?.textContent?.trim(),
      resources: resourceRows.map((entry) => entry.getAttribute('data-resource')),
      resourceAnchors,
      uniqueResourceAnchors: new Set(resourceAnchors).size,
      groups: [...document.querySelectorAll('[data-resource-task]')].map((entry) => entry.getAttribute('data-resource-task')),
      tables: document.querySelectorAll('table.resource-table').length,
      columnHeaders: [...document.querySelector('table.resource-table').querySelectorAll('thead th')].map((entry) => entry.textContent?.trim()),
      topicRows: document.querySelectorAll('[data-topic-resource]').length,
      resourceLinks: document.querySelectorAll('[data-resource-link]').length,
      detailLinks: [...document.querySelectorAll('[data-resource-detail-link]')].map((link) => link.getAttribute('href')),
      resourceTopicLinks: resourceRows.map((row) => ({
        slug: row.getAttribute('data-resource'),
        links: [...row.querySelectorAll('.resource-used-in a')].map((link) => link.getAttribute('href')),
      })),
      tableDisplay: getComputedStyle(document.querySelector('table.resource-table')).display,
      rowDisplay: getComputedStyle(resourceRows[0]).display,
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
    { width: 1024, javaScriptEnabled: true },
    { width: 430, javaScriptEnabled: true },
    { width: 390, javaScriptEnabled: true },
    { width: 360, javaScriptEnabled: true },
    { width: 390, javaScriptEnabled: false },
  ]) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setJavaScriptEnabled(mode.javaScriptEnabled);
    await page.setViewport({ width: mode.width, height: mode.width === 390 ? 844 : 1000, deviceScaleFactor: 1 });

    const indexResponse = await gotoWithRetry(page, `${base}/tools/`);
    const index = await inspectIndex(page);
    const expectedDetailLinks = detailResources.map((resource) => `/DFT-Research-Workflow/tools/${resource.slug}/`);
    const expectedResourceTopicLinks = resources.map((resource) => ({
      slug: resource.slug,
      links: resource.topics.map((slug) => `/DFT-Research-Workflow/operations/${slug}/`),
    }));
    const desktopTable = mode.width > 832;
    if (
      indexResponse?.status() !== 200
      || index.title !== 'Tools & Resources'
      || JSON.stringify(index.resources) !== JSON.stringify(expectedResourceIds)
      || index.uniqueResourceAnchors !== resources.length
      || JSON.stringify(index.resourceAnchors) !== JSON.stringify(expectedResourceIds.map((slug) => `resource-${slug}`))
      || JSON.stringify(index.groups) !== JSON.stringify(expectedGroupIds)
      || index.tables !== registry.task_groups.length
      || JSON.stringify(index.columnHeaders) !== JSON.stringify(['Resource', 'Best used for', 'Access', 'Used in'])
      || index.topicRows !== 46
      || index.resourceLinks !== expectedLinkCount
      || JSON.stringify(index.detailLinks) !== JSON.stringify(expectedDetailLinks)
      || JSON.stringify(index.resourceTopicLinks) !== JSON.stringify(expectedResourceTopicLinks)
      || index.tableDisplay !== (desktopTable ? 'table' : 'block')
      || index.rowDisplay !== (desktopTable ? 'table-row' : 'block')
      || (!allowDevScripts && index.scripts !== 0)
      || index.islands !== 0
      || hasOverflow(index)
      || index.text.includes('Research tasks:')
      || index.text.includes('First human action')
      || index.text.includes('Bring back')
    ) {
      throw Error(`/tools/ ${mode.width}px ${mode.javaScriptEnabled ? 'js' : 'no-js'} ${JSON.stringify({ status: indexResponse?.status(), title: index.title, resources: index.resources.length, uniqueResourceAnchors: index.uniqueResourceAnchors, groups: index.groups.length, tables: index.tables, columnHeaders: index.columnHeaders, topicRows: index.topicRows, resourceLinks: index.resourceLinks, detailLinks: index.detailLinks.length, topicMapping: index.resourceTopicLinks.length, tableDisplay: index.tableDisplay, rowDisplay: index.rowDisplay, scripts: index.scripts, islands: index.islands, overflow: hasOverflow(index) })}`);
    }

    if (mode.width === 1440 || (mode.width === 390 && mode.javaScriptEnabled)) {
      for (const resource of detailResources) {
        const response = await gotoWithRetry(page, `${base}/tools/${resource.slug}/`);
        const detail = await inspectDetail(page);
        const expectedTopics = resource.topics.map((slug) => `/DFT-Research-Workflow/operations/${slug}/`);
        if (
          response?.status() !== 200
          || detail.slug !== resource.slug
          || detail.title !== resource.name
          || JSON.stringify(detail.resourceLinks) !== JSON.stringify(resource.links.map((link) => link.url))
          || JSON.stringify(detail.topicLinks) !== JSON.stringify(expectedTopics)
          || !detail.verify
          || (!allowDevScripts && detail.scripts !== 0)
          || detail.islands !== 0
          || hasOverflow(detail)
          || detail.text.includes('First useful action')
          || detail.text.includes('Inputs and outputs')
        ) {
          throw Error(`/tools/${resource.slug}/ ${mode.width}px ${mode.javaScriptEnabled ? 'js' : 'no-js'} ${JSON.stringify({ status: response?.status(), slug: detail.slug, title: detail.title, resourceLinks: detail.resourceLinks.length, topicLinks: detail.topicLinks.length, verify: Boolean(detail.verify), scripts: detail.scripts, islands: detail.islands, overflow: hasOverflow(detail) })}`);
        }
      }
    }
    await page.close();
  }
  console.log(`Tools & Resources browser smoke passed: ${resources.length} unique compact catalog rows, ${detailResources.length} selective depth pages, ${registry.task_groups.length} task tables, exact resource-to-topic links, desktop table mode at 1440/1024px, compact rows at 430/390/360px, and 390px no-JavaScript parity.`);
} finally {
  await browser.close();
}

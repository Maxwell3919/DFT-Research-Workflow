import puppeteer from 'puppeteer-core';
import bridge from '../workflow/software-bridge.json' with { type: 'json' };

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const widths = [1440, 1024, 768, 430, 390, 360];
const route = '/operations/software-bridge/';
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_BIN ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

function expectedToolHref(toolSlug) {
  return `${base}/tools/${toolSlug}/`;
}

function expectedParentHref(topicSlug) {
  return `${base}/operations/${topicSlug}/`;
}

function stateMatchesRegistry(state) {
  if (state.title !== 'Software Bridge' || state.taskCount !== 6 || state.rowCount !== 24) return false;
  if (JSON.stringify(state.columnHeadings) !== JSON.stringify(['Software and official start', 'Inputs to prepare', 'Outputs to inspect', 'First check'])) return false;
  if (state.scripts !== 0 || state.astroIslands !== 0 || state.documentOverflow || state.elementOverflow) return false;
  if (state.primaryNavBridgeLinks !== 0) return false;
  if (state.ecosystemHref !== `${base}/${bridge.resource_landscape_path}` || !state.ecosystemText.includes(bridge.ecosystem_note)) return false;
  if (JSON.stringify(state.taskIds) !== JSON.stringify(bridge.tasks.map((task) => task.id))) return false;

  for (let taskIndex = 0; taskIndex < bridge.tasks.length; taskIndex += 1) {
    const expectedTask = bridge.tasks[taskIndex];
    const actualTask = state.tasks[taskIndex];
    if (!actualTask || actualTask.id !== expectedTask.id) return false;
    if (actualTask.parentHref !== expectedParentHref(expectedTask.parent_topic)) return false;
    if (actualTask.boundary !== `Scientific boundary: ${expectedTask.non_equivalence}`) return false;
    if (actualTask.rows.length !== 4) return false;

    for (let rowIndex = 0; rowIndex < expectedTask.implementations.length; rowIndex += 1) {
      const expectedRow = expectedTask.implementations[rowIndex];
      const actualRow = actualTask.rows[rowIndex];
      if (!actualRow || actualRow.code !== expectedRow.tool_slug) return false;
      if (actualRow.cellCount !== 4 || !actualRow.officialInFirstCell) return false;
      if (actualRow.toolHref !== expectedToolHref(expectedRow.tool_slug)) return false;
      if (actualRow.officialHref !== expectedRow.official_url) return false;
      if (actualRow.officialLabel !== expectedRow.first_official_start) return false;
      if (JSON.stringify(actualRow.inputs) !== JSON.stringify(expectedRow.required_inputs)) return false;
      if (JSON.stringify(actualRow.artifacts) !== JSON.stringify(expectedRow.artifacts)) return false;
      if (!actualRow.text.includes(expectedRow.terminology)) return false;
      if (!actualRow.text.includes(expectedRow.first_inspection)) return false;
      if (!actualRow.text.includes(expectedRow.boundary)) return false;
    }
  }
  return true;
}

async function inspect(page) {
  return page.evaluate(() => {
    const taskElements = [...document.querySelectorAll('[data-task-id]')];
    const measuredElements = [...document.querySelectorAll('main, [data-task-id], [data-code], .table-frame')];
    return {
      title: document.querySelector('h1')?.textContent?.trim(),
      taskCount: taskElements.length,
      rowCount: document.querySelectorAll('[data-code]').length,
      columnHeadings: [...(document.querySelector('table thead')?.querySelectorAll('th') ?? [])].map((heading) => heading.textContent?.trim()),
      taskIds: taskElements.map((task) => task.getAttribute('data-task-id')),
      scripts: document.querySelectorAll('script:not([data-copy-enhancement])').length,
      astroIslands: document.querySelectorAll('astro-island').length,
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      elementOverflow: measuredElements.some((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > window.innerWidth + 1;
      }),
      ecosystemHref: document.querySelector('[data-ecosystem-link]')?.href,
      ecosystemText: document.querySelector('[data-ecosystem-link]')?.parentElement?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      primaryNavBridgeLinks: [...(document.querySelector('header nav')?.querySelectorAll('a') ?? [])]
        .filter((link) => link.getAttribute('href')?.includes('/operations/software-bridge/')).length,
      tasks: taskElements.map((task) => ({
        id: task.getAttribute('data-task-id'),
        parentHref: task.querySelector('[data-parent-link]')?.href,
        boundary: task.querySelector('[data-task-boundary]')?.textContent?.replace(/\s+/g, ' ').trim(),
        rows: [...task.querySelectorAll('[data-code]')].map((row) => ({
          code: row.getAttribute('data-code'),
          cellCount: row.children.length,
          text: row.textContent?.replace(/\s+/g, ' ').trim(),
          toolHref: row.querySelector('[data-tool-link]')?.href,
          officialHref: row.querySelector('[data-official-link]')?.href,
          officialLabel: row.querySelector('[data-official-link]')?.textContent?.trim(),
          officialInFirstCell: row.firstElementChild?.contains(row.querySelector('[data-official-link]')) ?? false,
          inputs: [...row.querySelectorAll('[data-required-inputs] li')].map((item) => item.textContent?.trim()),
          artifacts: [...row.querySelectorAll('[data-artifacts] li')].map((item) => item.textContent?.trim()),
        })),
      })),
    };
  });
}

try {
  for (const javaScriptEnabled of [true, false]) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setJavaScriptEnabled(javaScriptEnabled);

    for (const width of widths) {
      await page.setViewport({ width, height: 900 });
      const response = await page.goto(base + route, { waitUntil: 'load' });
      const state = await inspect(page);
      if (response?.status() !== 200 || !stateMatchesRegistry(state)) {
        throw Error(`${route} ${width}px ${javaScriptEnabled ? 'js' : 'no-js'} ${JSON.stringify({
          status: response?.status(),
          title: state.title,
          taskCount: state.taskCount,
          rowCount: state.rowCount,
          scripts: state.scripts,
          astroIslands: state.astroIslands,
          documentOverflow: state.documentOverflow,
          elementOverflow: state.elementOverflow,
          primaryNavBridgeLinks: state.primaryNavBridgeLinks,
        })}`);
      }
    }
    await page.close();
  }

  console.log('Software Bridge browser smoke passed: exact 6-task/24-row rendering, official start in the first of four reader-facing columns, broader-ecosystem route, scientific boundaries, six responsive widths, and no-JavaScript parity.');
} finally {
  await browser.close();
}

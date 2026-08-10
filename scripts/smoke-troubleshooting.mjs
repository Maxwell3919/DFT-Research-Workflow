import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const route = '/operations/troubleshooting/';
const expectedSlugs = [
  'job-stops-before-completion',
  'input-or-method-rejected',
  'scf-does-not-converge',
  'eigensolver-or-fermi-level-error',
  'restart-or-parent-artifact-rejected',
  'io-memory-or-parallel-failure',
  'geometry-looks-physically-wrong',
  'geometry-optimization-stalls',
  'symmetry-or-kq-mapping-mismatch',
  'imaginary-phonon-frequencies',
];
const requiredAnchors = [
  'job-stops-before-completion',
  'scf-does-not-converge',
  'imaginary-phonon-frequencies',
];
const expectedFields = [
  'First check',
  'Cause classes',
  'Inspect',
  'Safe next action',
  'Preserve before retry',
  'What not to conclude',
  'Related DRW pages',
  'Official sources',
];

async function inspect(page, expectedWidth) {
  const result = await page.evaluate((fieldLabels) => {
    const root = document.querySelector('[data-troubleshooting-index]');
    const records = [...document.querySelectorAll('[data-symptom-record]')];
    const indexLinks = [...document.querySelectorAll('.symptom-index a')];
    const collisions = [];
    const escaping = [];
    const viewportWidth = document.documentElement.clientWidth;

    for (const element of root?.querySelectorAll('section, nav, dl, dd, li, a') ?? []) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && (rect.left < -1 || rect.right > viewportWidth + 1)) {
        escaping.push(`${element.tagName.toLowerCase()}:${element.textContent?.trim().slice(0, 50)}`);
      }
    }

    const recordData = records.map((record) => {
      for (const row of record.querySelectorAll('.record-details > div')) {
        const terms = [...row.children].map((element) => {
          const rect = element.getBoundingClientRect();
          return { label: element.textContent?.trim().slice(0, 50), left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
        });
        if (terms.length === 2) {
          const [first, second] = terms;
          const overlapWidth = Math.min(first.right, second.right) - Math.max(first.left, second.left);
          const overlapHeight = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
          if (overlapWidth > 1 && overlapHeight > 1) collisions.push(`${record.id}: ${first.label} <> ${second.label}`);
        }
      }
      const rect = record.getBoundingClientRect();
      return {
        id: record.id,
        title: record.querySelector('h2')?.textContent?.trim(),
        fields: [...record.querySelectorAll('dt')].map((term) => term.textContent?.trim()),
        topicLinks: [...record.querySelectorAll('[data-related-topic]')].map((link) => ({ href: link.href, text: link.textContent?.trim() })),
        sourceLinks: [...record.querySelectorAll('[data-official-source]')].map((link) => ({ id: link.dataset.officialSource, href: link.href, text: link.textContent?.trim() })),
        insideViewport: rect.left >= -1 && rect.right <= viewportWidth + 1,
      };
    });

    return {
      language: document.documentElement.lang,
      innerWidth: window.innerWidth,
      heading: root?.querySelector('h1')?.textContent?.trim(),
      recordData,
      indexTargets: indexLinks.map((link) => link.getAttribute('href')),
      collisions,
      escaping,
      documentOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      hydrated: Boolean(root?.querySelector('astro-island')),
      terminalBlocks: root?.querySelectorAll('pre').length ?? 0,
      text: root?.textContent ?? '',
      expectedFields: fieldLabels,
    };
  }, expectedFields);

  if (result.language !== 'en') throw new Error('Troubleshooting route is not English');
  if (result.innerWidth !== expectedWidth) throw new Error(`Requested ${expectedWidth}px but browser rendered ${result.innerWidth}px`);
  if (result.heading !== 'Troubleshoot a calculation') throw new Error(`Troubleshooting heading mismatch: ${result.heading}`);
  if (result.documentOverflow || result.escaping.length > 0) throw new Error(`Troubleshooting overflows at ${expectedWidth}px: ${result.escaping.join('; ')}`);
  if (result.collisions.length > 0) throw new Error(`Troubleshooting text collision at ${expectedWidth}px: ${result.collisions.join('; ')}`);
  if (result.hydrated) throw new Error('Troubleshooting route contains client hydration');
  if (result.terminalBlocks !== 0) throw new Error('Troubleshooting route contains terminal-like code blocks');
  if (JSON.stringify(result.recordData.map((record) => record.id)) !== JSON.stringify(expectedSlugs)) throw new Error('Troubleshooting record identity or order changed');
  if (JSON.stringify(result.indexTargets) !== JSON.stringify(expectedSlugs.map((slug) => `#${slug}`))) throw new Error('Troubleshooting symptom index does not resolve to all stable anchors');

  for (const record of result.recordData) {
    if (!record.title) throw new Error(`${record.id}: missing visible title`);
    if (JSON.stringify(record.fields) !== JSON.stringify(expectedFields)) throw new Error(`${record.id}: incomplete field set ${JSON.stringify(record.fields)}`);
    if (!record.insideViewport) throw new Error(`${record.id}: record escapes viewport at ${expectedWidth}px`);
    if (record.topicLinks.length < 1 || record.sourceLinks.length < 1) throw new Error(`${record.id}: missing related DRW or official-source links`);
    for (const link of record.topicLinks) {
      if (!link.href.includes('/DFT-Research-Workflow/operations/') || !link.text) throw new Error(`${record.id}: invalid topic link ${link.href}`);
    }
    for (const link of record.sourceLinks) {
      if (!link.href.startsWith('https://') || !link.id || !link.text) throw new Error(`${record.id}: invalid official source link ${link.href}`);
    }
  }
  if (!result.text.includes('An imaginary frequency alone does not prove a physical instability')) throw new Error('Imaginary-frequency claim boundary is missing');
  if (!result.text.includes('does not establish the lowest relevant state')) throw new Error('SCF claim boundary is missing');
  return result;
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  let desktop;
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
    const result = await inspect(page, viewport.width);
    if (viewport.width === 1440) desktop = result;
  }

  const topicTargets = [...new Set(desktop.recordData.flatMap((record) => record.topicLinks.map((link) => link.href)))];
  const topicResults = await Promise.all(topicTargets.map(async (href) => ({ href, status: (await fetch(href)).status })));
  const failedTopics = topicResults.filter((target) => target.status !== 200);
  if (failedTopics.length > 0) throw new Error(`Troubleshooting related-topic links failed: ${JSON.stringify(failedTopics)}`);

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  await noJsPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  const noJsResponse = await noJsPage.goto(`${base}${route}`, { waitUntil: 'load' });
  if (noJsResponse?.status() !== 200) throw new Error(`Troubleshooting no-JavaScript route returned ${noJsResponse?.status()}`);
  const noJs = await inspect(noJsPage, 390);
  if (noJs.recordData.some((record) => record.topicLinks.length < 1 || record.sourceLinks.length < 1)) throw new Error('Troubleshooting loses links without JavaScript');

  for (const anchor of requiredAnchors) {
    await noJsPage.evaluate((target) => { window.location.hash = target; }, anchor);
    const currentHash = await noJsPage.evaluate(() => window.location.hash);
    if (currentHash !== `#${anchor}`) throw new Error(`Troubleshooting stable anchor #${anchor} did not become the active fragment`);
    const exists = await noJsPage.$(`#${anchor}`);
    if (!exists) throw new Error(`Troubleshooting stable anchor #${anchor} is missing without JavaScript`);
  }

  console.log(`Troubleshooting smoke passed: ${expectedSlugs.length} static symptoms, ${topicTargets.length} related DRW targets, 1440/1024/768/430/390/360px no-overflow layouts, 390px no-JavaScript rendering, and ${requiredAnchors.length} stable anchors.`);
} finally {
  await browser.close();
}

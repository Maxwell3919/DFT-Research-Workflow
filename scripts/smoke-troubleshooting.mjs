import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const route = '/operations/troubleshooting/';
const quickReferenceRoute = '/quick-reference/';
const expectedSlugs = [
  'job-does-not-start',
  'job-stops-before-completion',
  'input-or-method-rejected',
  'scf-does-not-converge',
  'scf-becomes-very-slow',
  'eigensolver-or-fermi-level-error',
  'restart-or-parent-artifact-rejected',
  'expected-output-artifact-is-missing',
  'bands-and-dos-look-inconsistent',
  'io-memory-or-parallel-failure',
  'geometry-looks-physically-wrong',
  'geometry-optimization-stalls',
  'forces-remain-large',
  'stress-remains-large',
  'symmetry-or-kq-mapping-mismatch',
  'imaginary-phonon-frequencies',
];
const requiredAnchors = [
  'job-does-not-start',
  'job-stops-before-completion',
  'scf-does-not-converge',
  'scf-becomes-very-slow',
  'forces-remain-large',
  'stress-remains-large',
  'expected-output-artifact-is-missing',
  'bands-and-dos-look-inconsistent',
  'imaginary-phonon-frequencies',
];
const expectedPrimaryActions = [
  'Check this first',
  'Inspect now',
  'Classify likely causes',
  'Run a read-only quick check',
  'Read the official manual',
  'Take the next safe action',
];
const expectedSecondarySections = [
  'Preserve before retry',
  'Related Research Workflow pages',
];
const expectedQuickReferenceAnchors = ['qe-scf-check', 'qe-relax-check', 'job-check', 'artifact-check', 'bands-dos-check', 'phonon-check'];

async function inspect(page, expectedWidth, expectedDetailsOpen = false) {
  const result = await page.evaluate(() => {
    const root = document.querySelector('[data-troubleshooting-index]');
    const records = [...document.querySelectorAll('[data-symptom-record]')];
    const indexLinks = [...document.querySelectorAll('.symptom-index a')];
    const escaping = [];
    const viewportWidth = document.documentElement.clientWidth;

    for (const element of root?.querySelectorAll('section, nav, details, summary, aside, li, a') ?? []) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && (rect.left < -1 || rect.right > viewportWidth + 1)) {
        escaping.push(`${element.tagName.toLowerCase()}:${element.textContent?.trim().slice(0, 50)}`);
      }
    }

    const recordData = records.map((record) => {
      const rect = record.getBoundingClientRect();
      const primary = record.querySelector('[data-primary-actions]');
      const claim = record.querySelector('[data-claim-boundary]');
      const secondary = record.querySelector('[data-secondary-evidence]');
      return {
        id: record.id,
        title: record.querySelector('h2')?.textContent?.trim(),
        primaryActions: [...(primary?.querySelectorAll(':scope > .action-step > h3') ?? [])].map((heading) => heading.textContent?.trim()),
        claimHeading: claim?.querySelector('h3')?.textContent?.trim(),
        claimText: claim?.textContent?.replace(/\s+/g, ' ').trim(),
        secondaryTag: secondary?.tagName,
        secondaryOpen: secondary?.open,
        secondarySections: [...(secondary?.querySelectorAll('.secondary-grid > section > h3') ?? [])].map((heading) => heading.textContent?.trim()),
        actionBeforeSecondary: Boolean(primary && secondary && (primary.compareDocumentPosition(secondary) & Node.DOCUMENT_POSITION_FOLLOWING)),
        quickReference: record.querySelector('[data-quick-reference]')?.href,
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
      escaping,
      documentOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      hydrated: Boolean(root?.querySelector('astro-island')),
      terminalBlocks: root?.querySelectorAll('pre').length ?? 0,
      text: root?.textContent ?? '',
    };
  });

  if (result.language !== 'en') throw new Error('Troubleshooting route is not English');
  if (result.innerWidth !== expectedWidth) throw new Error(`Requested ${expectedWidth}px but browser rendered ${result.innerWidth}px`);
  if (result.heading !== 'Troubleshoot a calculation') throw new Error(`Troubleshooting heading mismatch: ${result.heading}`);
  if (result.documentOverflow || result.escaping.length > 0) throw new Error(`Troubleshooting overflows at ${expectedWidth}px: ${result.escaping.join('; ')}`);
  if (result.hydrated) throw new Error('Troubleshooting route contains client hydration');
  if (result.terminalBlocks !== 0) throw new Error('Troubleshooting route contains terminal-like code blocks');
  if (JSON.stringify(result.recordData.map((record) => record.id)) !== JSON.stringify(expectedSlugs)) throw new Error('Troubleshooting record identity or order changed');
  if (JSON.stringify(result.indexTargets) !== JSON.stringify(expectedSlugs.map((slug) => `#${slug}`))) throw new Error('Troubleshooting symptom index does not resolve to all stable anchors');

  for (const record of result.recordData) {
    if (!record.title) throw new Error(`${record.id}: missing visible title`);
    if (JSON.stringify(record.primaryActions) !== JSON.stringify(expectedPrimaryActions)) throw new Error(`${record.id}: action-first sequence changed ${JSON.stringify(record.primaryActions)}`);
    if (record.claimHeading !== 'Before you interpret the result' || !record.claimText) throw new Error(`${record.id}: visible interpretation boundary is missing`);
    if (record.secondaryTag !== 'DETAILS' || record.secondaryOpen !== expectedDetailsOpen) throw new Error(`${record.id}: secondary evidence disclosure state mismatch`);
    if (JSON.stringify(record.secondarySections) !== JSON.stringify(expectedSecondarySections)) throw new Error(`${record.id}: secondary evidence sections changed ${JSON.stringify(record.secondarySections)}`);
    if (!record.actionBeforeSecondary) throw new Error(`${record.id}: primary action is not before secondary evidence`);
    if (!record.insideViewport) throw new Error(`${record.id}: record escapes viewport at ${expectedWidth}px`);
    if (!record.quickReference || !record.quickReference.includes('/DFT-Research-Workflow/quick-reference/#')) throw new Error(`${record.id}: missing Quick Reference link`);
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

async function inspectQuickReference(page, expectedWidth) {
  return page.evaluate(({ expectedWidth, expectedQuickReferenceAnchors }) => {
    const root = document.querySelector('[data-quick-reference]');
    const sections = [...document.querySelectorAll('[data-quick-check]')];
    const codeBlocks = [...root.querySelectorAll('pre > code')].map((code) => code.textContent ?? '');
    const isDevOnlyScript = (script) => (
      script.src.includes('/@vite/client')
      || script.src.includes('/@id/astro/runtime/client/dev-toolbar/')
      || (script.textContent ?? '').includes('window.__astro_dev_toolbar__')
      || (script.type === 'module' && (script.src.includes('/src/styles/') || script.src.includes('/node_modules/katex/') || script.src.includes('type=style')))
    );
    return {
      language: document.documentElement.lang,
      innerWidth: window.innerWidth,
      heading: root.querySelector('h1')?.textContent?.trim(),
      anchors: sections.map((section) => section.id),
      codeBlocks,
      copyButtons: root.querySelectorAll('.copy-code-button').length,
      copyEnhancements: document.querySelectorAll('script[data-copy-enhancement]').length,
      unexpectedScripts: [...document.querySelectorAll('script:not([data-copy-enhancement])')].filter((script) => !isDevOnlyScript(script)).length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      anchoredPositiveScf: codeBlocks.some((text) => text.includes("^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$")),
      separateNegativeScf: codeBlocks.some((text) => text.includes('convergence NOT achieved') && text.includes('No convergence has been achieved')),
      everyBlockStartsFromOut: codeBlocks.every((text) => text.startsWith('OUT=')),
      expectedWidth,
      expectedQuickReferenceAnchors,
    };
  }, { expectedWidth, expectedQuickReferenceAnchors });
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
    await page.$$eval('[data-secondary-evidence]', (details) => details.forEach((element) => { element.open = true; }));
    await inspect(page, viewport.width, true);
    if (viewport.width === 1440) desktop = result;

    const quickResponse = await page.goto(`${base}${quickReferenceRoute}`, { waitUntil: 'load' });
    if (quickResponse?.status() !== 200) throw new Error(`Quick Reference returned ${quickResponse?.status()} at ${viewport.width}px`);
    const quick = await inspectQuickReference(page, viewport.width);
    if (quick.language !== 'en' || quick.innerWidth !== viewport.width || quick.heading !== 'Quick Reference') throw new Error(`Quick Reference identity failed at ${viewport.width}px`);
    if (JSON.stringify(quick.anchors) !== JSON.stringify(expectedQuickReferenceAnchors)) throw new Error(`Quick Reference anchors changed: ${JSON.stringify(quick.anchors)}`);
    if (quick.codeBlocks.length !== expectedQuickReferenceAnchors.length || quick.copyButtons !== quick.codeBlocks.length) throw new Error(`Quick Reference Copy controls failed at ${viewport.width}px`);
    if (quick.copyEnhancements !== 1 || quick.unexpectedScripts !== 0 || quick.overflow) throw new Error(`Quick Reference static/mobile boundary failed at ${viewport.width}px`);
    if (!quick.anchoredPositiveScf || !quick.separateNegativeScf || !quick.everyBlockStartsFromOut) throw new Error(`Quick Reference command contract failed at ${viewport.width}px`);
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

  const noJsQuickResponse = await noJsPage.goto(`${base}${quickReferenceRoute}`, { waitUntil: 'load' });
  if (noJsQuickResponse?.status() !== 200) throw new Error(`Quick Reference no-JavaScript route returned ${noJsQuickResponse?.status()}`);
  const noJsQuick = await inspectQuickReference(noJsPage, 390);
  if (JSON.stringify(noJsQuick.anchors) !== JSON.stringify(expectedQuickReferenceAnchors) || noJsQuick.codeBlocks.length !== expectedQuickReferenceAnchors.length) throw new Error('Quick Reference loses checks without JavaScript');

  console.log(`Troubleshooting smoke passed: ${expectedSlugs.length} action-first symptoms, ${expectedQuickReferenceAnchors.length} copy-ready OUT-only checks, native secondary-evidence disclosures open and closed, ${topicTargets.length} related DRW targets, 1440/1024/768/430/390/360px no-overflow layouts, 390px no-JavaScript rendering, and ${requiredAnchors.length} stable symptom anchors.`);
} finally {
  await browser.close();
}

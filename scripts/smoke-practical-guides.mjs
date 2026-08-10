import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const parentRoutes = [
  '/operations/build-or-modify-computational-model/',
  '/operations/validate-results-and-scientific-conclusions/',
];
const guides = [
  {
    parentRoute: parentRoutes[0],
    mediaCount: 0,
    route: '/operations/build-or-modify-computational-model/guides/ase-build-repeat-cells/',
    title: 'Build and Repeat Cells with ASE',
    tool: 'ase',
    version: 'ASE 3.29.0',
    phrase: 'A regular-looking cell does not show that defect, phonon, magnetic, alloy, or interface finite-size effects are converged.',
  },
  {
    parentRoute: parentRoutes[0],
    mediaCount: 0,
    route: '/operations/build-or-modify-computational-model/guides/ase-surfaces-vacuum-adsorbates/',
    title: 'Construct Surfaces, Vacuum, and Adsorbates with ASE',
    tool: 'ase',
    version: 'ASE 3.29.0',
    phrase: 'A surface builder produces starting coordinates; it does not select the physical termination, layer count, lateral cell, adsorption site, vacuum, constraint policy, or electrostatic treatment.',
  },
  {
    parentRoute: parentRoutes[0],
    mediaCount: 0,
    route: '/operations/build-or-modify-computational-model/guides/pymatgen-structure-transformations/',
    title: 'Apply Structure Transformations with pymatgen',
    tool: 'pymatgen',
    version: 'pymatgen-core 2026.7.31',
    phrase: 'A class can produce an object; it cannot decide whether the object answers the scientific question.',
  },
  {
    parentRoute: parentRoutes[0],
    mediaCount: 0,
    route: '/operations/build-or-modify-computational-model/examples/two-dimensional-monolayer-model/',
    title: 'Build a Two-Dimensional Monolayer Model',
    tool: 'ase',
    version: 'ASE 3.29.0',
    phrase: 'It is not derived from an experimental CIF',
  },
  {
    parentRoute: parentRoutes[0],
    mediaCount: 1,
    route: '/operations/build-or-modify-computational-model/examples/construct-defect-and-interface-candidates/',
    title: 'Construct Defect and Interface Candidates without Overclaiming Them',
    tool: 'ase',
    version: 'ASE 3.29.0',
    phrase: 'It is not a lattice-match prediction',
  },
  {
    parentRoute: parentRoutes[1],
    mediaCount: 0,
    route: '/operations/validate-results-and-scientific-conclusions/guides/inspect-qe-hpc-calculations-from-the-terminal/',
    title: 'Inspect QE HPC Calculations from the Terminal',
    tool: 'quantum-espresso',
    version: 'Quantum ESPRESSO 7.5 committed-output format',
    phrase: 'A Slurm COMPLETED state does not prove that pw.x reached self-consistency.',
  },
  {
    parentRoute: parentRoutes[1],
    mediaCount: 0,
    route: '/operations/validate-results-and-scientific-conclusions/examples/audit-a-qe-calculation/',
    title: 'Audit a QE Calculation',
    tool: 'quantum-espresso',
    version: 'Quantum ESPRESSO 7.5 committed-output format',
    phrase: 'the declared FM k-mesh total-energy screen failed',
  },
];

async function inspectGuide(page, guide, width) {
  const response = await page.goto(`${base}${guide.route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`${guide.route} returned ${response?.status()}`);
  const result = await page.evaluate(() => ({
    language: document.documentElement.lang,
    title: document.querySelector('h1')?.textContent?.trim(),
    text: document.body.innerText,
    links: [...document.querySelectorAll('.article-content a')].map((link) => link.href),
    images: [...document.querySelectorAll('.guide-media img')].map((image) => ({ src: image.src, alt: image.alt })),
    toolTags: [...document.querySelectorAll('.tool-tag')].map((tag) => tag.textContent?.trim()),
    hasMeta: Boolean(document.querySelector('.guide-meta')),
    hasEvidence: Boolean(document.querySelector('.evidence-note')),
    copyEnhancements: document.querySelectorAll('script[data-copy-enhancement]').length,
    unexpectedScripts: document.querySelectorAll('script:not([data-copy-enhancement])').length,
    copyableBlocks: document.querySelectorAll('pre[data-copyable] > code, pre[data-language="bash"] > code, pre[data-language="shell"] > code, pre[data-language="sh"] > code, pre[data-language="python"] > code, pre[data-language="qe"] > code, pre[data-language="slurm"] > code, pre > code.language-bash, pre > code.language-shell, pre > code.language-sh, pre > code.language-python, pre > code.language-qe, pre > code.language-slurm').length,
    copyButtons: document.querySelectorAll('.copy-code-button').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (result.language !== 'en') throw new Error(`${guide.route}: language is not English`);
  if (result.title !== guide.title) throw new Error(`${guide.route}: title mismatch ${result.title}`);
  if (!result.text.includes(guide.phrase)) throw new Error(`${guide.route}: missing scientific boundary phrase`);
  if (!result.text.includes(guide.version)) throw new Error(`${guide.route}: missing tested version ${guide.version}`);
  if (!result.toolTags.includes(guide.tool)) throw new Error(`${guide.route}: missing tool tag ${guide.tool}`);
  if (!result.hasMeta || !result.hasEvidence) throw new Error(`${guide.route}: missing metadata or evidence boundary`);
  if (result.images.length !== guide.mediaCount) throw new Error(`${guide.route}: expected ${guide.mediaCount} media items, found ${result.images.length}`);
  if (result.images.some((image) => !image.alt)) throw new Error(`${guide.route}: media item is missing alt text`);
  if (!result.links.some((link) => link.startsWith('https://'))) throw new Error(`${guide.route}: missing official source links`);
  if (result.copyEnhancements !== 1 || result.unexpectedScripts !== 0) {
    throw new Error(`${guide.route}: expected one Copy enhancement and no other scripts`);
  }
  if (result.copyButtons !== result.copyableBlocks) {
    throw new Error(`${guide.route}: renders ${result.copyButtons} Copy controls for ${result.copyableBlocks} copyable code blocks`);
  }
  if (result.overflow) throw new Error(`${guide.route}: horizontal overflow at ${width}px`);
  return result;
}

async function captureStablePage(page, path) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const body = document.body;
    return root.scrollWidth > 0 && root.scrollHeight > 0 && body.scrollWidth > 0 && body.scrollHeight > 0;
  }, { timeout: 15000 });
  const dimensions = await page.evaluate(() => ({
    width: Math.ceil(Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)),
    height: Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)),
  }));
  if (dimensions.width < 1 || dimensions.height < 1) throw new Error(`invalid screenshot dimensions ${JSON.stringify(dimensions)}`);
  await page.screenshot({
    path,
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: dimensions.width, height: dimensions.height },
  });
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });

  let response;
  const parentResults = [];
  for (const parentRoute of parentRoutes) {
    response = await page.goto(`${base}${parentRoute}`, { waitUntil: 'load' });
    if (response?.status() !== 200) throw new Error(`${parentRoute}: practical parent returned ${response?.status()}`);
    const parent = await page.evaluate(() => ({
      text: document.body.innerText,
      links: [...document.querySelectorAll('.practical-card-list a')].map((link) => link.href),
      cards: document.querySelectorAll('.practical-card-list li').length,
      copyEnhancements: document.querySelectorAll('script[data-copy-enhancement]').length,
      unexpectedScripts: document.querySelectorAll('script:not([data-copy-enhancement])').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    const parentGuides = guides.filter((guide) => guide.parentRoute === parentRoute);
    if (!parent.text.includes('Practical resources') || !parent.text.includes('Practical Guides') || !parent.text.includes('Worked Examples')) {
      throw new Error(`${parentRoute}: parent topic is missing practical resource groups`);
    }
    if (parent.cards !== parentGuides.length) throw new Error(`${parentRoute}: parent topic has ${parent.cards} practical cards instead of ${parentGuides.length}`);
    for (const guide of parentGuides) if (!parent.links.includes(`${base}${guide.route}`)) throw new Error(`${parentRoute}: parent topic is missing ${guide.route}`);
    if (parent.copyEnhancements !== 1 || parent.unexpectedScripts !== 0 || parent.overflow) {
      throw new Error(`${parentRoute}: parent is missing the bounded Copy enhancement, exposes another script, or overflows`);
    }
    parentResults.push({ route: parentRoute, ...parent });
  }
  const desktopResults = [];
  for (const guide of guides) desktopResults.push(await inspectGuide(page, guide, 1440));

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  for (const guide of guides) await inspectGuide(page, guide, 390);

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  for (const guide of guides) {
    response = await noJsPage.goto(`${base}${guide.route}`, { waitUntil: 'load' });
    if (response?.status() !== 200) throw new Error(`${guide.route}: no-JavaScript response ${response?.status()}`);
    const text = await noJsPage.$eval('body', (body) => body.innerText);
    if (!text.includes(guide.title) || !text.includes(guide.phrase)) throw new Error(`${guide.route}: no-JavaScript content incomplete`);
  }

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${parentRoutes[0]}`, { waitUntil: 'load' });
    await captureStablePage(page, join(artifactDirectory, 'practical-guides-parent-desktop.png'));
    await page.goto(`${base}${guides[3].route}`, { waitUntil: 'load' });
    await captureStablePage(page, join(artifactDirectory, 'practical-guide-monolayer-desktop.png'));
    await writeFile(join(artifactDirectory, 'practical-guides-summary.json'), `${JSON.stringify({
      site_url: base,
      parent_routes: parentRoutes,
      parent_cards: parentResults.reduce((sum, result) => sum + result.cards, 0),
      routes: guides.map((guide) => guide.route),
      source_links: desktopResults.reduce((sum, result) => sum + result.links.length, 0),
      original_media: desktopResults.reduce((sum, result) => sum + result.images.length, 0),
      desktop_width: 1440,
      mobile_width: 390,
      no_javascript: true,
    }, null, 2)}\n`);
  }

  console.log(`Practical guide smoke passed: ${parentRoutes.length} parents, ${guides.length} static-first routes, Copy controls for every copyable code block, pinned versions, official links, declared media counts, 1440px/390px layout, and no-JavaScript reading.`);
} finally {
  await browser.close();
}

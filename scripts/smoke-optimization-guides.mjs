import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const parentRoute = '/operations/optimize-structure/';
const guides = [
  {
    route: '/operations/optimize-structure/guides/choose-relaxed-degrees-and-constraints/',
    title: 'Choose Relaxed Degrees of Freedom and Constraints',
    listed: true,
    mediaCount: 0,
    tool: 'ase',
    version: 'ASE 3.29.0',
    phrase: 'A relaxation protocol begins with a declaration of active variables.',
    boundary: 'It does not run DFT',
  },
  {
    route: '/operations/optimize-structure/guides/diagnose-forces-stress-and-state/',
    title: 'Diagnose Forces, Stress, and Electronic-State Continuity',
    listed: true,
    mediaCount: 2,
    tool: 'python',
    version: 'Python 3.12',
    phrase: 'An optimization trajectory is a sequence of coupled electronic and structural calculations.',
    boundary: 'It does not run an electronic-structure code',
  },
  {
    route: '/operations/optimize-structure/guides/restart-and-verify-optimization/',
    title: 'Restart and Verify a Structural Optimization',
    listed: true,
    mediaCount: 0,
    tool: 'ase',
    version: 'ASE 3.29.0',
    phrase: 'A restart is a continuation of a traceable optimization problem',
    boundary: 'It does not run DFT',
  },
  {
    route: '/operations/optimize-structure/guides/compare-multiple-starts-and-minima/',
    title: 'Compare Multiple Starts and Stationary Candidates',
    listed: false,
    mediaCount: 0,
    tool: 'python',
    version: 'Python 3.12',
    phrase: 'A local optimizer answers a basin-dependent question',
    boundary: 'It does not run DFT',
    requiredPhrases: [
      'Force, stress, displacement, and solver criteria can support an accepted stationary candidate, but they do not establish positive curvature.',
      'Call an endpoint a local minimum only when a Hessian, phonon, vibrational, or other appropriate curvature test supports that classification in the active subspace.',
    ],
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
  for (const phrase of guide.requiredPhrases ?? []) {
    if (!result.text.includes(phrase)) throw new Error(`${guide.route}: missing stationary-candidate boundary phrase ${phrase}`);
  }
  if (!result.text.includes(guide.version)) throw new Error(`${guide.route}: missing tested version ${guide.version}`);
  if (!result.toolTags.includes(guide.tool)) throw new Error(`${guide.route}: missing tool tag ${guide.tool}`);
  if (!result.hasMeta || !result.hasEvidence) throw new Error(`${guide.route}: missing metadata or evidence boundary`);
  if (!/do(?:es)? not/i.test(result.text)) throw new Error(`${guide.route}: missing visible claim boundary`);
  if (result.images.length !== guide.mediaCount || result.images.some((image) => !image.alt)) {
    throw new Error(`${guide.route}: expected ${guide.mediaCount} accessible declared media, found ${result.images.length}`);
  }
  if (!result.links.some((link) => link.startsWith('https://'))) throw new Error(`${guide.route}: missing official or primary source links`);
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

  let response = await page.goto(`${base}${parentRoute}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`optimization parent returned ${response?.status()}`);
  const parent = await page.evaluate(() => ({
    text: document.body.innerText,
    links: [...document.querySelectorAll('.practical-card-list a')].map((link) => link.href),
    cards: document.querySelectorAll('.practical-card-list li').length,
    copyEnhancements: document.querySelectorAll('script[data-copy-enhancement]').length,
    unexpectedScripts: document.querySelectorAll('script:not([data-copy-enhancement])').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (!parent.text.includes('Practical resources') || !parent.text.includes('Practical Guides')) {
    throw new Error('optimization parent is missing practical resource groups');
  }
  const listedGuides = guides.filter((guide) => guide.listed);
  if (parent.cards !== listedGuides.length) throw new Error(`optimization parent has ${parent.cards} non-synthetic practical cards instead of ${listedGuides.length}`);
  for (const guide of guides) {
    const isLinked = parent.links.includes(`${base}${guide.route}`);
    if (guide.listed !== isLinked) throw new Error(`optimization parent synthetic-evidence filter mismatch for ${guide.route}`);
  }
  if (parent.copyEnhancements !== 1 || parent.unexpectedScripts !== 0 || parent.overflow) {
    throw new Error('optimization parent is missing the bounded Copy enhancement, exposes another script, or overflows');
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
    await page.goto(`${base}${parentRoute}`, { waitUntil: 'load' });
    await captureStablePage(page, join(artifactDirectory, 'optimization-guides-parent-desktop.png'));
    await page.goto(`${base}${guides[2].route}`, { waitUntil: 'load' });
    await captureStablePage(page, join(artifactDirectory, 'optimization-guide-restart-desktop.png'));
    await writeFile(join(artifactDirectory, 'optimization-guides-summary.json'), `${JSON.stringify({
      site_url: base,
      parent_route: parentRoute,
      parent_cards: parent.cards,
      routes: guides.map((guide) => guide.route),
      source_links: desktopResults.reduce((sum, result) => sum + result.links.length, 0),
      original_media: desktopResults.reduce((sum, result) => sum + result.images.length, 0),
      desktop_width: 1440,
      mobile_width: 390,
      no_javascript: true,
      evidence_boundary: 'declared per guide; media may combine conceptual and real-execution evidence',
    }, null, 2)}\n`);
  }

  console.log('Optimization guide smoke passed: 3 non-synthetic parent cards, 4 directly readable static-first guides, Copy controls for every copyable code block, pinned ASE/Python metadata, sources, declared media counts, 1440px/390px layout, and no-JavaScript reading.');
} finally {
  await browser.close();
}

import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const deployedSha = process.env.DEPLOYED_SHA;
const deployedRepository = process.env.DEPLOYED_REPOSITORY ?? 'Maxwell3919/DFT-Research-Workflow';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const root = new URL('../', import.meta.url);
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const topicSlugs = workflow.sections.flatMap((section) => section.groups.flatMap((group) => group.topics.map((topic) => topic.slug)));

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  return Object.fromEntries(match[1].split('\n').filter(Boolean).map((line) => {
    const [key, ...value] = line.split(':');
    return [key.trim(), value.join(':').trim().replace(/^['"]|['"]$/g, '')];
  }));
}

const topicNarrativeStatuses = new Map();
for (const file of (await readdir(new URL('src/content/topics/', root))).filter((name) => name.endsWith('.md'))) {
  const source = await readFile(new URL(`src/content/topics/${file}`, root), 'utf8');
  const data = parseFrontmatter(source);
  if (data.topic_slug) topicNarrativeStatuses.set(data.topic_slug, data.status);
}

const representativeTopicSlugs = [
  'obtain-material-structure',
  'band-structure',
  'harmonic-phonons',
  'electron-phonon-coupling',
  'conventional-superconductivity',
  'validate-results-and-scientific-conclusions',
];
const representativeTransitionalSlugs = [
  'o01-acquire-source-objects',
  'o13-solve-an-electronic-state',
  'o20-verify-numerical-completion-and-convergence',
  'o24-package-and-preserve-a-reproducible-research-bundle',
];
const representativeLegacySlugs = [
  '03-structure-standardization',
  '25-electron-phonon-and-superconductivity',
  '34-postprocessing-validation-and-reuse',
];
const frameworkSlugs = [
  'workflow-model',
  'lifecycle-and-operation-map',
  'relations-and-feedback-loops',
  'tags-and-methods',
  'evidence-provenance-and-reproducibility',
];
const requiredRoutes = [
  { route: '/', status: 200, name: 'Home' },
  { route: '/operations/', status: 200, name: 'Research Workflow' },
  ...representativeTopicSlugs.map((slug) => ({ route: `/operations/${slug}/`, status: 200, name: slug })),
  { route: '/workflows/', status: 200, name: 'Worked Workflows directory' },
  { route: '/workflows/silicon-ground-state-electronic-structure/', status: 200, name: 'Silicon Worked Workflow' },
  { route: '/workflows/aluminium-metallic-electronic-structure/', status: 200, name: 'Aluminium Worked Workflow' },
  { route: '/recipes/', status: 200, name: 'Recipes migration surface' },
  { route: '/recipes/bulk-structure-and-bands/', status: 200, name: 'Legacy recipe migration surface' },
  { route: '/framework/', status: 200, name: 'Framework migration surface' },
  ...frameworkSlugs.map((slug) => ({ route: `/framework/${slug}/`, status: 200, name: slug })),
  ...representativeTransitionalSlugs.map((slug) => ({ route: `/operations/${slug}/`, status: 200, name: slug })),
  ...representativeLegacySlugs.map((slug) => ({ route: `/operations/${slug}/`, status: 200, name: slug })),
  { route: '/missing-page-for-smoke/', status: 404, name: '404' },
];
const prohibitedText = /View contract|Operation registry|Automation maturity|Candidate automation|Claim ledger|查看契约|验证门/i;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForDeploymentManifest() {
  if (!deployedSha) return null;
  let lastObservation = 'manifest not fetched';
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await fetch(`${base}/deployment-manifest.json?attempt=${attempt}`, { cache: 'no-store' });
      if (!response.ok) {
        lastObservation = `HTTP ${response.status}`;
      } else {
        const manifest = await response.json();
        lastObservation = JSON.stringify(manifest);
        if (manifest.sha === deployedSha && manifest.repository === deployedRepository) return manifest;
      }
    } catch (error) {
      lastObservation = String(error);
    }
    await delay(3000);
  }
  throw new Error(`deployment manifest did not converge to ${deployedSha}: ${lastObservation}`);
}

async function captureFullPage(page, path) {
  await page.waitForFunction(() => document.documentElement.scrollWidth > 0 && document.documentElement.scrollHeight > 0);
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
  }));
  await page.screenshot({ path, captureBeyondViewport: true, clip: { x: 0, y: 0, ...dimensions } });
}

async function waitForRecipeRedirect(page) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline && !new URL(page.url()).pathname.includes('/workflows/')) await delay(50);
  if (!new URL(page.url()).pathname.includes('/workflows/')) throw new Error(`recipe redirect did not reach Worked Workflows: ${page.url()}`);
  await page.waitForSelector('body', { timeout: 5000 });
}

async function inspectPage(page, expectedStatus) {
  const observation = await page.evaluate(() => ({
    language: document.documentElement.lang,
    text: document.body.innerText,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    nav: [...document.querySelectorAll('.primary-nav a')].map((link) => link.textContent?.trim()),
    oldUi: document.querySelectorAll('.operation-card, .explorer-toolbar, .status-chip, .stage-rail, [data-filter]').length,
    fixedContracts: document.querySelectorAll('.operation-contract').length,
    background: getComputedStyle(document.body).backgroundColor,
    fontFamily: getComputedStyle(document.body).fontFamily,
  }));
  if (observation.language !== 'en') throw new Error('document language is not English');
  if (/[\u3400-\u9fff]/u.test(observation.text)) throw new Error('public page contains CJK text');
  if (prohibitedText.test(observation.text)) throw new Error('public page contains retired governance text');
  if (observation.overflow) throw new Error('page has horizontal overflow');
  if (observation.oldUi !== 0) throw new Error(`page exposes ${observation.oldUi} retired UI elements`);
  if (observation.fixedContracts !== 0) throw new Error('page exposes a fixed operation contract');
  if (JSON.stringify(observation.nav) !== JSON.stringify(['Home', 'Research Workflow', 'Worked Workflows', 'Tools'])) throw new Error(`navigation mismatch: ${JSON.stringify(observation.nav)}`);
  if (observation.background !== 'rgb(255, 255, 255)') throw new Error(`background is not white: ${observation.background}`);
  if (!/Iowan Old Style|Palatino|Book Antiqua|Georgia|Times New Roman|serif/i.test(observation.fontFamily)) throw new Error(`serif reading stack missing: ${observation.fontFamily}`);
  if (expectedStatus === 404 && !observation.text.includes('Page Not Found')) throw new Error('custom 404 content missing');
  return observation;
}

const deploymentManifest = await waitForDeploymentManifest();
const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });

  for (const target of requiredRoutes) {
    const response = await page.goto(`${base}${target.route}`, { waitUntil: 'load' });
    if (response?.status() !== target.status) throw new Error(`${target.route}: expected HTTP ${target.status}, found ${response?.status() ?? 'no response'}`);
    if (target.route.startsWith('/recipes/')) {
      await waitForRecipeRedirect(page);
    }
    try {
      await inspectPage(page, target.status);
    } catch (error) {
      throw new Error(`${target.route}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  await page.goto(`${base}/operations/`, { waitUntil: 'load' });
  const workflowState = await page.evaluate(() => ({
    text: document.body.innerText,
    topicLinks: [...document.querySelectorAll('.topic-list a')].map((link) => link.getAttribute('href')?.split('/').filter(Boolean).at(-1)),
    transitionalLinks: [...document.querySelectorAll('a[href*="/operations/"]')].filter((link) => {
      const slug = link.getAttribute('href')?.split('/').filter(Boolean).at(-1) ?? '';
      return /^o\d{2}-/.test(slug);
    }).length,
  }));
  for (const section of workflow.sections) {
    if (!workflowState.text.includes(`${section.id} · ${section.title}`)) throw new Error(`Research Workflow is missing ${section.id} · ${section.title}`);
    for (const group of section.groups) {
      if (section.id === 'D' && !workflowState.text.includes(`${group.id} · ${group.title}`)) throw new Error(`Research Workflow is missing ${group.id} · ${group.title}`);
    }
  }
  if (JSON.stringify(workflowState.topicLinks) !== JSON.stringify(topicSlugs)) throw new Error('Research Workflow topic links do not match the registry order');
  if (workflowState.transitionalLinks !== 0) throw new Error('Research Workflow exposes transitional numbered routes');
  if (/Core Operations|O01|O24|Operation 00/.test(workflowState.text)) throw new Error('Research Workflow exposes a superseded numbered taxonomy');

  for (const slug of representativeTopicSlugs) {
    await page.goto(`${base}/operations/${slug}/`, { waitUntil: 'load' });
    const state = await page.evaluate(() => ({
      transitional: document.body.innerText.includes('Transitional route'),
      fixedContract: document.querySelector('.operation-contract'),
      articleContent: document.querySelector('.article-content'),
      hasStableNotice: document.body.innerText.includes('This stable destination is reserved for a later reviewed content batch.'),
    }));
    const hasNarrative = topicNarrativeStatuses.has(slug);
    if (state.transitional || state.fixedContract) throw new Error(`${slug}: invalid current topic route`);
    if (hasNarrative && (!state.articleContent || state.hasStableNotice)) throw new Error(`${slug}: bound topic narrative was not rendered`);
    if (!hasNarrative && (state.articleContent || !state.hasStableNotice)) throw new Error(`${slug}: neutral destination state mismatch`);
  }

  const cifAssetUrl = `${base}/examples/cif/silicon-cod-9013102-expanded.cif`;
  let viewerCifStatus = null;
  const observeViewerCif = (response) => {
    if (response.url().split('?')[0] === cifAssetUrl) viewerCifStatus = response.status();
  };
  page.on('response', observeViewerCif);

  await page.goto(`${base}/operations/obtain-material-structure/`, { waitUntil: 'load' });
  const reviewedArticle = await page.evaluate(() => ({
    text: document.body.innerText,
    links: [...document.querySelectorAll('.article-content a')].map((link) => link.href),
    headingCount: document.querySelectorAll('.article-content h2').length,
  }));
  for (const phrase of [
    'A structure file is not yet a computational model.',
    'Start with the origin of the structure',
    'Read the crystallographic representation, not just the picture',
    'Symmetry is tolerance-dependent',
    'Inspect geometry before trusting automated checks',
    'Sources and standards',
  ]) {
    if (!reviewedArticle.text.includes(phrase)) throw new Error(`Obtain a Material Structure is missing ${phrase}`);
  }
  if (reviewedArticle.headingCount < 10) throw new Error('Obtain a Material Structure lost its natural topic sections');
  for (const domain of ['iucr.org', 'docs.materialsproject.org', 'crystallography.net', 'spglib.readthedocs.io']) {
    if (!reviewedArticle.links.some((link) => link.includes(domain))) throw new Error(`Obtain a Material Structure is missing source domain ${domain}`);
  }

  const cifAssetResponse = await fetch(`${cifAssetUrl}?smoke=${Date.now()}`, { cache: 'no-store' });
  if (!cifAssetResponse.ok) throw new Error(`silicon teaching CIF returned HTTP ${cifAssetResponse.status}`);
  const cifAssetText = await cifAssetResponse.text();
  if (!cifAssetText.includes('data_silicon_cod_9013102_teaching_snapshot')) throw new Error('silicon teaching CIF data block missing');
  if (!cifAssetText.includes('not the byte-for-byte COD download')) throw new Error('silicon teaching CIF provenance boundary missing');
  if ((cifAssetText.match(/^Si\d+\s+Si\s/gm) ?? []).length !== 8) throw new Error('silicon teaching CIF does not contain eight expanded Si sites');

  const viewerElement = await page.waitForSelector('.cif-viewer > iframe', { timeout: 5000 });
  await viewerElement.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  const wrapperFrame = await viewerElement.contentFrame();
  if (!wrapperFrame) throw new Error('local CIF viewer wrapper frame did not load');
  const molstarElement = await wrapperFrame.waitForSelector('#molstar-frame', { timeout: 10000 });
  let molstarFrame = null;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    molstarFrame = await molstarElement.contentFrame();
    if (molstarFrame?.url().startsWith('https://molstar.org/viewer/')) break;
    await delay(250);
  }
  if (!molstarFrame?.url().startsWith('https://molstar.org/viewer/')) throw new Error(`Mol* frame did not load: ${molstarFrame?.url() ?? 'no frame'}`);
  const molstarUrl = new URL(molstarFrame.url());
  if (molstarUrl.searchParams.get('structure-url-format') !== 'cif') throw new Error('Mol* viewer was not configured for CIF');
  if (molstarUrl.searchParams.get('structure-url') !== cifAssetUrl) throw new Error(`Mol* structure URL mismatch: ${molstarUrl.searchParams.get('structure-url')}`);
  await molstarFrame.waitForSelector('canvas', { timeout: 45000 });
  for (let attempt = 0; attempt < 180 && viewerCifStatus === null; attempt += 1) await delay(250);
  page.off('response', observeViewerCif);
  if (viewerCifStatus !== 200) throw new Error(`Mol* did not fetch the deployed CIF successfully: ${viewerCifStatus ?? 'no request observed'}`);

  await page.goto(`${base}/workflows/`, { waitUntil: 'load' });
  const workflowLinks = await page.$$eval('.directory-list a', (links) => links.length);
  if (workflowLinks !== 2) throw new Error(`Worked Workflows directory exposes ${workflowLinks}/2 published cases`);
  for (const slug of ['silicon-ground-state-electronic-structure', 'aluminium-metallic-electronic-structure']) {
    await page.goto(`${base}/workflows/${slug}/`, { waitUntil: 'load' });
    const state = await page.evaluate(() => ({
      text: document.body.innerText,
      figures: document.querySelectorAll('figure img[src^="data:image/png;base64,"]').length,
      commands: document.querySelectorAll('pre code').length,
    }));
    if (state.figures < 1 || state.commands < 2 || !state.text.includes('G4 NOT TESTED') || !state.text.includes('G5 NOT CLAIMED')) {
      throw new Error(`${slug}: incomplete terminal-first workflow rendering`);
    }
  }
  await page.goto(`${base}/recipes/`, { waitUntil: 'load' });
  await waitForRecipeRedirect(page);
  const recipeRedirectText = await page.evaluate(() => document.body.innerText);
  if (!recipeRedirectText.includes('Worked Workflows')) throw new Error('Recipes root did not redirect to Worked Workflows');
  await page.goto(`${base}/framework/`, { waitUntil: 'load' });
  const frameworkLinks = await page.$$eval('.directory-list a', (links) => links.length);
  if (frameworkLinks !== 4) throw new Error(`Framework migration surface exposes ${frameworkLinks}/4 current destinations`);

  await page.goto(`${base}/`, { waitUntil: 'load' });
  await page.focus('.primary-nav a');
  await page.keyboard.press('Tab');
  const keyboardHref = await page.evaluate(() => document.activeElement?.getAttribute('href'));
  if (!keyboardHref?.endsWith('/operations/')) throw new Error(`keyboard navigation mismatch: ${keyboardHref}`);

  const migrationNotice = 'This URL is retained while useful material is migrated into the A–E workflow.';
  for (const slug of [...representativeTransitionalSlugs, ...representativeLegacySlugs]) {
    await page.goto(`${base}/operations/${slug}/`, { waitUntil: 'load' });
    const migrationState = await page.evaluate((notice) => ({
      hasNotice: document.body.innerText.includes(notice),
      previous: document.querySelector('[data-previous]'),
      next: document.querySelector('[data-next]'),
      fixedContract: document.querySelector('.operation-contract'),
      mappedLinks: document.querySelectorAll('.legacy-mapping a').length,
    }), migrationNotice);
    if (!migrationState.hasNotice || migrationState.previous || migrationState.next || migrationState.fixedContract || migrationState.mappedLinks > 0) throw new Error(`${slug}: invalid migration route`);
  }

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  await noJsPage.goto(`${base}/operations/`, { waitUntil: 'load' });
  const noJsTopicLinks = await noJsPage.$$eval('.topic-list a', (links) => links.map((link) => link.getAttribute('href')?.split('/').filter(Boolean).at(-1)));
  if (JSON.stringify(noJsTopicLinks) !== JSON.stringify(topicSlugs)) throw new Error('no-JavaScript Research Workflow topic links are incomplete');
  await noJsPage.goto(`${base}/operations/obtain-material-structure/`, { waitUntil: 'load' });
  const noJsTopicText = await noJsPage.$eval('body', (body) => body.innerText);
  if (!noJsTopicText.includes('A structure file is not yet a computational model.') || !noJsTopicText.includes('Sources and standards')) {
    throw new Error('no-JavaScript reviewed topic page is incomplete');
  }

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  for (const target of requiredRoutes) {
    const response = await page.goto(`${base}${target.route}`, { waitUntil: 'load' });
    if (response?.status() !== target.status) throw new Error(`mobile ${target.route}: HTTP ${response?.status()}`);
    if (target.route.startsWith('/recipes/')) await waitForRecipeRedirect(page);
    await inspectPage(page, target.status);
  }

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.goto(`${base}/operations/`, { waitUntil: 'load' });
    await captureFullPage(page, join(artifactDirectory, 'research-workflow-mobile.png'));
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}/`, { waitUntil: 'load' });
    await captureFullPage(page, join(artifactDirectory, 'home-desktop.png'));
    await page.goto(`${base}/operations/`, { waitUntil: 'load' });
    await captureFullPage(page, join(artifactDirectory, 'research-workflow-desktop.png'));
    await page.goto(`${base}/operations/obtain-material-structure/`, { waitUntil: 'load' });
    await captureFullPage(page, join(artifactDirectory, 'topic-obtain-material-structure-desktop.png'));
    await page.goto(`${base}/operations/o13-solve-an-electronic-state/`, { waitUntil: 'load' });
    await captureFullPage(page, join(artifactDirectory, 'transitional-route-desktop.png'));
  }

  const summary = {
    site_url: base,
    deployment_manifest: deploymentManifest,
    routes: requiredRoutes.length,
    reader_workflow: 'A-E',
    topic_routes_verified_from_registry: true,
    topic_narratives: topicNarrativeStatuses.size,
    reviewed_topic_narratives: [...topicNarrativeStatuses.values()].filter((status) => status === 'reviewed').length,
    target_calculation_groups: 5,
    published_workflows: workflowLinks,
    framework_migration_destinations: frameworkLinks,
    migration_routes_sampled: representativeTransitionalSlugs.length + representativeLegacySlugs.length,
    fixed_contracts: 0,
    keyboard_navigation: true,
    mobile_width: 390,
    mobile_horizontal_overflow: false,
    no_javascript_workflow: true,
    no_javascript_reviewed_topic: true,
    cif_teaching_snapshot: true,
    cif_viewer_loaded: true,
    cif_viewer_source_fetch_status: viewerCifStatus,
    public_language: 'en',
  };
  if (artifactDirectory) await writeFile(join(artifactDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`Browser smoke passed: registry-driven A–E workflow, two terminal-first Worked Workflows, migration-safe old routes, keyboard navigation, true 390px no overflow, no-JavaScript reading, deployed CIF teaching snapshot and Mol* viewer fetch, and English-only output${deploymentManifest ? `, manifest ${deploymentManifest.sha}` : ''}.`);
} finally {
  await browser.close();
}

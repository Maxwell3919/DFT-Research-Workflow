import { readFile, mkdir, writeFile } from 'node:fs/promises';
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
  { route: '/recipes/', status: 200, name: 'Recipes directory' },
  { route: '/recipes/bulk-structure-and-bands/', status: 200, name: 'Research workflow example' },
  { route: '/framework/', status: 200, name: 'Framework directory' },
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
  if (JSON.stringify(observation.nav) !== JSON.stringify(['Home', 'Operations', 'Workflow Recipes', 'Framework'])) throw new Error(`navigation mismatch: ${JSON.stringify(observation.nav)}`);
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
    const response = await page.goto(`${base}${target.route}`, { waitUntil: 'domcontentloaded' });
    if (response?.status() !== target.status) throw new Error(`${target.route}: expected HTTP ${target.status}, found ${response?.status() ?? 'no response'}`);
    await inspectPage(page, target.status);
  }

  await page.goto(`${base}/operations/`, { waitUntil: 'domcontentloaded' });
  const workflowState = await page.evaluate(() => ({
    text: document.body.innerText,
    topicLinks: [...document.querySelectorAll('.topic-list a')].map((link) => link.getAttribute('href')?.split('/').filter(Boolean).at(-1)),
    transitionalLinks: document.querySelectorAll('a[href*="/operations/o"]').length,
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
    await page.goto(`${base}/operations/${slug}/`, { waitUntil: 'domcontentloaded' });
    const state = await page.evaluate(() => ({
      transitional: document.body.innerText.includes('Transitional route'),
      fixedContract: document.querySelector('.operation-contract'),
      hasStableNotice: document.body.innerText.includes('This stable destination is reserved for a later reviewed content batch.'),
    }));
    if (state.transitional || state.fixedContract || !state.hasStableNotice) throw new Error(`${slug}: invalid stable topic route`);
  }

  await page.goto(`${base}/recipes/`, { waitUntil: 'domcontentloaded' });
  const recipeLinks = await page.$$eval('.directory-list a', (links) => links.length);
  if (recipeLinks !== 16) throw new Error(`Workflow Recipes directory exposes ${recipeLinks}/16 transitional workflow sources`);
  await page.goto(`${base}/framework/`, { waitUntil: 'domcontentloaded' });
  const frameworkLinks = await page.$$eval('.directory-list a', (links) => links.length);
  if (frameworkLinks !== 5) throw new Error(`Framework directory exposes ${frameworkLinks}/5 pages`);

  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.focus('.primary-nav a');
  await page.keyboard.press('Tab');
  const keyboardHref = await page.evaluate(() => document.activeElement?.getAttribute('href'));
  if (!keyboardHref?.endsWith('/operations/')) throw new Error(`keyboard navigation mismatch: ${keyboardHref}`);

  const migrationNotice = 'This URL is retained while useful material is migrated into the A–E workflow.';
  for (const slug of [...representativeTransitionalSlugs, ...representativeLegacySlugs]) {
    await page.goto(`${base}/operations/${slug}/`, { waitUntil: 'domcontentloaded' });
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
  await noJsPage.setJavaScriptEnabled(false);
  await noJsPage.goto(`${base}/operations/`, { waitUntil: 'domcontentloaded' });
  const noJsTopicLinks = await noJsPage.$$eval('.topic-list a', (links) => links.map((link) => link.getAttribute('href')?.split('/').filter(Boolean).at(-1)));
  if (JSON.stringify(noJsTopicLinks) !== JSON.stringify(topicSlugs)) throw new Error('no-JavaScript Research Workflow topic links are incomplete');
  await noJsPage.goto(`${base}/operations/harmonic-phonons/`, { waitUntil: 'domcontentloaded' });
  const noJsTopicText = await noJsPage.$eval('body', (body) => body.innerText);
  if (!noJsTopicText.includes('Harmonic Phonons')) throw new Error('no-JavaScript topic page is incomplete');

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  for (const target of requiredRoutes) {
    const response = await page.goto(`${base}${target.route}`, { waitUntil: 'domcontentloaded' });
    if (response?.status() !== target.status) throw new Error(`mobile ${target.route}: HTTP ${response?.status()}`);
    await inspectPage(page, target.status);
  }

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.goto(`${base}/operations/`, { waitUntil: 'domcontentloaded' });
    await captureFullPage(page, join(artifactDirectory, 'research-workflow-mobile.png'));
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
    await captureFullPage(page, join(artifactDirectory, 'home-desktop.png'));
    await page.goto(`${base}/operations/`, { waitUntil: 'domcontentloaded' });
    await captureFullPage(page, join(artifactDirectory, 'research-workflow-desktop.png'));
    await page.goto(`${base}/operations/harmonic-phonons/`, { waitUntil: 'domcontentloaded' });
    await captureFullPage(page, join(artifactDirectory, 'topic-harmonic-phonons-desktop.png'));
    await page.goto(`${base}/operations/o13-solve-an-electronic-state/`, { waitUntil: 'domcontentloaded' });
    await captureFullPage(page, join(artifactDirectory, 'transitional-route-desktop.png'));
  }

  const summary = {
    site_url: base,
    deployment_manifest: deploymentManifest,
    routes: requiredRoutes.length,
    reader_workflow: 'A-E',
    topic_routes_verified_from_registry: true,
    target_calculation_groups: 5,
    workflow_sources: recipeLinks,
    framework_pages: frameworkLinks,
    migration_routes_sampled: representativeTransitionalSlugs.length + representativeLegacySlugs.length,
    fixed_contracts: 0,
    keyboard_navigation: true,
    mobile_width: 390,
    mobile_horizontal_overflow: false,
    no_javascript_workflow: true,
    public_language: 'en',
  };
  if (artifactDirectory) await writeFile(join(artifactDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`Browser smoke passed: registry-driven A–E workflow, stable topic routes, natural page layouts, migration-safe old routes, keyboard navigation, 390px no overflow, no-JavaScript reading, and English-only output${deploymentManifest ? `, manifest ${deploymentManifest.sha}` : ''}.`);
} finally {
  await browser.close();
}

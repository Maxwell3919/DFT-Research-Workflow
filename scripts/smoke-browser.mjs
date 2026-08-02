import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const deployedSha = process.env.DEPLOYED_SHA;
const deployedRepository = process.env.DEPLOYED_REPOSITORY ?? 'Maxwell3919/DFT-Research-Workflow';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const representativeCoreSlugs = [
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
const requiredRoutes = [
  { route: '/', status: 200, name: 'Home' },
  { route: '/operations/', status: 200, name: 'Operations' },
  ...representativeCoreSlugs.map((slug) => ({ route: `/operations/${slug}/`, status: 200, name: slug })),
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
  await page.screenshot({
    path,
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, ...dimensions },
  });
}

async function inspectPage(page, expectedStatus) {
  const observation = await page.evaluate(() => ({
    language: document.documentElement.lang,
    text: document.body.innerText,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    nav: [...document.querySelectorAll('.primary-nav a')].map((link) => link.textContent?.trim()),
    oldUi: document.querySelectorAll('.operation-card, .explorer-toolbar, .status-chip, .stage-rail, [data-filter]').length,
    background: getComputedStyle(document.body).backgroundColor,
    fontFamily: getComputedStyle(document.body).fontFamily,
  }));
  if (observation.language !== 'en') throw new Error('document language is not English');
  if (/[\u3400-\u9fff]/u.test(observation.text)) throw new Error('public page contains CJK text');
  if (prohibitedText.test(observation.text)) throw new Error('public page contains retired governance text');
  if (observation.overflow) throw new Error('page has horizontal overflow');
  if (observation.oldUi !== 0) throw new Error(`page exposes ${observation.oldUi} retired UI elements`);
  if (JSON.stringify(observation.nav) !== JSON.stringify(['Home', 'Operations'])) throw new Error(`navigation mismatch: ${JSON.stringify(observation.nav)}`);
  if (observation.background !== 'rgb(255, 255, 255)') throw new Error(`background is not white: ${observation.background}`);
  if (!/Iowan Old Style|Palatino|Book Antiqua|Georgia|Times New Roman|serif/i.test(observation.fontFamily)) {
    throw new Error(`serif reading stack missing: ${observation.fontFamily}`);
  }
  if (expectedStatus === 404 && !observation.text.includes('Page Not Found')) throw new Error('custom 404 content missing');
  return observation;
}

const deploymentManifest = await waitForDeploymentManifest();
const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

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
  const directory = await page.$$eval('.operations-list a', (links) => links.map((link) => ({
    id: link.querySelector('.operation-number')?.textContent?.trim(),
    href: link.getAttribute('href'),
  })));
  if (directory.length !== 24) throw new Error(`Core Operations directory contains ${directory.length}/24 links`);
  const ids = directory.map((entry) => entry.id);
  const expectedIds = Array.from({ length: 24 }, (_, index) => `O${String(index + 1).padStart(2, '0')}`);
  if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) throw new Error('Core Operations directory order is not O01–O24');

  await page.focus('.operations-list a');
  await page.keyboard.press('Tab');
  const keyboardHref = await page.evaluate(() => document.activeElement?.getAttribute('href'));
  if (!keyboardHref?.endsWith('/operations/o02-parse-and-normalize-artifacts/')) throw new Error(`keyboard order mismatch: ${keyboardHref}`);

  const adjacency = [
    ['o01-acquire-source-objects', null, 'o02-parse-and-normalize-artifacts'],
    ['o13-solve-an-electronic-state', 'o12-orchestrate-monitor-and-recover-executions', 'o14-optimize-structures-or-paths'],
    ['o20-verify-numerical-completion-and-convergence', 'o19-compare-and-aggregate-results', 'o21-validate-physical-consistency-and-method-robustness'],
    ['o24-package-and-preserve-a-reproducible-research-bundle', 'o23-capture-provenance-and-lineage', null],
  ];
  for (const [slug, previous, next] of adjacency) {
    await page.goto(`${base}/operations/${slug}/`, { waitUntil: 'domcontentloaded' });
    const links = await page.evaluate(() => ({
      previous: document.querySelector('[data-previous]')?.getAttribute('href') ?? null,
      next: document.querySelector('[data-next]')?.getAttribute('href') ?? null,
    }));
    if ((previous && !links.previous?.endsWith(`/operations/${previous}/`)) || (!previous && links.previous)) throw new Error(`${slug}: previous link mismatch`);
    if ((next && !links.next?.endsWith(`/operations/${next}/`)) || (!next && links.next)) throw new Error(`${slug}: next link mismatch`);
  }

  for (const slug of representativeLegacySlugs) {
    await page.goto(`${base}/operations/${slug}/`, { waitUntil: 'domcontentloaded' });
    const legacyState = await page.evaluate(() => ({
      hasNotice: document.body.innerText.includes('Legacy route retained for compatibility.'),
      previous: document.querySelector('[data-previous]'),
      next: document.querySelector('[data-next]'),
      mappedLinks: document.querySelectorAll('.legacy-mapping a').length,
    }));
    if (!legacyState.hasNotice || legacyState.previous || legacyState.next || legacyState.mappedLinks < 1) {
      throw new Error(`${slug}: invalid legacy compatibility page`);
    }
  }

  const noJsPage = await browser.newPage();
  await noJsPage.setJavaScriptEnabled(false);
  await noJsPage.goto(`${base}/operations/`, { waitUntil: 'domcontentloaded' });
  const noJsLinks = await noJsPage.$$eval('.operations-list a', (links) => links.length);
  if (noJsLinks !== 24) throw new Error(`no-JavaScript directory exposes ${noJsLinks}/24 core operations`);

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  for (const target of requiredRoutes) {
    const response = await page.goto(`${base}${target.route}`, { waitUntil: 'domcontentloaded' });
    if (response?.status() !== target.status) throw new Error(`mobile ${target.route}: HTTP ${response?.status()}`);
    await inspectPage(page, target.status);
  }

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.goto(`${base}/operations/`, { waitUntil: 'domcontentloaded' });
    await captureFullPage(page, join(artifactDirectory, 'operations-mobile.png'));
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
    await captureFullPage(page, join(artifactDirectory, 'home-desktop.png'));
    await page.goto(`${base}/operations/`, { waitUntil: 'domcontentloaded' });
    await captureFullPage(page, join(artifactDirectory, 'operations-desktop.png'));
    await page.goto(`${base}/operations/o13-solve-an-electronic-state/`, { waitUntil: 'domcontentloaded' });
    await captureFullPage(page, join(artifactDirectory, 'core-operation-o13-desktop.png'));
    await page.goto(`${base}/operations/25-electron-phonon-and-superconductivity/`, { waitUntil: 'domcontentloaded' });
    await captureFullPage(page, join(artifactDirectory, 'legacy-operation-25-desktop.png'));
  }

  const summary = {
    site_url: base,
    deployment_manifest: deploymentManifest,
    routes: requiredRoutes.length,
    core_operations: directory.length,
    core_order: 'O01-O24',
    legacy_routes_sampled: representativeLegacySlugs.length,
    keyboard_navigation: true,
    mobile_width: 390,
    mobile_horizontal_overflow: false,
    no_javascript_core_operations: noJsLinks,
    public_language: 'en',
  };
  if (artifactDirectory) await writeFile(join(artifactDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`Browser smoke passed: ${requiredRoutes.length} routes including legacy and 404, 24 core operations in order, adjacency, keyboard navigation, 390px no overflow, no-JS 24/24, English-only${deploymentManifest ? `, manifest ${deploymentManifest.sha}` : ''}.`);
} finally {
  await browser.close();
}

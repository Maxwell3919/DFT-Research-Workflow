import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const deployedSha = process.env.DEPLOYED_SHA;
const deployedRepository = process.env.DEPLOYED_REPOSITORY ?? 'Maxwell3919/DFT-Research-Workflow';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const operations = JSON.parse(await readFile(new URL('../src/data/operations.json', import.meta.url), 'utf8'));
const expectedAssisted = operations.filter((operation) => operation.automation_maturity === 'assisted').length;
const requiredRoutes = [
  '/', '/workflow/', '/stages/convergence/', '/branches/vibrations-response/',
  '/evidence/', '/registry/', '/data/operations.json',
];

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

const deploymentManifest = await waitForDeploymentManifest();

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  for (const route of requiredRoutes) {
    const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) throw new Error(`${route}: HTTP ${response?.status() ?? 'no response'}`);
  }

  await page.goto(`${base}/workflow/`, { waitUntil: 'domcontentloaded' });
  const allCards = await page.$$eval('[data-operation]', (cards) => cards.length);
  if (allCards !== operations.length) throw new Error(`expected ${operations.length} operation cards, found ${allCards}`);

  await page.focus('[data-filter="assisted"]');
  await page.keyboard.press('Enter');
  await page.waitForFunction(
    (expected) => [...document.querySelectorAll('[data-operation]')].filter((card) => !card.hidden).length === expected,
    {},
    expectedAssisted,
  );
  const interaction = await page.evaluate(() => ({
    visible: [...document.querySelectorAll('[data-operation]')].filter((card) => !card.hidden).length,
    readout: document.querySelector('[data-filter-readout]')?.textContent ?? '',
    pressed: document.querySelector('[data-filter="assisted"]')?.getAttribute('aria-pressed'),
  }));
  if (interaction.visible !== expectedAssisted || interaction.pressed !== 'true' || !interaction.readout.includes(String(expectedAssisted))) {
    throw new Error(`filter interaction mismatch: ${JSON.stringify(interaction)}`);
  }

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(`${base}/workflow/`, { waitUntil: 'domcontentloaded' });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (mobileOverflow) throw new Error('workflow route has horizontal overflow at 390px');

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await captureFullPage(page, join(artifactDirectory, 'workflow-mobile.png'));
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
    await captureFullPage(page, join(artifactDirectory, 'home-desktop.png'));
  }

  const noJsPage = await browser.newPage();
  await noJsPage.setJavaScriptEnabled(false);
  await noJsPage.goto(`${base}/workflow/`, { waitUntil: 'domcontentloaded' });
  const noJsCards = await noJsPage.$$eval('[data-operation]', (cards) => cards.filter((card) => !card.hidden).length);
  if (noJsCards !== operations.length) throw new Error(`no-JS route exposes ${noJsCards}/${operations.length} operations`);

  const summary = {
    site_url: base,
    deployment_manifest: deploymentManifest,
    routes: requiredRoutes.length,
    operation_cards: allCards,
    assisted_filter: expectedAssisted,
    mobile_width: 390,
    mobile_horizontal_overflow: false,
    no_javascript_cards: noJsCards,
  };
  if (artifactDirectory) await writeFile(join(artifactDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`Browser smoke passed: ${requiredRoutes.length} routes, ${allCards} cards, assisted filter ${expectedAssisted}, 390px no overflow, no-JS ${noJsCards}/${operations.length}${deploymentManifest ? `, manifest ${deploymentManifest.sha}` : ''}.`);
} finally {
  await browser.close();
}

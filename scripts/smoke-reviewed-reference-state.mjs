import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/calculate-reference-ground-state/';
const requiredHeadings = [
  'Build and audit the reference state',
  'Define the reference state operationally',
  'Enumerate candidate electronic states',
  'Distinguish internal SCF convergence from state verification',
  'Compare candidate energies under one common evaluator',
  'Repeat critical states from independent initializations',
  'Package charge density and wavefunction lineage',
  'Preserve a reference-state evidence package',
  'What this task does not establish',
  'Sources and methods',
];
const requiredPhrases = [
  'A reference ground-state calculation establishes the fixed-geometry electronic state',
  'Begin with one exact accepted geometry.',
  'The optimization-to-static route is common, not universal.',
  'Normal program termination does not establish SCF convergence.',
  'SCF convergence does not establish ionic optimization convergence.',
  'Ionic optimization convergence does not identify the lowest relevant state.',
  'The lowest identified state is not automatically the scientifically appropriate reference state.',
  'Define the reference state operationally',
  'A successful SCF solution is not automatically the global electronic ground state.',
  'Begin from the exact accepted geometry produced by Optimize the Structure or another declared source.',
  'This calculation is not simply “the last SCF in the relaxation.”',
  'Enumerate candidate electronic states',
  'A fresh start initializes the same declared state without using the previous electronic solution.',
  'A smearing width chosen for Brillouin-zone integration is not automatically a physical temperature.',
  'Initial moments guide the solver toward candidate magnetic states; they do not define the final state by themselves.',
  'A small final residual does not identify which self-consistent basin was reached.',
  'The lowest accepted candidate among the tested inventory is the current reference.',
  'State identity should be checked from outputs, not inferred from input labels.',
  'Package charge density and wavefunction lineage',
  'A file being readable is not evidence that it is scientifically compatible.',
  'The reference state closes the common C-stage backbone and opens the D-stage branching library.',
  'A single “SCF converged” line is not a reference-state record.',
  'What this task does not establish',
  'Sources and methods',
];
const requiredDomains = [
  'quantum-espresso.org',
  'vasp.at',
  'manual.cp2k.org',
  'docs.abinit.org',
  'doi.org',
];

async function inspect(page, expectedWidth) {
  const result = await page.evaluate(() => ({
    language: document.documentElement.lang,
    title: document.querySelector('h1')?.textContent?.trim(),
    text: document.body.innerText,
    links: [...document.querySelectorAll('.article-content a')].map((link) => link.href),
    headings: [...document.querySelectorAll('.article-content h2')].map((heading) => heading.textContent?.trim()),
    cards: document.querySelectorAll('.practical-card-list li').length,
    hasArticle: Boolean(document.querySelector('.article-content')),
    hasPlaceholder: document.body.innerText.includes('This stable destination is reserved for a later reviewed content batch.'),
    hasContract: Boolean(document.querySelector('.operation-contract')),
    hasScript: Boolean(document.querySelector('script')),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));

  if (result.language !== 'en') throw new Error('reference-state overview language is not English');
  if (result.title !== 'Calculate the Reference Ground State') throw new Error(`reference-state title mismatch: ${result.title}`);
  if (!result.hasArticle || result.hasPlaceholder) throw new Error('reviewed reference-state narrative was not rendered');
  if (result.hasContract) throw new Error('reference-state overview exposes a fixed contract');
  if (result.hasScript) throw new Error('reference-state overview contains client-side script');
  if (result.overflow) throw new Error(`reference-state overview overflows at ${expectedWidth}px`);
  for (const heading of requiredHeadings) {
    if (!result.headings.includes(heading)) throw new Error(`reference-state overview is missing semantic section ${heading}`);
  }
  if (result.cards !== 4) throw new Error(`reference-state overview exposes ${result.cards} practical cards instead of 4`);
  for (const phrase of requiredPhrases) {
    if (!result.text.includes(phrase)) throw new Error(`reference-state overview is missing ${phrase}`);
  }
  for (const domain of requiredDomains) {
    if (!result.links.some((link) => link.includes(domain))) throw new Error(`reference-state overview is missing source domain ${domain}`);
  }
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
  let response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`reference-state desktop route returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`reference-state mobile route returned ${response?.status()}`);
  await inspect(page, 390);

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  response = await noJsPage.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`reference-state no-JavaScript route returned ${response?.status()}`);
  const noJsText = await noJsPage.$eval('body', (body) => body.innerText);
  for (const phrase of [
    'A reference ground-state calculation establishes the fixed-geometry electronic state',
    'The optimization-to-static route is common, not universal.',
    'Normal program termination does not establish SCF convergence.',
    'SCF convergence does not establish ionic optimization convergence.',
    'Ionic optimization convergence does not identify the lowest relevant state.',
    'The lowest identified state is not automatically the scientifically appropriate reference state.',
    'A successful SCF solution is not automatically the global electronic ground state.',
    'Sources and methods',
  ]) {
    if (!noJsText.includes(phrase)) throw new Error(`reference-state no-JavaScript page is missing ${phrase}`);
  }

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'load' });
    await captureStablePage(page, join(artifactDirectory, 'topic-calculate-reference-ground-state-desktop.png'));
    await writeFile(join(artifactDirectory, 'reviewed-reference-state-summary.json'), `${JSON.stringify({
      site_url: base,
      route,
      natural_sections: desktop.headings.length,
      practical_cards: desktop.cards,
      source_links: desktop.links.length,
      desktop_width: 1440,
      mobile_width: 390,
      no_javascript: true,
      fixed_contract: false,
      global_ground_state_claim_rejected: desktop.text.includes('not automatically the global electronic ground state'),
      target_calculations_kept_separate: desktop.text.includes('does not perform the later D-section target calculations'),
    }, null, 2)}\n`);
  }

  console.log(`Reviewed reference-state smoke passed: common-not-universal fixed-geometry route and four distinct gates, ${desktop.headings.length} natural sections, 4 practical cards, rendered sources, 1440px/390px no-overflow, no-JavaScript reading, and bounded candidate-state language.`);
} finally {
  await browser.close();
}

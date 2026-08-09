import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/defect-formation-energies-and-charge-states/';
const phrases = [
  'Use defect formation energies when atoms and electrons are exchanged',
  'Prepare the parent calculations',
  'Store every term and sign separately.',
  'These allowed domains come from phase stability',
  'A periodic charged supercell is not an isolated charged defect',
  'Avoid double-counting alignment',
  'Agreement between two corrected values can arise from compensating errors.',
  'Only crossings on the lower envelope delimit thermodynamically stable charge states.',
  'Diagnose a skipped charge state',
  'A Kohn–Sham eigenvalue is neither automatically a thermodynamic transition level nor an optical excitation energy.',
  'The solution depends on the complete included defect and dopant inventory',
  'A low equilibrium formation energy does not supply a migration barrier',
  'Verify program completion, SCF convergence, relaxation, final charge and spin identity, and localization separately.',
  'Claim boundary and next operation',
  'It does not establish exhaustive search, isolated-defect convergence without size evidence',
  'Sources and methods',
];
const domains = ['doi.org', 'doped.readthedocs.io'];

async function inspect(page, width) {
  const result = await page.evaluate(() => ({
    language: document.documentElement.lang,
    title: document.querySelector('h1')?.textContent?.trim(),
    text: document.body.innerText,
    links: [...document.querySelectorAll('.article-content a')].map((link) => link.href),
    headings: document.querySelectorAll('.article-content h2').length,
    cards: document.querySelectorAll('.practical-card-list li').length,
    hasArticle: Boolean(document.querySelector('.article-content')),
    hasPlaceholder: document.body.innerText.includes('This stable destination is reserved for a later reviewed content batch.'),
    hasContract: Boolean(document.querySelector('.operation-contract')),
    scripts: document.querySelectorAll('script').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (result.language !== 'en' || result.title !== 'Defect Formation Energies and Charge States') throw new Error(`defect identity mismatch: ${result.title}`);
  if (!result.hasArticle || result.hasPlaceholder || result.hasContract) throw new Error('reviewed defect narrative was not rendered naturally');
  if (result.scripts !== 0 || result.overflow) throw new Error(`defect page is not static or overflows at ${width}px`);
  if (result.headings !== 22 || result.cards !== 2) throw new Error(`defect counts mismatch: ${result.headings} sections, ${result.cards} cards`);
  for (const phrase of phrases) if (!result.text.includes(phrase)) throw new Error(`defect page is missing ${phrase}`);
  for (const domain of domains) if (!result.links.some((link) => link.includes(domain))) throw new Error(`defect page is missing ${domain}`);
  return result;
}

async function capture(page, path) {
  await page.waitForFunction(() => document.documentElement.scrollWidth > 0 && document.documentElement.scrollHeight > 0, { timeout: 15000 });
  const size = await page.evaluate(() => ({ width: Math.ceil(Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)), height: Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)) }));
  await page.screenshot({ path, captureBeyondViewport: true, clip: { x: 0, y: 0, ...size } });
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  let response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`defect desktop returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`defect mobile returned ${response?.status()}`);
  await inspect(page, 390);

  const noJs = await browser.newPage();
  await noJs.setCacheEnabled(false);
  await noJs.setJavaScriptEnabled(false);
  response = await noJs.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`defect no-JavaScript returned ${response?.status()}`);
  const text = await noJs.$eval('body', (body) => body.innerText);
  for (const phrase of ['Store every term and sign separately.', 'Avoid double-counting alignment', 'Sources and methods']) if (!text.includes(phrase)) throw new Error(`defect no-JavaScript missing ${phrase}`);

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'load' });
    await capture(page, join(artifactDirectory, 'topic-defect-formation-energies-desktop.png'));
    await writeFile(join(artifactDirectory, 'reviewed-defects-summary.json'), `${JSON.stringify({ site_url: base, route, natural_sections: desktop.headings, practical_cards: desktop.cards, source_links: desktop.links.length, desktop_width: 1440, mobile_width: 390, no_javascript: true, fixed_contract: false, correction_boundary: true, transition_level_boundary: true, neutrality_boundary: true }, null, 2)}\n`);
  }
  console.log('Reviewed defect smoke passed: 22 natural sections, 2 practical cards, rendered sources, 1440px/390px no-overflow, no-JavaScript reading, and correction/transition/neutrality boundaries.');
} finally {
  await browser.close();
}

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/surface-energy-and-work-function/';
const phrases = [
  'Use a surface-energy calculation to compare the cost of creating declared facets',
  'A Miller index identifies an orientation, not a unique surface.',
  'The factor two counts the two equivalent surfaces.',
  'One equation determines only the sum of the two surface excesses.',
  'the surface free energy becomes a grand-potential excess',
  'A fitted slope or intercept does not repair a reconstruction, strain, stoichiometry, magnetic-state, or protocol switch.',
  'A dipole correction removes a chosen periodic-image field but does not provide missing reconstruction',
  'Here numerical convergence means thickness, vacuum, sampling, and finite lateral-size refinement within a fixed termination',
  'The expression is meaningful only when the vacuum reference is flat and charge-free.',
  'Do not average physically different surfaces.',
  'State whether the question uses work function, ionization potential',
  'It is not a rerun of InterMat, a thickness series, or independent validation',
  'Program termination, SCF convergence, geometry convergence, target convergence, physical plausibility, and claim support remain separate.',
  'It does not establish an exhaustive reconstruction search, experimental surface composition',
  'Sources and methods',
];
const domains = ['doi.org', 'vasp.at', 'gpaw.readthedocs.io'];

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
  if (result.language !== 'en' || result.title !== 'Surface Energy and Work Function') throw new Error(`surface identity mismatch: ${result.title}`);
  if (!result.hasArticle || result.hasPlaceholder || result.hasContract) throw new Error('reviewed surface narrative was not rendered naturally');
  if (result.scripts !== 0 || result.overflow) throw new Error(`surface page is not static or overflows at ${width}px`);
  if (result.headings < 8 || result.headings > 12 || result.cards !== 3) throw new Error(`surface counts mismatch: ${result.headings} sections outside 8..12, ${result.cards} cards`);
  for (const phrase of phrases) if (!result.text.includes(phrase)) throw new Error(`surface page is missing ${phrase}`);
  for (const domain of domains) if (!result.links.some((link) => link.includes(domain))) throw new Error(`surface page is missing ${domain}`);
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
  if (response?.status() !== 200) throw new Error(`surface desktop returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`surface mobile returned ${response?.status()}`);
  await inspect(page, 390);

  const noJs = await browser.newPage();
  await noJs.setCacheEnabled(false);
  await noJs.setJavaScriptEnabled(false);
  response = await noJs.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`surface no-JavaScript returned ${response?.status()}`);
  const text = await noJs.$eval('body', (body) => body.innerText);
  for (const phrase of ['The factor two counts the two equivalent surfaces.', 'The expression is meaningful only when the vacuum reference is flat and charge-free.', 'Sources and methods']) if (!text.includes(phrase)) throw new Error(`surface no-JavaScript missing ${phrase}`);

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'load' });
    await capture(page, join(artifactDirectory, 'topic-surface-energy-work-function-desktop.png'));
    await writeFile(join(artifactDirectory, 'reviewed-surfaces-summary.json'), `${JSON.stringify({ site_url: base, route, natural_sections: desktop.headings, practical_cards: desktop.cards, source_links: desktop.links.length, desktop_width: 1440, mobile_width: 390, no_javascript: true, fixed_contract: false, surface_reference_boundary: desktop.text.includes('The factor two counts the two equivalent surfaces.'), plateau_boundary: desktop.text.includes('The expression is meaningful only when the vacuum reference is flat and charge-free.'), semiconductor_boundary: desktop.text.includes('State whether the question uses work function, ionization potential'), target_convergence_boundary: desktop.text.includes('Here numerical convergence means thickness, vacuum, sampling, and finite lateral-size refinement within a fixed termination') }, null, 2)}\n`);
  }
  console.log(`Reviewed surface smoke passed: ${desktop.headings} natural sections, 3 practical cards, rendered sources, 1440px/390px no-overflow, no-JavaScript reading, and surface-reference/plateau/semiconductor/target-convergence boundaries.`);
} finally {
  await browser.close();
}

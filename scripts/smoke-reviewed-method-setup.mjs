import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const route = '/operations/choose-dft-method-and-computational-setup/';
const pseudopotentialRoute = `${route}guides/select-download-and-record-pseudopotentials/`;
const requiredContracts = [
  {
    name: 'versioned method baseline and branch compatibility',
    phrases: [
      'This task establishes a versioned method identity and a defensible starting setup.',
      'Calculations combined in an energy difference, reference cycle, or ranking require compatible method identities unless method sensitivity is itself the test.',
    ],
  },
  {
    name: 'physical and numerical choices',
    phrases: [
      'Separate the physical approximation from its discretization',
      'Increasing these controls should approach a method-specific limit; it does not repair an inappropriate physical approximation.',
    ],
  },
  {
    name: 'pseudopotential identity and compatibility',
    phrases: [
      'Select, Download, and Record Pseudopotentials',
      'Inspect element coverage, valence configuration, semicore choices, functional compatibility, scalar/full relativity, recommended starting cutoffs, generation lineage, tests, and license.',
    ],
  },
  {
    name: 'representative execution and output inspection',
    phrases: [
      'Run the smallest representative input, inspect warnings and produced artifacts, and verify that required features are compatible.',
      'A successful exit establishes neither methodological suitability nor numerical convergence.',
    ],
  },
  {
    name: 'baseline versus observable-specific convergence',
    phrases: [
      'Recommended cutoffs are starting evidence; system- and observable-specific convergence follows on the next topic.',
      'Test Numerical Convergence',
    ],
  },
  {
    name: 'reviewed sources',
    phrases: ['Sources and methods'],
  },
];
const requiredDomains = [
  'quantum-espresso.org',
  'pseudopotentials.quantum-espresso.org',
  'doi.org',
];

async function inspect(page, expectedWidth) {
  const result = await page.evaluate(() => ({
    language: document.documentElement.lang,
    title: document.querySelector('h1')?.textContent?.trim(),
    text: document.body.innerText,
    links: [...document.querySelectorAll('.article-content a')].map((link) => link.href),
    headings: [...document.querySelectorAll('.article-content h2')].map((heading) => heading.textContent?.trim()),
    hasArticle: Boolean(document.querySelector('.article-content')),
    hasPlaceholder: document.body.innerText.includes('This stable destination is reserved for a later reviewed content batch.'),
    hasContract: Boolean(document.querySelector('.operation-contract')),
    copyEnhancements: document.querySelectorAll('script[data-copy-enhancement]').length,
    unexpectedScripts: document.querySelectorAll('script:not([data-copy-enhancement])').length,
    copyableBlocks: document.querySelectorAll('pre[data-copyable] > code, pre[data-language="bash"] > code, pre[data-language="shell"] > code, pre[data-language="sh"] > code, pre[data-language="python"] > code, pre[data-language="qe"] > code, pre[data-language="slurm"] > code, pre[data-language="json"] > code, pre[data-language="plaintext"] > code, pre[data-language="gnuplot"] > code, pre > code.language-bash, pre > code.language-shell, pre > code.language-sh, pre > code.language-python, pre > code.language-qe, pre > code.language-slurm, pre > code.language-json, pre > code.language-plaintext, pre > code.language-gnuplot').length,
    copyButtons: document.querySelectorAll('.copy-code-button').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));

  if (result.language !== 'en') throw new Error('DFT method article language is not English');
  if (result.title !== 'Choose the DFT Method and Computational Setup') throw new Error(`DFT method article title mismatch: ${result.title}`);
  if (!result.hasArticle || result.hasPlaceholder) throw new Error('reviewed DFT method narrative was not rendered');
  if (result.hasContract) throw new Error('reviewed DFT method article exposes a fixed contract');
  if (result.copyEnhancements !== 1 || result.unexpectedScripts !== 0) {
    throw new Error(`DFT method article exposes ${result.copyEnhancements} copy enhancements and ${result.unexpectedScripts} unexpected scripts`);
  }
  if (result.copyableBlocks !== 0 || result.copyButtons !== 0) {
    throw new Error(`DFT method article renders ${result.copyButtons} Copy controls for ${result.copyableBlocks} copyable code blocks`);
  }
  if (result.overflow) throw new Error(`DFT method article overflows at ${expectedWidth}px`);
  if (result.headings.length < 16) throw new Error(`DFT method article has only ${result.headings.length} natural topic sections`);
  for (const contract of requiredContracts) {
    for (const phrase of contract.phrases) {
      if (!result.text.includes(phrase)) throw new Error(`DFT method article is missing ${contract.name}: ${phrase}`);
    }
  }
  for (const domain of requiredDomains) {
    if (!result.links.some((link) => link.includes(domain))) throw new Error(`DFT method article is missing source domain ${domain}`);
  }
  return result;
}

async function inspectPseudopotentialGuide(page, expectedWidth) {
  const result = await page.evaluate(() => ({
    title: document.querySelector('h1')?.textContent?.trim(),
    text: document.body.innerText,
    copyableBlocks: document.querySelectorAll('pre[data-copyable] > code, pre[data-language="bash"] > code, pre[data-language="shell"] > code, pre[data-language="sh"] > code, pre[data-language="python"] > code, pre[data-language="qe"] > code, pre[data-language="slurm"] > code, pre[data-language="json"] > code, pre[data-language="plaintext"] > code, pre[data-language="gnuplot"] > code').length,
    copyButtons: document.querySelectorAll('.copy-code-button').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (result.title !== 'Select, Download, and Record Pseudopotentials') throw new Error(`pseudopotential guide title mismatch: ${result.title}`);
  for (const phrase of [
    'Choose a tested family in the provider interface',
    'Download the exact file',
    'sha256sum "downloads/$PSEUDO_FILE"',
    'Create the receipt',
    'Put the exact file into a QE input',
    'Decide whether to continue',
    'Advanced branch: generate a pseudopotential',
    'Software bridges',
  ]) {
    if (!result.text.includes(phrase)) throw new Error(`pseudopotential guide is missing ${phrase}`);
  }
  if (result.copyableBlocks < 6 || result.copyButtons !== result.copyableBlocks) {
    throw new Error(`pseudopotential guide renders ${result.copyButtons} Copy controls for ${result.copyableBlocks} executable/input blocks`);
  }
  if (result.overflow) throw new Error(`pseudopotential guide overflows at ${expectedWidth}px`);
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
  if (response?.status() !== 200) throw new Error(`DFT method desktop route returned ${response?.status()}`);
  const desktop = await inspect(page, 1440);
  response = await page.goto(`${base}${pseudopotentialRoute}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`pseudopotential desktop route returned ${response?.status()}`);
  await inspectPseudopotentialGuide(page, 1440);

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`DFT method mobile route returned ${response?.status()}`);
  await inspect(page, 390);
  response = await page.goto(`${base}${pseudopotentialRoute}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`pseudopotential mobile route returned ${response?.status()}`);
  await inspectPseudopotentialGuide(page, 390);

  const noJsPage = await browser.newPage();
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  response = await noJsPage.goto(`${base}${route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`DFT method no-JavaScript route returned ${response?.status()}`);
  const noJsText = await noJsPage.$eval('body', (body) => body.innerText);
  for (const phrase of [
    'This task establishes a versioned method identity and a defensible starting setup.',
    'Select, Download, and Record Pseudopotentials',
    'A successful exit establishes neither methodological suitability nor numerical convergence.',
    'Sources and methods',
  ]) {
    if (!noJsText.includes(phrase)) throw new Error(`DFT method no-JavaScript page is missing ${phrase}`);
  }
  response = await noJsPage.goto(`${base}${pseudopotentialRoute}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`pseudopotential no-JavaScript route returned ${response?.status()}`);
  const noJsPseudopotentialText = await noJsPage.$eval('body', (body) => body.innerText);
  for (const phrase of ['sha256sum "downloads/$PSEUDO_FILE"', 'Create the receipt', 'Software bridges']) {
    if (!noJsPseudopotentialText.includes(phrase)) throw new Error(`pseudopotential no-JavaScript page is missing ${phrase}`);
  }

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}${route}`, { waitUntil: 'load' });
    await captureStablePage(page, join(artifactDirectory, 'topic-choose-dft-method-setup-desktop.png'));
    await writeFile(join(artifactDirectory, 'reviewed-method-setup-summary.json'), `${JSON.stringify({
      site_url: base,
      route,
      natural_sections: desktop.headings.length,
      source_links: desktop.links.length,
      desktop_width: 1440,
      mobile_width: 390,
      no_javascript: true,
      fixed_contract: false,
      baseline_kept_separate_from_observable_convergence: desktop.text.includes('accepts settings only against a declared observable and tolerance'),
    }, null, 2)}\n`);
  }

  console.log(`Reviewed DFT method smoke passed: concise method overview plus copy-ready pseudopotential selection/download/receipt guide, baseline convergence boundary, ${desktop.headings.length} topic sections, rendered source links, 1440px and 390px no-overflow, and no-JavaScript reading.`);
} finally {
  await browser.close();
}

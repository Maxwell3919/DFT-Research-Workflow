import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const topicRoute = '/operations/band-structure/';
const guides = [
  { route: `${topicRoute}guides/build-reciprocal-path-ledger/`, title: 'Build a Reciprocal-Path Ledger Before Plotting Bands', phrase: 'Execution verifies reciprocal-coordinate conversion' },
  { route: `${topicRoute}guides/compare-band-path-and-full-zone-extrema/`, title: 'Compare a Band Path with a Full-Zone Extremum Search', phrase: 'Execution verifies a deterministic comparison' },
];
const topicPhrases = [
  'A path is a visual cut, not a full-zone search',
  'Choose an energy reference that survives comparison',
  'Interpolation is an approximation with a validation task',
  'Gap labels require their own definitions',
  'What this topic establishes',
];

async function loadMedia(page) {
  const loaded = await page.$eval('.guide-media img', async (image) => {
    image.loading = 'eager';
    image.scrollIntoView({ block: 'center' });
    try { await image.decode(); } catch { return false; }
    return image.complete && image.naturalWidth > 0;
  });
  if (!loaded) throw new Error('band-structure guide media could not be decoded');
}

async function inspectTopic(page, width) {
  const response = await page.goto(`${base}${topicRoute}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`band-structure topic returned ${response?.status()}`);
  const result = await page.evaluate(() => ({
    language: document.documentElement.lang,
    title: document.querySelector('h1')?.textContent?.trim(),
    text: document.body.innerText,
    cards: document.querySelectorAll('.practical-card-list li').length,
    links: [...document.querySelectorAll('.practical-card-list a')].map((link) => link.href),
    headings: document.querySelectorAll('.article-content h2').length,
    scripts: document.querySelectorAll('script').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (result.language !== 'en' || result.title !== 'Band Structure') throw new Error(`band-structure identity mismatch: ${result.title}`);
  if (result.headings !== 12 || result.cards !== 2 || result.scripts !== 0 || result.overflow) throw new Error(`band-structure topic layout or content mismatch at ${width}px`);
  for (const phrase of topicPhrases) if (!result.text.includes(phrase)) throw new Error(`band-structure topic missing ${phrase}`);
  for (const guide of guides) if (!result.links.includes(`${base}${guide.route}`)) throw new Error(`band-structure topic missing ${guide.route}`);
}

async function inspectGuide(page, guide, width) {
  const response = await page.goto(`${base}${guide.route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`${guide.route} returned ${response?.status()}`);
  await loadMedia(page);
  const result = await page.evaluate(() => ({
    language: document.documentElement.lang,
    title: document.querySelector('h1')?.textContent?.trim(),
    text: document.body.innerText,
    image: (() => {
      const image = document.querySelector('.guide-media img');
      return image ? { alt: image.alt, complete: image.complete, naturalWidth: image.naturalWidth } : null;
    })(),
    scripts: document.querySelectorAll('script').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (result.language !== 'en' || result.title !== guide.title || !result.text.includes(guide.phrase)) throw new Error(`${guide.route} content mismatch`);
  if (!result.image?.alt || !result.image.complete || !result.image.naturalWidth || result.scripts !== 0 || result.overflow) throw new Error(`${guide.route} media, static boundary, or ${width}px layout failed`);
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await inspectTopic(page, 1440);
  for (const guide of guides) await inspectGuide(page, guide, 1440);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await inspectTopic(page, 390);
  for (const guide of guides) await inspectGuide(page, guide, 390);

  const noJs = await browser.newPage();
  await noJs.setCacheEnabled(false);
  await noJs.setJavaScriptEnabled(false);
  const response = await noJs.goto(`${base}${topicRoute}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`band-structure no-JavaScript returned ${response?.status()}`);
  const text = await noJs.$eval('body', (body) => body.innerText);
  for (const phrase of ['A path is a visual cut, not a full-zone search', 'Gap labels require their own definitions', 'What this topic establishes']) if (!text.includes(phrase)) throw new Error(`band-structure no-JavaScript missing ${phrase}`);
  console.log('Reviewed band-structure smoke passed: topic and 2 guides, source-linked original media, 1440px/390px no-overflow, and no-JavaScript reading.');
} finally {
  await browser.close();
}

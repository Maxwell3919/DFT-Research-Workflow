import { readFile, readdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
import navigation from '../workflow/contextual-navigation.json' with { type: 'json' };

const root = new URL('../', import.meta.url);
const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const supportPaths = new Map([
  ['troubleshooting', '/operations/troubleshooting/'],
  ['software-bridge', '/operations/software-bridge/'],
]);

function frontmatterValue(source, key) {
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)?.[1] ?? '';
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return frontmatter.match(new RegExp(`^${escapedKey}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? '';
}

const guideBySlug = new Map();
const guideDirectory = new URL('src/content/practical-guides/', root);
for (const file of (await readdir(guideDirectory)).filter((name) => name.endsWith('.md'))) {
  const source = await readFile(new URL(`src/content/practical-guides/${file}`, root), 'utf8');
  const guide = {
    guide_slug: frontmatterValue(source, 'guide_slug'),
    topic_slug: frontmatterValue(source, 'topic_slug'),
    kind: frontmatterValue(source, 'kind'),
  };
  guideBySlug.set(guide.guide_slug, guide);
}

function sourceKey(source) {
  return source.kind === 'practical' ? `practical:${source.guide_slug}` : `${source.kind}:${source.slug}`;
}

function sourceRoute(source) {
  if (source.kind === 'topic') return `/operations/${source.slug}/`;
  if (source.kind === 'tool') return `/tools/${source.slug}/`;
  const guide = guideBySlug.get(source.guide_slug);
  const segment = guide.kind === 'worked-example' ? 'examples' : guide.kind === 'visual-note' ? 'notes' : 'guides';
  return `/operations/${guide.topic_slug}/${segment}/${guide.guide_slug}/`;
}

function targetRoute(target) {
  if (target.kind === 'topic') return `/operations/${target.slug}/`;
  const route = supportPaths.get(target.route);
  return target.anchor ? `${route}#${target.anchor}` : route;
}

const expectedByRoute = new Map(navigation.pages.map((page) => [sourceRoute(page.source), {
  source: sourceKey(page.source),
  links: page.links.map((link) => ({
    relation: link.relation,
    href: `${base}${targetRoute(link.target)}`,
    title: link.title,
  })),
}]));
const routes = new Set(['/operations/']);
for (const page of navigation.pages) {
  routes.add(sourceRoute(page.source));
  for (const link of page.links) routes.add(targetRoute(link.target).split('#')[0]);
}
const internalTargets = [...routes].map((route) => `${base}${route}`);
const anchorTargets = [...new Set(navigation.pages.flatMap((page) => page.links)
  .filter((link) => link.target.kind === 'support' && link.target.anchor)
  .map((link) => `${base}${targetRoute(link.target)}`))];

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_BIN ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

async function inspect(page, route, width) {
  const expected = expectedByRoute.get(route);
  const state = await page.evaluate(() => {
    const nav = document.querySelector('[data-contextual-navigation]');
    const support = document.querySelector('[data-workflow-support-links]');
    const viewportWidth = document.documentElement.clientWidth;
    const escaping = [...document.querySelectorAll('[data-contextual-navigation], [data-contextual-link], [data-workflow-support-links]')]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > viewportWidth + 1);
      })
      .map((element) => element.textContent?.trim().slice(0, 60));
    return {
      innerWidth: window.innerWidth,
      documentOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      escaping,
      scripts: document.querySelectorAll('script:not([data-copy-enhancement])').length,
      islands: document.querySelectorAll('astro-island').length,
      contextualBlocks: document.querySelectorAll('[data-contextual-navigation]').length,
      source: nav?.getAttribute('data-contextual-source'),
      contextualText: nav?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      boundaryCount: nav?.querySelectorAll('.contextual-boundary').length ?? 0,
      links: [...(nav?.querySelectorAll('[data-contextual-link]') ?? [])].map((item) => ({
        relation: item.getAttribute('data-contextual-relation'),
        href: item.querySelector('a')?.href,
        title: item.querySelector('a')?.textContent?.trim(),
      })),
      supportLinks: [...(support?.querySelectorAll('a') ?? [])].map((link) => link.href),
    };
  });

  if (state.innerWidth !== width) throw new Error(`${route}: requested ${width}px but rendered ${state.innerWidth}px`);
  if (state.documentOverflow || state.escaping.length > 0) throw new Error(`${route}: overflow at ${width}px ${state.escaping.join('; ')}`);
  if (state.scripts !== 0 || state.islands !== 0) throw new Error(`${route}: contextual route is not static`);
  if (expected) {
    if (state.contextualBlocks !== 1 || state.source !== expected.source) throw new Error(`${route}: contextual source mismatch`);
    if (state.links.length > 3 || JSON.stringify(state.links) !== JSON.stringify(expected.links)) throw new Error(`${route}: contextual links differ from registry`);
    if (state.boundaryCount !== 0 || state.contextualText.includes(navigation.boundary)) throw new Error(`${route}: contextual navigation exposes internal taxonomy-governance copy`);
  } else if (state.contextualBlocks !== 0) {
    throw new Error(`${route}: unlisted route renders contextual navigation`);
  }
  if (route === '/operations/') {
    const expectedSupport = [
      `${base}/operations/troubleshooting/`,
      `${base}/operations/software-bridge/`,
      `${base}/tools/`,
    ];
    if (JSON.stringify(state.supportLinks) !== JSON.stringify(expectedSupport)) throw new Error('Research Workflow support sentence does not expose all three support routes');
  }
}

try {
  for (const mode of [
    { javaScriptEnabled: true, width: 1440 },
    { javaScriptEnabled: true, width: 390 },
    { javaScriptEnabled: false, width: 390 },
  ]) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setJavaScriptEnabled(mode.javaScriptEnabled);
    await page.setViewport({ width: mode.width, height: mode.width === 390 ? 844 : 1000, deviceScaleFactor: 1 });
    for (const route of routes) {
      const response = await page.goto(`${base}${route}`, { waitUntil: 'load' });
      if (response?.status() !== 200) throw new Error(`${route}: HTTP ${response?.status()} at ${mode.width}px`);
      await inspect(page, route, mode.width);
    }
    await page.close();
  }

  const httpResults = await Promise.all(internalTargets.map(async (url) => ({ url, status: (await fetch(url)).status })));
  const failedHttp = httpResults.filter((result) => result.status !== 200);
  if (failedHttp.length > 0) throw new Error(`Contextual internal HTTP failed: ${JSON.stringify(failedHttp)}`);

  const anchorPage = await browser.newPage();
  await anchorPage.setJavaScriptEnabled(false);
  await anchorPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  for (const url of anchorTargets) {
    const target = new URL(url);
    await anchorPage.goto(`${target.origin}${target.pathname}${target.search}`, { waitUntil: 'load' });
    const anchor = target.hash;
    if (!anchor) throw new Error(`Stable support anchor is missing from the URL: ${url}`);
    await anchorPage.evaluate((hash) => { window.location.hash = hash; }, anchor);
    if (!(await anchorPage.$(anchor))) throw new Error(`Stable support anchor failed: ${url}`);
  }
  await anchorPage.close();

  console.log(`Contextual navigation smoke passed: ${routes.size} listed routes, ${navigation.pages.length} source pages, ${internalTargets.length} internal HTTP targets, ${anchorTargets.length} support anchors, 1440/390px containment, and 390px no-JavaScript parity.`);
} finally {
  await browser.close();
}

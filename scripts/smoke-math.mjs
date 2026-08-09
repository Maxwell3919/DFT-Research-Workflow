import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const base = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/, '');
const executablePath = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const artifactDirectory = process.env.SMOKE_ARTIFACT_DIR;
const widths = [1440, 1024, 768, 430, 390, 360];
const routes = [
  { name: 'convex hull', path: '/operations/compositional-phase-stability-and-convex-hulls/', phrase: 'Build and inspect the lower envelope', requiredMathFragments: ['\\min_{\\{\\lambda_j\\}}', '\\lambda_j\\ge0', '\\sum_{j\\in\\mathcal S}\\lambda_j=1', '\\sum_{j\\in\\mathcal S}\\lambda_j\\mathbf{x}_j=\\mathbf{x}', 'G_k-G_{\\mathrm{hull}}^{\\mathcal S}(\\mathbf{x}_k)'] },
  { name: 'B convergence guide', path: '/operations/test-numerical-convergence/guides/converge-basis-cutoffs-and-grids/', phrase: 'Generate and inspect the declared input series', requiredPhrases: ['Run each input in an isolated directory'], requiresCode: true, requiresMath: false },
  { name: 'B numerical convergence', path: '/operations/test-numerical-convergence/', phrase: 'Define tolerances in the units of the decision' },
  { name: 'dielectric response', path: '/operations/dielectric-response-and-born-effective-charges/', phrase: 'Born effective charge' },
  { name: 'electron-phonon coupling', path: '/operations/electron-phonon-coupling/', phrase: 'Eliashberg spectral function' },
];

async function inspect(page, route, width, noJavaScript = false) {
  const response = await page.goto(base + route.path, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(route.name + ' ' + width + 'px returned ' + response?.status());
  const result = await page.evaluate(({ phrase, requiredPhrases, requiresCode }) => {
    const article = document.querySelector('.article-content');
    const displays = [...document.querySelectorAll('.article-content .katex-display')];
    const codeBlocks = [...document.querySelectorAll('.article-content pre')];
    const bodyText = document.body.innerText;
    const displayChecks = displays.map((display) => {
      const rect = display.getBoundingClientRect();
      const style = getComputedStyle(display);
      const block = display.closest('p') ?? display;
      const blockRect = block.getBoundingClientRect();
      const previous = block.previousElementSibling?.getBoundingClientRect();
      const next = block.nextElementSibling?.getBoundingClientRect();
      return {
        insideViewport: rect.left >= -1 && rect.right <= document.documentElement.clientWidth + 1,
        localScroll: display.scrollWidth > display.clientWidth + 1,
        localOverflowEnabled: ['auto', 'scroll'].includes(style.overflowX),
        transparent: style.backgroundColor === 'rgba(0, 0, 0, 0)',
        borderless: parseFloat(style.borderTopWidth) === 0 && parseFloat(style.borderRightWidth) === 0 && parseFloat(style.borderBottomWidth) === 0 && parseFloat(style.borderLeftWidth) === 0,
        previousCollision: Boolean(previous && previous.bottom > blockRect.top + 1),
        nextCollision: Boolean(next && blockRect.bottom > next.top + 1),
      };
    });
    const firstCodeStyle = codeBlocks[0] ? getComputedStyle(codeBlocks[0]) : null;
    return {
      hasArticle: Boolean(article),
      phrase: [phrase, ...(requiredPhrases ?? [])].every((requiredPhrase) => bodyText.includes(requiredPhrase)),
      width: window.innerWidth,
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      katex: document.querySelectorAll('.article-content .katex').length,
      displays: displays.length,
      mathml: document.querySelectorAll('.article-content .katex-mathml math').length,
      html: document.querySelectorAll('.article-content .katex-html').length,
      scripts: [...document.scripts].filter((script) => /katex|mathjax/i.test(script.src || script.textContent || '')).length,
      mathInCode: document.querySelectorAll('.article-content pre .katex, .article-content code .katex').length,
      visibleLatex: /\$\$|\\(?:sum|frac|sqrt|lambda|omega|mathbf|mathrm|partial|nabla|int)\b|\\\(|\\\)/.test(bodyText),
      subOrSup: document.querySelectorAll('.article-content .katex-mathml msub, .article-content .katex-mathml msup, .article-content .katex-mathml msubsup').length,
      codeBlocks: codeBlocks.length,
      mathSource: [...document.querySelectorAll('.article-content .katex-mathml annotation')].map((node) => node.textContent ?? '').join('\n').replace(/\s+/g, ''),
      codeDistinct: !requiresCode || Boolean(firstCodeStyle && !['rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)'].includes(firstCodeStyle.backgroundColor) && /mono/i.test(firstCodeStyle.fontFamily)),
      displayChecks,
    };
  }, { phrase: route.phrase, requiredPhrases: route.requiredPhrases, requiresCode: Boolean(route.requiresCode) });
  for (const fragment of route.requiredMathFragments ?? []) {
    if (!result.mathSource.includes(fragment.replace(/\s+/g, ''))) throw new Error(route.name + ' ' + width + 'px is missing required mathematical definition ' + fragment);
  }
  if (!result.hasArticle || !result.phrase) throw new Error(route.name + ' ' + width + 'px content missing');
  if (result.width !== width) throw new Error(route.name + ': requested ' + width + 'px but browser reports ' + result.width + 'px');
  if (result.documentOverflow) throw new Error(route.name + ' ' + width + 'px has document overflow');
  if (route.requiresMath !== false && (result.katex === 0 || result.displays === 0)) throw new Error(route.name + ' ' + width + 'px has no rendered mathematics');
  if (route.requiresMath !== false && (result.mathml === 0 || result.html === 0 || result.mathml !== result.html)) throw new Error(route.name + ' ' + width + 'px is missing paired MathML/HTML output');
  if (route.requiresMath !== false && result.subOrSup === 0) throw new Error(route.name + ' ' + width + 'px did not render subscript or superscript structure');
  if (result.scripts !== 0) throw new Error(route.name + ' ' + width + 'px loads a client math renderer');
  if (result.mathInCode !== 0) throw new Error(route.name + ' ' + width + 'px renders mathematics inside code');
  if (result.visibleLatex) throw new Error(route.name + ' ' + width + 'px exposes LaTeX source');
  if (route.requiresCode && (result.codeBlocks === 0 || !result.codeDistinct)) throw new Error(route.name + ' ' + width + 'px lost terminal/input/output code styling');
  for (const check of result.displayChecks) {
    if (!check.insideViewport || !check.localOverflowEnabled || !check.transparent || !check.borderless || check.previousCollision || check.nextCollision) throw new Error(route.name + ' ' + width + 'px has unsafe math layout: ' + JSON.stringify(check));
  }
  return { ...result, noJavaScript };
}

async function capture(page, path) {
  const dimensions = await page.evaluate(() => ({ width: Math.ceil(document.documentElement.scrollWidth), height: Math.ceil(document.documentElement.scrollHeight) }));
  await page.screenshot({ path, captureBeyondViewport: true, clip: { x: 0, y: 0, ...dimensions } });
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const observations = [];
try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  for (const width of widths) {
    await page.setViewport({ width, height: width <= 430 ? 844 : 1000, deviceScaleFactor: 1 });
    for (const route of routes) observations.push(await inspect(page, route, width));
  }
  const noJs = await browser.newPage();
  await noJs.setCacheEnabled(false);
  await noJs.setJavaScriptEnabled(false);
  await noJs.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  for (const route of routes) observations.push(await inspect(noJs, route, 390, true));
  await noJs.close();
  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(base + routes[0].path, { waitUntil: 'load' });
    await capture(page, join(artifactDirectory, 'math-convex-hull-desktop.png'));
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.goto(base + routes[3].path, { waitUntil: 'load' });
    await capture(page, join(artifactDirectory, 'math-epc-mobile.png'));
    await writeFile(join(artifactDirectory, 'math-smoke-summary.json'), JSON.stringify({
      site_url: base,
      routes: routes.map((route) => route.path),
      widths,
      checks: observations.length,
      no_javascript_checks: routes.length,
      document_overflow: 0,
      collisions: 0,
      visible_latex: 0,
      client_math_renderers: 0,
    }, null, 2) + '\n');
  }
  const localScrolls = observations.reduce((sum, observation) => sum + observation.displayChecks.filter((check) => check.localScroll).length, 0);
  console.log('Math browser smoke passed: ' + observations.length + ' checks across ' + routes.length + ' representative routes at ' + widths.join(', ') + 'px plus no-JavaScript 390px; static KaTeX HTML+MathML, subscripts/superscripts, code separation, zero visible LaTeX, zero collisions, zero document overflow, and ' + localScrolls + ' locally scrollable long equations.');
} finally {
  await browser.close();
}

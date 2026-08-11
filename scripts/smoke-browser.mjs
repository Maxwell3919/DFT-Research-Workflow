import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
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

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  return Object.fromEntries(match[1].split('\n').filter(Boolean).map((line) => {
    const [key, ...value] = line.split(':');
    return [key.trim(), value.join(':').trim().replace(/^['"]|['"]$/g, '')];
  }));
}

const topicNarrativeStatuses = new Map();
for (const file of (await readdir(new URL('src/content/topics/', root))).filter((name) => name.endsWith('.md'))) {
  const source = await readFile(new URL(`src/content/topics/${file}`, root), 'utf8');
  const data = parseFrontmatter(source);
  if (data.topic_slug) topicNarrativeStatuses.set(data.topic_slug, data.status);
}

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
  { route: '/workflows/', status: 200, name: 'Worked Workflows directory' },
  { route: '/troubleshooting/', status: 200, name: 'Troubleshooting' },
  { route: '/workflows/silicon-ground-state-electronic-structure/', status: 200, name: 'Silicon Worked Workflow' },
  { route: '/workflows/aluminium-metallic-electronic-structure/', status: 200, name: 'Aluminium Worked Workflow' },
  { route: '/recipes/', status: 200, name: 'Recipes migration surface' },
  { route: '/recipes/bulk-structure-and-bands/', status: 200, name: 'Legacy recipe migration surface' },
  { route: '/framework/', status: 200, name: 'Framework migration surface' },
  ...frameworkSlugs.map((slug) => ({ route: `/framework/${slug}/`, status: 200, name: slug })),
  ...representativeTransitionalSlugs.map((slug) => ({ route: `/operations/${slug}/`, status: 200, name: slug })),
  ...representativeLegacySlugs.map((slug) => ({ route: `/operations/${slug}/`, status: 200, name: slug })),
  { route: '/missing-page-for-smoke/', status: 404, name: '404' },
];
const responsiveWidths = [360, 390, 430, 600, 768, 900, 1024, 1280, 1440];
const responsiveTargets = [
  { route: '/', name: 'Home' },
  { route: '/operations/', name: 'Research Workflow' },
];
const observableExampleSlugs = [
  'relative-and-formation-energies',
  'optimize-structure',
  'harmonic-phonons',
  'fermi-surface-and-full-brillouin-zone-analysis',
  'electron-phonon-coupling',
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

async function waitForRecipeRedirect(page) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline && !new URL(page.url()).pathname.includes('/workflows/')) await delay(50);
  if (!new URL(page.url()).pathname.includes('/workflows/')) throw new Error(`recipe redirect did not reach Worked Workflows: ${page.url()}`);
  await page.waitForSelector('body', { timeout: 5000 });
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
  if (JSON.stringify(observation.nav) !== JSON.stringify(['Home', 'Research Workflow', 'Worked Workflows', 'Tools & Resources', 'Troubleshooting'])) throw new Error(`navigation mismatch: ${JSON.stringify(observation.nav)}`);
  if (observation.background !== 'rgb(255, 255, 255)') throw new Error(`background is not white: ${observation.background}`);
  if (!/Iowan Old Style|Palatino|Book Antiqua|Georgia|Times New Roman|serif/i.test(observation.fontFamily)) throw new Error(`serif reading stack missing: ${observation.fontFamily}`);
  if (expectedStatus === 404 && !observation.text.includes('Page Not Found')) throw new Error('custom 404 content missing');
  return observation;
}

async function inspectResponsiveLayout(page, target, width) {
  await page.setViewport({ width, height: Math.max(900, Math.round(width * 0.75)), deviceScaleFactor: 1 });
  const response = await page.goto(`${base}${target.route}`, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(`${target.name} at ${width}px: HTTP ${response?.status() ?? 'no response'}`);

  const observation = await page.evaluate(() => {
    const tolerance = 1;
    const viewportWidth = document.documentElement.clientWidth;
    const describe = (element) => {
      const id = element.id ? `#${element.id}` : '';
      const classes = [...element.classList].slice(0, 3).map((name) => `.${name}`).join('');
      return `${element.tagName.toLowerCase()}${id}${classes}`;
    };
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > tolerance && rect.height > tolerance;
    };
    const documentOverflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - viewportWidth;
    const invalidPreOverflow = [];
    let localPreOverflow = 0;

    for (const pre of document.querySelectorAll('pre')) {
      if (!visible(pre)) continue;
      const rect = pre.getBoundingClientRect();
      const style = getComputedStyle(pre);
      if (rect.left < -tolerance || rect.right > viewportWidth + tolerance) {
        invalidPreOverflow.push(`${describe(pre)} leaves the viewport`);
      }
      if (pre.scrollWidth > pre.clientWidth + tolerance) {
        localPreOverflow += 1;
        if (!['auto', 'scroll'].includes(style.overflowX)) {
          invalidPreOverflow.push(`${describe(pre)} has unclipped local overflow (${style.overflowX})`);
        }
      }
    }

    const intrinsicOverflow = [];
    for (const element of document.querySelectorAll('.primary-nav, .primary-nav *, main, main *')) {
      if (!(element instanceof HTMLElement) || element.closest('pre') || !visible(element) || element.clientWidth <= tolerance) continue;
      if (element.scrollWidth > element.clientWidth + tolerance) {
        intrinsicOverflow.push(`${describe(element)} ${element.scrollWidth}px > ${element.clientWidth}px`);
      }
    }

    const collisions = [];
    for (const parent of document.querySelectorAll('.primary-nav, main, main *')) {
      if (!(parent instanceof HTMLElement) || parent.closest('pre') || !visible(parent)) continue;
      const parentDisplay = getComputedStyle(parent).display;
      const isFlexOrGrid = parentDisplay.includes('flex') || parentDisplay.includes('grid');
      const children = [...parent.children].filter((child) => {
        if (!(child instanceof HTMLElement) || child.parentElement?.closest('pre') || !visible(child)) return false;
        const display = getComputedStyle(child).display;
        return isFlexOrGrid || !['inline', 'inline-block', 'contents'].includes(display);
      });
      for (let first = 0; first < children.length; first += 1) {
        const firstRect = children[first].getBoundingClientRect();
        for (let second = first + 1; second < children.length; second += 1) {
          const secondRect = children[second].getBoundingClientRect();
          const horizontalOverlap = Math.min(firstRect.right, secondRect.right) - Math.max(firstRect.left, secondRect.left);
          const verticalOverlap = Math.min(firstRect.bottom, secondRect.bottom) - Math.max(firstRect.top, secondRect.top);
          if (horizontalOverlap > tolerance && verticalOverlap > tolerance) {
            collisions.push(`${describe(parent)}: ${describe(children[first])} overlaps ${describe(children[second])}`);
          }
        }
      }
    }

    return {
      innerWidth: window.innerWidth,
      documentOverflow,
      intrinsicOverflow: [...new Set(intrinsicOverflow)].slice(0, 10),
      collisions: [...new Set(collisions)].slice(0, 10),
      invalidPreOverflow,
      localPreOverflow,
    };
  });

  if (observation.innerWidth !== width) throw new Error(`${target.name} requested ${width}px but rendered ${observation.innerWidth}px`);
  if (observation.documentOverflow > 1) throw new Error(`${target.name} at ${width}px has ${observation.documentOverflow}px document overflow`);
  if (observation.intrinsicOverflow.length > 0) throw new Error(`${target.name} at ${width}px has intrinsic overflow: ${observation.intrinsicOverflow.join('; ')}`);
  if (observation.collisions.length > 0) throw new Error(`${target.name} at ${width}px has collisions: ${observation.collisions.join('; ')}`);
  if (observation.invalidPreOverflow.length > 0) throw new Error(`${target.name} at ${width}px has invalid pre overflow: ${observation.invalidPreOverflow.join('; ')}`);
  return observation.localPreOverflow;
}

const deploymentManifest = await waitForDeploymentManifest();
const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });

  for (const target of requiredRoutes) {
    const response = await page.goto(`${base}${target.route}`, { waitUntil: 'load' });
    if (response?.status() !== target.status) throw new Error(`${target.route}: expected HTTP ${target.status}, found ${response?.status() ?? 'no response'}`);
    if (target.route.startsWith('/recipes/')) {
      await waitForRecipeRedirect(page);
    }
    try {
      await inspectPage(page, target.status);
    } catch (error) {
      throw new Error(`${target.route}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  let responsiveChecks = 0;
  let responsiveLocalPreOverflows = 0;
  for (const width of responsiveWidths) {
    for (const target of responsiveTargets) {
      responsiveLocalPreOverflows += await inspectResponsiveLayout(page, target, width);
      responsiveChecks += 1;
    }
  }

  await page.goto(`${base}/operations/`, { waitUntil: 'load' });
  const workflowState = await page.evaluate(() => ({
    text: document.body.innerText,
    topicLinks: [...document.querySelectorAll('.topic-list a')].map((link) => link.getAttribute('href')?.split('/').filter(Boolean).at(-1)),
    observableRows: document.querySelectorAll('[data-research-question]').length,
    observableLinks: [...document.querySelectorAll('[data-research-question-navigator] a')].map((link) => link.getAttribute('href')?.split('/').filter(Boolean).at(-1)),
    transitionalLinks: [...document.querySelectorAll('a[href*="/operations/"]')].filter((link) => {
      const slug = link.getAttribute('href')?.split('/').filter(Boolean).at(-1) ?? '';
      return /^o\d{2}-/.test(slug);
    }).length,
  }));
  for (const section of workflow.sections) {
    if (!workflowState.text.includes(`${section.id} · ${section.title}`)) throw new Error(`Research Workflow is missing ${section.id} · ${section.title}`);
    for (const group of section.groups) {
      if (section.id === 'D' && !workflowState.text.includes(`${group.id} · ${group.title}`)) throw new Error(`Research Workflow is missing ${group.id} · ${group.title}`);
    }
  }
  if (JSON.stringify(workflowState.topicLinks) !== JSON.stringify(topicSlugs)) throw new Error('Research Workflow topic links do not match the registry order');
  if (workflowState.observableRows !== 10) throw new Error(`Research Question Navigator exposes ${workflowState.observableRows}/10 question routes`);
  for (const slug of observableExampleSlugs) {
    if (!workflowState.observableLinks.includes(slug)) throw new Error(`Research Workflow observable examples are missing ${slug}`);
  }
  if (workflowState.transitionalLinks !== 0) throw new Error('Research Workflow exposes transitional numbered routes');
  if (/Core Operations|O01|O24|Operation 00/.test(workflowState.text)) throw new Error('Research Workflow exposes a superseded numbered taxonomy');

  for (const slug of representativeTopicSlugs) {
    await page.goto(`${base}/operations/${slug}/`, { waitUntil: 'load' });
    const state = await page.evaluate(() => ({
      transitional: document.body.innerText.includes('Transitional route'),
      fixedContract: document.querySelector('.operation-contract'),
      articleContent: document.querySelector('.article-content'),
      hasStableNotice: document.body.innerText.includes('This stable destination is reserved for a later reviewed content batch.'),
    }));
    const hasNarrative = topicNarrativeStatuses.has(slug);
    if (state.transitional || state.fixedContract) throw new Error(`${slug}: invalid current topic route`);
    if (hasNarrative && (!state.articleContent || state.hasStableNotice)) throw new Error(`${slug}: bound topic narrative was not rendered`);
    if (!hasNarrative && (state.articleContent || !state.hasStableNotice)) throw new Error(`${slug}: neutral destination state mismatch`);
  }

  const cifAssetUrl = `${base}/examples/cif/silicon-cod-9013102-expanded.cif`;
  const canonicalViewerCifUrl = 'https://maxwell3919.github.io/DFT-Research-Workflow/examples/cif/silicon-cod-9013102-expanded.cif';

  await page.goto(`${base}/operations/obtain-material-structure/`, { waitUntil: 'load' });
  const reviewedArticle = await page.evaluate(() => ({
    text: document.body.innerText,
    links: [...document.querySelectorAll('.article-content a')].map((link) => link.href),
    headingCount: document.querySelectorAll('.article-content h2').length,
  }));
  for (const phrase of [
    'Begin with the human source search',
    'Compare source records',
    'Manual route: download and inspect the CIF as text',
    'Manual route: inspect the structure visually',
    'Numerical and symmetry checks',
    'Optional automation: retrieve and preserve the CIF',
    'Decide whether to continue',
    'COD Silicon worked guide',
    'Sources and standards',
  ]) {
    if (!reviewedArticle.text.includes(phrase)) throw new Error(`Obtain a Material Structure is missing ${phrase}`);
  }
  if (reviewedArticle.headingCount < 8) throw new Error('Obtain a Material Structure lost its operation-first sections');
  if (!reviewedArticle.links.some((link) => link.includes('/operations/obtain-material-structure/examples/inspect-cod-silicon-record/'))) {
    throw new Error('Obtain a Material Structure lost its concrete COD practical route');
  }
  for (const domain of ['iucr.org', 'docs.materialsproject.org', 'crystallography.net', 'molstar.org', 'spglib.readthedocs.io']) {
    if (!reviewedArticle.links.some((link) => link.includes(domain))) throw new Error(`Obtain a Material Structure is missing source domain ${domain}`);
  }

  await page.goto(`${base}/operations/obtain-material-structure/examples/inspect-cod-silicon-record/`, { waitUntil: 'load' });
  const codGuide = await page.evaluate(() => ({
    text: document.body.innerText,
    codeBlocks: document.querySelectorAll('.article-content pre').length,
    commandBlocks: document.querySelectorAll('.article-content pre[data-language="bash"]').length,
    copyButtons: document.querySelectorAll('.article-content .copy-code-button').length,
  }));
  for (const phrase of [
    'Record ID: COD 9013102',
    'mkdir -p structures/si-cod-9013102',
    'sha256sum source/9013102.cif',
    'ase convert -i cif -o extxyz',
    'Decide pass, stop, or rebuild',
    'Optional automation: replay the recorded COD case',
  ]) {
    if (!codGuide.text.includes(phrase)) throw new Error(`COD Silicon practical guide is missing ${phrase}`);
  }
  if (codGuide.codeBlocks < 5 || codGuide.commandBlocks < 4 || codGuide.copyButtons !== codGuide.commandBlocks) {
    throw new Error('COD Silicon practical guide lost copy-ready terminal or record blocks');
  }

  const cifAssetResponse = await fetch(`${cifAssetUrl}?smoke=${Date.now()}`, { cache: 'no-store' });
  if (!cifAssetResponse.ok) throw new Error(`silicon teaching CIF returned HTTP ${cifAssetResponse.status}`);
  const cifAssetText = await cifAssetResponse.text();
  if (!cifAssetText.includes('data_silicon_cod_9013102_teaching_snapshot')) throw new Error('silicon teaching CIF data block missing');
  if (!cifAssetText.includes('not the byte-for-byte COD download')) throw new Error('silicon teaching CIF provenance boundary missing');
  if ((cifAssetText.match(/^Si\d+\s+Si\s/gm) ?? []).length !== 8) throw new Error('silicon teaching CIF does not contain eight expanded Si sites');

  const molstarHref = reviewedArticle.links.find((href) => href.startsWith('https://molstar.org/viewer/'));
  if (!molstarHref) throw new Error('Obtain a Material Structure is missing its explicit Mol* browser route');
  const molstarUrl = new URL(molstarHref);
  if (molstarUrl.searchParams.get('url-format') !== 'cifCore') throw new Error(`Mol* viewer format mismatch: ${molstarUrl.searchParams.get('url-format')}`);
  if (molstarUrl.searchParams.get('url') !== canonicalViewerCifUrl) throw new Error(`Mol* structure URL mismatch: ${molstarUrl.searchParams.get('url')}`);

  await page.goto(`${base}/workflows/`, { waitUntil: 'load' });
  const workflowLinks = await page.$$eval('.directory-list a', (links) => links.length);
  if (workflowLinks !== 2) throw new Error(`Worked Workflows directory exposes ${workflowLinks}/2 published cases`);
  const readerRouteRecipes = JSON.parse(await readFile(new URL('../recipes/index.json', import.meta.url), 'utf8'));
  const expectedWorkedWorkflowSlugs = ['silicon-ground-state-electronic-structure', 'aluminium-metallic-electronic-structure'];
  const readerRouteWorkflows = expectedWorkedWorkflowSlugs.map((slug) => {
    const entry = readerRouteRecipes.workflows.find((workflowEntry) => workflowEntry.slug === slug);
    if (!entry) throw new Error(`recipes/index.json is missing ${slug}`);
    return entry;
  });
  const inspectWorkedWorkflow = async (targetPage, entry, mode, expectedWidth = null) => {
    const response = await targetPage.goto(`${base}/workflows/${entry.slug}/`, { waitUntil: 'load' });
    if (response?.status() !== 200) throw new Error(`${mode} ${entry.slug}: HTTP ${response?.status() ?? 'no response'}`);
    const state = await targetPage.evaluate(() => {
      const split = (value) => value ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
      return {
        text: document.body.innerText,
        allText: document.body.textContent ?? '',
        figures: document.querySelectorAll('figure img[src^="data:image/png;base64,"]').length,
        commands: document.querySelectorAll('pre code').length,
        humanSteps: document.querySelectorAll('[data-human-workflow-step]').length,
        stageFigures: document.querySelectorAll('[data-reader-stage] [data-stage-figure]').length,
        evidenceDetails: document.querySelectorAll('[data-stage-evidence-details]').length,
        reproductionSections: document.querySelectorAll('[data-reproduction-section]').length,
        reproducibilityAppendixClosed: document.querySelector('[data-reproducibility-appendix]')?.open === false,
        routeMarkers: [...document.querySelectorAll('[data-reader-route]')].map((element) => element.getAttribute('data-reader-route')),
        historyKinds: [...document.querySelectorAll('[data-history-kind]')].map((element) => element.getAttribute('data-history-kind')),
        stages: [...document.querySelectorAll('[data-reader-stage]')].map((element) => ({
          id: element.getAttribute('data-reader-stage'),
          topic_slugs: split(element.getAttribute('data-topic-slugs')),
          case_files: split(element.getAttribute('data-case-files')),
          execution_route_ids: split(element.getAttribute('data-execution-route-ids')),
          command_stages: split(element.getAttribute('data-command-stages')),
          artifact_paths: split(element.getAttribute('data-artifact-paths')),
        })),
        innerWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        invalidPreOverflow: [...document.querySelectorAll('pre')].filter((element) => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).overflowX === 'visible').length,
      };
    });
    const expectedStages = entry.reader_route.stages.map((stage) => ({ id: stage.id, topic_slugs: stage.topic_slugs, case_files: stage.case_files, execution_route_ids: stage.execution_route_ids, command_stages: stage.command_stages, artifact_paths: stage.artifact_paths }));
    if (JSON.stringify(state.routeMarkers) !== JSON.stringify([entry.slug])) throw new Error(`${mode} ${entry.slug}: reader route marker mismatch`);
    if (JSON.stringify(state.stages) !== JSON.stringify(expectedStages)) throw new Error(`${mode} ${entry.slug}: reader route order/reference mismatch`);
    if (!state.historyKinds.includes(entry.history_kind)) throw new Error(`${mode} ${entry.slug}: history_kind mismatch`);
    if (
      state.figures < 1
      || state.commands < 2
      || state.humanSteps !== expectedStages.length
      || state.evidenceDetails !== expectedStages.length
      || state.reproductionSections !== 1
      || !state.reproducibilityAppendixClosed
      || !state.text.includes('Scientific objective and starting object')
      || !state.text.includes('Open the starting sources')
      || !state.text.includes('Follow the calculation')
      || !state.text.includes('Continue when:')
      || !state.text.includes('Reproducibility appendix')
      || !state.text.includes('Observable convergence')
      || !state.text.includes('Current claim boundary:')
    ) {
      throw new Error(`${mode} ${entry.slug}: incomplete human-first workflow rendering`);
    }
    for (const boundary of [entry.evidence_boundary, entry.continuity_boundary, entry.claim_boundary]) if (!state.allText.replace(/\s+/g, ' ').includes(boundary.replace(/\s+/g, ' '))) throw new Error(`${mode} ${entry.slug}: reviewed boundary text is missing`);
    if (expectedWidth !== null && state.innerWidth !== expectedWidth) throw new Error(`${mode} ${entry.slug}: expected ${expectedWidth}px, rendered ${state.innerWidth}px`);
    if (expectedWidth !== null && state.overflow > 1) throw new Error(`${mode} ${entry.slug}: ${state.overflow}px document overflow`);
    if (expectedWidth !== null && state.invalidPreOverflow > 0) throw new Error(`${mode} ${entry.slug}: invalid pre overflow`);
  };
  for (const entry of readerRouteWorkflows) await inspectWorkedWorkflow(page, entry, 'desktop');
  await page.goto(`${base}/recipes/`, { waitUntil: 'load' });
  await waitForRecipeRedirect(page);
  const recipeRedirectText = await page.evaluate(() => document.body.innerText);
  if (!recipeRedirectText.includes('Worked Workflows')) throw new Error('Recipes root did not redirect to Worked Workflows');
  await page.goto(`${base}/framework/`, { waitUntil: 'load' });
  const frameworkLinks = await page.$$eval('.directory-list a', (links) => links.length);
  if (frameworkLinks !== 4) throw new Error(`Framework migration surface exposes ${frameworkLinks}/4 current destinations`);

  await page.goto(`${base}/`, { waitUntil: 'load' });
  await page.focus('.primary-nav a');
  await page.keyboard.press('Tab');
  const keyboardHref = await page.evaluate(() => document.activeElement?.getAttribute('href'));
  if (!keyboardHref?.endsWith('/operations/')) throw new Error(`keyboard navigation mismatch: ${keyboardHref}`);

  const migrationNotice = 'This URL is retained while useful material is migrated into the A–E workflow.';
  for (const slug of [...representativeTransitionalSlugs, ...representativeLegacySlugs]) {
    await page.goto(`${base}/operations/${slug}/`, { waitUntil: 'load' });
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
  await noJsPage.setCacheEnabled(false);
  await noJsPage.setJavaScriptEnabled(false);
  await noJsPage.goto(`${base}/operations/`, { waitUntil: 'load' });
  const noJsTopicLinks = await noJsPage.$$eval('.topic-list a', (links) => links.map((link) => link.getAttribute('href')?.split('/').filter(Boolean).at(-1)));
  if (JSON.stringify(noJsTopicLinks) !== JSON.stringify(topicSlugs)) throw new Error('no-JavaScript Research Workflow topic links are incomplete');
  await noJsPage.goto(`${base}/operations/obtain-material-structure/`, { waitUntil: 'load' });
  const noJsTopicText = await noJsPage.$eval('body', (body) => body.innerText);
  if (!noJsTopicText.includes('A structure file is not yet a computational model.') || !noJsTopicText.includes('Sources and standards')) {
    throw new Error('no-JavaScript reviewed topic page is incomplete');
  }
  for (const entry of readerRouteWorkflows) await inspectWorkedWorkflow(noJsPage, entry, 'no-JavaScript desktop');

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  for (const target of requiredRoutes) {
    const response = await page.goto(`${base}${target.route}`, { waitUntil: 'load' });
    if (response?.status() !== target.status) throw new Error(`mobile ${target.route}: HTTP ${response?.status()}`);
    if (target.route.startsWith('/recipes/')) await waitForRecipeRedirect(page);
    await inspectPage(page, target.status);
  }
  const mobileNoJsPage = await browser.newPage();
  await mobileNoJsPage.setCacheEnabled(false);
  await mobileNoJsPage.setJavaScriptEnabled(false);
  await mobileNoJsPage.emulate({
    name: 'DRW 390px mobile',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; DRW Smoke) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true, isLandscape: false },
  });
  for (const entry of readerRouteWorkflows) await inspectWorkedWorkflow(mobileNoJsPage, entry, 'no-JavaScript mobile', 390);
  await mobileNoJsPage.close();

  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await page.goto(`${base}/operations/`, { waitUntil: 'load' });
    await captureFullPage(page, join(artifactDirectory, 'research-workflow-mobile.png'));
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}/`, { waitUntil: 'load' });
    await captureFullPage(page, join(artifactDirectory, 'home-desktop.png'));
    await page.goto(`${base}/operations/`, { waitUntil: 'load' });
    await captureFullPage(page, join(artifactDirectory, 'research-workflow-desktop.png'));
    await page.goto(`${base}/operations/obtain-material-structure/`, { waitUntil: 'load' });
    await captureFullPage(page, join(artifactDirectory, 'topic-obtain-material-structure-desktop.png'));
    await page.goto(`${base}/operations/o13-solve-an-electronic-state/`, { waitUntil: 'load' });
    await captureFullPage(page, join(artifactDirectory, 'transitional-route-desktop.png'));
  }

  const summary = {
    site_url: base,
    deployment_manifest: deploymentManifest,
    routes: requiredRoutes.length,
    reader_workflow: 'A-E',
    topic_routes_verified_from_registry: true,
    topic_narratives: topicNarrativeStatuses.size,
    reviewed_topic_narratives: [...topicNarrativeStatuses.values()].filter((status) => status === 'reviewed').length,
    target_calculation_groups: 5,
    published_workflows: workflowLinks,
    worked_workflow_reader_routes: readerRouteWorkflows.length,
    worked_workflow_stage_orders_verified: true,
    worked_workflow_reference_bindings_verified: true,
    worked_workflow_boundaries_verified: true,
    no_javascript_worked_workflows: readerRouteWorkflows.length,
    mobile_emulation: true,
    mobile_no_javascript_worked_workflows: readerRouteWorkflows.length,
    framework_migration_destinations: frameworkLinks,
    migration_routes_sampled: representativeTransitionalSlugs.length + representativeLegacySlugs.length,
    fixed_contracts: 0,
    keyboard_navigation: true,
    mobile_width: 390,
    mobile_horizontal_overflow: false,
    no_javascript_workflow: true,
    no_javascript_reviewed_topic: true,
    responsive_widths: responsiveWidths,
    responsive_routes: responsiveTargets.map((target) => target.route),
    responsive_layout_checks: responsiveChecks,
    responsive_collisions: 0,
    responsive_document_overflow: 0,
    responsive_local_pre_overflows: responsiveLocalPreOverflows,
    cif_teaching_snapshot: true,
    cif_viewer_link_verified: true,
    cif_viewer_source: canonicalViewerCifUrl,
    public_language: 'en',
  };
  if (artifactDirectory) await writeFile(join(artifactDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`Browser smoke passed: registry-driven A–E workflow, ${responsiveChecks} Home/Research Workflow responsive layout checks across ${responsiveWidths.join(', ')}px, two human-first Worked Workflows with exact evidence appendices, migration-safe old routes, keyboard navigation, no-JavaScript reading, deployed CIF teaching snapshot, an explicit Mol* browser route, and English-only output${deploymentManifest ? `, manifest ${deploymentManifest.sha}` : ''}.`);
} finally {
  await browser.close();
}

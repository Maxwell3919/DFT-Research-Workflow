import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const topicsDocument = JSON.parse(fs.readFileSync(path.join(root, 'workflow/topics.json'), 'utf8'));
const authorityDocument = JSON.parse(fs.readFileSync(path.join(root, 'sources/topic-authority.json'), 'utf8'));
const baseUrl = (process.env.SITE_URL ?? 'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/$/, '');
const executablePath = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((candidate) => candidate && fs.existsSync(candidate));
if (!executablePath) throw new Error('No Chrome/Chromium executable found');

const topicSlugs = topicsDocument.sections.flatMap((section) =>
  section.groups.flatMap((group) => group.topics.map((topic) => topic.slug)),
);
const representativeSlugs = [
  'obtain-material-structure',
  'choose-dft-method-and-computational-setup',
  'calculate-reference-ground-state',
  'band-structure',
  'document-and-preserve-study',
];
const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const failures = [];

const inspect = async (page, slug, width, label) => {
  await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
  const response = await page.goto(`${baseUrl}/operations/${slug}/`, { waitUntil: 'networkidle0' });
  if (!response || response.status() >= 400) {
    failures.push(`${label}/${slug}: HTTP ${response?.status() ?? 'no response'}`);
    return;
  }
  const result = await page.evaluate(() => {
    const footers = [...document.querySelectorAll('.authoritative-references')];
    const footer = footers[0];
    if (!footer) return { footerCount: 0 };
    const text = footer.textContent ?? '';
    return {
      footerCount: footers.length,
      heading: footer.querySelector('h2')?.textContent?.trim(),
      itemCount: footer.querySelectorAll(':scope > ul > li').length,
      linkCount: footer.querySelectorAll('a[href^="http"]').length,
      roleLabels: [...footer.querySelectorAll(':scope > ul > li > strong')].map((label) => label.textContent?.trim()),
      hasCardUi: Boolean(footer.querySelector('.card, .status, [role="tab"], progress')),
      internalKey: /\b(?:martin|sholl-steckel|giustino)\b/.test(text)
        || [...footer.attributes].some((attribute) => /textbook|authority-key/i.test(attribute.name)),
      overflows: footer.scrollWidth > footer.clientWidth || document.documentElement.scrollWidth > window.innerWidth,
      text,
    };
  });
  if (result.footerCount !== 1) failures.push(`${label}/${slug}: expected one footer, found ${result.footerCount}`);
  if (result.heading !== 'Authoritative references') failures.push(`${label}/${slug}: heading mismatch`);
  if (result.itemCount < 2 || result.itemCount > 3) failures.push(`${label}/${slug}: expected 2-3 items, found ${result.itemCount}`);
  if (result.linkCount < 1 || result.linkCount > 2) failures.push(`${label}/${slug}: expected 1-2 external links, found ${result.linkCount}`);
  if (result.hasCardUi) failures.push(`${label}/${slug}: prohibited card/status/tab/progress UI found`);
  const allowedRoleLabels = new Set(['Official method or implementation source.', 'Method or specialist reference.', 'Deeper theory.', 'Why these sources.']);
  if (result.roleLabels?.some((roleLabel) => !allowedRoleLabels.has(roleLabel))) failures.push(`${label}/${slug}: reader-facing reference role is unclear: ${JSON.stringify(result.roleLabels)}`);
  if (result.internalKey) failures.push(`${label}/${slug}: internal textbook key is reader-visible`);
  if (result.overflows) failures.push(`${label}/${slug}: footer or page overflows at ${width}px`);
  if (slug === 'document-and-preserve-study' && !result.text?.includes('data and metadata standards')) {
    failures.push(`${label}/${slug}: missing explicit no-textbook reason`);
  }
};

try {
  const desktop = await browser.newPage();
  for (const slug of topicSlugs) await inspect(desktop, slug, 1440, 'desktop');
  await desktop.close();
  const mobile = await browser.newPage();
  for (const slug of representativeSlugs) await inspect(mobile, slug, 390, 'mobile');
  await mobile.close();
  const noJs = await browser.newPage();
  await noJs.setJavaScriptEnabled(false);
  for (const slug of representativeSlugs) await inspect(noJs, slug, 390, 'no-js');
  await noJs.close();
} finally {
  await browser.close();
}

if (authorityDocument.entries.length !== 46) failures.push('authority data does not contain 46 entries');
if (failures.length > 0) {
  console.error(`topic-authority smoke failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('topic-authority smoke passed: all 46 desktop footers plus representative A-E mobile and no-JS routes');

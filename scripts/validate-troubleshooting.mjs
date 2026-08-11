import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const validateBuilt = process.argv.includes('--built');
const routeSource = await readFile(new URL('src/pages/operations/troubleshooting.astro', root), 'utf8');
const layoutSource = await readFile(new URL('src/layouts/BaseLayout.astro', root), 'utf8');

for (const marker of [
  'title="Troubleshooting"',
  'current="troubleshooting"',
  '<h1>Troubleshooting</h1>',
]) {
  if (!routeSource.includes(marker)) errors.push(`Troubleshooting scaffold is missing ${marker}`);
}

for (const forbidden of [
  'workflow/troubleshooting.json',
  'data-troubleshooting-index',
  'data-symptom-record',
  '<h2',
  '<section',
  '<article',
  '<pre',
]) {
  if (routeSource.includes(forbidden)) errors.push(`Troubleshooting scaffold must remain unpopulated and contains ${forbidden}`);
}

const navigationBlock = layoutSource.match(/const navigation = \[([\s\S]*?)\] as const/)?.[1] ?? '';
const navigationLabels = [...navigationBlock.matchAll(/label: '([^']+)'/g)].map((match) => match[1]);
if (navigationLabels.at(-1) !== 'Troubleshooting') errors.push('Troubleshooting must be the final primary-navigation item');
if (!navigationBlock.includes("withBase('operations/troubleshooting/')")) errors.push('Troubleshooting navigation does not resolve to the stable troubleshooting route');

if (validateBuilt) {
  try {
    const html = await readFile(new URL('dist/operations/troubleshooting/index.html', root), 'utf8');
    if (!/<html[^>]+lang="en"/i.test(html)) errors.push('built Troubleshooting route does not declare English');
    if (!/<h1[^>]*>Troubleshooting<\/h1>/.test(html)) errors.push('built Troubleshooting route is missing its heading');
    for (const forbidden of ['data-symptom-record', 'data-troubleshooting-index', '<h2']) {
      if (html.includes(forbidden)) errors.push(`built Troubleshooting route must remain unpopulated and contains ${forbidden}`);
    }
  } catch (error) {
    errors.push(`built Troubleshooting route is missing: ${error.message}`);
  }
}

if (errors.length > 0) {
  console.error(`Troubleshooting validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Troubleshooting scaffold valid: empty reader-facing route, final primary-navigation position${validateBuilt ? ', and built route' : ''}.`);

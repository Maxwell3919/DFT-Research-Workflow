import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { isUnifiedProcessor } from '@astrojs/markdown-remark';

const root = new URL('../', import.meta.url);
const errors = [];
const [packageDocument, astroConfigSource, baseLayout, globalCss] = await Promise.all([
  readFile(new URL('package.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('astro.config.mjs', root), 'utf8'),
  readFile(new URL('src/layouts/BaseLayout.astro', root), 'utf8'),
  readFile(new URL('src/styles/global.css', root), 'utf8'),
]);

function requireMatch(source, pattern, message) {
  if (!pattern.test(source)) errors.push(message);
}

for (const dependency of ['@astrojs/markdown-remark', 'remark-math', 'rehype-katex', 'katex']) {
  if (!packageDocument.dependencies?.[dependency]) errors.push(`package.json is missing direct dependency ${dependency}`);
}

requireMatch(astroConfigSource, /import\s+\{\s*unified\s*\}\s+from\s+['"]@astrojs\/markdown-remark['"]/, 'Astro config does not import unified from @astrojs/markdown-remark');
requireMatch(astroConfigSource, /import\s+remarkMath\s+from\s+['"]remark-math['"]/, 'Astro config does not import remark-math');
requireMatch(astroConfigSource, /import\s+rehypeKatex\s+from\s+['"]rehype-katex['"]/, 'Astro config does not import rehype-katex');
requireMatch(astroConfigSource, /processor:\s*unified\s*\(\s*\{/, 'Astro markdown does not use an explicit unified processor');
requireMatch(astroConfigSource, /remarkPlugins:\s*\[\s*remarkMath\s*\]/, 'The unified processor does not register remark-math');
requireMatch(astroConfigSource, /rehypePlugins:\s*\[\s*\[\s*rehypeKatex\s*,/, 'The unified processor does not register rehype-katex with options');
requireMatch(astroConfigSource, /throwOnError:\s*true/, 'rehype-katex must fail closed with throwOnError: true');
requireMatch(astroConfigSource, /output:\s*['"]htmlAndMathml['"]/, 'rehype-katex must emit HTML and MathML');

const importedConfig = (await import(new URL('astro.config.mjs', root).href)).default;
if (!isUnifiedProcessor(importedConfig.markdown?.processor)) errors.push('Astro markdown processor is not a unified processor instance');

requireMatch(baseLayout, /import\s+['"]katex\/dist\/katex\.min\.css['"];/, 'BaseLayout does not import the local KaTeX stylesheet');
if (/https?:\/\/[^'"\s>]*(?:katex|mathjax)/i.test(`${astroConfigSource}\n${baseLayout}`)) {
  errors.push('Math rendering infrastructure references a remote CDN asset');
}

const mathCss = globalCss.match(/\/\* Static mathematics \*\/([\s\S]*?)\/\* End static mathematics \*\//)?.[1] ?? '';
if (!mathCss) errors.push('Global CSS is missing the bounded static-mathematics rules');
requireMatch(mathCss, /\.katex\s*\{[\s\S]*?color:\s*inherit;/, 'Inline mathematics does not inherit the reading color');
requireMatch(mathCss, /\.katex\s*\{[\s\S]*?font-size:\s*1em;/, 'Inline mathematics does not preserve the surrounding text size');
requireMatch(mathCss, /\.katex\s*\{[\s\S]*?white-space:\s*nowrap;/, 'Inline mathematics may break across lines');
requireMatch(mathCss, /\.katex-display\s*\{[\s\S]*?overflow-x:\s*auto;/, 'Display mathematics does not provide local horizontal scrolling');
requireMatch(mathCss, /\.katex-display\s*\{[\s\S]*?max-inline-size:\s*100%;/, 'Display mathematics is not constrained to the reading column');
if (/\btransform\s*:|\bposition\s*:\s*absolute/i.test(mathCss)) errors.push('Static-mathematics overrides use prohibited positioning or scaling');

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (/\.(?:astro|[cm]?[jt]s)$/.test(entry.name)) files.push(path);
  }
  return files;
}

for (const path of await walk(new URL('src/', root).pathname)) {
  const source = await readFile(path, 'utf8');
  if (/\bkatex\.render\b|\brenderMathInElement\b|\bMathJax\.(?:typeset|typesetPromise)\b/.test(source)) {
    errors.push(`${path}: client-side math renderer detected`);
  }
  if (/(?:katex|mathjax)/i.test(source) && /client:(?:load|idle|visible|media|only)/.test(source)) {
    errors.push(`${path}: math renderer is hydrated on the client`);
  }
}

if (errors.length > 0) {
  console.error(`Static math rendering validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Static math rendering valid: unified remark-math to rehype-katex, fail-closed HTML+MathML output, local KaTeX CSS, responsive display overflow, and no client renderer.');

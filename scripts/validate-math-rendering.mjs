import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { isUnifiedProcessor } from '@astrojs/markdown-remark';
import katex from 'katex';

const root = new URL('../', import.meta.url);
const rootPath = root.pathname;
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

for (const [dependency, expected] of Object.entries({
  '@astrojs/markdown-remark': '7.2.1',
  'remark-math': '6.0.0',
  'rehype-katex': '7.0.1',
  'katex': '0.16.47',
})) {
  if (packageDocument.dependencies?.[dependency] !== expected) errors.push('package.json must pin ' + dependency + ' at ' + expected);
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
if (/https?:\/\/[^'"\s>]*(?:katex|mathjax)/i.test(astroConfigSource + '\n' + baseLayout)) errors.push('Math rendering infrastructure references a remote CDN asset');

const mathCss = globalCss.match(/\/\* Static mathematics \*\/([\s\S]*?)\/\* End static mathematics \*\//)?.[1] ?? '';
if (!mathCss) errors.push('Global CSS is missing the bounded static-mathematics rules');
requireMatch(mathCss, /\.katex\s*\{[\s\S]*?color:\s*inherit;/, 'Inline mathematics does not inherit the reading color');
requireMatch(mathCss, /\.katex\s*\{[\s\S]*?font-size:\s*1em;/, 'Inline mathematics does not preserve the surrounding text size');
requireMatch(mathCss, /\.katex\s*\{[\s\S]*?white-space:\s*nowrap;/, 'Inline mathematics may break across lines');
requireMatch(mathCss, /\.katex-display\s*\{[\s\S]*?overflow-x:\s*auto;/, 'Display mathematics does not provide local horizontal scrolling');
requireMatch(mathCss, /\.katex-display\s*\{[\s\S]*?max-inline-size:\s*100%;/, 'Display mathematics is not constrained to the reading column');
if (/\btransform\s*:|\bposition\s*:\s*absolute/i.test(mathCss)) errors.push('Static-mathematics overrides use prohibited positioning or scaling');

async function walk(directory, pattern) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path, pattern));
    else if (pattern.test(entry.name)) files.push(path);
  }
  return files;
}

for (const path of await walk(new URL('src/', root).pathname, /\.(?:astro|[cm]?[jt]s)$/)) {
  const source = await readFile(path, 'utf8');
  if (/\bkatex\.render\b|\brenderMathInElement\b|\bMathJax\.(?:typeset|typesetPromise)\b/.test(source)) errors.push(relative(rootPath, path) + ': client-side math renderer detected');
  if (/(?:katex|mathjax)/i.test(source) && /client:(?:load|idle|visible|media|only)/.test(source)) errors.push(relative(rootPath, path) + ': math renderer is hydrated on the client');
}

const knownAsciiMath = new Set([
  '(n, k)', '<r>_n', '|g|', '|m, k+q⟩', '|n k⟩', '|u_nk>', '2e/h', '3N', '6 × 6',
  'A(t)', 'A^S', 'C_qν', 'Cov', 'D(q)', 'delta f_nk', 'E_above_hull', 'E_f', 'E_g^QP',
  'E_m', 'E_vac - E_CBM', 'E_vac - E_VBM', 'E(V)', 'E(ε)', 'epsilon_nk', 'F_el',
  'F_qν,β', 'F(s)', 'f0', 'f0(epsilon_nk, mu, T)', 'H_mn(R)', 'H(k)', 'hbar', 'I--V',
  'k_B', 'K^d', 'K^x', 'mu', 'mu - band edge', 'N_k', 'N_w', 'N=2', 'P(final)',
  'P(reference)', 'P(s)', 'R_i', 's(R)', 'S^2 sigma', 'sigma/tau', 'T_c', 'T_L', 'T_R',
  'T(E)', 'tau', 'tau_nk', 'u_m,k+q', 'u_nk', 'u_y', 'U(k)', 'v_qν,α', 'v_xc',
  'x_i', 'Z*', 'Z*κ,αβ', 'Z2',
]);
const inlineCodeExceptions = [{
  file: 'src/content/practical-guides/balance-reference-reactions-and-normalization.md',
  tokens: new Set(['A']),
  reason: 'A is a literal synthetic species identifier here, not an algebraic variable.',
}, {
  file: 'src/content/topics/harmonic-phonons.md',
  tokens: new Set(['v_sim']),
  reason: 'v_sim is the executable named by the official Phonopy mode-animation workflow, not algebraic notation.',
}, {
  file: 'src/content/practical-guides/build-reciprocal-path-ledger.md',
  tokens: new Set(['c_bands']),
  reason: 'c_bands is literal Quantum ESPRESSO warning text, not algebraic notation.',
}, {
  file: 'src/content/practical-guides/compare-full-zone-isovalue-and-band-path.md',
  tokens: new Set(['c_bands', 'c_bands: 1 eigenvalues not converged']),
  reason: 'These are literal Quantum ESPRESSO warning strings, not algebraic notation.',
}, {
  file: 'src/content/practical-guides/two-dimensional-monolayer-model.md',
  tokens: new Set(['c']),
  reason: 'c is the literal crystallographic cell-axis label in this inspection instruction.',
}];

function isExplicitInlineException(file, token) {
  return inlineCodeExceptions.some((entry) => entry.file === file && entry.tokens.has(token));
}
const literalCodeTokens = new Set(['K_POINTS crystal_b']);
function looksLikeMathToken(token) {
  if (literalCodeTokens.has(token)) return false;
  if (knownAsciiMath.has(token)) return true;
  if (/\\(?:sum|frac|sqrt|lambda|omega|alpha|beta|gamma|mathbf|mathrm|partial|nabla|int|begin|left|right)\b/.test(token)) return true;
  if (/[α-ωΑ-Ω∑∏√∞≈≠≤≥∂∇⟨⟩‡]|[₀-₉ᵢⱼₖₗ⁰-⁹⁽⁾]/u.test(token)) return true;
  if (/^[A-Za-z]$/.test(token)) return true;
  if (/^[A-Za-z](?:[_^]|\([^)]*\))/.test(token)) return true;
  return false;
}
function maskHtmlComments(source) {
  // Compatibility-only comments do not enter public HTML. Masking is an
  // explicit semantic exception for old validator search tokens, not a way to
  // accept visible ASCII mathematics.
  return source.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, ' '));
}
function stripInlineMath(line, file, lineNumber) {
  let output = '';
  let inMath = false;
  let escaped = false;
  for (const character of line) {
    if (escaped) {
      if (!inMath) output += character;
      escaped = false;
      continue;
    }
    if (character === '\\') {
      if (!inMath) output += character;
      escaped = true;
      continue;
    }
    if (character === '$') {
      inMath = !inMath;
      continue;
    }
    if (!inMath) output += character;
  }
  if (inMath) errors.push(file + ':' + lineNumber + ': unmatched inline-math delimiter');
  return output;
}
function validateKatex(expression, file, lineNumber, displayMode) {
  try {
    katex.renderToString(expression, { displayMode, throwOnError: true, strict: 'error' });
  } catch (error) {
    errors.push(file + ':' + lineNumber + ': KaTeX strict parse failed: ' + error.message);
  }
}
function formulaLikeFence(content) {
  return /\\(?:sum|frac|sqrt|lambda|omega|mathbf|mathrm|partial|nabla|int)\b/.test(content)
    || /[∑Σ∏√∞≈≠≤≥∂∇λμω]/u.test(content)
    || /^\s*[A-Za-z][A-Za-z0-9 _(),.+\-]*\s*=\s*\S/m.test(content);
}
function explicitFenceException(language, content) {
  const codeLanguages = new Set(['bash', 'sh', 'shell', 'python', 'py', 'json', 'yaml', 'toml', 'qe', 'pw', 'fortran', 'gnuplot', 'plaintext', 'text-output', 'output']);
  if (codeLanguages.has(language)) return 'declared executable, input, structured data, or raw output';
  if (language === 'text' && /(?:Program PWSCF|JOB DONE|total energy|convergence has been achieved|^\s*\{[\s\S]*\}\s*$)/m.test(content)) return 'literal program or machine-readable output';
  return null;
}

let markdownFiles = 0;
let inlineMathCount = 0;
let displayMathCount = 0;
let fencedCodeCount = 0;
for (const path of await walk(new URL('src/content/', root).pathname, /\.md$/)) {
  markdownFiles += 1;
  const file = relative(rootPath, path);
  const source = maskHtmlComments(await readFile(path, 'utf8'));
  const lines = source.split('\n');
  let inFence = false;
  let fenceLanguage = '';
  let fenceStart = 0;
  let fenceLines = [];
  let inDisplay = false;
  let displayLines = [];
  let displayStart = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];
    const fenceMatch = line.match(/^\s*((?:\x60{3,})|(?:~{3,}))(?:\s*([^\s\x60~]+))?\s*$/);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceLanguage = fenceMatch[2] ?? '';
        fenceStart = lineNumber;
        fenceLines = [];
      } else {
        fencedCodeCount += 1;
        const content = fenceLines.join('\n');
        if (!fenceLanguage) errors.push(file + ':' + fenceStart + ': fenced code block has no semantic language');
        if (formulaLikeFence(content) && !explicitFenceException(fenceLanguage, content)) errors.push(file + ':' + fenceStart + ': formula-like content is fenced as ' + (fenceLanguage || 'unlabelled code') + ' instead of mathematics');
        inFence = false;
      }
      continue;
    }
    if (inFence) {
      fenceLines.push(line);
      continue;
    }
    if (/^\s*\$\$\s*$/.test(line)) {
      if (inDisplay) validateKatex(displayLines.join('\n'), file, displayStart, true);
      else { displayMathCount += 1; displayLines = []; displayStart = lineNumber; }
      inDisplay = !inDisplay;
      continue;
    }
    if (line.includes('$$')) errors.push(file + ':' + lineNumber + ': display-math delimiter must occupy its own line');
    if (inDisplay) { displayLines.push(line); continue; }
    for (const match of line.matchAll(/\x60([^\x60\n]+)\x60/g)) {
      const token = match[1].trim();
      if (looksLikeMathToken(token) && !isExplicitInlineException(file, token)) errors.push(file + ':' + lineNumber + ': mathematical token remains inline code: ' + JSON.stringify(token));
    }
    const withoutCode = line.replace(/\x60[^\x60\n]*\x60/g, '');
    for (const match of withoutCode.matchAll(/(?<!\$)\$(?!\$)((?:\\.|[^$\n])+)\$(?!\$)/g)) {
      inlineMathCount += 1;
      validateKatex(match[1], file, lineNumber, false);
    }
    const prose = stripInlineMath(withoutCode, file, lineNumber);
    if (/\\\(|\\\)|\\\[|\\\]/.test(prose)) errors.push(file + ':' + lineNumber + ': unsupported visible LaTeX delimiter remains');
    if (/\\(?:sum|frac|sqrt|lambda|omega|alpha|beta|gamma|mathbf|mathrm|partial|nabla|int|begin|left|right)\b/.test(prose)) errors.push(file + ':' + lineNumber + ': visible LaTeX source remains outside mathematics');
    if (/[∑Σ∏√∞≈≠≤≥∂∇]\s*|(?:\b[A-Z]\w*(?:\([^)]*\)|_[A-Za-z0-9]+)?\s*=)/u.test(prose)) errors.push(file + ':' + lineNumber + ': equation-like prose remains outside mathematics');
  }
  if (inFence) errors.push(file + ':' + fenceStart + ': unclosed fenced code block');
  if (inDisplay) errors.push(file + ': unclosed display-math delimiter');
}

if (errors.length > 0) {
  console.error('Static math rendering validation failed (' + errors.length + '):');
  for (const error of errors) console.error('- ' + error);
  process.exit(1);
}
console.log('Static math rendering valid: ' + markdownFiles + ' Markdown files audited, ' + displayMathCount + ' display equations, ' + Math.round(inlineMathCount) + ' inline equations, ' + fencedCodeCount + ' semantic code/input/output blocks, unified remark-math to rehype-katex, pinned KaTeX HTML+MathML output, local responsive CSS, explicit non-reader-facing comment and raw-output exceptions, and no client renderer.');

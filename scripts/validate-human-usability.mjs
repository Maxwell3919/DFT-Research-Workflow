import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();

async function collectMarkdown(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await collectMarkdown(path));
    else if (entry.isFile() && entry.name.endsWith('.md')) paths.push(path);
  }
  return paths;
}

const failures = [];
const contentRoot = join(root, 'src', 'content');
const markdownPaths = await collectMarkdown(contentRoot);
const forbiddenReaderHelpers = [
  /--run-regeneration-check/,
  /\bpackage-study\b/,
];
const optionalCompanionCommands = [
  /python3\s+examples\/practical-guides\/qe_manual_handoff\.py/,
  /python3\s+examples\/practical-guides\/silicon_qe_relax\.py/,
];

for (const path of markdownPaths) {
  const source = await readFile(path, 'utf8');
  const label = relative(root, path);
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');

  if (body.includes('${{')) failures.push(`${label}: contains invalid Bash expansion \${{`);
  for (const pattern of forbiddenReaderHelpers) {
    if (pattern.test(body)) failures.push(`${label}: exposes a DRW-specific helper in the reader workflow (${pattern})`);
  }
  for (const pattern of optionalCompanionCommands) {
    const helperIndex = body.search(pattern);
    if (helperIndex < 0) continue;
    const preceding = body.slice(0, helperIndex);
    if (!/\boptional\b/i.test(preceding) || !/(?:```|~~~)(?:bash|shell|sh)\n[\s\S]*?\b(?:grep|awk|sed|tail|find|sha256sum|tar|pw\.x)\b[\s\S]*?(?:```|~~~)/.test(preceding)) {
      failures.push(`${label}: DRW companion appears before a direct manual route or is not clearly optional`);
    }
  }

  for (const match of body.matchAll(/(```|~~~)(?:bash|shell|sh)\n([\s\S]*?)\n\1/g)) {
    const script = match[2];
    const syntax = spawnSync('bash', ['-n'], { input: script, encoding: 'utf8' });
    if (syntax.status !== 0) {
      const line = body.slice(0, match.index).split('\n').length;
      failures.push(`${label}:${line}: Bash fence fails bash -n: ${(syntax.stderr || syntax.stdout).trim()}`);
    }
  }

  for (const match of body.matchAll(/(```|~~~)text\n([\s\S]*?)\n\1/g)) {
    if (/[→←]|\b(?:prepared structure|program completed|solver converged|observable converged)\b/i.test(match[2])) {
      const line = body.slice(0, match.index).split('\n').length;
      failures.push(`${label}:${line}: prose or a workflow is still presented as a text code fence`);
    }
  }
}

const navigatorPage = await readFile(join(root, 'src', 'pages', 'operations', 'index.astro'), 'utf8');
for (const obsoleteLabel of ['Common human route', 'What to inspect', 'Before starting', 'First practical action', 'Does not establish']) {
  if (navigatorPage.includes(`>${obsoleteLabel}<`)) failures.push(`Research Question Navigator still renders ${obsoleteLabel}`);
}
for (const requiredHeading of ['Question', 'Observable or evidence', 'Start here']) {
  if (!navigatorPage.includes(`>${requiredHeading}<`)) failures.push(`Research Question Navigator is missing compact column ${requiredHeading}`);
}

const baseLayout = await readFile(join(root, 'src', 'layouts', 'BaseLayout.astro'), 'utf8');
for (const requiredCopyFeature of ['copy-code-button', 'navigator.clipboard.writeText', 'aria-label', 'pre[data-language="bash"]', 'language-bash']) {
  if (!baseLayout.includes(requiredCopyFeature)) failures.push(`Copy control is missing ${requiredCopyFeature}`);
}

const evidence = JSON.parse(await readFile(join(root, 'workflow', 'practical-evidence.json'), 'utf8'));
for (const guide of evidence.guides ?? []) {
  if (guide.evidence_class === 'synthetic-only' && (guide.media_ids ?? []).length > 0) {
    failures.push(`${guide.guide_slug}: synthetic-only guide still publishes visual media`);
  }
}

if (failures.length > 0) {
  console.error(`Human usability validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Human usability validation passed for ${markdownPaths.length} reader-facing Markdown files.`);

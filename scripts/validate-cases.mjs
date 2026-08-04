import { createHash } from 'node:crypto';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative, resolve, sep } from 'node:path';

const root = resolve(new URL('../', import.meta.url).pathname);
const casesRoot = join(root, 'examples', 'cases');
const fileLedgerPath = join(root, 'workflow', 'case-file-hashes.json');
const execute = process.argv.includes('--execute');
const casePython = process.env.CASE_PYTHON ?? 'python3';
const errors = [];
const requiredFiles = ['README.md', 'environment.txt', 'run.sh', 'check.sh', 'extract.sh', 'parse.py', 'manifest.json'];
const requiredDirectories = ['source', 'input', 'output', 'derived', 'figures'];
const gateNames = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5'];
const gateStatuses = new Set(['PASS', 'FAIL', 'WARN', 'NOT TESTED', 'NOT CLAIMED']);
const evidenceClasses = new Set(['real-execution', 'derived-public-data', 'real-interface-walkthrough']);
const shaPattern = /^[0-9a-f]{64}$/;
const privatePathPattern = /(?:file:\/\/\/(?:home|Users|Volumes)\/|\/(?:home|Users|Volumes)\/[A-Za-z0-9._-]+\/)/;
const privateHostPattern = /\b[A-Za-z0-9]+-MS-[A-Za-z0-9]+\b/;

function run(caseId, cwd, command, args, extraEnv = {}) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, ...extraEnv, LC_ALL: 'C.UTF-8' } });
  if (result.status !== 0) {
    errors.push(`${caseId}: ${command} ${args.join(' ')} exited ${result.status}\n${result.stdout}${result.stderr}`);
  }
}

function runResult(cwd, command, args) {
  return spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, LC_ALL: 'C.UTF-8' } });
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function safeCasePath(caseDirectory, declaredPath) {
  if (typeof declaredPath !== 'string' || declaredPath.length === 0 || declaredPath.startsWith('/')) return null;
  const target = resolve(caseDirectory, declaredPath);
  if (target !== caseDirectory && !target.startsWith(`${caseDirectory}${sep}`)) return null;
  return target;
}

let caseEntries;
try {
  caseEntries = (await readdir(casesRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'));
} catch {
  caseEntries = [];
}

if (caseEntries.length === 0) errors.push('examples/cases must contain at least one terminal-first case');

try {
  const ledger = JSON.parse(await readFile(fileLedgerPath, 'utf8'));
  const actualFiles = (await listFiles(casesRoot)).sort();
  const expectedPaths = actualFiles.map((path) => relative(root, path));
  const declaredPaths = (ledger.files ?? []).map((record) => record.path);
  if (ledger.schema_version !== 1) errors.push('workflow/case-file-hashes.json: schema_version must be 1');
  if (new Set(declaredPaths).size !== declaredPaths.length) errors.push('workflow/case-file-hashes.json: duplicate paths');
  if (JSON.stringify(declaredPaths) !== JSON.stringify(expectedPaths)) {
    errors.push('workflow/case-file-hashes.json: file coverage/order differs from examples/cases; run node scripts/update-case-file-hashes.mjs');
  } else {
    for (let index = 0; index < actualFiles.length; index += 1) {
      const record = ledger.files[index];
      const targetStat = await stat(actualFiles[index]);
      if (!shaPattern.test(record.sha256) || record.sha256 !== await sha256(actualFiles[index])) {
        errors.push(`workflow/case-file-hashes.json: sha256 mismatch for ${record.path}`);
      }
      if (record.bytes !== targetStat.size) errors.push(`workflow/case-file-hashes.json: byte count mismatch for ${record.path}`);
    }
  }
} catch (error) {
  errors.push(`workflow/case-file-hashes.json: unreadable ledger: ${error.message}`);
}

for (const entry of caseEntries) {
  const caseId = entry.name;
  const caseDirectory = join(casesRoot, caseId);

  for (const name of requiredFiles) {
    const path = join(caseDirectory, name);
    try {
      if (!(await stat(path)).isFile()) errors.push(`${caseId}: ${name} is not a file`);
    } catch {
      errors.push(`${caseId}: missing ${name}`);
    }
  }
  for (const name of requiredDirectories) {
    const path = join(caseDirectory, name);
    try {
      if (!(await stat(path)).isDirectory()) errors.push(`${caseId}: ${name}/ is not a directory`);
    } catch {
      errors.push(`${caseId}: missing ${name}/`);
    }
  }
  if (errors.some((error) => error.startsWith(`${caseId}: missing`))) continue;

  for (const script of ['run.sh', 'check.sh', 'extract.sh']) {
    run(caseId, caseDirectory, 'bash', ['-n', script]);
    try {
      await access(join(caseDirectory, script), constants.X_OK);
    } catch {
      errors.push(`${caseId}: ${script} is not executable`);
    }
  }

  let manifest;
  try {
    manifest = JSON.parse(await readFile(join(caseDirectory, 'manifest.json'), 'utf8'));
  } catch (error) {
    errors.push(`${caseId}: manifest.json is not valid JSON: ${error.message}`);
    continue;
  }

  if (manifest.schema_version !== '1.0') errors.push(`${caseId}: schema_version must be 1.0`);
  if (manifest.case_id !== caseId) errors.push(`${caseId}: manifest case_id mismatch`);
  if (!evidenceClasses.has(manifest.evidence_class)) errors.push(`${caseId}: invalid evidence_class`);
  if (!Array.isArray(manifest.software) || manifest.software.length === 0) errors.push(`${caseId}: software must be non-empty`);
  if (!Array.isArray(manifest.sources)) errors.push(`${caseId}: sources must be an array`);
  if (!Array.isArray(manifest.commands) || manifest.commands.length === 0) errors.push(`${caseId}: commands must be non-empty`);
  if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length === 0) errors.push(`${caseId}: artifacts must be non-empty`);
  if (!manifest.claim_boundary || !Array.isArray(manifest.claim_boundary.supports) || !Array.isArray(manifest.claim_boundary.does_not_support) || manifest.claim_boundary.does_not_support.length === 0) {
    errors.push(`${caseId}: incomplete claim_boundary`);
  }
  for (const gate of gateNames) {
    const record = manifest.gates?.[gate];
    if (!record || !gateStatuses.has(record.status) || typeof record.summary !== 'string' || record.summary.length === 0) {
      errors.push(`${caseId}: invalid ${gate} gate`);
    }
  }

  if (execute) {
    run(caseId, caseDirectory, 'bash', ['extract.sh']);
    const parserArgs = manifest.validation?.parser_args ?? [];
    if (!Array.isArray(parserArgs) || parserArgs.some((arg) => typeof arg !== 'string')) {
      errors.push(`${caseId}: validation.parser_args must be an array of strings`);
    } else {
      run(caseId, caseDirectory, casePython, ['parse.py', ...parserArgs], { CASE_REUSE_DERIVED: '1' });
    }
    const check = runResult(caseDirectory, 'bash', ['check.sh']);
    const declaredFailure = gateNames.some((gate) => manifest.gates?.[gate]?.status === 'FAIL');
    if (declaredFailure) {
      if (check.status === 0) {
        errors.push(`${caseId}: check.sh exited zero despite a manifest FAIL gate`);
      }
      if (!`${check.stdout}${check.stderr}`.includes('FAIL')) {
        errors.push(`${caseId}: check.sh did not emit a FAIL line for the manifest FAIL gate`);
      }
    } else if (check.status !== 0) {
      errors.push(`${caseId}: check.sh exited ${check.status} without a manifest FAIL gate\n${check.stdout}${check.stderr}`);
    }
  }

  for (const record of [...(manifest.sources ?? []), ...(manifest.artifacts ?? [])]) {
    const target = safeCasePath(caseDirectory, record.path);
    if (!target) {
      errors.push(`${caseId}: unsafe declared path ${record.path}`);
      continue;
    }
    try {
      const targetStat = await stat(target);
      if (!targetStat.isFile()) throw new Error('not a file');
      if (!shaPattern.test(record.sha256)) errors.push(`${caseId}: invalid sha256 for ${record.path}`);
      else {
        const actual = await sha256(target);
        if (actual !== record.sha256) errors.push(`${caseId}: sha256 mismatch for ${record.path}`);
      }
      if ('bytes' in record && record.bytes !== targetStat.size) errors.push(`${caseId}: byte count mismatch for ${record.path}`);
    } catch (error) {
      errors.push(`${caseId}: unreadable declared file ${record.path}: ${error.message}`);
    }
  }

  for (const directory of ['source', 'input', 'output', 'derived']) {
    const files = await listFiles(join(caseDirectory, directory));
    if (files.length === 0) errors.push(`${caseId}: ${directory}/ contains no files`);
  }

  for (const path of await listFiles(caseDirectory)) {
    if (/\.(?:png|webp|jpe?g)$/i.test(path)) continue;
    const bytes = await readFile(path);
    if (bytes.includes(0)) continue;
    const text = bytes.toString('utf8');
    if (privatePathPattern.test(text)) errors.push(`${caseId}: private absolute path in ${relative(caseDirectory, path)}`);
    if (privateHostPattern.test(text)) errors.push(`${caseId}: private host identity in ${relative(caseDirectory, path)}`);
  }
}

if (errors.length > 0) {
  console.error(`Terminal-first case validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Terminal-first cases valid: ${caseEntries.length} case(s); complete case-file ledger, required trees, shell syntax, manifests, hashes, gates, claim boundaries and privacy checks${execute ? ', plus extract/parser/check execution' : ''}.`);

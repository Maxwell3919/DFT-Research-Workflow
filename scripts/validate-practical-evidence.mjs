import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const evidence = JSON.parse(await readFile(new URL('workflow/practical-evidence.json', root), 'utf8'));
const topics = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const topicSlugs = new Set(topics.sections.flatMap((section) => section.groups.flatMap((group) => group.topics.map((topic) => topic.slug))));
const allowed = new Set(['real-execution', 'derived-public-data', 'real-interface-walkthrough', 'synthetic-only']);
const files = (await readdir(new URL('src/content/practical-guides/', root))).filter((file) => file.endsWith('.md'));
const errors = [];
const guides = new Map();
for (const file of files) {
  const source = await readFile(new URL(`src/content/practical-guides/${file}`, root), 'utf8');
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/m)?.[1] ?? '';
  const slug = frontmatter.match(/^guide_slug:\s*([^\n]+)$/m)?.[1]?.trim();
  const topic = frontmatter.match(/^topic_slug:\s*([^\n]+)$/m)?.[1]?.trim();
  const script = frontmatter.match(/^execution_script:\s*([^\n]+)$/m)?.[1]?.trim();
  const mediaBlock = frontmatter.match(/^media_ids:\n((?:\s+-\s+[^\n]+\n?)*)/m)?.[1] ?? '';
  const media = [...mediaBlock.matchAll(/^\s+-\s+([^\n]+)$/gm)].map((match) => match[1].trim());
  if (!slug || !topic) errors.push(`${file}: unresolvable practical frontmatter`);
  else guides.set(slug, { topic, script: script ?? null, media });
}
if (evidence.schema_version !== 2 || !Array.isArray(evidence.guides)) errors.push('invalid evidence manifest envelope');
const seen = new Set();
for (const record of evidence.guides ?? []) {
  const required = ['guide_slug', 'parent_topic', 'evidence_class', 'material', 'real_result', 'interface', 'traceable_data', 'execution_script', 'media_ids', 'upgrade', 'upgrade_readiness', 'priority'];
  for (const key of required) if (!(key in record)) errors.push(`${record.guide_slug ?? 'unknown'}: missing ${key}`);
  if (seen.has(record.guide_slug)) errors.push(`${record.guide_slug}: duplicate evidence record`);
  seen.add(record.guide_slug);
  const page = guides.get(record.guide_slug);
  if (!page) errors.push(`${record.guide_slug}: no practical page`);
  else {
    if (page.topic !== record.parent_topic) errors.push(`${record.guide_slug}: parent topic mismatch`);
    if (page.script !== record.execution_script) errors.push(`${record.guide_slug}: execution script mismatch`);
    if (JSON.stringify(page.media) !== JSON.stringify(record.media_ids)) errors.push(`${record.guide_slug}: media IDs mismatch`);
  }
  if (!topicSlugs.has(record.parent_topic)) errors.push(`${record.guide_slug}: unknown parent topic`);
  if (!allowed.has(record.evidence_class)) errors.push(`${record.guide_slug}: invalid evidence class`);
  if (!Number.isInteger(record.priority) || record.priority < 1 || record.priority > 5) errors.push(`${record.guide_slug}: invalid priority`);
  if (!['completed', 'candidate', 'blocked'].includes(record.upgrade_readiness)) errors.push(`${record.guide_slug}: invalid upgrade readiness`);
  if (record.evidence_class !== 'synthetic-only' && record.upgrade_readiness !== 'completed') errors.push(`${record.guide_slug}: non-synthetic record must be completed`);
  if (record.evidence_class === 'synthetic-only' && record.blocker && record.upgrade_readiness !== 'blocked') errors.push(`${record.guide_slug}: blocker must be marked blocked`);
  if (record.evidence_class === 'synthetic-only' && (record.real_result || record.interface || record.traceable_data)) errors.push(`${record.guide_slug}: synthetic record overclaims real evidence`);
  if (record.evidence_class === 'real-interface-walkthrough' && !record.interface) errors.push(`${record.guide_slug}: interface walkthrough requires interface=true`);
  if (record.evidence_class === 'real-interface-walkthrough' && record.execution_script !== null) errors.push(`${record.guide_slug}: interface-only walkthrough must not claim a terminal execution script`);
  if (record.evidence_class !== 'real-interface-walkthrough' && (typeof record.execution_script !== 'string' || !record.execution_script)) errors.push(`${record.guide_slug}: executable evidence requires an execution script`);
  if (record.evidence_class === 'derived-public-data' && !record.traceable_data) errors.push(`${record.guide_slug}: public-data record requires traceable_data=true`);
  if (record.evidence_class !== 'real-execution' && 'case_id' in record) errors.push(`${record.guide_slug}: only real-execution records may bind a file-backed case`);
  if (record.evidence_class === 'real-execution' && 'case_id' in record) {
    if (typeof record.case_id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.case_id)) {
      errors.push(`${record.guide_slug}: declared case_id is invalid`);
    } else {
      const caseRoot = new URL(`examples/cases/${record.case_id}/`, root);
      try {
        const requiredCaseFiles = ['README.md', 'environment.txt', 'run.sh', 'check.sh', 'extract.sh', 'parse.py', 'manifest.json'];
        await Promise.all(requiredCaseFiles.map((file) => readFile(new URL(file, caseRoot))));
        const manifest = JSON.parse(await readFile(new URL('manifest.json', caseRoot), 'utf8'));
        if (manifest.case_id !== record.case_id) errors.push(`${record.guide_slug}: bound case manifest identity mismatch`);
        if (manifest.evidence_class !== 'real-execution') errors.push(`${record.guide_slug}: bound case is not real-execution`);
        for (const gate of ['G0', 'G1', 'G2', 'G3', 'G4', 'G5']) if (!manifest.gates?.[gate]?.status) errors.push(`${record.guide_slug}: bound case is missing ${gate}`);
        if (!Array.isArray(manifest.commands) || manifest.commands.length === 0) errors.push(`${record.guide_slug}: bound case has no recorded commands`);
        if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length === 0) errors.push(`${record.guide_slug}: bound case has no hash-bound artifacts`);
        if (!manifest.claim_boundary?.supports || !manifest.claim_boundary?.does_not_support) errors.push(`${record.guide_slug}: bound case has no two-sided claim boundary`);
      } catch (error) {
        errors.push(`${record.guide_slug}: bound case is unreadable (${String(error)})`);
      }
    }
  }
}
for (const slug of guides.keys()) if (!seen.has(slug)) errors.push(`${slug}: missing evidence record`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
const counts = Object.fromEntries([...allowed].map((kind) => [kind, evidence.guides.filter((record) => record.evidence_class === kind).length]));
console.log(`Practical evidence manifest valid: ${evidence.guides.length}/${guides.size} guides; ${JSON.stringify(counts)}.`);

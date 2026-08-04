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
  if (!slug || !topic || !script) errors.push(`${file}: unresolvable practical frontmatter`);
  else guides.set(slug, { topic, script, media });
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
  if (record.evidence_class === 'derived-public-data' && !record.traceable_data) errors.push(`${record.guide_slug}: public-data record requires traceable_data=true`);
}
for (const slug of guides.keys()) if (!seen.has(slug)) errors.push(`${slug}: missing evidence record`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
const counts = Object.fromEntries([...allowed].map((kind) => [kind, evidence.guides.filter((record) => record.evidence_class === kind).length]));
console.log(`Practical evidence manifest valid: ${evidence.guides.length}/${guides.size} guides; ${JSON.stringify(counts)}.`);

import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const registry = JSON.parse(await readFile(new URL('workflow/tools.json', root), 'utf8'));
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const topics = new Set(workflow.sections.flatMap((section) => section.groups.flatMap((group) => group.topics.map((topic) => topic.slug))));
const guideTools = new Set();
for (const file of (await readdir(new URL('src/content/practical-guides/', root))).filter((entry) => entry.endsWith('.md'))) {
  const text = await readFile(new URL(`src/content/practical-guides/${file}`, root), 'utf8');
  const block = text.match(/tools:\n((?:\s+- .+\n?)+)/)?.[1] ?? '';
  for (const match of block.matchAll(/^\s+-\s+([a-z0-9-]+)$/gm)) guideTools.add(match[1]);
}
const isHttps = (value) => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
const expectedOrder = ['materials-project','vesta','ase','pymatgen','spglib','seekpath','quantum-espresso','vasp','abinit','cp2k','siesta','phonopy','phono3py','wannier90','epw','aiida','python'];
const expectedCategories = ['Structures and materials data','Inspection, preparation, and symmetry','Electronic-structure engines','Target-property tools','Preservation and optional automation','Scientific programming'];
const accessKinds = new Set(['open-source','restricted-license','registration-required','free-proprietary']);
const interfaceKinds = new Set(['Web','GUI','CLI','API','Python','Library','Programming language']);
if (registry.schema_version !== 2 || !String(registry.authority).includes('secondary tool')) errors.push('registry authority');
if (!String(registry.scope_note).includes('not research operations')) errors.push('scope boundary');
if (!/^\d{4}-\d{2}-\d{2}$/.test(registry.verified_at ?? '')) errors.push('registry verified_at');
if (JSON.stringify((registry.tools ?? []).map((tool) => tool.slug)) !== JSON.stringify(expectedOrder)) errors.push('tools must remain the exact 17 identities in human research sequence');
if (JSON.stringify([...new Set((registry.tools ?? []).map((tool) => tool.category))]) !== JSON.stringify(expectedCategories)) errors.push('human research category order changed');

const slugs = new Set(), names = new Set(), urls = new Set(), checks = new Set();
for (const tool of registry.tools ?? []) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.slug) || slugs.has(tool.slug)) errors.push(`${tool.slug}: slug`); else slugs.add(tool.slug);
  if (!tool.name || names.has(tool.name)) errors.push(`${tool.slug}: name`); else names.add(tool.name);
  if (!accessKinds.has(tool.access)) errors.push(`${tool.slug}: access`);
  if (!Array.isArray(tool.interfaces) || !tool.interfaces.length || tool.interfaces.some((item) => !interfaceKinds.has(item))) errors.push(`${tool.slug}: interfaces`);
  for (const key of ['role','use_when','first_action','verify']) if (typeof tool[key] !== 'string' || !tool[key].trim()) errors.push(`${tool.slug}: ${key}`);
  if (checks.has(tool.verify)) errors.push(`${tool.slug}: duplicate verify`); else checks.add(tool.verify);
  for (const key of ['input_objects','output_objects']) if (!Array.isArray(tool[key]) || !tool[key].length || tool[key].some((item) => typeof item !== 'string' || !item.trim())) errors.push(`${tool.slug}: ${key}`);
  if (!Array.isArray(tool.topics) || !tool.topics.length) errors.push(`${tool.slug}: topics`);
  for (const topic of tool.topics ?? []) if (!topics.has(topic)) errors.push(`${tool.slug}: unknown topic ${topic}`);
  if (!topics.has(tool.primary_topic) || !tool.topics.includes(tool.primary_topic)) errors.push(`${tool.slug}: primary_topic`);
  for (const [key, url] of [['homepage',tool.homepage],['documentation',tool.documentation],['source_repository',tool.source_repository],['getting_started.url',tool.getting_started?.url]]) {
    if (key === 'source_repository' && !url) continue;
    if (!isHttps(url)) errors.push(`${tool.slug}: ${key}`); else urls.add(url);
  }
}
for (const tool of guideTools) if (!slugs.has(tool)) errors.push(`practical tool missing: ${tool}`);
const mp = registry.tools.find((tool) => tool.slug === 'materials-project');
if (mp?.interfaces?.[0] !== 'Web' || mp?.getting_started?.url !== 'https://docs.materialsproject.org/apps/explorer-apps/materials-explorer/tutorial' || !mp?.first_action?.startsWith('Open Materials Explorer in a browser')) errors.push('Materials Project must be browser-first');
const seekpath = registry.tools.find((tool) => tool.slug === 'seekpath');
if (seekpath?.interfaces?.[0] !== 'Web' || seekpath?.getting_started?.url !== 'https://www.materialscloud.org/work/tools/seekpath' || !seekpath?.first_action?.startsWith('Open the SeeK-path browser tool')) errors.push('SeeK-path must use the stable Materials Cloud browser entry');
const maintainerLeakage = [
  /\b(?:maintainer|automation)\s+(?:host|machine|environment|capabilit(?:y|ies)|limitation|access)\b/i,
  /\b(?:this|current|local)\s+(?:host|machine|execution environment)\b/i,
  /\b(?:credential|secret)\s+(?:availability|status|was available|was unavailable)\b/i,
];
if (maintainerLeakage.some((pattern) => pattern.test(JSON.stringify(registry)))) errors.push('reader-facing maintainer-environment leakage');
if (registry.tools.length !== 17 || checks.size !== 17 || urls.size !== 51) errors.push(`expected 17 tools/17 checks/51 URLs, found ${registry.tools.length}/${checks.size}/${urls.size}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Tool registry valid: exactly 17 depth tools in human research sequence, browser-first Materials Project and SeeK-path, no maintainer leakage, 17 checks, 51 official URLs, and practical-tool coverage.');

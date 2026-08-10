import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const landscape = JSON.parse(await readFile(new URL('workflow/resource-landscape.json', root), 'utf8'));
const manifest = JSON.parse(await readFile(new URL('sources/resource-landscape-links.json', root), 'utf8'));
const pageSource = await readFile(new URL('src/pages/operations/resource-landscape.astro', root), 'utf8');
const builtMode = process.argv.includes('--built');
const expectedCategories = [
  ['structures-data', 20], ['visual-symmetry', 10], ['electronic-properties', 20],
  ['specialist-tools', 12], ['pseudopotentials-basis', 8], ['literature-learning', 12],
];
const requiredAnchorAliases = ['method-inputs', 'electronic-structure-codes', 'lattice-dynamics'];
const allowedAccess = new Set(['Open', 'Registration', 'Institutional', 'Subscription', 'Commercial', 'Mixed']);
const allowedInterfaces = new Set(['Web', 'GUI', 'CLI', 'API', 'Python', 'Library']);
const allowedAuthority = new Set(['Official', 'Academic', 'Community']);
const allowedSourceKinds = new Set([
  'official-landing', 'official-documentation', 'official-tutorial', 'official-data-service',
  'primary-repository', 'academic-data-service', 'academic-web-service', 'academic-software',
  'academic-resource', 'academic-learning-portal', 'academic-tutorial', 'academic-course',
]);
const allowedNetworkStates = new Set(['reachable', 'protected', 'timeout', 'service-error']);
const requiredFields = ['id','name','subcategory','authority','access','interfaces','languages','use_when','first_human_action','inspect','bring_back','boundary','source_id','link_label'];
const requiredIds = new Set([
  'cod','materials-project','nomad','aflow','oqmd','icsd','csd','springer-materials','pauling-file','mpds','nims-matnavi',
  'vesta','ovito','bilbao','findsym','checkcif','seekpath-web','quantum-espresso','vasp','abinit','cp2k','castep','wien2k',
  'fhi-aims','siesta','gpaw','elk','exciting','octopus','dftbplus','phonopy','phono3py','wannier90','epw','sssp','pseudo-dojo',
  'materiapps','materiapps-mp-qe-ja','whut-materials-simulation-cn',
]);

const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
if (landscape.schema_version !== 1) errors.push('landscape schema_version');
if (!String(landscape.authority).includes('Secondary human research resource landscape')) errors.push('landscape authority');
for (const phrase of ['does not rank', 'endorse', 'equivalent']) if (!String(landscape.scope_note).includes(phrase)) errors.push(`scope_note missing ${phrase}`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(landscape.reviewed_at ?? '') || landscape.reviewed_at !== manifest.reviewed_at) errors.push('review date mismatch');
if (manifest.schema_version !== 1 || !String(manifest.semantic_review_note).includes('Semantic review')) errors.push('source manifest boundary');
if (JSON.stringify((landscape.categories ?? []).map((category) => category.id)) !== JSON.stringify(expectedCategories.map(([id]) => id))) errors.push('category order or anchors changed');

const resources = [];
for (const [expectedId, minimum] of expectedCategories) {
  const category = landscape.categories?.find((entry) => entry.id === expectedId);
  if (!category) continue;
  if (!nonEmpty(category.title) || !nonEmpty(category.intro)) errors.push(`${expectedId}: title or intro`);
  if (!Array.isArray(category.resources) || category.resources.length < minimum) errors.push(`${expectedId}: expected at least ${minimum} resources, found ${category.resources?.length ?? 0}`);
  for (const entry of category.resources ?? []) resources.push({ ...entry, category_id: expectedId });
}

const ids = new Set();
const resourceSourceIds = new Set();
const languages = new Set();
for (const entry of resources) {
  for (const key of requiredFields) if (entry[key] === undefined || entry[key] === null || (typeof entry[key] === 'string' && !entry[key].trim())) errors.push(`${entry.id ?? 'unknown'}: ${key}`);
  if (ids.has(entry.id)) errors.push(`${entry.id}: duplicate resource id`);
  ids.add(entry.id);
  if (resourceSourceIds.has(entry.source_id)) errors.push(`${entry.id}: duplicate source id`);
  resourceSourceIds.add(entry.source_id);
  if (!allowedAccess.has(entry.access)) errors.push(`${entry.id}: access ${entry.access}`);
  if (!allowedAuthority.has(entry.authority)) errors.push(`${entry.id}: authority ${entry.authority}`);
  if (!Array.isArray(entry.interfaces) || !entry.interfaces.length || entry.interfaces.some((item) => !allowedInterfaces.has(item))) errors.push(`${entry.id}: interfaces`);
  if (!Array.isArray(entry.languages) || !entry.languages.length || entry.languages.some((item) => !nonEmpty(item))) errors.push(`${entry.id}: languages`);
  for (const language of entry.languages ?? []) languages.add(language);
  if (!/^(Open|Search|Browse|Upload|Read|Follow|Inspect|Use|Start|Explore|Download|Compare|Run|Choose|Create|Register)/.test(entry.first_human_action)) errors.push(`${entry.id}: first action is not action-oriented`);
  if (!/^(Open|Search|Browse|Upload|Read|Follow|Inspect|Use|Start|Explore|Download|Compare|Run|Choose|Review|Work)/.test(entry.link_label)) errors.push(`${entry.id}: link label is not action-oriented`);
  if (entry.category_id === 'structures-data' && /^Use (the )?(API|Python)/i.test(entry.first_human_action)) errors.push(`${entry.id}: API-first database route`);
}
const qeLearn = resources.find((entry) => entry.id === 'qe-learn');
const qeLearnText = qeLearn ? [qeLearn.first_human_action, qeLearn.inspect, qeLearn.bring_back, qeLearn.boundary].join(' ') : '';
if (qeLearn?.access !== 'Open' || !qeLearnText.includes('Quantum ESPRESSO') || /VASP|licensed PAW/i.test(qeLearnText)) errors.push('qe-learn: public Quantum ESPRESSO learning route is contaminated by a licensed VASP boundary');
for (const id of ['vasp-tutorials', 'vasp-workshop']) {
  const entry = resources.find((resource) => resource.id === id);
  if (entry?.access !== 'Mixed' || !entry.boundary.includes('linked reading is public') || !entry.boundary.includes('licensed VASP access')) errors.push(`${id}: public-reading and licensed-execution boundary changed`);
}
const phonopy = resources.find((entry) => entry.id === 'phonopy');
if (!phonopy?.interfaces?.includes('GUI') || !phonopy?.first_human_action?.includes('ANIME') || !phonopy?.inspect?.includes('Phonons tab') || !phonopy?.boundary?.includes('does not prove that an imaginary mode is a physical instability')) errors.push('phonopy: human mode-animation and diagnosis boundary changed');
const seekpathSource = (manifest.sources ?? []).find((source) => source.id === 'rl-seekpath-web');
if (seekpathSource?.url !== 'https://www.materialscloud.org/work/tools/seekpath') errors.push('seekpath-web: stable Materials Cloud landing changed');
const phonopySource = (manifest.sources ?? []).find((source) => source.id === 'rl-phonopy');
if (phonopySource?.url !== 'https://phonopy.github.io/phonopy/animation.html') errors.push('phonopy: official mode-animation source changed');
const legacyHttpBoundary = 'This is a legacy HTTP-only official site; do not enter credentials or sensitive data; use institutional or package documentation if policy blocks it.';
for (const sourceId of ['rl-xcrysden', 'rl-wien2k', 'rl-lobster']) {
  const entry = resources.find((resource) => resource.source_id === sourceId);
  if (!entry?.boundary?.includes(legacyHttpBoundary)) errors.push(`${sourceId}: legacy HTTP safety boundary changed`);
}
for (const id of requiredIds) if (!ids.has(id)) errors.push(`required human ecosystem resource missing: ${id}`);
for (const value of ['Open','Registration','Institutional','Subscription','Commercial','Mixed']) if (!resources.some((entry) => entry.access === value)) errors.push(`access landscape missing ${value}`);
if (![...languages].some((language) => language !== 'English')) errors.push('non-English learning resources missing');
if (!resources.some((entry) => entry.interfaces.includes('GUI')) || !resources.some((entry) => entry.interfaces.includes('Web'))) errors.push('human browser/GUI routes missing');

const sources = manifest.sources ?? [];
const exactCorrectedUrls = new Map([
  ['rl-amcsd', 'https://rruff.info/AMS/'],
  ['rl-bilbao', 'https://cryst.ehu.es/'],
  ['rl-ams-band', 'https://www.scm.com/doc/BAND/index.html'],
  ['rl-xcrysden', 'http://www.xcrysden.org/Description.html'],
  ['rl-wien2k', 'http://susi.theochem.tuwien.ac.at/'],
  ['rl-lobster', 'http://cohp.de/'],
]);
const legacyHttpSources = new Map([...exactCorrectedUrls].filter(([, url]) => url.startsWith('http:')));
const manifestIds = new Set();
for (const source of sources) {
  if (!nonEmpty(source.id) || manifestIds.has(source.id)) errors.push(`${source.id ?? 'unknown'}: source id`);
  manifestIds.add(source.id);
  if (!nonEmpty(source.title) || !nonEmpty(source.semantic_role)) errors.push(`${source.id}: source semantics`);
  if (!allowedSourceKinds.has(source.source_kind)) errors.push(`${source.id}: source_kind ${source.source_kind}`);
  if (!allowedNetworkStates.has(source.network_state)) errors.push(`${source.id}: network_state ${source.network_state}`);
  if (source.reviewed_at !== landscape.reviewed_at) errors.push(`${source.id}: reviewed_at`);
  const exactCorrectedUrl = exactCorrectedUrls.get(source.id);
  if (exactCorrectedUrl && source.url !== exactCorrectedUrl) errors.push(`${source.id}: corrected official URL changed`);
  try {
    const protocol = new URL(source.url).protocol;
    if (legacyHttpSources.has(source.id)) {
      if (protocol !== 'http:' || source.url !== legacyHttpSources.get(source.id)) errors.push(`${source.id}: legacy HTTP URL differs from the reviewed official endpoint`);
    } else if (protocol !== 'https:') errors.push(`${source.id}: non-HTTPS URL`);
  } catch { errors.push(`${source.id}: invalid URL`); }
}
if (sources.length !== resources.length) errors.push(`resource/source count mismatch ${resources.length}/${sources.length}`);
if (JSON.stringify([...resourceSourceIds].sort()) !== JSON.stringify([...manifestIds].sort())) errors.push('source manifest is not exact');
for (const entry of resources) if (sources.find((source) => source.id === entry.source_id)?.semantic_role !== entry.link_label) errors.push(`${entry.id}: link/source semantic mismatch`);

for (const marker of ["import landscape from '../../../workflow/resource-landscape.json'", "import sourceManifest from '../../../sources/resource-landscape-links.json'", 'data-resource-landscape', 'data-landscape-category', 'data-resource', 'data-resource-link', 'First human action', 'Bring back']) if (!pageSource.includes(marker)) errors.push(`page source missing ${marker}`);
for (const anchor of requiredAnchorAliases) if (!pageSource.includes(`'${anchor}'`)) errors.push(`page source missing compatibility anchor ${anchor}`);
if (pageSource.includes('client:') || /<script(?:\s|>)/i.test(pageSource)) errors.push('resource landscape must not hydrate or emit scripts');
if (/class=["'][^"']*card/i.test(pageSource)) errors.push('resource landscape must not use cards');

if (builtMode) {
  let html = '';
  try { html = await readFile(new URL('dist/operations/resource-landscape/index.html', root), 'utf8'); } catch (error) { errors.push(`built resource landscape missing: ${error.message}`); }
  for (const [id] of expectedCategories) if (!html.includes(`id="${id}"`) || !html.includes(`data-landscape-category="${id}"`)) errors.push(`built anchor missing: ${id}`);
  for (const anchor of requiredAnchorAliases) if (!html.includes(`id="${anchor}"`)) errors.push(`built compatibility anchor missing: ${anchor}`);
  for (const entry of resources) {
    const source = sources.find((candidate) => candidate.id === entry.source_id);
    if (!html.includes(`data-resource="${entry.id}"`)) errors.push(`built resource missing: ${entry.id}`);
    if (source && !html.includes(`href="${source.url}"`)) errors.push(`built source link missing: ${entry.id}`);
  }
}

if (errors.length) {
  console.error(`Resource Landscape validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Resource Landscape valid: ${resources.length} human-first resources across ${expectedCategories.length} classified sections, exact source coverage, browser/GUI/CLI/API/Python access, commercial context, and non-English academic routes.`);

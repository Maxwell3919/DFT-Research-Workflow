import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const bridge = JSON.parse(await readFile(new URL('workflow/software-bridge.json', root), 'utf8'));
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const tools = JSON.parse(await readFile(new URL('workflow/tools.json', root), 'utf8'));
const pageSource = await readFile(new URL('src/pages/operations/software-bridge.astro', root), 'utf8');

const expectedTaskIds = [
  'fixed-geometry-scf',
  'geometry-cell-optimization',
  'band-path',
  'dense-dos-pdos',
  'harmonic-phonons',
  'restart-continuation',
];
const expectedSoftware = ['quantum-espresso', 'vasp', 'abinit', 'cp2k'];
const expectedParents = new Map([
  ['fixed-geometry-scf', 'calculate-reference-ground-state'],
  ['geometry-cell-optimization', 'optimize-structure'],
  ['band-path', 'band-structure'],
  ['dense-dos-pdos', 'density-of-states-and-projected-density-of-states'],
  ['harmonic-phonons', 'harmonic-phonons'],
  ['restart-continuation', 'document-and-preserve-study'],
]);
const expectedUrls = new Map([
  ['fixed-geometry-scf:quantum-espresso', 'https://www.quantum-espresso.org/Doc/INPUT_PW.html'],
  ['fixed-geometry-scf:vasp', 'https://vasp.at/wiki/Electronic_ground-state_properties'],
  ['fixed-geometry-scf:abinit', 'https://docs.abinit.org/tutorial/base1/'],
  ['fixed-geometry-scf:cp2k', 'https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/SCF.html'],
  ['geometry-cell-optimization:quantum-espresso', 'https://www.quantum-espresso.org/Doc/INPUT_PW.html'],
  ['geometry-cell-optimization:vasp', 'https://vasp.at/wiki/Structure_optimization'],
  ['geometry-cell-optimization:abinit', 'https://docs.abinit.org/topics/GeoOpt/'],
  ['geometry-cell-optimization:cp2k', 'https://manual.cp2k.org/trunk/methods/optimization/geometry_and_cell_opt.html'],
  ['band-path:quantum-espresso', 'https://www.quantum-espresso.org/Doc/INPUT_BANDS.html'],
  ['band-path:vasp', 'https://vasp.at/wiki/Band-structure_calculation_using_density-functional_theory'],
  ['band-path:abinit', 'https://docs.abinit.org/tutorial/base3/'],
  ['band-path:cp2k', 'https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/PRINT/BAND_STRUCTURE.html'],
  ['dense-dos-pdos:quantum-espresso', 'https://www.quantum-espresso.org/Doc/pp_user_guide/'],
  ['dense-dos-pdos:vasp', 'https://vasp.at/wiki/DOSCAR'],
  ['dense-dos-pdos:abinit', 'https://docs.abinit.org/topics/ElecDOS/'],
  ['dense-dos-pdos:cp2k', 'https://manual.cp2k.org/trunk/methods/electronic_structure/dos.html'],
  ['harmonic-phonons:quantum-espresso', 'https://www.quantum-espresso.org/Doc/ph_user_guide/'],
  ['harmonic-phonons:vasp', 'https://vasp.at/wiki/Computing_the_phonon_dispersion_and_DOS'],
  ['harmonic-phonons:abinit', 'https://docs.abinit.org/tutorial/rf2/'],
  ['harmonic-phonons:cp2k', 'https://manual.cp2k.org/trunk/CP2K_INPUT/VIBRATIONAL_ANALYSIS.html'],
  ['restart-continuation:quantum-espresso', 'https://www.quantum-espresso.org/Doc/INPUT_PW.html'],
  ['restart-continuation:vasp', 'https://vasp.at/wiki/ISTART'],
  ['restart-continuation:abinit', 'https://docs.abinit.org/guide/abinit/'],
  ['restart-continuation:cp2k', 'https://manual.cp2k.org/trunk/CP2K_INPUT/EXT_RESTART.html'],
]);
const allowedDomains = new Set([
  'www.quantum-espresso.org',
  'vasp.at',
  'docs.abinit.org',
  'manual.cp2k.org',
]);
const topicSlugs = new Set(workflow.sections.flatMap((section) => section.groups.flatMap((group) => group.topics.map((topic) => topic.slug))));
const toolSlugs = new Set(tools.tools.map((tool) => tool.slug));

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validStringArray(value) {
  return Array.isArray(value)
    && value.length >= 2
    && value.every(nonEmptyString)
    && new Set(value).size === value.length;
}

function requireText(value, fragment, label) {
  if (!String(value).includes(fragment)) errors.push(`${label}: missing boundary "${fragment}"`);
}

if (bridge.schema_version !== 1) errors.push('schema_version must be 1');
if (!String(bridge.authority).includes('Secondary software implementation cross-index')) errors.push('authority boundary');
for (const phrase of ['not a software manual', 'compatibility promise', 'benchmark', 'ranking', 'numerically equivalent']) {
  requireText(bridge.scope_note, phrase, 'scope_note');
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(bridge.verified_at ?? '')) errors.push('verified_at');
if (JSON.stringify(bridge.software_order) !== JSON.stringify(expectedSoftware)) errors.push('software_order changed');
if (JSON.stringify((bridge.tasks ?? []).map((task) => task.id)) !== JSON.stringify(expectedTaskIds)) errors.push('task inventory or order changed');

for (const task of bridge.tasks ?? []) {
  const label = task.id ?? 'unknown-task';
  if (!expectedParents.has(label) || task.parent_topic !== expectedParents.get(label)) errors.push(`${label}: parent_topic`);
  if (!topicSlugs.has(task.parent_topic)) errors.push(`${label}: unknown parent topic`);
  for (const key of ['title', 'scientific_action', 'required_parent_object', 'validation_requirement', 'non_equivalence']) {
    if (!nonEmptyString(task[key])) errors.push(`${label}: ${key}`);
  }
  if (JSON.stringify((task.implementations ?? []).map((entry) => entry.tool_slug)) !== JSON.stringify(expectedSoftware)) {
    errors.push(`${label}: implementation inventory or order`);
  }

  for (const implementation of task.implementations ?? []) {
    const cell = `${label}:${implementation.tool_slug}`;
    if (!toolSlugs.has(implementation.tool_slug)) errors.push(`${cell}: unknown tool`);
    for (const key of ['software', 'terminology', 'first_official_start', 'first_inspection', 'boundary']) {
      if (!nonEmptyString(implementation[key])) errors.push(`${cell}: ${key}`);
    }
    for (const key of ['required_inputs', 'artifacts']) {
      if (!validStringArray(implementation[key])) errors.push(`${cell}: ${key}`);
    }
    if (implementation.official_url !== expectedUrls.get(cell)) errors.push(`${cell}: official_url changed`);
    try {
      const url = new URL(implementation.official_url);
      if (url.protocol !== 'https:' || !allowedDomains.has(url.hostname)) errors.push(`${cell}: unofficial URL`);
    } catch {
      errors.push(`${cell}: invalid URL`);
    }
  }
}

const taskById = new Map((bridge.tasks ?? []).map((task) => [task.id, task]));
requireText(taskById.get('fixed-geometry-scf')?.non_equivalence, 'Program completion is not SCF convergence', 'fixed-geometry-scf');
requireText(taskById.get('geometry-cell-optimization')?.non_equivalence, 'Electronic convergence is not ionic or cell convergence', 'geometry-cell-optimization');
requireText(taskById.get('band-path')?.non_equivalence, 'not full-Brillouin-zone evidence', 'band-path');
requireText(taskById.get('dense-dos-pdos')?.non_equivalence, 'broadening cannot replace k-point convergence', 'dense-dos-pdos');
requireText(taskById.get('harmonic-phonons')?.non_equivalence, 'imaginary frequency can be physical or numerical', 'harmonic-phonons');
requireText(taskById.get('restart-continuation')?.non_equivalence, 'not proof of compatible ancestry', 'restart-continuation');

const vaspBand = taskById.get('band-path')?.implementations.find((entry) => entry.tool_slug === 'vasp');
requireText(vaspBand?.boundary, 'ordinary ICHARG=11 fixed-density route', 'band-path:vasp');
requireText(vaspBand?.boundary, 'hybrid band structures require a different official route', 'band-path:vasp');
const cp2kDos = taskById.get('dense-dos-pdos')?.implementations.find((entry) => entry.tool_slug === 'cp2k');
requireText(cp2kDos?.boundary, 'CP2K 2026.2 or later', 'dense-dos-pdos:cp2k');
const cp2kPhonons = taskById.get('harmonic-phonons')?.implementations.find((entry) => entry.tool_slug === 'cp2k');
requireText(cp2kPhonons?.boundary, 'Gamma-point normal modes', 'harmonic-phonons:cp2k');
requireText(cp2kPhonons?.boundary, 'not a general-q phonon dispersion workflow', 'harmonic-phonons:cp2k');
for (const implementation of taskById.get('restart-continuation')?.implementations ?? []) {
  requireText(`${implementation.first_inspection} ${implementation.boundary}`, 'ancestry', `restart-continuation:${implementation.tool_slug}`);
}

for (const marker of [
  "import bridge from '../../../workflow/software-bridge.json'",
  'data-software-bridge',
  'data-task-id',
  'data-code',
  'data-tool-link',
  'data-official-link',
  'data-parent-link',
  'data-required-inputs',
  'data-artifacts',
  'data-check-boundary',
  'data-task-boundary',
]) {
  if (!pageSource.includes(marker)) errors.push(`page source missing ${marker}`);
}
if (pageSource.includes('client:') || /<script(?:\s|>)/i.test(pageSource)) errors.push('page must not hydrate or emit client scripts');
if (/class=["'][^"']*card/i.test(pageSource)) errors.push('page must not introduce cards');
if ((bridge.tasks ?? []).length !== 6 || (bridge.tasks ?? []).reduce((sum, task) => sum + task.implementations.length, 0) !== 24) {
  errors.push('expected exactly 6 tasks and 24 implementation rows');
}
if (expectedUrls.size !== 24) errors.push('validator URL inventory must contain 24 cells');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Software Bridge valid: 6 frozen scientific tasks, 24 QE/VASP/ABINIT/CP2K mappings, exact existing parent topics and official URLs, static rendering markers, and fail-closed scientific non-equivalence boundaries.');

import { readFileSync as readFileForManualAcceptance } from 'node:fs';
import { access, readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const operations = JSON.parse(await readFile(new URL('ontology/operations.json', root), 'utf8')).operations;
const legacy = JSON.parse(await readFile(new URL('ontology/legacy-operations.json', root), 'utf8')).entries;
const recipesDocument = JSON.parse(await readFile(new URL('recipes/index.json', root), 'utf8'));
const recipes = recipesDocument.legacy_recipe_redirects;
const workedWorkflows = recipesDocument.workflows;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const expectedSections = ['A', 'B', 'C', 'D', 'E'];
const expectedDGroups = ['D1', 'D2', 'D3', 'D4', 'D5'];
const expectedWorkedWorkflowSlugs = ['silicon-ground-state-electronic-structure', 'aluminium-metallic-electronic-structure'];
const expectedReaderStageIds = ['source', 'model', 'pseudopotential', 'inputs', 'run', 'checks', 'convergence', 'relaxation-reference-geometry', 'scf', 'bands-dos', 'plot', 'interpret', 'preserve'];
const stageReferenceFields = ['topic_slugs', 'case_files', 'execution_route_ids', 'command_stages', 'artifact_paths'];

function normalized(value) {
  return JSON.stringify(value ?? '').toLowerCase().replaceAll('_', '-').replaceAll(' ', '-');
}

function collectStrings(value, strings = new Set()) {
  if (typeof value === 'string') strings.add(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, strings);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) collectStrings(item, strings);
  return strings;
}

function validateAction(action, label) {
  if (!action || typeof action !== 'object') return errors.push(`${label}: action must be an object`);
  if (typeof action.label !== 'string' || action.label.length === 0) errors.push(`${label}: action label is required`);
  if (typeof action.cwd !== 'string' || action.cwd.length === 0) errors.push(`${label}: action cwd is required`);
  if (!Array.isArray(action.commands) || action.commands.length === 0 || action.commands.some((command) => typeof command !== 'string' || command.length === 0)) errors.push(`${label}: action commands must be non-empty strings`);
  if (typeof action.boundary !== 'string' || action.boundary.length === 0) errors.push(`${label}: action boundary is required`);
}

function resolveCasePath(caseRoot, path) {
  if (typeof path !== 'string' || path.length === 0 || path.startsWith('/') || path.includes('..')) return null;
  const repositoryPath = path.startsWith('examples/cases/') ? path : `${caseRoot}/${path}`;
  if (!repositoryPath.startsWith(`${caseRoot}/`)) return null;
  return { repositoryPath, url: new URL(repositoryPath, root) };
}

if (workflow.schema_version !== 1) errors.push('workflow registry schema_version must be 1');
if (workflow.authority !== 'reader-facing A–E workflow topic registry') errors.push('workflow registry authority statement mismatch');
if (!String(workflow.scope_note).includes('not presented as the number of DFT operations')) errors.push('workflow registry must reject a public operation-count interpretation');
if (!Array.isArray(workflow.sections)) errors.push('workflow registry sections must be an array');

const sectionIds = workflow.sections.map((section) => section.id);
if (JSON.stringify(sectionIds) !== JSON.stringify(expectedSections)) errors.push(`workflow sections must be A–E in order: ${JSON.stringify(sectionIds)}`);
const expectedSectionTitles = new Map([
  ['A', 'Structure & Model'],
  ['B', 'Method & Numerical Setup'],
  ['C', 'Reference State'],
  ['D', 'Target Calculations'],
  ['E', 'Validation, Interpretation & Reproducibility'],
]);
for (const section of workflow.sections) {
  const expectedTitle = expectedSectionTitles.get(section.id);
  if (expectedTitle !== undefined && section.title !== expectedTitle) {
    errors.push(`section ${section.id} title must be ${JSON.stringify(expectedTitle)}: ${JSON.stringify(section.title)}`);
  }
}
const sectionSlugs = workflow.sections.map((section) => section.slug);
if (new Set(sectionSlugs).size !== sectionSlugs.length) errors.push('workflow section slugs must be unique');

const topics = [];
for (const section of workflow.sections) {
  if (!slugPattern.test(section.slug)) errors.push(`invalid section slug: ${section.slug}`);
  if (typeof section.title !== 'string' || section.title.length === 0) errors.push(`section ${section.id} has no title`);
  if (typeof section.summary !== 'string' || section.summary.length === 0) errors.push(`section ${section.id} has no summary`);
  const expectedRole = section.id === 'D' ? 'branching-library' : 'backbone';
  if (section.role !== expectedRole) errors.push(`section ${section.id} role must be ${expectedRole}`);
  if (!Array.isArray(section.groups) || section.groups.length === 0) errors.push(`section ${section.id} must contain groups`);

  const groupIds = section.groups.map((group) => group.id);
  if (section.id === 'D') {
    if (JSON.stringify(groupIds) !== JSON.stringify(expectedDGroups)) errors.push(`section D groups must be D1–D5: ${JSON.stringify(groupIds)}`);
  } else if (JSON.stringify(groupIds) !== JSON.stringify([section.id])) {
    errors.push(`section ${section.id} must use one same-letter group`);
  }

  for (const group of section.groups) {
    if (!slugPattern.test(group.slug)) errors.push(`invalid group slug: ${group.slug}`);
    if (typeof group.title !== 'string' || group.title.length === 0) errors.push(`group ${group.id} has no title`);
    if (typeof group.summary !== 'string' || group.summary.length === 0) errors.push(`group ${group.id} has no summary`);
    if (!Array.isArray(group.topics) || group.topics.length === 0) errors.push(`group ${group.id} must contain topics`);
    for (const topic of group.topics) {
      const keys = Object.keys(topic).sort();
      if (JSON.stringify(keys) !== JSON.stringify(['slug', 'title'])) errors.push(`${topic.slug ?? group.id}: topic records may contain only slug and title`);
      if (!slugPattern.test(topic.slug)) errors.push(`invalid topic slug: ${topic.slug}`);
      if (typeof topic.title !== 'string' || topic.title.length === 0) errors.push(`${topic.slug}: topic has no title`);
      if (/^(?:O\d{2}|\d{2})\b/.test(topic.title)) errors.push(`${topic.slug}: public topic title must not expose a numbered taxonomy`);
      topics.push({ ...topic, section: section.id, group: group.id });
    }
  }
}

const topicSlugs = topics.map((topic) => topic.slug);
if (new Set(topicSlugs).size !== topicSlugs.length) errors.push('workflow topic slugs must be unique');
const topicTitles = topics.map((topic) => topic.title);
if (new Set(topicTitles).size !== topicTitles.length) errors.push('workflow topic titles must be unique');

const oldSlugs = new Set([...operations.map((operation) => operation.slug), ...legacy.map((entry) => entry.slug)]);
for (const slug of topicSlugs) if (oldSlugs.has(slug)) errors.push(`${slug}: new topic route collides with a transitional route`);

const topicSet = new Set(topicSlugs);
const operationSet = new Set(operations.map((operation) => operation.id));
const legacySet = new Set(legacy.map((entry) => entry.slug));
const recipeSet = new Set(recipes.map((recipe) => recipe.slug));
for (const [topicSlug, sources] of Object.entries(workflow.migration_sources ?? {})) {
  if (!topicSet.has(topicSlug)) errors.push(`migration source key does not resolve to a workflow topic: ${topicSlug}`);
  for (const id of sources.core_operations ?? []) if (!operationSet.has(id)) errors.push(`${topicSlug}: unknown transitional core operation ${id}`);
  for (const slug of sources.legacy_routes ?? []) if (!legacySet.has(slug)) errors.push(`${topicSlug}: unknown legacy route ${slug}`);
  for (const slug of sources.recipes ?? []) if (!recipeSet.has(slug)) errors.push(`${topicSlug}: unknown transitional recipe ${slug}`);
}

if (!Array.isArray(workedWorkflows)) {
  errors.push('recipes workflows must be an array');
} else {
  const workedWorkflowSlugs = workedWorkflows.map((entry) => entry.slug);
  if (JSON.stringify(workedWorkflowSlugs) !== JSON.stringify(expectedWorkedWorkflowSlugs)) errors.push(`worked workflows must be the frozen Silicon and Aluminium routes in order: ${JSON.stringify(workedWorkflowSlugs)}`);

  for (const entry of workedWorkflows) {
    const label = `worked workflow ${entry.slug}`;
    const caseRoot = `examples/cases/${entry.slug}`;
    const caseRootUrl = new URL(`${caseRoot}/`, root);
    let manifest = null;
    let manifestStrings = new Set();
    try {
      await access(caseRootUrl);
      const manifestNames = (await readdir(caseRootUrl)).filter((name) => /manifest.*\.json$|^manifest\.json$/i.test(name)).sort();
      const manifestName = manifestNames.includes('manifest.json') ? 'manifest.json' : manifestNames[0];
      if (!manifestName) errors.push(`${label}: case root has no JSON manifest`);
      else {
        manifest = JSON.parse(await readFile(new URL(manifestName, caseRootUrl), 'utf8'));
        manifestStrings = collectStrings(manifest);
      }
    } catch (error) {
      errors.push(`${label}: cannot load case root/manifest: ${error instanceof Error ? error.message : String(error)}`);
    }

    const start = entry.start_here;
    if (!start || typeof start !== 'object') errors.push(`${label}: start_here is required`);
    else {
      if (start.repository_url !== 'https://github.com/Maxwell3919/DFT-Research-Workflow.git') errors.push(`${label}: start_here.repository_url mismatch`);
      if (start.source_revision_token !== '{SOURCE_REVISION}') errors.push(`${label}: start_here.source_revision_token must be {SOURCE_REVISION}`);
      if (start.working_directory !== 'repository-root') errors.push(`${label}: start_here.working_directory must be repository-root`);
      if (start.case_root !== caseRoot) errors.push(`${label}: start_here.case_root must be ${caseRoot}`);
      if (!Array.isArray(start.acquisition_commands) || start.acquisition_commands.length === 0 || start.acquisition_commands.some((command) => typeof command !== 'string' || command.length === 0)) errors.push(`${label}: acquisition_commands must be non-empty strings`);
      validateAction(start.first_action, `${label}/start_here.first_action`);
    }

    if (!Array.isArray(entry.execution_contexts) || entry.execution_contexts.length < 2) errors.push(`${label}: login-node and Slurm execution contexts are required`);
    else {
      const contextIds = entry.execution_contexts.map((context) => context.id);
      if (!contextIds.some((id) => /local.*interactive/i.test(id))) errors.push(`${label}: local-interactive context is missing`);
      if (!contextIds.some((id) => /slurm/i.test(id))) errors.push(`${label}: Slurm context is missing`);
      if (!entry.execution_contexts.some((context) => /login node/i.test(context.boundary ?? ''))) errors.push(`${label}: login-node execution prohibition is missing`);
      for (const context of entry.execution_contexts) {
        for (const field of ['id', 'label', 'allowed_when', 'boundary']) if (typeof context[field] !== 'string' || context[field].length === 0) errors.push(`${label}: execution context ${context.id ?? '<unknown>'} needs ${field}`);
      }
    }

    if (!Array.isArray(entry.evidence_tracks) || !entry.evidence_tracks.some((track) => /stored/i.test(track.id)) || !entry.evidence_tracks.some((track) => /fresh/i.test(track.id))) errors.push(`${label}: stored and fresh evidence tracks are required`);
    else for (const track of entry.evidence_tracks) {
      for (const field of ['id', 'label', 'output_policy', 'parse_plot_boundary', 'boundary']) if (typeof track[field] !== 'string' || track[field].length === 0) errors.push(`${label}: evidence track ${track.id ?? '<unknown>'} needs ${field}`);
      if (typeof track.launches_dft !== 'boolean') errors.push(`${label}: evidence track ${track.id} launches_dft must be boolean`);
      if (!Array.isArray(track.commands) || !Array.isArray(track.audit)) errors.push(`${label}: evidence track ${track.id} commands/audit must be arrays`);
      if (/stored/i.test(track.id) && track.launches_dft) errors.push(`${label}: stored track must not launch DFT`);
      if (/fresh/i.test(track.id) && !track.launches_dft) errors.push(`${label}: fresh track must launch DFT`);
    }

    const sourceRecords = Array.isArray(entry.source_records) ? entry.source_records : [];
    if (sourceRecords.length === 0) errors.push(`${label}: source_records are required`);
    const shaRolePairs = new Set();
    for (const record of sourceRecords) {
      for (const field of ['id', 'label', 'role', 'boundary']) if (typeof record[field] !== 'string' || record[field].length === 0) errors.push(`${label}: source record ${record.id ?? '<unknown>'} needs ${field}`);
      if (!Array.isArray(record.case_files) || record.case_files.length === 0) errors.push(`${label}: source record ${record.id} needs case_files`);
      for (const path of record.case_files ?? []) {
        const resolved = resolveCasePath(caseRoot, path);
        if (!resolved) errors.push(`${label}: source record ${record.id} has invalid case file ${path}`);
        else try { await access(resolved.url); } catch { errors.push(`${label}: source record ${record.id} is missing case file ${resolved.repositoryPath}`); }
      }
      for (const identity of record.identity ?? []) {
        const sha = String(identity).match(/\b[a-f0-9]{64}\b/i)?.[0]?.toLowerCase();
        if (!sha) continue;
        const pair = `${record.role}:${sha}`;
        if (shaRolePairs.has(pair)) errors.push(`${label}: duplicate source SHA/role ${pair}`);
        shaRolePairs.add(pair);
      }
    }

    if (!entry.reader_route || entry.reader_route.schema_version !== 1 || !Array.isArray(entry.reader_route.stages)) errors.push(`${label}: reader_route schema_version 1 with stages is required`);
    else {
      const stages = entry.reader_route.stages;
      const stageIds = stages.map((stage) => stage.id);
      if (JSON.stringify(stageIds) !== JSON.stringify(expectedReaderStageIds)) errors.push(`${label}: reader_route must use the frozen 13 stage IDs in order: ${JSON.stringify(stageIds)}`);
      if (new Set(stageIds).size !== stageIds.length) errors.push(`${label}: reader_route stage IDs must be unique`);
      for (const stage of stages) {
        const stageLabel = `${label}/${stage.id}`;
        for (const field of ['label', 'purpose', 'boundary']) if (typeof stage[field] !== 'string' || stage[field].length === 0) errors.push(`${stageLabel}: ${field} is required`);
        if (stage.action !== undefined) validateAction(stage.action, `${stageLabel}/action`);
        for (const field of stageReferenceFields) if (!Array.isArray(stage[field]) || new Set(stage[field]).size !== stage[field].length || stage[field].some((value) => typeof value !== 'string' || value.length === 0)) errors.push(`${stageLabel}: ${field} must be a unique string array`);
        for (const slug of stage.topic_slugs ?? []) if (!topicSet.has(slug)) errors.push(`${stageLabel}: unknown topic_slug ${slug}`);
        for (const path of stage.case_files ?? []) {
          const resolved = resolveCasePath(caseRoot, path);
          if (!resolved) errors.push(`${stageLabel}: invalid case path ${path}`);
          else try { await access(resolved.url); } catch { errors.push(`${stageLabel}: missing case path ${resolved.repositoryPath}`); }
        }
        for (const path of stage.artifact_paths ?? []) {
          const resolved = resolveCasePath(caseRoot, path);
          if (!resolved) errors.push(`${stageLabel}: invalid artifact path ${path}`);
          else {
            try { await access(resolved.url); } catch { errors.push(`${stageLabel}: missing artifact path ${resolved.repositoryPath}`); }
            if (manifest && !manifestStrings.has(path) && !manifestStrings.has(resolved.repositoryPath)) errors.push(`${stageLabel}: artifact path is not indexed by the case manifest: ${path}`);
          }
        }
        for (const id of [...(stage.execution_route_ids ?? []), ...(stage.command_stages ?? [])]) if (manifest && !manifestStrings.has(id)) errors.push(`${stageLabel}: manifest does not resolve ${id}`);
      }
    }

    const continuousIds = entry.continuous_execution_route_ids;
    if (!Array.isArray(continuousIds) || continuousIds.some((id) => typeof id !== 'string' || id.length === 0)) errors.push(`${label}: continuous_execution_route_ids must be a string array`);
    for (const field of ['history_kind', 'evidence_boundary', 'continuity_boundary', 'claim_boundary']) if (typeof entry[field] !== 'string' || entry[field].length === 0) errors.push(`${label}: ${field} is required`);
    const stages = entry.reader_route?.stages ?? [];
    const convergenceStage = stages.find((stage) => stage.id === 'convergence');
    const relaxationStage = stages.find((stage) => stage.id === 'relaxation-reference-geometry');
    const scfStage = stages.find((stage) => stage.id === 'scf');
    if (!normalized(convergenceStage?.observable_convergence).includes('not-tested') || normalized(convergenceStage?.observable_convergence).includes('g4')) errors.push(`${label}: reader-facing observable convergence must remain not tested without internal gate codes`);
    if (!normalized(manifest?.gates?.G4?.status).includes('not-tested')) errors.push(`${label}: case manifest must retain internal G4 NOT_TESTED`);

    if (entry.slug === 'silicon-ground-state-electronic-structure') {
      if (!normalized(entry.history_kind).includes('assembled')) errors.push(`${label}: Silicon history_kind must remain assembled`);
      if ((continuousIds ?? []).length !== 0) errors.push(`${label}: Silicon must claim no continuous execution route`);
      const runStage = stages.find((stage) => stage.id === 'run');
      if (!normalized(`${runStage?.coverage ?? ''} ${runStage?.boundary ?? ''}`).includes('template')) errors.push(`${label}: Silicon run stage must expose the run template boundary`);
      if (!/relax|geometry/i.test(scfStage?.boundary ?? '') || !/lineage|ancestry|input/i.test(scfStage?.boundary ?? '')) errors.push(`${label}: Silicon SCF must state the relaxation-to-SCF geometry lineage boundary`);
    }
    if (entry.slug === 'aluminium-metallic-electronic-structure') {
      if ((continuousIds ?? []).length !== 1 || !/isolated.*dos|dos.*isolated/i.test(continuousIds?.[0] ?? '')) errors.push(`${label}: Aluminium must expose only the isolated DOS continuous route`);
      if ((relaxationStage?.execution_route_ids ?? []).some((id) => continuousIds?.includes(id))) errors.push(`${label}: Aluminium relaxation must remain outside the isolated DOS route`);
      if (!normalized(convergenceStage?.assessment).includes('fail')) errors.push(`${label}: Aluminium convergence assessment must remain FAIL`);
      const roles = sourceRecords.map((record) => normalized(record.role));
      if (!roles.some((role) => role.includes('source') || role.includes('structure')) || !roles.some((role) => role.includes('pseudo'))) errors.push(`${label}: Aluminium source and pseudopotential records must both remain visible`);
      if (!Array.isArray(entry.record_conflicts) || entry.record_conflicts.length === 0) errors.push(`${label}: Aluminium source/pseudopotential record conflict must remain explicit`);
    }
  }
}

// DRW_HUMAN_ROUTE_ACCEPTANCE
{
  const manualRecipes = JSON.parse(readFileForManualAcceptance('recipes/index.json', 'utf8'));
  const manualWorkflow = (slug) => manualRecipes.workflows.find((item) => item.slug === slug);
  const siliconManual = manualWorkflow('silicon-ground-state-electronic-structure');
  const aluminiumManual = manualWorkflow('aluminium-metallic-electronic-structure');
  if (!siliconManual || !aluminiumManual) {
    errors.push('manual acceptance requires Silicon and Aluminium worked workflows');
  } else {
    const freshTrack = (workflow) => workflow.evidence_tracks.find((track) => track.id === 'fresh-runtime');
    const storedTrack = (workflow) => workflow.evidence_tracks.find((track) => track.id === 'stored-reconstruction');
    const siliconFresh = freshTrack(siliconManual);
    const aluminiumFresh = freshTrack(aluminiumManual);
    const siliconCommands = siliconFresh?.commands.join('\n') ?? '';
    const aluminiumCommands = aluminiumFresh?.commands.join('\n') ?? '';
    for (const workflow of [siliconManual, aluminiumManual]) {
      const startCommands = workflow.start_here?.first_action?.commands?.join('\n') ?? '';
      const storedCommands = storedTrack(workflow)?.commands?.join('\n') ?? '';
      if (!startCommands.includes(`case_root=${workflow.start_here.case_root}`)) errors.push(`${workflow.slug}: first action must define its own case_root`);
      if (!storedCommands.includes(`case_root=${workflow.start_here.case_root}`)) errors.push(`${workflow.slug}: stored track must define its own case_root`);
    }
    for (const token of ['si-relax.in', 'Begin final coordinates', 'ACCEPT_RELAX_GEOMETRY', 'final-positions.inc', 'static-scf.in', 'JOB DONE', 'si_cod9013102.save']) {
      if (!siliconCommands.includes(token)) {
        errors.push('Silicon fresh-runtime is missing ' + token);
      }
    }
    for (const token of ['qe_manual_handoff.py', 'prepare-reference', 'audit-scf', 'extract-runtime', 'package-study', 'QE_BANDS', 'QE_DOS', 'run.sh']) {
      if (siliconCommands.includes(token)) errors.push('Silicon fresh-runtime must not expose the old helper/full-replay route: ' + token);
    }
    if (!/new static SCF is not the parent of the stored bands or DOS/i.test(siliconFresh?.boundary ?? '') || !/future compatible bands\/NSCF\/DOS branch/i.test(siliconFresh?.boundary ?? '')) {
      errors.push('Silicon fresh-runtime must stop after static SCF and reject ancestry to stored bands/DOS');
    }
    if (!/No fresh bands or DOS parsing is attempted/i.test(siliconFresh?.parse_plot_boundary ?? '')) {
      errors.push('Silicon fresh-runtime must not imply fresh downstream parsing');
    }

    for (const token of ['QE_PW', 'QE_DOS', 'QE_PSEUDO_DIR', 'RUN_OUTPUT_ROOT', 'run.sh', 'al.dos']) {
      if (!aluminiumCommands.includes(token)) errors.push('Aluminium fresh-runtime is missing runner contract token ' + token);
    }
    for (const token of ['qe_manual_handoff.py', 'extract-runtime', '$prepared']) {
      if (aluminiumCommands.includes(token)) errors.push('Aluminium fresh-runtime must not expose the old helper/undefined-variable route: ' + token);
    }
    if (/(^|\s)PSEUDO_DIR=/.test(aluminiumCommands) || /(^|\s)RUNTIME_DIR=/.test(aluminiumCommands)) {
      errors.push('Aluminium fresh-runtime must use QE_PSEUDO_DIR and RUN_OUTPUT_ROOT, not the Silicon runner contract');
    }
    if (!/test -x.*QE_PW/.test(aluminiumCommands) || !/test -x.*QE_DOS/.test(aluminiumCommands)) {
      errors.push('Aluminium fresh-runtime must check the supplied executable paths before launch');
    }
    if (!/no relaxation/i.test(aluminiumFresh?.boundary ?? '')) {
      errors.push('Aluminium fresh-runtime must state that no relaxation is included');
    }

    const stage = (workflow, id) => workflow.reader_route.stages.find((item) => item.id === id);
    const actionCommands = (workflow, id) => stage(workflow, id)?.action?.commands?.join('\n') ?? '';
    const allPublicActionCommands = (workflow) => [workflow.start_here?.first_action, ...(workflow.reader_route?.stages ?? []).map((item) => item.action)]
      .filter(Boolean)
      .flatMap((action) => action.commands ?? [])
      .join('\n');

    const siliconSource = actionCommands(siliconManual, 'source');
    if (!siliconSource.includes('silicon-cod-9013102.cif') || siliconSource.includes('$prepared')) errors.push('Silicon source action must inspect the source record without an undefined prepared path');
    const siliconPseudo = actionCommands(siliconManual, 'pseudopotential');
    for (const token of ['prepare-replay.py', '--download-pseudopotential', 'sha256sum --check']) if (!siliconPseudo.includes(token)) errors.push('Silicon pseudopotential action is missing ' + token);
    const siliconRelax = actionCommands(siliconManual, 'relaxation-reference-geometry');
    for (const token of ['Begin final coordinates', 'ACCEPT_RELAX_GEOMETRY', 'final-positions.inc', 'static-scf.in', 'diff -u']) if (!siliconRelax.includes(token)) errors.push('Silicon geometry handoff action is missing ' + token);
    const siliconScf = actionCommands(siliconManual, 'scf');
    for (const token of ['QE_PW', 'JOB DONE', 'si_cod9013102.save']) if (!siliconScf.includes(token)) errors.push('Silicon SCF action is missing ' + token);
    const siliconBands = stage(siliconManual, 'bands-dos');
    if (!/not the parent/i.test(actionCommands(siliconManual, 'bands-dos')) || !/fresh route stops after static SCF/i.test(siliconBands?.boundary ?? '')) errors.push('Silicon bands/DOS stage must keep stored data separate and state the fresh stopping point');
    const siliconPreserve = actionCommands(siliconManual, 'preserve');
    for (const token of ['runtime=', 'record=', 'sums=', 'stops after static SCF']) if (!siliconPreserve.includes(token)) errors.push('Silicon preservation action is missing the direct bounded record token ' + token);

    const aluminiumPseudo = actionCommands(aluminiumManual, 'pseudopotential');
    for (const token of ['curl --fail', '1500731', 'sha256sum --check']) if (!aluminiumPseudo.includes(token)) errors.push('Aluminium pseudopotential action is missing ' + token);
    const aluminiumRun = actionCommands(aluminiumManual, 'run');
    for (const token of ['QE_PW', 'QE_DOS', 'QE_PSEUDO_DIR', 'RUN_OUTPUT_ROOT', 'run.sh']) if (!aluminiumRun.includes(token)) errors.push('Aluminium run action is missing ' + token);
    const aluminiumConvergence = stage(aluminiumManual, 'convergence');
    if (aluminiumConvergence?.assessment !== 'FAIL' || !normalized(aluminiumConvergence?.observable_convergence).includes('not-tested')) errors.push('Aluminium convergence stage must retain FAIL and observable convergence not tested');
    if (!/not a program failure/i.test(aluminiumConvergence?.boundary ?? '') || !/scientific rejection/i.test(aluminiumConvergence?.boundary ?? '')) errors.push('Aluminium convergence FAIL must retain its non-rejection boundary');
    const aluminiumInterpret = stage(aluminiumManual, 'interpret');
    if (!/FAIL/.test(aluminiumInterpret?.assessment ?? '') || !normalized(aluminiumInterpret?.observable_convergence).includes('not-tested')) errors.push('Aluminium interpretation must retain the adverse screen and NOT TESTED observable boundary');

    for (const [workflowName, commands] of [
      ['Silicon', allPublicActionCommands(siliconManual)],
      ['Aluminium', allPublicActionCommands(aluminiumManual)],
    ]) {
      for (const token of ['qe_manual_handoff.py', 'prepare-reference', 'audit-scf', 'extract-runtime', 'package-study']) {
        if (commands.includes(token)) errors.push(`${workflowName} reader actions must not expose internal helper route ${token}`);
      }
    }
  }

  const guideChecks = [
    [
      'src/content/practical-guides/prepare-fixed-geometry-reference-calculation.md',
      ['last complete', 'static-scf.in', 'diff -u', 'JOB DONE', 'Use this new static run as the explicit parent'],
    ],
    [
      'src/content/practical-guides/converge-basis-cutoffs-and-grids.md',
      ['for ecut in 30 40 50', 'for kmesh in 6 8 10', 'pw.x -in', 'Energy convergence does not imply'],
    ],
    [
      'src/content/practical-guides/package-reusable-reference-state-lineage.md',
      ['test ! -e "$study"', 'README.md', 'SHA256SUMS', 'sha256sum -c', 'It does not prove'],
    ],
  ];
  for (const [path, tokens] of guideChecks) {
    const text = readFileForManualAcceptance(path, 'utf8');
    for (const token of tokens) {
      if (!text.includes(token)) errors.push(path + ' is missing ' + token);
    }
    if (/\bG[0-5]\b/.test(text)) {
      errors.push(path + ' exposes an internal evidence gate code');
    }
    if (/package-study|--run-regeneration-check/.test(text)) {
      errors.push(path + ' exposes the retired internal packaging helper route');
    }
  }
}


if (errors.length > 0) {
  console.error(`A–E workflow validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('A–E workflow registry valid: stable sections, navigation groups, unique topic routes, resolved migration references, and no collision with transitional URLs.');

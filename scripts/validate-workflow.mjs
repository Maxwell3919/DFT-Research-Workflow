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

if (errors.length > 0) {
  console.error(`A–E workflow validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('A–E workflow registry valid: stable sections, navigation groups, unique topic routes, resolved migration references, and no collision with transitional URLs.');

import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const operations = JSON.parse(await readFile(new URL('src/data/operations.json', root), 'utf8'));
const stages = JSON.parse(await readFile(new URL('src/data/stages.json', root), 'utf8'));
const errors = [];
const required = [
  'id', 'stage', 'title', 'summary', 'inputs', 'outputs', 'prerequisites',
  'convergence_axes', 'validation_gates', 'supported_tools',
  'automation_maturity', 'evidence_boundary',
];
const maturity = new Set(['manual', 'assisted', 'candidate']);
const stageIds = new Set(stages.map((stage) => stage.id));
const operationIds = new Set(operations.map((operation) => operation.id));

if (stages.length !== 8) errors.push(`expected 8 stages, found ${stages.length}`);
if (operations.length !== 35) errors.push(`expected 35 operations, found ${operations.length}`);
if (stageIds.size !== stages.length) errors.push('stage ids are not unique');
if (operationIds.size !== operations.length) errors.push('operation ids are not unique');

for (const operation of operations) {
  for (const key of required) {
    if (!(key in operation)) errors.push(`${operation.id ?? '<unknown>'}: missing ${key}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(operation.id)) errors.push(`${operation.id}: invalid id`);
  if (!stageIds.has(operation.stage)) errors.push(`${operation.id}: unknown stage ${operation.stage}`);
  if (!maturity.has(operation.automation_maturity)) errors.push(`${operation.id}: invalid maturity`);
  for (const key of ['inputs', 'outputs', 'prerequisites', 'convergence_axes', 'validation_gates', 'supported_tools']) {
    if (!Array.isArray(operation[key])) errors.push(`${operation.id}: ${key} must be an array`);
  }
  if (operation.outputs.length === 0) errors.push(`${operation.id}: at least one output is required`);
  if (operation.validation_gates.length === 0) errors.push(`${operation.id}: at least one validation gate is required`);
  if (operation.evidence_boundary.length < 12) errors.push(`${operation.id}: evidence boundary is too short`);
  for (const prerequisite of operation.prerequisites) {
    if (!operationIds.has(prerequisite)) errors.push(`${operation.id}: unknown prerequisite ${prerequisite}`);
    if (prerequisite === operation.id) errors.push(`${operation.id}: operation cannot depend on itself`);
  }
}

for (const stage of stages) {
  const count = operations.filter((operation) => operation.stage === stage.id).length;
  if (count === 0) errors.push(`${stage.id}: stage has no operations`);
}

if (errors.length > 0) {
  console.error(`Operation registry validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const counts = Object.fromEntries(stages.map((stage) => [stage.id, operations.filter((operation) => operation.stage === stage.id).length]));
console.log(`Operation registry valid: ${stages.length} stages, ${operations.length} operations.`);
console.log(JSON.stringify(counts));

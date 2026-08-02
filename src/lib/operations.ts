import operationsDocument from '../../ontology/operations.json';
import legacyDocument from '../../ontology/legacy-operations.json';
import recipesDocument from '../../recipes/index.json';

export const lifecycleGroups = [
  {
    id: 'source-and-identity',
    anchor: 'source-and-identity',
    label: 'Source and Identity',
    range: 'O01–O04',
    summary: 'Acquire, parse, verify, and canonicalize source objects.',
  },
  {
    id: 'model-preparation',
    anchor: 'model-preparation',
    label: 'Model Preparation',
    range: 'O05–O06',
    summary: 'Build computational models and reduce configurational alternatives.',
  },
  {
    id: 'protocol-design',
    anchor: 'protocol-design',
    label: 'Protocol Design',
    range: 'O07–O10',
    summary: 'Specify theory, numerics, references, acceptance criteria, and executable inputs.',
  },
  {
    id: 'computation',
    anchor: 'computation',
    label: 'Computation',
    range: 'O11–O17',
    summary: 'Configure and control execution, solve states, optimize, propagate, respond, and interpolate.',
  },
  {
    id: 'analysis-and-comparison',
    anchor: 'analysis-and-comparison',
    label: 'Analysis and Comparison',
    range: 'O18–O19',
    summary: 'Derive observables and compare results across cases and references.',
  },
  {
    id: 'evidence-and-claim',
    anchor: 'evidence-and-claim',
    label: 'Evidence and Claim',
    range: 'O20–O22',
    summary: 'Separate numerical convergence, physical robustness, and claim support.',
  },
  {
    id: 'preservation',
    anchor: 'preservation',
    label: 'Preservation',
    range: 'O23–O24',
    summary: 'Capture lineage and preserve a reproducibility-ready research bundle.',
  },
] as const;

export type LifecycleId = (typeof lifecycleGroups)[number]['id'];

export interface CoreOperation {
  id: string;
  order: number;
  slug: string;
  name: string;
  lifecycle: LifecycleId;
  definition: string;
  inputs: string[];
  outputs: string[];
  requirement: string;
  repeatability: string;
  dependencies: string[];
  alternatives: string[];
  exclusions: string[];
}

export interface LegacyOperation {
  number: number;
  display_number: string;
  title: string;
  slug: string;
  maps_to: string[];
  entry_kind: string;
  disposition: string;
}

export interface Recipe {
  slug: string;
  title: string;
  operations: string[];
  system_types: string[];
  scientific_targets: string[];
  methods: string[];
  status: string;
}

const coreOperations = operationsDocument.operations as CoreOperation[];
const legacyOperations = legacyDocument.entries as LegacyOperation[];
const recipes = recipesDocument.recipes as Recipe[];

export function getOperations(): CoreOperation[] {
  return [...coreOperations].sort((left, right) => left.order - right.order);
}

export function getLegacyOperations(): LegacyOperation[] {
  return [...legacyOperations].sort((left, right) => left.number - right.number);
}

export function getRecipes(): Recipe[] {
  return [...recipes];
}

export function getRecipeBySlug(slug: string): Recipe {
  const recipe = recipes.find((candidate) => candidate.slug === slug);
  if (!recipe) throw new Error(`Unknown recipe: ${slug}`);
  return recipe;
}


export const recipeTiers = [
  { label: 'Tier 1 — Foundational workflows', slugs: ['bulk-structure-and-bands', 'two-dimensional-electronic-structure', 'magnetic-order-comparison', 'harmonic-phonons'] },
  { label: 'Tier 2 — Common model-specific workflows', slugs: ['defect-formation-energy', 'surface-and-adsorption', 'heterostructure-band-alignment', 'reaction-path-and-diffusion'] },
  { label: 'Tier 3 — Response, spectra, and finite temperature', slugs: ['dielectric-polarization-piezoelectric', 'ab-initio-molecular-dynamics', 'optical-and-excited-states'] },
  { label: 'Tier 4 — Advanced composite workflows', slugs: ['soc-and-topology', 'anharmonic-thermal-transport', 'electron-phonon-superconductivity', 'gw-bse', 'high-throughput-screening'] },
] as const;

export function getOperationById(id: string): CoreOperation {
  const operation = coreOperations.find((candidate) => candidate.id === id);
  if (!operation) throw new Error(`Unknown core operation: ${id}`);
  return operation;
}

export function getLifecycle(lifecycleId: LifecycleId) {
  const lifecycle = lifecycleGroups.find((candidate) => candidate.id === lifecycleId);
  if (!lifecycle) throw new Error(`Unknown lifecycle: ${lifecycleId}`);
  return lifecycle;
}

export function humanizeToken(token: string): string {
  return token.replaceAll('_', ' ').replaceAll('-', ' ');
}

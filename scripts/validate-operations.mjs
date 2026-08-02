import { readFile, readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';

const root = new URL('../', import.meta.url);
const contentDirectory = new URL('src/content/operations/', root).pathname;
const expected = [[0,"Define the Scientific Question and Computational Objective","common-workflow","00-scientific-question"],[1,"Initialize the Project, Directory Structure, and Provenance","common-workflow","01-project-initialization"],[2,"Acquire Source Structures and Reference Data","common-workflow","02-source-structures"],[3,"Parse, Clean, and Standardize Structures","common-workflow","03-structure-standardization"],[4,"Build the Computational Model","common-workflow","04-computational-model"],[5,"Enumerate Candidate Configurations","common-workflow","05-candidate-configurations"],[6,"Choose the Electronic-Structure Method","common-workflow","06-electronic-structure-method"],[7,"Choose Pseudopotentials, PAW Datasets, Basis Sets, and Core Treatment","common-workflow","07-core-treatment-and-basis"],[8,"Set Boundary Conditions and Long-Range Interactions","common-workflow","08-boundary-conditions"],[9,"Design Numerical Convergence Tests","common-workflow","09-convergence-tests"],[10,"Plan the Workflow and Calculation Dependencies","common-workflow","10-workflow-planning"],[11,"Generate Inputs and Perform Preflight Checks","common-workflow","11-inputs-and-preflight"],[12,"Configure the Runtime Environment and HPC Resources","common-workflow","12-runtime-and-hpc-resources"],[13,"Submit, Monitor, and Control Calculations","common-workflow","13-submit-monitor-and-control"],[14,"Run the Ground-State SCF Calculation","common-workflow","14-ground-state-scf"],[15,"Optimize Atomic Positions and the Simulation Cell","common-workflow","15-structure-optimization"],[16,"Run the High-Accuracy Static Ground-State Calculation","common-workflow","16-high-accuracy-static"],[17,"Inspect Calculation Status and Initial Numerical Results","common-workflow","17-status-and-initial-results"],[18,"Calculate Band Structures, Density of States, and Fermi Surfaces","property-workflows","18-bands-dos-and-fermi-surfaces"],[19,"Analyze Charge Density, Electrostatic Potential, and Chemical Bonding","property-workflows","19-charge-potential-and-bonding"],[20,"Study Magnetism","property-workflows","20-magnetism"],[21,"Calculate Equations of State and Structural Phase Stability","property-workflows","21-equations-of-state-and-phase-stability"],[22,"Calculate Elastic, Mechanical, and Piezoelectric Properties","property-workflows","22-elastic-mechanical-and-piezoelectric"],[23,"Calculate Phonons and Harmonic Vibrational Properties","property-workflows","23-phonons-and-harmonic-vibrations"],[24,"Study Anharmonicity, Thermodynamics, and Lattice Thermal Transport","property-workflows","24-anharmonicity-and-thermal-transport"],[25,"Calculate Electron-Phonon Coupling and Conventional Superconductivity","property-workflows","25-electron-phonon-and-superconductivity"],[26,"Study Defects, Doping, and Disorder","property-workflows","26-defects-doping-and-disorder"],[27,"Study Surfaces, Interfaces, Adsorption, and Layered Systems","property-workflows","27-surfaces-interfaces-and-adsorption"],[28,"Calculate Reaction Paths, Diffusion, and Kinetic Barriers","property-workflows","28-reaction-paths-and-barriers"],[29,"Calculate Dielectric, Polarization, Ferroelectric, and Response Properties","property-workflows","29-dielectric-polarization-and-response"],[30,"Calculate Optical, Spectroscopic, and Excited-State Properties","property-workflows","30-optical-and-excited-state-properties"],[31,"Build Wannier Models and Study Berry Phases, Topology, and Transport","property-workflows","31-wannier-topology-and-transport"],[32,"Run Molecular Dynamics, Finite-Temperature Simulations, and Sampling","property-workflows","32-molecular-dynamics-and-sampling"],[33,"Go Beyond Conventional Kohn–Sham DFT","property-workflows","33-beyond-kohn-sham-dft"],[34,"Post-Process, Validate, Compare, Archive, and Reuse Results","closing-loop","34-postprocessing-validation-and-reuse"]];
const expectedFields = ['number', 'title', 'part', 'slug', 'status'];
const errors = [];

function parseEntry(source, filename) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    errors.push(`${filename}: invalid frontmatter boundary`);
    return null;
  }
  const data = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^([a-z]+):\s*(.*)$/);
    if (!field) {
      errors.push(`${filename}: invalid frontmatter line ${JSON.stringify(line)}`);
      continue;
    }
    data[field[1]] = field[1] === 'number' ? Number(field[2]) : field[2];
  }
  if (match[2].trim() !== '') errors.push(`${filename}: scaffold body must remain empty`);
  return data;
}

const filenames = (await readdir(contentDirectory)).filter((name) => name.endsWith('.md')).sort();
if (filenames.length !== 35) errors.push(`expected 35 operation files, found ${filenames.length}`);

const entries = [];
for (const filename of filenames) {
  const data = parseEntry(await readFile(join(contentDirectory, filename), 'utf8'), filename);
  if (!data) continue;
  const keys = Object.keys(data).sort();
  if (JSON.stringify(keys) !== JSON.stringify([...expectedFields].sort())) {
    errors.push(`${filename}: fields must be exactly ${expectedFields.join(', ')}`);
  }
  if (basename(filename, '.md') !== data.slug) errors.push(`${filename}: filename must equal slug`);
  if (data.status !== 'scaffold') errors.push(`${filename}: status must be scaffold`);
  entries.push(data);
}

entries.sort((left, right) => left.number - right.number);
const numbers = entries.map((entry) => entry.number);
const slugs = entries.map((entry) => entry.slug);
if (new Set(numbers).size !== numbers.length) errors.push('duplicate operation number');
if (new Set(slugs).size !== slugs.length) errors.push('duplicate operation slug');
if (JSON.stringify(numbers) !== JSON.stringify(Array.from({ length: 35 }, (_, index) => index))) {
  errors.push(`operation numbers must be continuous 00–34: ${JSON.stringify(numbers)}`);
}

for (const [number, title, part, slug] of expected) {
  const entry = entries[number];
  if (!entry) continue;
  for (const [field, value] of Object.entries({ number, title, part, slug })) {
    if (entry[field] !== value) errors.push(`Operation ${String(number).padStart(2, '0')}: ${field} mismatch`);
  }
}

const counts = Object.fromEntries(
  ['common-workflow', 'property-workflows', 'closing-loop'].map((part) => [
    part,
    entries.filter((entry) => entry.part === part).length,
  ]),
);
if (counts['common-workflow'] !== 18) errors.push(`Part I must contain 18 operations, found ${counts['common-workflow']}`);
if (counts['property-workflows'] !== 16) errors.push(`Part II must contain 16 operations, found ${counts['property-workflows']}`);
if (counts['closing-loop'] !== 1) errors.push(`Part III must contain 1 operation, found ${counts['closing-loop']}`);
if (entries.at(-1)?.number !== 34 || entries.at(-1)?.part !== 'closing-loop') errors.push('Operation 34 must be the final and only Part III entry');

if (errors.length > 0) {
  console.error(`Operation validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Operation collection valid: exactly 35 entries, continuous 00–34, parts 18/16/1, fixed titles and explicit unique slugs.');

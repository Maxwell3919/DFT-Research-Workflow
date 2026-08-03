import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const errors = [];
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const topicSlugs = new Set(
  workflow.sections.flatMap((section) =>
    section.groups.flatMap((group) => group.topics.map((topic) => topic.slug)),
  ),
);

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { data: {}, body: source };
  const data = Object.fromEntries(
    match[1]
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [key, ...value] = line.split(':');
        return [key.trim(), value.join(':').trim().replace(/^['"]|['"]$/g, '')];
      }),
  );
  return { data, body: source.slice(match[0].length) };
}

const topicDirectory = new URL('src/content/topics/', root);
const files = (await readdir(topicDirectory)).filter((name) => name.endsWith('.md')).sort();
const reviewed = new Map();

for (const file of files) {
  const source = await readFile(new URL(`src/content/topics/${file}`, root), 'utf8');
  const { data, body } = parseFrontmatter(source);
  if (!topicSlugs.has(data.topic_slug)) errors.push(`${file}: unresolved topic_slug ${data.topic_slug}`);
  if (data.status === 'reviewed') reviewed.set(data.topic_slug, { file, body });
}

const forbiddenHeadings = [
  '## Inputs',
  '## Outputs',
  '## Requirement',
  '## Repeatability',
  '## Dependencies',
  '## Alternatives',
  '## Exclusions',
];

const reviewedTopicSpecifications = {
  'obtain-material-structure': {
    review: 'docs/reviews/2026-08-03-obtain-material-structure.md',
    sections: [
      '## Start with the origin of the structure',
      '## Preserve the source before transforming it',
      '## Read the crystallographic representation, not just the picture',
      '## Experimental and calculated structures answer different questions',
      '## Establish chemical and crystallographic identity',
      '## Treat format conversion as a scientific transformation',
      '## Symmetry is tolerance-dependent',
      '## Inspect geometry before trusting automated checks',
      '## Compare sources when the decision matters',
      '## The result of this task',
      '## Sources and standards',
    ],
    boundaries: [
      'A structure file is not yet a computational model.',
      'A **generated or hypothetical structure** is not experimental evidence.',
      'A value below one is therefore not a small numerical defect to be rounded away.',
      'Choosing that representation belongs to **Build or Modify a Computational Model**.',
      'They are not a certificate that the structure is suitable for a particular DFT calculation.',
      'It should not silently replace partial occupancy, choose a magnetic order, add vacuum, construct a supercell, select a defect configuration, or claim that the source phase is stable.',
    ],
    sources: [
      'https://doi.org/10.1107/S010876739101067X',
      'https://checkcif.iucr.org/',
      'https://docs.materialsproject.org/methodology/materials-methodology/understanding-structures-and-properties-in-the-materials-project',
      'https://docs.materialsproject.org/downloading-data/using-the-api/querying-data',
      'https://docs.materialsproject.org/frequently-asked-questions',
      'https://www.crystallography.net/cod/',
      'https://spglib.readthedocs.io/en/v2.7.0/api/autodoc/spglib.html',
    ],
    reviewStatements: [
      'reviewed within the declared educational scope',
      'does not validate any real material structure',
    ],
  },
  'build-or-modify-computational-model': {
    review: 'docs/reviews/2026-08-03-build-computational-model.md',
    sections: [
      '## Begin with the question the model must answer',
      '## Separate equivalent representations from changes to the physical model',
      '## Choose dimensionality and periodicity explicitly',
      '## Let the supercell encode the relevant length scale',
      '## Construct surfaces and adsorption models deliberately',
      '## Treat defects and dopants as controlled departures from a reference',
      '## Build interfaces and heterostructures as families of candidates',
      '## Replace disorder with a declared approximation',
      '## Include magnetic order and constraints in model identity',
      '## Generate candidates broadly, then reduce them transparently',
      '## Preserve model lineage and identity',
      '## The result of this task',
      '## Sources and methods',
    ],
    boundaries: [
      'The result of this task is often a **model family**, not one privileged file.',
      'Vacuum is part of the boundary model, not empty experimental material.',
      'A supercell is a modelling choice, not merely a larger file.',
      'Choosing a charge state changes the model even before an electronic-structure method is selected.',
      'No universal lattice-mismatch threshold decides whether an interface is acceptable.',
      'One ordered cell is not a random alloy.',
      'Constraints are assumptions written into the model.',
      'A generated candidate is not a predicted ground state',
      'This stage does not establish that a model is stable, experimentally realized, numerically converged, or the ground state.',
    ],
    sources: [
      'https://docs.ase-lib.org/ase/build/build.html',
      'https://docs.ase-lib.org/ase/build/surface.html',
      'https://docs.ase-lib.org/ase/atoms.html',
      'https://docs.ase-lib.org/ase/constraints.html',
      'https://pymatgen.org/pymatgen.transformations.html',
      'https://pymatgen.org/pymatgen.analysis.interfaces.html',
      'https://pymatgen.org/pymatgen.analysis.magnetism.html',
      'https://doi.org/10.1063/1.333084',
      'https://doi.org/10.1103/PhysRevLett.65.353',
      'https://doi.org/10.1103/RevModPhys.86.253',
    ],
    reviewStatements: [
      'reviewed within the declared educational scope',
      'does not validate any particular model',
      'It does not restore the former\nInputs/Outputs-style contract',
      '## External-link correction and verification',
    ],
  },
  'choose-dft-method-and-computational-setup': {
    review: 'docs/reviews/2026-08-03-choose-dft-method-and-setup.md',
    sections: [
      '## Begin with the scientific comparison',
      '## Separate the physical approximation from its discretization',
      '## Choose exchange–correlation treatment by the physics and error',
      '## Define the core and valence treatment',
      '## Choose a numerical representation that can express the method',
      '## Decide which spin and relativistic degrees of freedom are active',
      '## Treat DFT+U as a defined extension, not a generic repair',
      '## Include dispersion and other long-range interactions deliberately',
      '## Distinguish electron number, occupations, smearing, and temperature',
      '## Match electrostatic boundary treatment to the model',
      '## Keep reference calculations method-compatible',
      '## Respect implementation and feature compatibility',
      '## Record the setup as a versioned method identity',
      '## The result of this task',
      '## Sources and methods',
    ],
    boundaries: [
      'This task establishes a **versioned method identity** and a defensible starting setup.',
      'Increasing these controls should approach a method-specific limit; it does not repair an inappropriate physical approximation.',
      'A formally higher rung is not automatically better for every observable or material.',
      'A pseudopotential file being readable does not establish its accuracy or transferability.',
      'Initial magnetic moments and spin directions help select a starting basin, but they are not evidence that the final state is the magnetic ground state.',
      'DFT+U is not a universal elemental constant and not a knob to force a preferred gap or magnetic state.',
      'They are not interchangeable switches',
      'A smearing width used to stabilize metallic integration is not automatically a physical electronic temperature.',
      'A successful program exit establishes neither methodological suitability nor numerical convergence.',
      'There is no universal best functional, pseudopotential library, all-electron method, code, basis, cutoff, k-point mesh, smearing width, Hubbard parameter, or boundary correction.',
    ],
    sources: [
      'https://www.quantum-espresso.org/Doc/INPUT_PW.html',
      'https://pseudopotentials.quantum-espresso.org/',
      'https://pseudopotentials.quantum-espresso.org/home/unified-pseudopotential-format',
      'https://doi.org/10.1103/PhysRevLett.77.3865',
      'https://doi.org/10.1103/PhysRevLett.115.036402',
      'https://doi.org/10.1063/1.1564060',
      'https://doi.org/10.1103/PhysRevB.50.17953',
      'https://doi.org/10.1103/PhysRevB.43.1993',
      'https://doi.org/10.1016/j.cpc.2018.01.012',
      'https://doi.org/10.1103/PhysRevB.71.035105',
      'https://doi.org/10.1103/PhysRevLett.92.246401',
      'https://doi.org/10.1103/PhysRev.137.A1441',
      'https://doi.org/10.1103/PhysRevB.40.3616',
      'https://doi.org/10.1103/PhysRevB.73.233103',
    ],
    reviewStatements: [
      'reviewed within the declared educational scope',
      'does not validate any particular functional',
      'restore O07 and O08 as parallel public operations.',
    ],
  },
  'relative-and-formation-energies': {
    review: 'docs/reviews/2026-08-03-relative-and-formation-energies.md',
    sections: [
      '## Begin with the scientific comparison',
      '## A raw total energy is not yet a comparable result',
      '## Build a ledger before subtracting',
      '## Relative energies compare a bounded candidate set',
      '## Balance a reaction before evaluating its energy',
      '## Formation energy is a special reference reaction',
      '## Reference states are part of the result',
      '## Normalize only after the stoichiometry is clear',
      '## Keep electronic energy, enthalpy, and free energy distinct',
      '## Method consistency controls error cancellation',
      '## Converge the difference and its least-cancelling terms',
      '## State identity and geometry remain part of every term',
      '## Treat small differences as estimates with uncertainty',
      '## A negative formation energy is not a phase-stability proof',
      '## Preserve the complete comparison object',
      '## What this topic establishes',
      '## Sources and methods',
    ],
    boundaries: [
      'A raw total energy is an internal value for one calculation',
      'The statement “candidate A is lower than candidate B” is bounded by the enumerated states',
      'Experimental standard enthalpy of formation is a thermodynamic quantity for specified standard states and temperature.',
      'Numerical smearing used for Brillouin-zone integration is not automatically `F_el` at a physical temperature.',
      'The acceptance criterion belongs to the target difference and intended conclusion, not to a universal cutoff or mesh.',
      '`ΔE_f < 0` means that the target is below its chosen elemental references for that formation reaction.',
      'Formation energy alone establishes neither equilibrium stability nor experimental synthesizability.',
      'It does not establish the global structural or electronic ground state, stability against all competing phases, a finite-temperature equilibrium, a reaction barrier or rate, experimental synthesizability, or the accuracy of the underlying method.',
    ],
    sources: [
      'https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds',
      'https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/thermodynamic-stability',
      'https://goldbook.iupac.org/terms/view/G02629',
      'https://phonopy.github.io/phonopy/formulation.html',
      'https://doi.org/10.1103/PhysRev.136.B864',
      'https://doi.org/10.1103/PhysRev.140.A1133',
      'https://doi.org/10.1103/PhysRev.137.A1441',
      'https://doi.org/10.1103/PhysRevB.84.045115',
      'https://doi.org/10.1103/PhysRevB.85.115104',
      'https://doi.org/10.1038/s41524-018-0143-2',
    ],
    reviewStatements: [
      'reviewed within the declared educational and execution scope',
      'a negative formation energy from stability against all competing phases',
      'Execution success is not energy convergence for a real calculation.',
    ],
  },
  'equation-of-state-and-structural-phase-stability': {
    review: 'docs/reviews/2026-08-03-equation-of-state-and-structural-phase-stability.md',
    sections: [
      '## Begin with one structural or phase question',
      '## The equation of state is a derivative relation',
      '## Decide what changes when volume changes',
      '## Preserve phase and electronic identity across the series',
      '## Sample the minimum and the intended pressure interval',
      '## Make every energy point comparable',
      '## Fit a model, not a decorative curve',
      '## Challenge the fit form and window',
      '## Read equilibrium parameters within their scope',
      '## Compare phases at one common pressure',
      '## The common-tangent picture has the same content',
      '## Metastability and hysteresis are not equilibrium boundaries',
      '## Hydrostatic curvature does not prove structural stability',
      '## Temperature changes the potential being minimized',
      '## Diagnose failure before interpreting parameters',
      '## Quantify uncertainty at the level of the conclusion',
      '## Preserve the curves and the decisions around them',
      '## What this topic establishes',
      '## Sources and methods',
    ],
    boundaries: [
      'A smooth curve by itself is not evidence that a structure is mechanically, dynamically, thermally, or compositionally stable.',
      'A clamped-ion curvature and a relaxed-ion curvature are different response quantities.',
      'There is no universal number of points or percentage volume range.',
      'None is universally preferred.',
      'An intersection of two `E(V)` curves at one common volume is not generally the transition condition.',
      'An EOS analysis does not calculate a transformation pathway or rate.',
      'A positive fitted bulk modulus shows positive curvature along the sampled hydrostatic direction near the fitted minimum.',
      'Numerical occupation smearing is not automatically `F_el`.',
    ],
    sources: [
      'https://doi.org/10.1103/PhysRev.71.809',
      'https://doi.org/10.1073/pnas.30.9.244',
      'https://doi.org/10.1029/JB092iB09p09319',
      'https://doi.org/10.1103/PhysRevB.90.224104',
      'https://docs.ase-lib.org/ase/eos.html',
      'https://vasp.at/wiki/Volume_relaxation',
      'https://phonopy.github.io/phonopy/qha.html',
      'https://goldbook.iupac.org/terms/view/H02752',
    ],
    reviewStatements: [
      'reviewed within the declared educational and execution scope',
      'Execution success is not EOS convergence for a real calculation.',
      'They are conceptual diagrams, not plots of calculated data.',
    ],
  },
};

for (const [slug, specification] of Object.entries(reviewedTopicSpecifications)) {
  const topic = reviewed.get(slug);
  if (!topic) {
    errors.push(`${slug} must have one reviewed narrative`);
    continue;
  }

  const { body, file } = topic;
  for (const heading of specification.sections) {
    if (!body.includes(heading)) errors.push(`${file}: missing topic-specific section ${heading}`);
  }
  for (const statement of specification.boundaries) {
    if (!body.includes(statement)) errors.push(`${file}: missing scientific boundary ${JSON.stringify(statement)}`);
  }
  for (const source of specification.sources) {
    if (!body.includes(source)) errors.push(`${file}: missing reviewed source ${source}`);
  }
  for (const heading of forbiddenHeadings) {
    if (body.includes(heading)) errors.push(`${file}: restores fixed heading ${heading}`);
  }
  if (/Detailed content for this operation|stable destination is reserved/i.test(body)) {
    errors.push(`${file}: reviewed article still contains placeholder prose`);
  }

  let reviewBody = '';
  try {
    reviewBody = await readFile(new URL(specification.review, root), 'utf8');
  } catch {
    errors.push(`${file}: missing scientific review ${specification.review}`);
  }
  for (const statement of specification.reviewStatements) {
    if (!reviewBody.includes(statement)) errors.push(`${specification.review}: missing review boundary ${JSON.stringify(statement)}`);
  }
}

if (errors.length > 0) {
  console.error(`Reviewed-topic validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Reviewed topics valid: ${reviewed.size} reviewed narrative(s) with topic-specific boundaries, review records, and official or primary sources.`);

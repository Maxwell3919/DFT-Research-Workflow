# DFT Research Workflow architecture

## Decision

DFT Research Workflow is organized around **researcher-scale tasks**, not a
fixed number of atomic actions.

The former O01–O24 ontology and the earlier Operation 00–34 directory are no
longer the reader-facing scientific framework. They divided ordinary research
tasks into implementation-level actions and created two competing numbered
systems. Their files and URLs may remain temporarily for migration and link
continuity, but they must not be presented as two valid ways to count DFT
operations.

The current reader-facing structure is:

```text
A · Structures
B · Calculation Preparation
C · Reference-State Calculations
D · Target Calculations
E · Research Completion
```

The letters identify broad parts of a study. They are navigation aids, not a
claim that every project follows one irreversible linear sequence.

## Researcher-scale tasks

A task belongs in the public framework when a researcher can reasonably plan,
perform, discuss, and report it as a recognizable unit of scientific work.
Usually it:

- has a clear research purpose;
- produces a result that can be used directly by later work;
- has its own important modelling, numerical, or interpretive decisions;
- has identifiable failure modes or validation questions;
- could appear as a distinct method or result in a research project.

Implementation-level actions remain inside the relevant page. Downloading a
CIF, parsing it, checking its fields, transforming the cell, recording its
source, and validating its identity are normally parts of **Obtain a Material
Structure**, not six parallel top-level operations. Likewise, diagonalization,
FFT execution, file conversion, scheduler submission, interpolation commands,
and plotting commands do not become public workflow tasks merely because a
software system can record them separately.

Machine-readable provenance may still describe those finer events. The teaching
architecture does not have to expose the same granularity as an execution engine
or provenance graph.

## Public workflow structure

### A · Structures

#### Obtain a Material Structure

Obtain a structure from a database, experiment, publication, previous
calculation, or structure generator. Source tracking, parsing, format
conversion, identity checks, crystallographic inspection, and representation
choices are treated as parts of this task.

#### Build or Modify a Computational Model

Create the model required by the research question: supercells, slabs,
defects, dopants, adsorbates, interfaces, heterostructures, vacuum regions,
constraints, magnetic candidates, disorder models, or other structural
variants.

### B · Calculation Preparation

#### Choose the DFT Method and Computational Setup

Choose the physical approximation and principal computational setup, including
functional, core treatment, basis or representation, spin and relativistic
treatment, dispersion corrections, boundary treatment, occupations, sampling,
and relevant code-specific implementation choices.

#### Test Numerical Convergence

Establish numerical settings for the intended observable. Convergence is tied
to the quantity and claim of interest rather than to one universal total-energy
threshold.

### C · Reference-State Calculations

#### Optimize the Structure

Optimize atomic positions, lattice variables, constrained coordinates, or other
structural degrees of freedom appropriate to the model and scientific question.

#### Calculate the Reference Ground State

Produce the well-defined electronic reference state used by subsequent target
calculations. The required SCF, static, NSCF, spin, charge, and sampling choices
are explained in the context of this task rather than promoted to independent
public workflow categories.

### D · Target Calculations

D is a branching library. Each concrete calculation below may have its own page
because it has a distinct scientific output, setup, convergence problem, or
interpretive boundary. The group names are navigation headings only.

#### D1 · Energetics and Stability

- Relative Energies and Formation Energies
- Equation of State and Structural Phase Stability
- Compositional Phase Stability and Convex Hulls
- Defect Formation Energies and Charge States
- Surface Energy and Work Function
- Adsorption Energies
- Interface and Heterostructure Energetics

#### D2 · Electronic and Magnetic Properties

- Band Structure
- Density of States and Projected Density of States
- Fermi Surface and Full-Brillouin-Zone Analysis
- Charge Density and Charge Redistribution
- Electrostatic Potential and Band Alignment
- Chemical Bonding Analysis
- Magnetic Configuration and Ground-State Comparison
- Magnetic Anisotropy and Exchange Interactions

Band structures, density of states, and Fermi surfaces remain separate tasks.
They use different sampling strategies and support different claims. A
high-symmetry path is not a Brillouin-zone integral or a full-zone search for
pockets and extrema.

#### D3 · Mechanical, Electric, and Lattice Response

- Elastic Constants and Mechanical Properties
- Dielectric Response and Born Effective Charges
- Polarization and Ferroelectricity
- Piezoelectric Response
- Harmonic Phonons
- Anharmonic Phonons
- Lattice Thermal Transport
- Electron–Phonon Coupling
- Conventional Superconductivity

Dependencies do not collapse these into one page. Harmonic phonons may feed
anharmonic calculations or electron–phonon calculations; those may then feed
thermal-transport or superconductivity analysis. Each stage still has its own
physical objects, convergence axes, and evidence boundary.

#### D4 · Kinetics and Finite Temperature

- Reaction Paths and Transition States
- Diffusion Barriers
- Ab Initio Molecular Dynamics
- Finite-Temperature Structural Sampling

#### D5 · Optical, Excited-State, Topological, and Transport Calculations

- Independent-Particle Optical Properties
- Time-Dependent Response and Spectroscopy
- Quasiparticle Corrections
- Excitons and the Bethe–Salpeter Equation
- Wannier Function Construction
- Berry Phase and Berry Curvature
- Topological Invariants and Boundary States
- Electronic Transport
- Quantum Transport

Wannier construction, Berry quantities, topology, and transport may be linked
in one research workflow, but they are not one indivisible operation.

### E · Research Completion

#### Analyze and Compare Results

Normalize, align, aggregate, compare, and interpret results using appropriate
reference states and uncertainty boundaries.

#### Validate Results and Scientific Conclusions

Separate program completion, solver convergence, structural convergence,
target-observable convergence, physical consistency, method robustness, and
support for the stated scientific conclusion.

#### Document and Preserve the Study

Record sources, models, methods, parameters, software versions, dependencies,
raw and derived evidence, and reconstruction instructions needed for future
inspection and reproducibility.

## Workflow relations

A, B, and C form a common backbone, but projects may return to them after a
failed or ambiguous D or E result. D is selected according to the scientific
question and may branch, repeat, or run in parallel. E is not merely a final
administrative step: analysis and validation can send the project back to the
structure, setup, convergence, reference-state, or target-calculation stage.

A provenance system may represent executed events as a directed acyclic data
lineage while the research-control process contains cycles. The public site
should explain those relations without converting them into a numbered list of
pseudo-atomic operations.

## Research workflows

Research-workflow pages show how tasks combine for a specific scientific goal,
for example:

- bulk structure optimization and electronic properties;
- two-dimensional materials;
- magnetic-order comparison;
- defect thermodynamics;
- surfaces and adsorption;
- heterostructure band alignment;
- harmonic and anharmonic lattice dynamics;
- electron–phonon superconductivity;
- reaction paths and diffusion;
- molecular dynamics;
- topology and transport;
- GW and BSE;
- high-throughput screening.

A workflow page may reuse, omit, repeat, or branch between tasks. It must not
imply that one example is a universal execution sequence.

## Natural topic organization

All scientific pages use **Natural topic organization**.

There is no mandatory visible page contract and no required sequence of
headings such as:

- Inputs;
- Outputs;
- Requirement;
- Repeatability;
- Dependencies;
- Alternatives;
- Exclusions.

Those concepts may be useful for internal metadata or may appear naturally
where a topic requires them, but they must not force every article into the same
form. A band-structure page, defect-formation-energy page, phonon page, and
provenance page have different explanatory needs and should not look like copies
of one schema.

Authors should choose the structure that best explains the subject. Depending
on the page, a clear article may discuss scientific motivation, physical
meaning, model construction, method choices, numerical convergence, workflow
logic, failure modes, interpretation, evidence limits, implementation notes,
worked examples, or references. These are editorial considerations, not a
mandatory heading checklist.

Review evaluates scientific completeness, clarity, evidence boundaries, and
readability. It does not evaluate whether a page conforms to a uniform section
template.

## Metadata and public prose

Machine-readable metadata may support routing, search, cross-linking,
provenance, and migration. It must not dictate the visible article structure.
Metadata can describe internal relationships without being rendered as a large
contract block at the top of every page.

Public prose remains English, software-neutral at the conceptual level, and
organized for continuous reading. Code-specific details are labelled as
implementations rather than treated as universal DFT definitions.

## Migration compatibility

The repository currently contains two superseded classifications:

- O01–O24 machine-granularity routes;
- former Operation 00–34 routes.

They are **Migration compatibility** data only. During migration:

- old URLs may remain available so existing links do not break;
- old identifiers must not appear as the primary directory, chapter count, or
  scientific framework;
- old routes must not have previous/next links that imply a current sequence;
- the public directory must not ask readers to understand the relation between
  24 and 35;
- useful material is moved into the A–E pages or research-workflow pages;
- removal or redirection of old URLs is performed only after the new destination
  pages exist and route migration is reviewed.

`ontology/operations.json`, `ontology/relations.json`,
`ontology/legacy-operations.json`, and the current scaffold collections remain
available during this transition. They are not the current reader-facing
scientific taxonomy.

## Repository authority during migration

Authority is separated as follows:

1. `docs/architecture.md` defines the current reader-facing information
   architecture and task granularity.
2. `docs/content-contract.md` defines writing, source, review, and migration
   rules.
3. Future A–E content records define the public topic inventory and routes.
4. Existing O01–O24, recipe, relation, tag, and legacy files are transition
   sources until their useful information is migrated.
5. Astro pages render the approved structure but do not independently redefine
   it.

A legacy JSON record, old route title, or validator assertion must not silently
restore the superseded numbered framework.

## Validation

Repository checks should establish that:

- public pages do not advertise a total number of DFT operations;
- the workflow directory presents A–E and the D target-calculation branches;
- old numbered routes remain reachable only as migration surfaces;
- old routes do not form a public numbered sequence;
- operation and workflow pages do not render a compulsory Inputs/Outputs-style
  contract;
- narrative content can choose its own headings and order;
- internal links remain project-base safe;
- pages remain readable without client-side JavaScript;
- desktop and narrow layouts remain usable;
- compatibility and current scientific structure are not confused.

Build and browser success establish software behaviour only. They do not
validate a DFT protocol, numerical result, physical interpretation, learning
effectiveness, or scientific claim.

## Talos handoff

Talos should continue the migration in bounded stages:

1. read the current `main`, this architecture, the content rules, current routes,
   validators, and migration data;
2. keep `/operations/` aligned with the A–E workflow and prevent 24/35 counts
   from returning to reader-facing pages;
3. define a machine-readable A–E topic registry without recreating an artificial
   fixed operation count;
4. create destination pages for A, B, C, D, and E topics, with each D calculation
   represented independently;
5. migrate useful content from O01–O24, former 00–34 pages, and current recipe
   scaffolds into the appropriate destination;
6. preserve old URLs during migration, then review redirects or retirement only
   after destination coverage exists;
7. write and review content one coherent topic or research workflow at a time;
8. allow every page to use a natural subject-specific structure;
9. update tests so they verify scientific information architecture and route
   integrity rather than a historical item count;
10. distinguish software validation, scientific review, and live Pages
    verification in every delivery.

## Non-goals

This project is not:

- a workflow execution engine;
- a scheduler or HPC control service;
- a universal input generator;
- a proof that DFT research has a fixed number of operations;
- a scientific database;
- evidence that a real calculation is converged or valid;
- a replacement for code- and version-specific official documentation.

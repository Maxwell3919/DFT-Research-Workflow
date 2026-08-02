# DFT Research Workflow architecture

## Decision

DFT Research Workflow is organized around **researcher-scale tasks**, not a
fixed number of atomic actions.

The former O01–O24 ontology and the earlier Operation 00–34 directory are no
longer the reader-facing scientific framework. They split ordinary research
tasks into implementation-level actions and created two competing numbered
systems. Their files and URLs remain temporarily for migration and link
continuity, but they must not be presented as valid ways to count DFT
operations.

The current reader-facing structure is:

```text
A · Structures
B · Calculation Preparation
C · Reference-State Calculations
D · Target Calculations
E · Research Completion
```

These letters are navigation aids. They do not imply that every project follows
one irreversible linear sequence.

## Researcher-scale tasks

A public topic should be a unit of work that a researcher can reasonably plan,
perform, discuss, and report. It normally has a clear scientific purpose, an
identifiable result, important modelling or numerical decisions, recognizable
failure modes, and a role in a research method or result.

Implementation-level events remain inside the task that gives them scientific
meaning. Downloading a CIF, parsing it, checking its fields, transforming a
cell, recording its source, and inspecting crystallography are parts of
**Obtain a Material Structure**. Diagonalization, FFT execution, scheduler
submission, interpolation commands, file conversion, and plotting do not become
separate public topics merely because software can record them separately.

Machine-readable provenance may remain more granular than the teaching site.
The public information architecture does not need to match an execution engine
or provenance graph.

## Topic registry and stable routes

`workflow/topics.json` is the machine-readable authority for:

- A–E section identity and labels;
- D1–D5 navigation groups;
- stable public topic slugs and titles;
- optional references to superseded records used during migration.

The registry is an address book and navigation source. Its length is not shown
as the number of DFT operations. It contains no article prose, universal
parameters, scientific conclusions, or global execution order.

`src/lib/workflow.ts` reads the registry. The home page, `/operations/`
directory, and stable `/operations/<topic-slug>/` routes are generated from it.
A topic route may exist before reviewed prose is available.

Reviewed topic narratives belong under `src/content/topics/` and bind to the
registry using only:

```yaml
topic_slug: harmonic-phonons
status: draft
```

The narrative body is optional during migration and may use any scientifically
appropriate organization.

## Public workflow structure

### A · Structures

- Obtain a Material Structure
- Build or Modify a Computational Model

### B · Calculation Preparation

- Choose the DFT Method and Computational Setup
- Test Numerical Convergence

### C · Reference-State Calculations

- Optimize the Structure
- Calculate the Reference Ground State

### D · Target Calculations

D is a branching library. Each concrete calculation may have its own page when
it has a distinct output, setup, convergence problem, or interpretive boundary.
The D1–D5 headings are navigation groups, not extra operations.

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

Band structures, density of states, and Fermi surfaces remain separate topics.
They use different sampling strategies and support different conclusions. A
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
anharmonic or electron–phonon calculations; those may feed thermal transport or
superconductivity. Each topic retains its own physical objects, convergence
axes, and evidence boundary.

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
inside a research workflow, but they are not one indivisible operation.

### E · Research Completion

- Analyze and Compare Results
- Validate Results and Scientific Conclusions
- Document and Preserve the Study

## Workflow relations

A, B, and C form a common backbone, but projects may return to them after an
ambiguous D or E result. D is selected according to the scientific question and
may branch, repeat, or run in parallel. E can send the project back to the
structure, setup, convergence, reference-state, or target-calculation stage.

An execution record may be a directed acyclic data lineage while research
control contains cycles. The public site should explain those relations without
turning them into a numbered list of pseudo-atomic actions.

## Research workflows

Research-workflow pages show how topics combine for a scientific goal, such as:

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

A workflow may reuse, omit, repeat, or branch between topics. It must not imply
that one example is a universal execution sequence.

## Natural topic organization

All scientific pages use **Natural topic organization**.

There is no mandatory visible page contract and no required sequence of
headings such as Inputs, Outputs, Requirement, Repeatability, Dependencies,
Alternatives, or Exclusions. Those ideas may appear naturally where a topic
requires them, but they must not be rendered automatically as a uniform form.

A band-structure page, defect-formation-energy page, phonon page, and provenance
page have different explanatory needs. Authors should choose the structure that
best explains the subject. Review evaluates scientific completeness, clarity,
evidence boundaries, sources, and readability rather than conformity to one
section template.

## Repository authority

Current authority is separated as follows:

1. `docs/architecture.md` defines reader-facing task granularity and the A–E
   information architecture.
2. `workflow/topics.json` defines stable topic identity, grouping, and routes.
3. `docs/content-contract.md` defines writing, source, review, and migration
   rules.
4. `src/content/topics/*.md` supplies optional natural-language topic narratives.
5. Research-workflow and framework pages provide composite and cross-cutting
   explanations.
6. O01–O24, recipe coverage arrays, relation/tag files, and former 00–34 records
   are migration sources until useful material is reassigned.
7. Astro pages render these sources but do not independently redefine them.

A legacy JSON record, old route title, or validator assertion must not restore
the superseded numbered framework.

## Migration compatibility

The repository retains two superseded route families:

- O01–O24 machine-granularity routes;
- former Operation 00–34 routes.

They are **Migration compatibility** data only.

- Old URLs remain reachable while destination content is developed.
- Old identifiers do not appear in the primary directory or reading sequence.
- Old routes have no previous/next adjacency or visible mapping tables.
- `workflow/topics.json` records intended destination topics when known.
- Useful material is moved into A–E topic, research-workflow, or framework pages.
- Redirects or retirement occur only after reviewed destination coverage exists.

Readers should never need to understand the relationship between 24 and 35.

## Validation

Repository checks establish that:

- sections are A–E and D groups are D1–D5;
- topic slugs and titles are unique and collision-free;
- migration references resolve to existing transitional records;
- the home page and workflow directory are generated from the registry;
- every registry topic has a stable route;
- old numbered routes remain reachable only as migration surfaces;
- public pages do not advertise a total number of DFT operations;
- pages do not render a compulsory Inputs/Outputs-style contract;
- internal links remain project-base safe;
- pages remain readable without client-side JavaScript;
- desktop and narrow layouts remain usable.

Tests may count files and routes internally to detect omissions. Such counts are
software invariants, not scientific statements about how many operations exist.

Build and browser success establish software behaviour only. They do not
validate a DFT protocol, numerical result, physical interpretation, learning
effectiveness, or scientific claim.

## Talos handoff

Talos should continue in bounded stages:

1. read the current project and Research-Ops `main` commits;
2. verify the exact-SHA Pages deployment for each merged batch;
3. keep `workflow/topics.json`, the home page, the workflow directory, and topic
   routes aligned without introducing a public total-operation count;
4. migrate useful material from O01–O24, former 00–34 pages, and current recipe
   scaffolds into the appropriate destinations;
5. write and review one coherent topic or research workflow at a time;
6. preserve old URLs until reviewed destination coverage exists;
7. allow every page to use a natural subject-specific structure;
8. update validators when routes or migration relationships change;
9. distinguish software validation, scientific review, and live deployment
   verification in every delivery.

The next scientific-content batch should select one topic from the registry and
write it as an independent article. It should not bulk-fill the route set.

## Non-goals

This project is not:

- a workflow execution engine;
- a scheduler or HPC control service;
- a universal input generator;
- a proof that DFT research has a fixed number of operations;
- a scientific database;
- evidence that a real calculation is converged or valid;
- a replacement for code- and version-specific official documentation.

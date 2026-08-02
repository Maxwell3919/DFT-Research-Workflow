# DFT Research Workflow architecture

## Decision

The repository no longer treats the former 35 chapters as a complete,
non-overlapping, or minimal set of DFT operations.

The scientific content authority is a scope-bounded ontology of 24 typed core
operations, O01–O24. The set starts with acquiring or constructing material
structures and ends with claim assessment, provenance capture, and preservation
of a reproducible research bundle.

The number 24 is not claimed to be a unique global mathematical minimum. It is
the canonical granularity adopted by this project: independently executable
research actions with distinct primary semantics and output types.

The former Operation 00–34 routes remain a compatibility layer. They are not
ontology authority.

## Scope

The framework starts when a researcher acquires, selects, or constructs a
material structure or related source object. It covers structure identity,
model construction, method and numerical specification, execution, solvers,
analysis, verification, claim assessment, provenance, and reproducibility.

It covers bulk, low-dimensional, surface, interface, molecular, defect,
disordered, finite-temperature, response, electron–phonon, transport,
excited-state, and beyond-Kohn–Sham workflows when those workflows are composed
from the core operations.

The framework ends when a stated scientific claim has an explicit evidence
status and the selected workflow can be reconstructed from a versioned,
integrity-checkable package.

The following are outside the core operation ontology:

- how the original research idea was generated;
- funding, staffing, and general project administration;
- general literature review that does not alter structures, models, methods,
  references, acceptance criteria, or interpretation;
- software-installation tutorials as an end in themselves;
- manuscript writing, submission, and peer review.

## Workflow model

A DFT study is not represented as one fixed linear sequence. The architecture
uses three connected models.

### 1. Typed data and provenance DAG

Every executed operation consumes typed objects and produces new typed objects.
Actual attempts are immutable provenance events. A retry or model revision
creates a new event rather than rewriting the previous lineage.

### 2. Cyclic workflow-control state graph

Control logic may retry, restart, replace, branch, detour, pause for review, or
return to model and protocol design. The control graph may contain cycles even
when the recorded data lineage remains a DAG.

### 3. Multi-axis ontology

Every workflow instance is described using three orthogonal axes:

1. lifecycle projection;
2. reusable core operations;
3. system, scientific-target, method, and implementation tags.

A workflow recipe is a graph assembled from operations and parameterized by
tags. A scientific target such as magnetism, topology, superconductivity, or a
defect formation energy is not itself an atomic operation.

## Authority layers

Repository authority is separated into four layers.

```text
ontology/
├── operations.json          # O01–O24 scientific operation authority
├── relations.json           # typed semantic relations
├── tags.json                # systems, targets, methods, implementations
└── legacy-operations.json   # former 00–34 compatibility mapping

recipes/
└── index.json               # composite workflow recipe registry

src/content/operations/
└── *.md                     # legacy route metadata only

src/pages/
└── ...                      # public teaching projection
```

Authority order:

1. `ontology/operations.json` defines core operation identity and contracts.
2. `ontology/relations.json` defines reusable semantic relations.
3. `ontology/tags.json` defines orthogonal classification vocabularies.
4. `recipes/index.json` defines composite workflow scaffolds.
5. `ontology/legacy-operations.json` maps former routes to the new framework.
6. Astro pages render these sources but do not redefine the taxonomy.
7. `src/content/operations/*.md` preserves former route metadata only.

A Markdown chapter, page title, or navigation order must not silently modify the
ontology.

## Public information architecture

The current framework has four distinct public entries:

```text
Home
├── Operations
├── Workflow Recipes
└── Framework
```

`/operations/` lists the 24 core operations by lifecycle. Core operation
pages expose the operation contract: definition, typed inputs and outputs,
requirement, repeatability, dependencies, alternatives, and exclusions.

`/recipes/` renders the 16 registered composite recipes. Their operation arrays
are coverage projections, not automatic complete topological execution orders.

`/framework/` renders the workflow model, lifecycle map, relations and feedback
loops, tags and methods, and evidence/provenance/reproducibility context. These
are not additional operations or recipes.

The 35 former `/operations/<legacy-slug>/` URLs remain generated. Each legacy
page states that it is a compatibility route and links to its mapped core
operations.

The 35 former `/operations/<legacy-slug>/` URLs remain generated as a separate
compatibility layer and do not enter the main learning sequence.

## Lifecycle projection

The lifecycle view is a teaching projection, not a universal execution order.

| Lifecycle | Core operations |
|---|---|
| Source and identity | O01–O04 |
| Model preparation | O05–O06 |
| Protocol design | O07–O10 |
| Computation | O11–O17 |
| Analysis and comparison | O18–O19 |
| Evidence and claim | O20–O22 |
| Preservation | O23–O24 |

O09, O12, and O20–O24 are cross-cutting. They may be revisited throughout a
workflow and must not be interpreted as one-time terminal steps.

## Core operations

### Source and identity

- O01 · Acquire Source Objects
- O02 · Parse and Normalize Artifacts
- O03 · Verify Identity and Integrity
- O04 · Canonicalize Crystallographic Representation

### Model preparation

- O05 · Build a Computational Model
- O06 · Generate and Reduce Candidate Configurations

### Protocol design

- O07 · Specify the Physical Theory and Ensemble
- O08 · Specify Numerical Representation and Boundary Treatment
- O09 · Design the Protocol, References, and Acceptance Criteria
- O10 · Materialize and Preflight Executable Inputs

### Computation

- O11 · Configure the Execution Environment and Resources
- O12 · Orchestrate, Monitor, and Recover Executions
- O13 · Solve an Electronic State
- O14 · Optimize Structures or Paths
- O15 · Propagate Dynamics and Sample an Ensemble
- O16 · Evaluate Perturbations, Responses, and Couplings
- O17 · Construct Reduced and Interpolated Representations

### Analysis and comparison

- O18 · Derive Scientific Quantities
- O19 · Compare and Aggregate Results

### Evidence and claim

- O20 · Verify Numerical Completion and Convergence
- O21 · Validate Physical Consistency and Method Robustness
- O22 · Assess Support for a Scientific Claim

### Preservation

- O23 · Capture Provenance and Lineage
- O24 · Package and Preserve a Reproducible Research Bundle

## Operation contract

Each core operation must define:

- stable `id`, `order`, `slug`, and action-oriented `name`;
- one primary action semantic;
- typed `inputs` and `outputs`;
- lifecycle projection;
- requirement and repeatability;
- direct operation dependencies;
- implementation alternatives;
- explicit exclusions.

An operation must not be introduced merely because a material class, scientific
topic, software package, or method family exists. New operation proposals must
show a distinct input–action–output contract and pass a deletion test against
the existing set.

## Workflow recipes

A recipe composes operations into a target-specific graph. It may reuse an
operation multiple times and may contain branching, parallel candidates, nested
solvers, and feedback loops.

The initial registry includes representative scaffolds for:

- bulk structure optimization and bands;
- two-dimensional electronic structure;
- magnetic-order comparison;
- SOC and topology;
- defect formation energies;
- surfaces and adsorption;
- heterostructure band alignment;
- harmonic phonons;
- anharmonic lattice thermal transport;
- electron–phonon coupling and conventional superconductivity;
- dielectric, polarization, and piezoelectric response;
- optical and excited-state calculations;
- reaction paths and diffusion barriers;
- ab initio molecular dynamics;
- GW/BSE;
- high-throughput screening.

A recipe page must reference operation IDs. It must not copy and redefine their
contracts.

## Tags

Tags describe context; they are not operation classes.

- `system_types`: bulk, 2D, slab, interface, defect, disordered, and related
  object types;
- `scientific_targets`: stability, bands, magnetism, phonons, superconductivity,
  topology, transport, and related observables;
- `methods`: Kohn–Sham DFT, SOC, DFT+U, DFPT, Wannier, GW, BSE, DMFT, and
  related physical or algorithmic choices;
- `implementations`: codes, workflow systems, and analysis tools.

A system tag must never imply that required model or boundary operations have
already been performed. For example, `two_dimensional` does not establish that
vacuum, Coulomb truncation, dipole treatment, or q→0 behavior is correct.

## Assurance and provenance

The architecture keeps the following states separate:

1. task submitted or program exited;
2. solver internally converged;
3. structure or path converged;
4. target observable numerically converged;
5. result physically consistent;
6. method robust within the declared scope;
7. evidence sufficient for a named scientific claim;
8. provenance complete;
9. a reproducibility package preserved;
10. independent reproduction completed.

No earlier state automatically establishes a later one.

O20, O21, and O22 produce different evidence objects. O23 and O24 record and
preserve work but do not validate its scientific correctness.

## Legacy compatibility

The former 35-page taxonomy mixed prerequisites, atomic operations, recipes,
system tags, method families, and composite quality activities.

`ontology/legacy-operations.json` is the only mapping authority for those
routes. Legacy pages may explain the mapping but may not present themselves as
members of the core operation set.

Compatibility policy:

- preserve every former slug;
- do not reuse a legacy slug for a different concept;
- link legacy pages to all mapped O01–O24 operations;
- do not include legacy pages in core-operation counts or adjacency;
- remove a legacy route only through a separately reviewed migration decision.

## Validation

`npm run check` must verify at least:

- exactly 24 continuous operation IDs O01–O24;
- unique explicit core slugs;
- the seven lifecycle projections and expected counts;
- valid operation dependencies;
- non-empty typed inputs and outputs;
- exactly 35 legacy mappings and matching compatibility Markdown files;
- recipe operation references and tag references;
- valid relation types and operation references;
- generated core and legacy routes;
- English, no-JavaScript public pages;
- project-base-safe links;
- core-operation previous/next boundaries;
- desktop and 390 px browser behavior.

These checks validate repository structure and public software behavior only.
They do not validate a DFT protocol, numerical result, physical interpretation,
learning effectiveness, or scientific claim.

## Talos handoff

The repository state after this architecture migration establishes the ontology,
recipe registry, compatibility mapping, public core-operation directory, and
legacy routes. Talos should continue in this order:

1. Read the current `main` SHA, this file, `docs/content-contract.md`, and all
   files under `ontology/` and `recipes/`.
2. Run `npm ci --no-audit --no-fund` and `npm run check` before modifying the
   framework.
3. Add a public Workflow Recipes directory driven only by `recipes/index.json`.
4. Add tag and method views driven only by `ontology/tags.json`.
5. Add relation-aware diagrams from `ontology/relations.json`; keep an
   understandable static representation without JavaScript.
6. Migrate any useful explanatory content from legacy pages into recipes or
   core-operation chapters without duplicating operation contracts.
7. Write detailed content one reviewed core operation or recipe at a time.
8. Preserve all legacy routes until an explicit removal decision.
9. Update validators whenever authority fields or public projections change.
10. After each batch, distinguish software validation from scientific content
    review and from live Pages verification.

Talos must not restore the former claim that 35 pages form a minimal,
non-overlapping operation set. It must not infer that a recipe, method, target,
or system type is an atomic operation.

## Non-goals

This project is not:

- a workflow execution engine;
- a scheduler or HPC control service;
- a universal input generator;
- a scientific database;
- evidence that a real DFT calculation is converged or valid;
- a replacement for code- and version-specific official documentation.

The site teaches a compositional research model. Production calculations still
require project-, material-, observable-, software-, and version-specific
review.

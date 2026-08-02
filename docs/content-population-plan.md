# DFT Research Workflow content population plan

## Purpose

This document defines how the current O01–O24 ontology becomes a complete
learning website without changing the scientific taxonomy or bulk-generating
unreviewed DFT guidance.

The work is divided into two distinct stages:

1. **framework scaffolding** — create complete routes, content collections,
   navigation, metadata bindings, and neutral placeholders;
2. **scientific content development** — write and review one core operation or
   workflow recipe at a time.

The first stage establishes where future content belongs. It does not claim that
an empty or placeholder page is scientifically complete.

## Fixed authority and boundaries

The following authority order remains unchanged:

1. `ontology/operations.json` defines the 24 core operations O01–O24.
2. `ontology/relations.json` defines semantic relationships.
3. `ontology/tags.json` defines system, target, method, and implementation tags.
4. `recipes/index.json` defines composite workflow recipes.
5. `ontology/legacy-operations.json` maps the former 00–34 routes.
6. Markdown content and Astro pages are subordinate teaching projections.

The content build must not:

- redefine an operation in prose;
- restore the former 35-page taxonomy as a minimal or non-overlapping set;
- turn a material class, scientific target, method family, or software package
  into a core operation;
- treat lifecycle order as a universal execution order;
- infer scientific validity from build, route, or browser checks;
- remove or repurpose a former 00–34 compatibility route;
- connect the site to production schedulers, private hosts, unpublished data, or
  licensed potential contents.

The O01–O24 set is a scope-bounded canonical granularity. It is not presented as
a uniquely proven universal mathematical minimum.

## Target content architecture

The complete learning framework should expose four content layers while keeping
legacy routes outside the main learning sequence.

```text
Home
├── Core Operations
│   └── O01–O24, grouped by lifecycle
├── Workflow Recipes
│   └── 16 initial composite workflows
└── Framework
    ├── Workflow Model
    ├── Lifecycle and Operation Map
    ├── Relations and Feedback Loops
    ├── System, Target, Method, and Implementation Tags
    └── Evidence, Provenance, and Reproducibility

Legacy compatibility
└── former Operation 00–34 routes, not primary navigation
```

The public names and exact navigation arrangement may be refined during the
framework audit, but the four semantic layers must remain distinct:

- core operations;
- composite recipes;
- contextual framework and vocabularies;
- legacy compatibility.

## Proposed content sources

Narrative content must not be stored inside the ontology files. The recommended
content collections are:

```text
src/content/core-operations/
  o01-acquire-source-objects.md
  ...
  o24-package-and-preserve-a-reproducible-research-bundle.md

src/content/recipes/
  bulk-structure-and-bands.md
  ...
  high-throughput-screening.md

src/content/framework/
  workflow-model.md
  lifecycle-and-operation-map.md
  relations-and-feedback-loops.md
  tags-and-methods.md
  evidence-provenance-and-reproducibility.md
```

`src/content/operations/*.md` remains legacy-route metadata and must not be
reused as the core narrative collection.

### Core-operation narrative record

A core-operation Markdown file should identify only:

```yaml
operation_id: O01
status: scaffold
```

The operation title, slug, lifecycle, definition, inputs, outputs,
dependencies, alternatives, and exclusions must be read from
`ontology/operations.json`. They must not be duplicated in frontmatter.

Allowed internal statuses are:

- `scaffold` — route and binding exist, but no reviewed scientific prose;
- `draft` — scientific prose exists but has not passed full review;
- `reviewed` — the declared review checklist has passed.

Status is internal metadata. Do not add public progress badges, completion
meters, or dashboard-style UI unless separately requested.

### Recipe narrative record

A recipe Markdown file should identify only:

```yaml
recipe_slug: bulk-structure-and-bands
status: scaffold
```

The title, operation references, and tags must be read from
`recipes/index.json`. A recipe page may later add explicit edges, branches,
loops, convergence axes, references, and evidence boundaries, but it must not
copy operation contracts.

### Framework narrative record

A framework page may use:

```yaml
slug: workflow-model
title: Workflow Model
status: scaffold
```

Framework pages explain how the ontology is used. They are not additional
operations or recipes.

## Placeholder-only implementation stage

The next implementation batch is intentionally limited to scaffolding.

### Required deliverables

1. Create one core-operation narrative file for every O01–O24 record.
2. Create one recipe narrative file for every recipe in `recipes/index.json`.
3. Create the five framework narrative files listed above.
4. Add collection schemas that enforce one-to-one binding to the authority
   records.
5. Render public recipe and framework routes from those sources.
6. Keep the existing O01–O24 operation routes and all former 00–34 legacy
   routes working.
7. Add navigation only after confirming that its labels do not collapse
   operations, recipes, tags, or framework concepts into one category.
8. Extend deterministic validators for content coverage, unique bindings,
   orphan detection, route generation, and legacy compatibility.

### Placeholder content limit

A scaffold file may contain no body, or one neutral sentence such as:

> Detailed content for this operation will be written and reviewed in a later
> content batch.

Recipe placeholders may additionally display, from the machine-readable
registry:

- recipe title;
- associated tags;
- referenced operation IDs;
- an explicit notice that the operation list is a coverage projection and not
  necessarily a complete execution order.

Framework placeholders may contain a short statement of the page's future
scope. They must not contain generic tutorial prose, invented examples,
universal parameters, equations, scientific conclusions, or unverified
references.

### Placeholder definition of done

The placeholder stage is complete only when:

- 24/24 core-operation narrative files resolve to O01–O24;
- every registered recipe has exactly one narrative file;
- all five framework pages exist;
- no narrative file duplicates taxonomy fields that belong to JSON authority;
- no orphan, duplicate, or unresolved ID exists;
- O01–O24 adjacency remains correct;
- all 35 legacy routes remain available and excluded from core counts;
- public pages remain English and usable without client-side JavaScript;
- desktop and 390 px layouts have no horizontal overflow;
- internal links respect the GitHub Pages project base;
- `npm run check` passes on the exact branch head;
- the PR description states that placeholder completion is not scientific
  content completion.

## Mature core-operation chapter coverage

The following is a coverage checklist, not a mandatory public heading template.
Writers may use a natural explanatory structure as long as the necessary
questions are answered.

A mature core-operation chapter should explain:

1. what research object the operation consumes and produces;
2. what the researcher actually does;
3. why the operation is distinct from neighboring operations;
4. which decisions and implementation alternatives exist;
5. which assumptions and applicability limits matter;
6. which failures or ambiguous states can occur;
7. which earlier operation should be revised after each major failure class;
8. how the output is checked before downstream use;
9. how the operation is reused inside representative recipes;
10. which official documentation, standards, or primary method sources support
    version-sensitive statements.

Generated ontology metadata should remain visible in a compact contract area,
but the chapter body should read as an explanation rather than a serialized
schema.

## Operation-by-operation content plan

| ID | Chapter focus for later reviewed content |
|---|---|
| O01 | Obtaining structures and reference objects from databases, publications, experiments, previous calculations, or generators while preserving source identity, version, citation, licence boundary, and checksum. |
| O02 | Converting CIF, POSCAR, XYZ, calculation outputs, and database records into typed objects with explicit units, schemas, parser versions, and parse reports. |
| O03 | Checking composition, occupancies, coordinates, required fields, duplicate atoms, unit consistency, identity, and file integrity before modelling. |
| O04 | Primitive/conventional representations, symmetry tolerances, equivalent sites, transformation maps, and the boundary between representation changes and physical model changes. |
| O05 | Building supercells, slabs, interfaces, clusters, charged models, vacuum regions, environments, constraints, and boundary assumptions from validated structures. |
| O06 | Generating and symmetry-reducing magnetic orders, defects, adsorption sites, stackings, SQS structures, conformers, and other candidate configurations. |
| O07 | Selecting the physical theory, electronic and spin degrees of freedom, interactions, relativistic treatment, and thermodynamic or electronic ensemble. |
| O08 | Selecting basis and core treatment, grids, cutoffs, occupations, k/q sampling, electrostatic boundaries, long-range treatment, and other numerical representations. |
| O09 | Defining workflow dependencies, reference states, target observables, convergence axes, tolerances, comparison rules, and claim acceptance criteria before execution. |
| O10 | Translating model and protocol objects into code-specific inputs and scheduler artefacts, then performing static preflight and dependency checks. |
| O11 | Fixing executable versions, libraries, modules or containers, parallel layout, memory, storage, walltime, and scheduler resources. |
| O12 | Submitting, monitoring, restarting, recovering, branching, replacing, and stopping executions while distinguishing runtime failures from scientific failures. |
| O13 | SCF, NSCF, constrained, direct-minimization, and related fixed-nuclear electronic-state solves; outputs, convergence meaning, and downstream reuse. |
| O14 | Atomic, cell, constrained-coordinate, collective-variable, and reaction-path optimization; local minima, stopping criteria, and nested electronic solves. |
| O15 | Time propagation and ensemble sampling for AIMD and related dynamics; timestep, ensemble, equilibration, trajectory length, and statistical independence. |
| O16 | DFPT, finite-difference, Sternheimer, real-time, screening, response, force-constant, and coupling calculations, including perturbation grids and derivative meaning. |
| O17 | Wannier models, real-space force constants, Fourier or fine-grid interpolation, reduced models, quality checks, and the boundary between model construction and observable derivation. |
| O18 | Deriving observables such as energies, bands, DOS, spectra, response quantities, barriers, transport coefficients, and superconducting quantities from normalized calculation objects. |
| O19 | Reference alignment, energy ranking, phase relations, convex hulls, band alignment, aggregation, statistics, and comparison across candidates, methods, or external data. |
| O20 | Separating program completion, solver convergence, structural convergence, and target-observable convergence; convergence series, controls, and indeterminate states. |
| O21 | Symmetry, conservation laws, sum rules, limiting behaviour, benchmark comparison, cross-implementation checks, and sensitivity to model or method choices. |
| O22 | Mapping the evidence record to a named scientific claim and returning supported, not supported, or indeterminate with an explicit evidence boundary. |
| O23 | Capturing object identities, parameters, environments, process events, causal relationships, retries, and lineage without confusing provenance completeness with correctness. |
| O24 | Creating versioned, integrity-checkable research bundles with required artefacts, checksums, environment descriptions, reconstruction entry points, and preservation records. |

## Mature workflow-recipe coverage

A mature recipe should show how operations compose into a research graph. It
should explain:

- the scientific question and applicability boundary;
- required starting objects and reference calculations;
- operation nodes and explicit dependency edges;
- repeated, parallel, conditional, and nested operations;
- failure-return edges to model, method, numerical, or protocol revision;
- target-specific convergence axes;
- comparison and reference conventions;
- physical checks and method-robustness checks;
- the strongest claim the workflow can support;
- software-neutral implementation routes;
- official and primary sources;
- one later worked example whose inputs and outputs are reproducible.

The recipe page must state when its listed operation IDs are only a coverage
projection rather than a complete topological order.

## Recipe development order

The initial 16 recipes should be developed in dependency-aware tiers.

### Tier 1 — foundational workflows

1. Bulk Structure Optimization and Bands
2. Two-Dimensional Structure and Electronic States
3. Magnetic-Order Comparison
4. Harmonic Phonons

These expose the most reused model, solver, optimization, response, analysis,
and validation concepts.

### Tier 2 — common model-specific workflows

5. Defect Formation Energies and Charge States
6. Surface and Adsorption
7. Heterostructure Band Alignment
8. Reaction Paths and Diffusion Barriers

### Tier 3 — response, spectra, and finite temperature

9. Dielectric, Polarization, and Piezoelectric Response
10. Ab Initio Molecular Dynamics
11. Optical Spectra and Excited States

### Tier 4 — advanced composite workflows

12. SOC and Topological Analysis
13. Anharmonic Phonons and Lattice Thermal Transport
14. Electron–Phonon Coupling and Conventional Superconductivity
15. GW and Bethe–Salpeter Workflow
16. High-Throughput Screening

The order is a writing and dependency strategy, not a scientific ranking.

## Framework-page scope

### Workflow Model

Explain the difference between the immutable typed data/provenance DAG and the
cyclic control-state graph used for retries, restarts, branches, and revisions.

### Lifecycle and Operation Map

Explain the seven lifecycle projections and why O09, O12, and O20–O24 are
cross-cutting rather than one-time terminal steps.

### Relations and Feedback Loops

Render and explain declared relations such as `requires`, `contains`,
`alternative-to`, `validated-by`, `records`, and failure-driven revision edges.

### Tags and Methods

Explain why system types, scientific targets, methods, and implementations are
orthogonal descriptors rather than operations. A tag must not imply that the
required model, boundary, convergence, or validation work has been performed.

### Evidence, Provenance, and Reproducibility

Keep program exit, solver convergence, structure/path convergence, observable
convergence, physical consistency, method robustness, claim support,
provenance completeness, preservation, and independent reproduction separate.

## Scientific writing sequence

After the placeholder framework is accepted, detailed content should proceed in
small reviewable batches:

1. O01–O04: source objects, parsing, integrity, crystallographic representation;
2. O05–O06: computational models and candidate configurations;
3. O07–O10: physical theory, numerical representation, protocol, executable inputs;
4. O11–O13: environment, execution control, electronic-state solving;
5. O14–O17: optimization, dynamics, response, reduced representations;
6. O18–O19: observables, comparison, and aggregation;
7. O20–O24: numerical evidence, physical validation, claims, provenance, preservation;
8. recipe tiers 1 through 4;
9. framework explanatory pages and cross-links refined as operation and recipe
   content matures.

Default delivery is one operation or one recipe per pull request. A tightly
coupled pair may share a PR only when the dependency and review boundary are
explicit. Do not bulk-fill all operation or recipe bodies.

## Source and example policy

- Prefer official software documentation, formal standards, and original method
  papers for version-sensitive or method-specific claims.
- Distinguish source records from authors' interpretations and from synthesis in
  the website.
- Do not copy manuals, textbooks, figures, or long passages.
- Use synthetic examples during early writing unless a public example has clear
  provenance and licence compatibility.
- A worked example must retain its input provenance, method and numerical
  settings, software version, raw-output references, derived data, and declared
  validation boundary.
- Do not present one material's converged parameter as a universal recommendation.
- Do not imply that using a named code or workflow system establishes numerical
  or scientific validity.

## Review checklist for a mature page

A page can move from `draft` to `reviewed` only when the applicable checks pass:

1. **Taxonomy fidelity** — no operation, recipe, tag, or method boundary is
   silently changed.
2. **Input/output clarity** — upstream and downstream research objects are clear.
3. **Scientific correctness** — statements are supported by appropriate sources
   and preserve applicability limits.
4. **Numerical boundary** — convergence statements name the target observable
   and controls rather than relying only on total energy or program exit.
5. **Physical boundary** — physical consistency and method robustness are not
   collapsed into numerical convergence.
6. **Claim boundary** — the page states what evidence can and cannot support.
7. **Software neutrality** — concepts are primary; code-specific examples are
   labelled as implementations.
8. **Reproducibility** — later examples expose enough provenance to reconstruct
   the declared workflow.
9. **Readability** — the page is explanatory rather than a form, contract dump,
   or collection of status labels.
10. **Software checks** — repository validation, build, links, no-JavaScript
    rendering, and responsive layout pass.

## Framework audit required before scaffolding

Before implementing placeholders, Talos must audit the exact current `main`
against this plan and report:

- authority consistency between `AGENTS.md`, `README.md`, architecture, content
  contract, ontology, recipes, rendering code, and validators;
- whether public routes and navigation preserve the four content layers;
- whether current operation pages consume ontology data without duplicating it;
- whether recipe arrays are clearly identified as coverage projections;
- whether legacy routes are complete and excluded from core counts;
- whether relations and tags resolve without orphan values;
- whether the proposed content collections introduce any duplicated authority;
- whether accessibility, no-JavaScript rendering, base paths, responsive layout,
  and exact-SHA deployment checks remain adequate.

Implementation defects may be repaired in the scaffolding PR. Any proposed
change to O01–O24 identity, semantics, granularity, recipe scientific scope, or
legacy-route meaning must be reported and left unmerged for user review.

## Final boundary

A complete placeholder framework means that every future content type has a
validated place in the repository and a working public projection. It does not
mean that the DFT workflow has been taught, that scientific content has been
reviewed, or that any real calculation has been validated.

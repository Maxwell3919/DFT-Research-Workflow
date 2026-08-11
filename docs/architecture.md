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
A · Structure & Model
B · Method & Numerical Setup
C · Reference State
D · Target Calculations
E · Validation, Interpretation & Reproducibility
```

These letters are navigation aids. They do not imply that every project follows
one irreversible linear sequence.

The top-level public navigation is **Home**, **Research Workflow**, **Worked
Workflows**, **Tools & Resources**, and **Troubleshooting**, in that order.
Troubleshooting is a separate top-level section for real DFT calculation
problems and their eventual fixes; its case content may be populated
incrementally without changing the A–E research-task taxonomy. Framework is no
longer a reader-facing directory: branching and feedback live in the Research
Workflow introduction; method context, evidence boundaries, and provenance live
in the corresponding B and E topics. Old `/framework/*` URLs remain short
migration surfaces. Former recipe URLs receive the same treatment, while
`/workflows/` is reserved for continuous worked cases backed by committed
execution directories.

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

## Human-first, terminal-capable execution cases

A practical page should lead with the way a careful researcher performs and
inspects the task: browser, GUI, manual comparison, terminal, HPC, plotting, or
an appropriate combination. When a page is marked `real-execution`, it also
binds to one directory under `examples/cases/<case-id>/`. That directory is the
authority for displayed input, commands, raw or deterministically excerpted
output, parsed data, figures, hashes, and gate claims. The web page may select
and explain those records, but it must not maintain a second handwritten
result. Machine reproducibility supports the human narrative; it does not
replace it.

The gates deliberately separate artifact identity (G0), program completion
(G1), solver/optimizer thresholds (G2), downstream artifacts (G3),
observable-specific numerical convergence (G4), and physical consistency or a
scientific conclusion (G5). A case may be useful while declaring `FAIL`,
`NOT TESTED`, or `NOT CLAIMED`; its `check.sh` must return nonzero whenever it
prints a required `FAIL`.

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

### A · Structure & Model

- Obtain a Material Structure
- Build or Modify a Computational Model

### B · Method & Numerical Setup

- Choose the DFT Method and Computational Setup
- Test Numerical Convergence

### C · Reference State

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

### E · Validation, Interpretation & Reproducibility

- Analyze and Compare Results
- Validate Results and Scientific Conclusions
- Document and Preserve the Study

## Natural topic organization

The repository keeps machine-readable identity and routing separate from article
structure. Topic pages should use the organization that best fits the science.
There is no site-wide visible checklist of inputs, outputs, dependencies,
alternatives, exclusions, or completion state.

A topic may therefore be a short practical essay, a comparison of calculation
routes, a convergence discussion, or a result-interpretation guide. Cross-links
are added only where they help the research decision being made.

## Migration compatibility

Legacy source records may remain in `ontology/`, `recipes/`, and transitional
content collections while old links are being retired. They are migration
sources, not reader-facing authorities.

Stable A–E routes should be preferred in all new links. Existing old URLs are
kept only where they protect external bookmarks or preserve useful historical
material during migration.

## Maintenance handoff

When this architecture changes, update the smallest set of files required to
keep the public route, navigation, validators, and documentation consistent.
Do not create a second machine-readable taxonomy solely for a presentation
change.

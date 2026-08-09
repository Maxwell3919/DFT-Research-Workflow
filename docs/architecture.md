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
Workflows**, and **Tools**. Framework is no longer a reader-facing directory:
branching and feedback live in the Research Workflow introduction; method
context, evidence boundaries, and provenance live in the corresponding B and E
topics. Old `/framework/*` URLs remain short migration surfaces. Former recipe
URLs receive the same treatment, while `/workflows/` is reserved for continuous
worked cases backed by committed execution directories.

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

## Terminal-first execution cases

A practical page marked `real-execution` binds to one directory under
`examples/cases/<case-id>/`. That directory is the source for displayed input,
commands, raw or deterministically excerpted output, parsed data, figures,
hashes, and G0–G5 claims. The web page may select and explain those records, but
it must not maintain a second handwritten result.

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

Wannier construction, Berry quantities, topology, and transport may be linked
inside a research workflow, but they are not one indivisible operation.

### E · Validation, Interpretation & Reproducibility

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

## Practical subpage architecture

### Decision

A researcher-scale topic page should remain a scientific overview. Detailed
software operation, screenshots, complete inputs, command sequences, and
material-specific examples should normally live on subordinate pages rather
than making the overview indefinitely longer.

Subordinate pages are **not additional operations**. They are views into the
implementation and evidence of an existing A–E topic. Their existence must not
change the topic count, the A–E navigation, or the scientific granularity of the
site.

The intended hierarchy is:

```text
Researcher-scale topic
├── Scientific overview
├── Practical guides
├── Worked examples
└── Visual notes
```

### Scientific overview

The stable topic route remains the conceptual entry point:

```text
/operations/<topic-slug>/
```

It should explain the scientific purpose, modelling decisions, numerical and
interpretive boundaries, failure modes, and connection to the rest of the
workflow. It may mention representative software, but it should not become a
manual for every implementation.

### Practical guide

A practical guide explains how one tool or a tightly coupled toolchain performs
one bounded part of the parent research task. It may include version-specific
commands, input fragments, API calls, interface screenshots, output checks, and
implementation restrictions.

Recommended route:

```text
/operations/<topic-slug>/guides/<guide-slug>/
```

Examples include:

- building and repeating cells with ASE;
- constructing surfaces, vacuum, and adsorbates with ASE;
- applying structure transformations with pymatgen;
- inspecting UPF metadata for a Quantum ESPRESSO setup;
- preparing spin–orbit coupling in one code;
- converging a k-point mesh for a stated observable.

A guide should answer one practical question. A page that attempts to document
all capabilities of a large code should instead be split by scientific use or
replaced with links to the official manual.

### Worked example

A worked example follows one explicit material or model through a bounded
scientific chain. It should connect decisions, commands, intermediate objects,
checks, and claim limits rather than merely display a successful input file.

Recommended route:

```text
/operations/<topic-slug>/examples/<example-slug>/
```

A reproducible example should record, as applicable:

- source structure, stable identifier, retrieval date, and checksum;
- model transformations and scripts;
- software and library versions;
- method identity and numerical settings;
- relevant raw-output references and derived files;
- validation performed and validation not performed;
- the exact conclusion the example can and cannot support.

An illustrative example that was not run as a validated production calculation
must say so prominently.

### Visual note

A visual note explains one interface, figure, file layout, parameter family, or
output pattern that benefits from annotated images. It is appropriate for GUI
steps, database download interfaces, structure viewers, convergence plots, band
and phonon visualizations, and common warning patterns.

Recommended route:

```text
/operations/<topic-slug>/notes/<note-slug>/
```

A visual note should remain understandable from its text and alt text when the
image cannot be loaded. It must not turn a screenshot sequence into the only
available instruction.

### Content collection

Implementation should begin with one collection rather than three mechanically
separate systems:

```text
src/content/practical-guides/
```

A future minimal frontmatter shape may be:

```yaml
topic_slug: build-or-modify-computational-model
guide_slug: ase-build-supercell
title: Build a Supercell with ASE
kind: implementation
tools:
  - ase
status: reviewed
```

Initial `kind` values should be limited to:

- `implementation`;
- `worked-example`;
- `visual-note`.

The collection supplies subordinate content. `workflow/topics.json` remains the
authority for the parent scientific topics and must not absorb guide prose or
software-specific parameters.

### Parent-topic interface

A reviewed topic page may show restrained static sections such as:

```text
Practical Guides
Worked Examples
Visual Notes
```

Each entry should show only the title, content kind, tools used, and the bounded
problem it addresses. The interface should not become a progress dashboard,
software popularity ranking, or matrix of every possible implementation.

Static cards and ordinary links are preferred over JavaScript-dependent tabs.
The overview and all subordinate pages must remain readable without client-side
JavaScript.

### Secondary tool directory

The workflow remains the primary scientific navigation. A secondary tool index
may provide cross-navigation:

```text
/tools/
/tools/<tool-slug>/
```

A tool page should summarize identity, role, access conditions, official
resources, supported workflow topics, and available guides or examples. It
should not reproduce the upstream manual, claim that the tool is universally
preferred, or turn software names into research operations.

A future `workflow/tools.json` may record only stable cross-index metadata such
as:

- canonical name and aliases;
- tool category and interface type;
- official homepage, documentation, and source repository;
- open, restricted, licensed, or commercial access status;
- relevant A–E topics;
- supported codes or file formats where important;
- latest verification date and verification state;
- links to reviewed practical guides and worked examples.

Tool metadata must not contain copied manual prose, universal settings, or
scientific conclusions.

### Code, terminal, GUI, and web interfaces

Different software classes require different presentation.

- Python and API tools should use copyable text, small executable fragments, and
  before/after objects. Code screenshots are not a substitute for code blocks.
- Command-line electronic-structure codes should show input and output as text,
  with screenshots reserved for terminal context or visual results.
- GUI tools may use annotated original screenshots, but every important action
  should also be described in text.
- Database and web interfaces should record the service, visible version when
  available, retrieval date, stable material identifier, and downloaded object.
- Large automated workflows should show the scientific dependency graph and
  provenance boundary, not only a successful dashboard state.

### Images, screenshots, and copyright

Original screenshots and original figures are preferred. A screenshot taken
from an official manual should be used only when the interface itself is the
subject and an original reproduction is impractical.

Every externally derived image requires:

- source page;
- access date;
- licence or reuse basis;
- a cropped scope limited to what is necessary;
- an original caption and alt text.

Do not copy complete manual pages, long screenshot sequences, publisher figures,
or licensed software assets into the repository. Inputs, commands, and output
fragments should remain selectable text whenever possible. Restricted potential
files, credentials, private host details, and unpublished calculation data remain
prohibited.

Suggested media location:

```text
public/media/practical-guides/<topic-slug>/<guide-slug>/
```

The source and licence record should remain adjacent to the guide or in a
machine-readable media manifest.

### Review boundaries

A practical page is reviewed only when its exact software version or version
range, official sources, tested interface, example provenance, and limitations
are explicit. A rendered screenshot does not prove that a command works. A
successful command does not prove convergence. A converged example does not
prove transferability to another material, method, observable, or software
version.

Semantic source review, external-link reachability, rendered-link presence,
software execution, numerical convergence, and scientific validation remain
separate evidence classes.

### Initial implementation sequence

The first interface pilot should use **Build or Modify a Computational Model**
because it already connects naturally to ASE and pymatgen. The initial bounded
set should be:

1. Build and repeat cells with ASE;
2. Construct surfaces, vacuum, and adsorbates with ASE;
3. Apply structure transformations with pymatgen;
4. Build a two-dimensional monolayer model as a worked example.

Only after the collection, routes, responsive layout, no-JavaScript behaviour,
media provenance, and review process are validated should the pattern expand to
other topics.

**Test Numerical Convergence** should then use the same architecture. Its main
page should explain convergence as scientific evidence, while separate guides
may treat plane-wave and grid convergence, k-point and smearing convergence,
finite-size and vacuum convergence, phonon q-mesh convergence, and
EPC-specific sampling without turning those guides into new operations.

## Tool and software coverage map

### Purpose and boundary

The site should maintain a broad map of tools that may implement, inspect,
automate, or validate parts of the DFT research workflow. This map is a planning
inventory, not an endorsement, installation promise, compatibility guarantee,
or claim that every listed project is currently maintained.

The inventory intentionally includes:

- open-source and restricted-access tools;
- commercial and academic-licence software;
- general electronic-structure engines and narrowly specialized utilities;
- code-native modules and independent post-processing packages;
- adjacent molecular, classical, and machine-learning tools when they are often
  used to prepare or interpret DFT research.

Before a tool receives a public page or practical guide, its official identity,
current documentation, maintenance state, licence, access requirements, version,
and scientific role must be verified independently.

Tools are many-to-many tags. One tool may support several A–E topics, and one
topic may have several implementations. The tool directory must never replace
the scientific workflow directory.

### Structure sources, databases, and interoperability

Seed candidates include:

- Materials Project;
- NOMAD;
- Materials Cloud, Materials Cloud Archive, and Materials Cloud Discover;
- Crystallography Open Database and Theoretical Crystallography Open Database;
- Inorganic Crystal Structure Database;
- Open Quantum Materials Database;
- AFLOW;
- JARVIS;
- C2DB and the Computational Materials Repository;
- Alexandria;
- Open Materials Database;
- open database of xtals;
- Materials Platform for Data Science;
- CatHub;
- OPTIMADE, optimade-python-tools, and OPTIMADE Client;
- mp-api, JARVIS-Tools, AFLOW APIs, and NOMAD APIs;
- ASE databases and project-specific AiiDA or atomate databases.

These sources differ in experimental versus computed content, licensing,
versioning, provenance, identifiers, and available properties. A database page
must preserve those distinctions rather than present all returned structures as
equivalent starting evidence.

### Crystallography, structure conversion, and model construction

Seed candidates include:

- ASE;
- pymatgen;
- spglib;
- SeeK-path and seekpath;
- Gemmi;
- PyCifRW;
- cif2cell;
- PyXtal;
- icet;
- CASM;
- enumlib;
- ATAT;
- CellConstructor;
- Atomsk;
- Packmol;
- Moltemplate;
- Open Babel;
- RDKit;
- Avogadro;
- Atomic Simulation Recipes;
- code-native structure generators and symmetry utilities.

Their guides should distinguish file conversion from physical-model changes,
and exact symmetry transformations from tolerance-dependent numerical
classification.

### Structure and scientific visualization

Seed candidates include:

- VESTA;
- XCrySDen;
- ASE GUI;
- OVITO;
- VMD;
- Jmol and JSmol;
- py3Dmol;
- nglview;
- ParaView;
- FermiSurfer;
- code-native viewers and Materials Cloud visualizers.

Visualization confirms what is displayed, not that a structure, field, band,
phonon, or trajectory is scientifically valid.

### Periodic electronic-structure engines

Seed candidates include:

- Quantum ESPRESSO;
- VASP;
- ABINIT;
- CASTEP;
- CP2K;
- SIESTA;
- GPAW;
- FHI-aims;
- WIEN2k;
- Elk;
- exciting;
- FLEUR;
- OpenMX;
- BigDFT;
- Octopus;
- JDFTx;
- SPARC;
- ONETEP;
- CONQUEST;
- Questaal;
- RSPt;
- Qbox;
- DFT-FE;
- RMG;
- PARSEC;
- CRYSTAL;
- xTAPP;
- DFTK;
- PROFESS and other orbital-free DFT engines;
- SIRIUS-enabled applications;
- QuantumATK and other restricted or commercial implementations.

The directory should classify numerical representation, core treatment,
periodicity, licensing, and principal method families without ranking codes by a
single notion of accuracy.

### Molecular DFT and quantum-chemistry engines

These are adjacent to the materials-focused workflow but relevant for molecules,
clusters, embedding, benchmark calculations, and surface fragments. Seed
candidates include:

- NWChem;
- PySCF;
- Psi4;
- ORCA;
- Gaussian;
- Q-Chem;
- TURBOMOLE;
- GAMESS-US;
- Molpro;
- Dalton;
- TeraChem;
- CP2K and FHI-aims molecular modes;
- other specialised quantum-chemistry packages after scope review.

Their presence must not shift the public workflow from materials research into a
general quantum-chemistry manual.

### Pseudopotentials, PAW data, and basis resources

Seed candidates include:

- SSSP;
- PseudoDojo;
- PSLibrary;
- GBRV;
- SG15 and ONCV sets;
- JTH PAW datasets;
- GTH pseudopotentials;
- CP2K BASIS_MOLOPT;
- Basis Set Exchange;
- VASP PAW datasets;
- CASTEP on-the-fly generated potentials;
- code-distributed atomic datasets;
- ONCVPSP;
- ATOMPAW;
- OPIUM;
- Quantum ESPRESSO `ld1.x` and related atomic tools.

Licensed potential bodies must never be copied. A guide may explain metadata,
identity, compatibility, and testing without redistributing restricted data.

### Workflow engines, provenance, and high-throughput execution

Seed candidates include:

- AiiDA and the AiiDA plugin registry;
- AiiDAlab;
- aiida-quantumespresso;
- aiida-vasp;
- aiida-cp2k;
- aiida-siesta;
- aiida-fleur;
- AiiDA common workflows and AiiDA WorkGraph;
- Materials Cloud Explore and Archive;
- Quantum Mobile;
- atomate2;
- jobflow and jobflow-remote;
- custodian;
- FireWorks;
- pyiron and pyiron_atomistics;
- ASE calculators;
- Atomic Simulation Recipes;
- signac and signac-flow;
- Parsl;
- Snakemake;
- Nextflow;
- Dask;
- code-specific workflow packages and institutional workflow layers.

A workflow interface should expose provenance, restarts, error handling, and
scientific decision points. A green scheduler or dashboard state is not evidence
of numerical or scientific completion.

### Input generation, parsers, and code-specific helpers

Seed candidates include:

- pymatgen input sets and parsers;
- ASE I/O and calculators;
- VASPKIT;
- py4vasp;
- sumo;
- PyProcar;
- sisl;
- AbiPy;
- qe-tools;
- pwtools;
- c2x;
- cif2cell;
- Materials Cloud Quantum ESPRESSO input generator;
- code-native preprocessing and post-processing packages.

These tools should be introduced at the task they support. They should not be
presented as substitutes for understanding the underlying model, method, or
observable.

### Electronic structure, Fermi-surface, and bonding analysis

Seed candidates include:

- pymatgen electronic-structure analysis;
- sumo;
- PyProcar;
- VASPKIT;
- IFermi;
- FermiSurfer;
- SKEAF;
- BoltzTraP2;
- AMSET;
- PAOFLOW;
- Wannier90 and `postw90`;
- WannierBerri;
- Bader analysis tools from the Henkelman group;
- Critic2;
- Chargemol and DDEC methods;
- LOBSTER;
- Multiwfn;
- MacroDensity;
- code-native charge, ELF, COHP, COOP, and projected-orbital tools.

A plotting or partitioning tool produces a representation under stated
assumptions. It does not by itself establish chemical bonding, charge transfer,
or a Fermi-surface conclusion.

### Defects, disorder, and finite-size corrections

Seed candidates include:

- pymatgen-analysis-defects;
- doped;
- pydefect;
- Spinney;
- PyCDT;
- ShakeNBreak;
- sxdefectalign;
- CoFFEE;
- AiiDA-defects;
- py-sc-fermi;
- CarrierCapture.jl;
- CPLAP;
- icet, CASM, enumlib, and ATAT for configurational models;
- code-specific charged-defect and correction workflows.

Guides must preserve the distinction between generating a defect model,
selecting chemical potentials, applying finite-size corrections, solving charge
neutrality, and claiming a thermodynamic concentration.

### Surfaces, adsorption, reactions, and transition states

Seed candidates include:

- ASE surface, adsorption, NEB, and dimer tools;
- pymatgen surface, adsorption, and interface modules;
- VTST Tools;
- CatKit;
- ACAT;
- Surfaxe;
- Sella;
- geomeTRIC;
- EON;
- PLUMED;
- CatLearn;
- CatMAP;
- code-native NEB, string, dimer, and constrained-optimization modules.

A path-search tool finds a path under its model and initialization. It does not
prove that the path is globally dominant or experimentally accessible.

### Harmonic phonons, anharmonicity, and lattice thermal transport

Seed candidates include:

- Quantum ESPRESSO PHonon;
- ABINIT DFPT;
- code-native phonon modules in VASP, CASTEP, GPAW, Elk, and other engines;
- Phonopy;
- Phono3py;
- ALAMODE;
- hiPhive;
- TDEP;
- SSCHA and CellConstructor;
- DynaPhoPy;
- ShengBTE;
- almaBTE;
- kALDo;
- GPUMD;
- thermo_pw;
- Gibbs2 and other quasi-harmonic utilities;
- interfaces that convert force constants among Phonopy, Phono3py, ShengBTE,
  ALAMODE, and GPUMD formats.

The directory must distinguish harmonic force constants, fitted effective force
constants, perturbative anharmonicity, nonperturbative anharmonicity, and
transport solvers.

### Electron–phonon coupling and conventional superconductivity

Seed candidates include:

- EPW;
- Perturbo;
- EPIq;
- Phoebe;
- ElectronPhonon.jl;
- Quantum ESPRESSO PHonon and `lambda.x` workflows;
- ABINIT electron–phonon modules;
- code-native VASP, CASTEP, GPAW, and exciting electron–phonon capabilities where
  verified;
- SSCHA interfaces for anharmonic electron–phonon calculations;
- SCTK and other superconducting-density-functional or Eliashberg utilities
  after independent review.

Guides must distinguish electron–phonon matrix elements, interpolation,
self-energies, transport, isotropic and anisotropic Eliashberg calculations,
SCDFT, and empirical transition-temperature formulas. A computed `Tc` is not
accepted without the required electronic, phonon, sampling, stability, and
method evidence.

### Molecular dynamics, enhanced sampling, and trajectory analysis

Seed candidates include:

- code-native AIMD in Quantum ESPRESSO CP, VASP, CP2K, SIESTA, ABINIT, GPAW, and
  other engines;
- ASE molecular dynamics;
- i-PI;
- PLUMED;
- LAMMPS;
- GPUMD;
- TRAVIS;
- MDAnalysis;
- MDTraj;
- Chemfiles;
- OVITO;
- VMD;
- enhanced-sampling and free-energy packages after method-specific review.

The page hierarchy should separate force evaluation, integrator, thermostat or
barostat, enhanced-sampling bias, trajectory processing, and statistical
convergence.

### Machine-learning interatomic potentials and active learning

These are adjacent acceleration tools rather than DFT replacements. Seed
candidates include:

- DeePMD-kit and DP-GEN;
- QUIP and Gaussian Approximation Potentials;
- MACE;
- NequIP;
- Allegro;
- CHGNet;
- MatGL and M3GNet;
- SevenNet;
- FLARE;
- FitSNAP and SNAP;
- n2p2;
- SchNetPack;
- ACE and pacemaker;
- active-learning integrations in pyiron, ASE, AiiDA, and code-specific
  workflows.

Every guide must state the training domain, reference method, uncertainty or
extrapolation checks, and the distinction between surrogate-model convergence
and DFT validation.

### Optical response, spectroscopy, GW, and BSE

Seed candidates include:

- Yambo;
- BerkeleyGW;
- WEST;
- ABINIT GW and BSE;
- exciting;
- VASP GW and BSE;
- GPAW response modules;
- Octopus;
- SALMON;
- Quantum ESPRESSO turboTDDFT;
- CP2K excited-state modules;
- FHI-aims GW and response methods;
- Questaal GW and BSE;
- SPEX;
- OCEAN;
- FEFF;
- FDMNES;
- Quantum ESPRESSO XSpectra;
- code-native TDDFT, dielectric, Raman, infrared, EELS, XAS, and core-level
  spectroscopy tools.

Independent-particle optics, TDDFT, quasiparticle corrections, BSE excitons, and
core spectroscopy remain separate scientific methods even when one software
package implements several of them.

### Wannier functions, topology, and electronic transport

Seed candidates include:

- Wannier90;
- WannierTools;
- WannierBerri;
- Z2Pack;
- irvsp;
- qeirreps;
- irrep;
- spgrep;
- TBmodels;
- PythTB;
- Kwant;
- TranSIESTA and TBtrans;
- SMEAGOL;
- QuantumATK;
- NanoDCAL;
- OMEN;
- BoltzTraP2;
- AMSET;
- PAOFLOW;
- BoltzWann;
- EPW, Perturbo, and Phoebe transport modules;
- ShengBTE and almaBTE for phonon transport.

The site should distinguish interpolation, symmetry indicators, Berry
quantities, surface or edge states, semiclassical transport, ballistic transport,
and electron–phonon-limited transport.

### Mechanical, dielectric, piezoelectric, and polarization analysis

Seed candidates include:

- ElaStic;
- MechElastic;
- thermo_pw;
- pymatgen elasticity tools;
- VASPKIT mechanical-property tools;
- DFPT implementations in Quantum ESPRESSO, ABINIT, VASP, CASTEP, GPAW, and
  related engines;
- Berry-phase and polarization implementations in Quantum ESPRESSO, VASP,
  ABINIT, Wannier90, and other verified codes;
- code-native finite-field, dielectric, Born-charge, piezoelectric, and Raman
  modules.

A finite-difference wrapper and a native response implementation may have
fundamentally different convergence and symmetry requirements and should not be
presented as interchangeable buttons.

### Data, provenance, archiving, and reproducibility

Seed candidates include:

- AiiDA provenance graphs;
- NOMAD parsers, metainfo, and archive;
- Materials Cloud Explore and Archive;
- TCOD;
- OPTIMADE;
- ASE databases;
- atomate and MongoDB-based task stores;
- signac data spaces;
- HDF5, NetCDF, JSON, YAML, and code-native structured formats;
- workflow-specific provenance and manifest tools.

The site should explain authority, lineage, checksums, versioned schemas,
licensing, and reconstruction packages rather than treating file presence as
reproducibility.

### Scientific libraries and infrastructure

Supporting libraries and infrastructure may receive tool pages when they affect
method identity, interoperability, or reproducibility. Seed candidates include:

- Libxc;
- libvdwxc;
- DFT-D3 and DFT-D4 libraries;
- ELSI;
- SIRIUS;
- the Electronic Structure Library;
- PSML and libPSML;
- libGridXC;
- ELPA;
- ScaLAPACK;
- FFTW;
- HDF5;
- NetCDF;
- libint;
- Slurm;
- OpenPBS and PBS Pro;
- LSF;
- Grid Engine;
- Spack;
- EasyBuild;
- Conda, Mamba, and conda-forge;
- Apptainer and Singularity;
- Docker;
- Quantum Mobile and other reproducible environments.

These are supporting layers, not additional scientific operations.

### Discovery and maintenance policy

The inventory should be expanded and checked using current primary sources such
as official code manuals, official repositories, the AiiDA plugin registry,
Materials Cloud Work tools, the OPTIMADE providers dashboard, the Wannier
software ecosystem registry, NOMAD parser documentation, and official interface
lists from specialised packages such as Phonopy and Phono3py.

For every candidate tool, later review should record one of:

- current and verified;
- current but access-restricted;
- specialised or experimental;
- legacy but still scientifically relevant;
- superseded or unmaintained;
- unknown and requiring verification.

A tool must not be promoted to `reviewed` merely because its homepage exists or
because another package lists an interface. The exact capability used by the
guide must be checked against the current version and official documentation.

## Repository authority

Current authority is separated as follows:

1. `docs/architecture.md` defines reader-facing task granularity, the A–E
   information architecture, subordinate practical pages, and the secondary
   tool-index boundary.
2. `workflow/topics.json` defines stable topic identity, grouping, and routes.
3. A future `workflow/tools.json` may define stable tool identity and
   cross-index metadata, but it must not redefine scientific topics.
4. `docs/content-contract.md` defines writing, source, review, and migration
   rules.
5. `src/content/topics/*.md` supplies optional natural-language topic narratives.
6. A future `src/content/practical-guides/*.md` collection may supply
   implementation guides, worked examples, and visual notes.
7. Research-workflow and framework pages provide composite and cross-cutting
   explanations.
8. O01–O24, recipe coverage arrays, relation/tag files, and former 00–34 records
   are migration sources until useful material is reassigned.
9. Astro pages render these sources but do not independently redefine them.

A legacy JSON record, old route title, tool name, or validator assertion must not
restore the superseded numbered framework or redefine the scientific workflow.

## Migration compatibility

The repository retains two superseded route families:

- O01–O24 machine-granularity routes;
- former Operation 00–34 routes.

They are **Migration compatibility** data only.

- Old URLs remain reachable while destination content is developed.
- Old identifiers do not appear in the primary directory or reading sequence.
- Old routes have no previous/next adjacency or visible mapping tables.
- `workflow/topics.json` records intended destination topics when known.
- Useful material is moved into A–E topic, practical guide, worked example,
  research-workflow, or framework pages.
- Redirects or retirement occur only after reviewed destination coverage exists.

Readers should never need to understand the relationship between 24 and 35.

## Validation

Repository checks establish that:

- sections are A–E and D groups are D1–D5;
- topic slugs and titles are unique and collision-free;
- migration references resolve to existing transitional records;
- the home page and workflow directory are generated from the registry;
- every registry topic has a stable route;
- practical guides resolve to an existing parent topic when the collection is
  implemented;
- tool records use unique stable slugs and do not redefine topic identity when
  the tool registry is implemented;
- old numbered routes remain reachable only as migration surfaces;
- public pages do not advertise a total number of DFT operations;
- pages do not render a compulsory Inputs/Outputs-style contract;
- internal links remain project-base safe;
- screenshots and externally derived media retain provenance and reuse records;
- pages remain readable without client-side JavaScript;
- desktop and narrow layouts remain usable.

Tests may count files and routes internally to detect omissions. Such counts are
software invariants, not scientific statements about how many operations exist.

Build and browser success establish software behaviour only. They do not
validate a DFT protocol, numerical result, physical interpretation, learning
effectiveness, software capability, external-source semantics, or scientific
claim.

## Talos handoff

Talos should continue in bounded stages:

1. read the current project and Research-Ops `main` commits;
2. verify the exact-SHA Pages deployment for each merged batch;
3. keep `workflow/topics.json`, the home page, the workflow directory, and topic
   routes aligned without introducing a public total-operation count;
4. implement one `practical-guides` collection and static subordinate routes
   before adding large quantities of content;
5. pilot the interface with the four Build or Modify a Computational Model pages
   defined above;
6. add a secondary tool directory only after stable tool identity and review
   rules are implemented;
7. migrate useful material from O01–O24, former 00–34 pages, and current recipe
   scaffolds into the appropriate destinations;
8. write and review one coherent topic, practical guide, worked example, or
   research workflow at a time;
9. preserve old URLs until reviewed destination coverage exists;
10. allow every page to use a natural subject-specific structure;
11. update validators when routes, media rules, tool records, or migration
    relationships change;
12. distinguish software validation, semantic source review, external-link
    reachability, live deployment, numerical convergence, and scientific
    validation in every delivery.

The next framework batch should implement the practical-guide collection,
subordinate static routes, restrained parent-page cards, and one pilot topic. It
should not bulk-fill the tool inventory or generate empty tool pages.

The next scientific-content batch, after that framework is validated, should
write **Test Numerical Convergence** using the overview-plus-guides structure.

## Non-goals

This project is not:

- a workflow execution engine;
- a scheduler or HPC control service;
- a universal input generator;
- a proof that DFT research has a fixed number of operations;
- a scientific database;
- a software popularity ranking or exhaustive maintenance guarantee;
- a mirror of upstream manuals or licensed software assets;
- evidence that a listed tool supports every claimed capability or current
  version;
- evidence that a real calculation is converged or valid;
- a replacement for code- and version-specific official documentation.

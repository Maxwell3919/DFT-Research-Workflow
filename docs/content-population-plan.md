# DFT Research Workflow content development plan

## Purpose

This plan replaces the former O01–O24 chapter-writing sequence.

Future content is developed around researcher-scale workflow tasks, concrete
target calculations, and complete research workflows. The site does not aim to
prove or advertise a fixed total number of DFT operations.

Every page is written with natural topic organization. The plan defines content
coverage and migration order, not a mandatory visible template.

## Reader-facing architecture

```text
A · Structures
B · Calculation Preparation
C · Reference-State Calculations
D · Target Calculations
E · Research Completion
```

A, B, C, and E provide the common research backbone. D is a branching library
of calculations selected according to the scientific question.

## A · Structures

### Obtain a Material Structure

Later content should integrate:

- database, publication, experimental, previous-calculation, and generated
  structures;
- source identity, citation, version, licence, and integrity;
- CIF, POSCAR, XYZ, and other relevant representations;
- parsing, units, occupancies, disorder, duplicate sites, and missing fields;
- crystallographic cells, symmetry tolerances, equivalent sites, and
  representation choices;
- the distinction between correcting a representation and changing the physical
  model.

These are parts of one research task. They should not be restored as parallel
public chapters merely because software records them as separate events.

### Build or Modify a Computational Model

Later content should cover model construction appropriate to the chosen system:

- supercells and commensurate cells;
- surfaces, slabs, vacuum, dipoles, and electrostatic boundaries;
- defects, dopants, charge states, and chemical substitutions;
- adsorption sites and coverages;
- interfaces, heterostructures, stackings, registries, and strain;
- clusters, molecules, embedding, and constraints;
- magnetic orders, disorder models, SQS structures, and candidate reduction.

## B · Calculation Preparation

### Choose the DFT Method and Computational Setup

Later content should connect the physical question to:

- exchange–correlation treatment;
- pseudopotential, PAW, all-electron, basis, or real-space representation;
- spin polarization, noncollinearity, SOC, relativistic treatment, and DFT+U;
- dispersion and long-range interactions;
- charge, occupations, smearing, ensemble, and boundary conditions;
- k-point and q-point strategies;
- software and version-specific implementation choices.

The article structure should follow the scientific decisions rather than a
fixed parameter checklist.

### Test Numerical Convergence

Later content should explain observable-specific convergence, including:

- basis, cutoff, grids, supercell, vacuum, k/q sampling, smearing, and
  interpolation;
- reference-state consistency across comparisons;
- coupled convergence variables;
- uncertainty and indeterminate results;
- why program completion, SCF convergence, total-energy convergence, and target
  observable convergence are different.

## C · Reference-State Calculations

### Optimize the Structure

Later content should address:

- atomic, cell, constrained, interface, and path-related optimization;
- nested electronic convergence;
- force, stress, displacement, and energy criteria;
- local minima, metastability, symmetry breaking, and initial-condition
  dependence;
- consistency between the optimized structure and the later target calculation.

### Calculate the Reference Ground State

Later content should explain how to establish the electronic reference used by
subsequent work, including SCF/static/NSCF roles, spin and charge state,
sampling, precision, saved quantities, and the limits of calling one converged
branch the ground state.

## D · Target Calculations

Each item below is eligible for an independent page. Group names are navigation
categories only.

### D1 · Energetics and Stability

1. Relative Energies and Formation Energies
2. Equation of State and Structural Phase Stability
3. Compositional Phase Stability and Convex Hulls
4. Defect Formation Energies and Charge States
5. Surface Energy and Work Function
6. Adsorption Energies
7. Interface and Heterostructure Energetics

### D2 · Electronic and Magnetic Properties

1. Band Structure
2. Density of States and Projected Density of States
3. Fermi Surface and Full-Brillouin-Zone Analysis
4. Charge Density and Charge Redistribution
5. Electrostatic Potential and Band Alignment
6. Chemical Bonding Analysis
7. Magnetic Configuration and Ground-State Comparison
8. Magnetic Anisotropy and Exchange Interactions

### D3 · Mechanical, Electric, and Lattice Response

1. Elastic Constants and Mechanical Properties
2. Dielectric Response and Born Effective Charges
3. Polarization and Ferroelectricity
4. Piezoelectric Response
5. Harmonic Phonons
6. Anharmonic Phonons
7. Lattice Thermal Transport
8. Electron–Phonon Coupling
9. Conventional Superconductivity

### D4 · Kinetics and Finite Temperature

1. Reaction Paths and Transition States
2. Diffusion Barriers
3. Ab Initio Molecular Dynamics
4. Finite-Temperature Structural Sampling

### D5 · Optical, Excited-State, Topological, and Transport Calculations

1. Independent-Particle Optical Properties
2. Time-Dependent Response and Spectroscopy
3. Quasiparticle Corrections
4. Excitons and the Bethe–Salpeter Equation
5. Wannier Function Construction
6. Berry Phase and Berry Curvature
7. Topological Invariants and Boundary States
8. Electronic Transport
9. Quantum Transport

## E · Research Completion

### Analyze and Compare Results

Later content should cover reference alignment, normalization, aggregation,
relative stability, uncertainty, comparisons across structures or methods, and
the distinction between recorded output and interpreted scientific quantity.

### Validate Results and Scientific Conclusions

Later content should integrate numerical convergence, physical consistency,
symmetry and sum-rule checks, method sensitivity, benchmark comparison, and the
strength of the stated scientific conclusion.

### Document and Preserve the Study

Later content should cover provenance, model and parameter identity, software
environment, raw and derived evidence, workflow reconstruction, integrity
checks, archiving, and reuse.

## Research-workflow pages

Research-workflow pages show how A–E tasks combine for a scientific goal. The
initial set may include:

- bulk structure and electronic properties;
- two-dimensional materials;
- magnetic-order comparison;
- defect formation energies and charge states;
- surfaces and adsorption;
- heterostructure band alignment;
- harmonic phonons;
- anharmonic phonons and thermal transport;
- electron–phonon superconductivity;
- dielectric, polarization, and piezoelectric response;
- reaction paths and diffusion;
- molecular dynamics;
- optical spectra and excited states;
- SOC and topology;
- GW and BSE;
- high-throughput screening.

The existing `recipes/index.json` can provide migration hints, but its O01–O24
coverage arrays are not the final reader-facing workflow model.

## Page organization

No page has a required public outline.

Authors choose the explanatory order that best suits the subject. A page may
use narrative sections, equations, diagrams, tables, examples, comparisons, or
implementation notes where useful. It does not have to display Inputs, Outputs,
Requirement, Repeatability, Dependencies, Alternatives, or Exclusions as fixed
headings.

The following are planning questions, not a template:

- What does the task calculate or decide?
- Why is it scientifically useful?
- What model or reference state does it require?
- Which method and numerical choices control the result?
- How is convergence established for the target quantity?
- What common failures or false interpretations occur?
- What can the result support, and what remains unsupported?
- How does the task connect to other parts of the workflow?

Only applicable questions need to be discussed.

## Migration from the numbered structures

The current repository still contains O01–O24 and Operation 00–34 routes. They
are migration material only.

Migration proceeds in four stages.

### Stage 1 · Architecture and presentation

- adopt A–E in documentation and the public workflow directory;
- remove public 24/35 counts;
- remove automatic fixed-contract rendering;
- remove numbered previous/next navigation from old routes;
- retain old URLs temporarily.

### Stage 2 · Topic registry and destination pages

- define stable A–E topic slugs and category relationships;
- create one narrative destination for each backbone task and each D
  calculation;
- keep metadata minimal and independent of visible article structure;
- update navigation and deterministic route checks.

### Stage 3 · Content migration

- move useful material from old operation scaffolds and recipe records into the
  appropriate A–E pages;
- merge implementation-level fragments into the researcher-scale topic that
  gives them meaning;
- preserve source and historical mapping notes internally;
- write and review one coherent topic or research workflow at a time.

### Stage 4 · Route retirement or redirection

- verify destination coverage;
- decide whether each old route redirects, remains as a short migration page, or
  is retired;
- avoid exposing old identifiers or mappings as a second scientific taxonomy;
- update Pages and link validation.

## Writing order

A practical content order is:

1. Obtain a Material Structure;
2. Build or Modify a Computational Model;
3. Choose the DFT Method and Computational Setup;
4. Test Numerical Convergence;
5. Optimize the Structure;
6. Calculate the Reference Ground State;
7. Band Structure;
8. Density of States and Projected Density of States;
9. Charge Density and Electrostatic Potential topics;
10. Harmonic Phonons;
11. Relative Energies and Formation Energies;
12. Analyze and Compare Results;
13. Validate Results and Scientific Conclusions;
14. Document and Preserve the Study;
15. remaining D pages in dependency-aware groups;
16. complete research-workflow pages.

This order supports incremental learning. It is not a universal scientific
ranking or a fixed execution sequence.

## Sources and examples

- Prefer official documentation, standards, and primary method papers for
  version-sensitive claims.
- Use original explanation rather than copied manual or textbook prose.
- Use synthetic or clearly licensed examples during early development.
- Preserve structure source, software version, method, numerical settings, raw
  evidence, derived data, and validation limits for reproducible examples.
- Do not present one material's parameters as universal defaults.
- Do not imply that a named code, workflow framework, or successful job proves
  scientific validity.

## Review boundary

A page is reviewed for scientific accuracy, topic coverage, evidence limits,
source quality, and readability. It is not reviewed by checking compliance with
a uniform heading sequence.

Repository build, links, responsive layout, and no-JavaScript rendering are
software checks. They do not establish numerical or physical validity.

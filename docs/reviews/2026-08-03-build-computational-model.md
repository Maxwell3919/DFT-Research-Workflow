# Build or Modify a Computational Model — scientific content review

## Scope

This review covers only the public topic:

> A · Structures → Build or Modify a Computational Model

The reviewed narrative is
`src/content/topics/build-or-modify-computational-model.md`.
The decision is **reviewed within the declared educational scope**.

This status means that the article has a coherent model-building boundary,
appropriate primary or official sources, and no known conflict with the current
A–E architecture. It does not validate any particular model, supercell,
interface, defect, surface, disorder realization, or DFT result.

## Migration-source review

The superseded O05 and O06 narrative files were inspected:

- Build a Computational Model;
- Generate and Reduce Candidate Configurations.

Both contained only neutral scaffold text. No scientific prose was migrated.
The new article treats model construction, candidate generation, and transparent
candidate reduction as one researcher-scale task rather than restoring two
parallel public operations.

## Source review

### General model construction, periodicity, surfaces, adsorption, and constraints

ASE documentation supports the discussion of atomistic model objects, periodic
boundary flags, integer supercells, surface construction, vacuum insertion,
adsorbate placement, and explicit constraints. The article uses these as
implementation examples, not as definitions of DFT or universal settings.

- https://wiki.fysik.dtu.dk/ase/ase/build/build.html
- https://wiki.fysik.dtu.dk/ase/ase/build/surface.html
- https://wiki.fysik.dtu.dk/ase/ase/atoms.html
- https://wiki.fysik.dtu.dk/ase/ase/constraints.html

### Structure transformations, disorder, interfaces, and magnetic candidates

Pymatgen documentation supports the existence of integer supercell
transformations, one-to-many structure enumeration, disorder ordering and SQS
workflows, coherent-interface construction, and collinear magnetic-order
candidate generation. The article explicitly warns that internal Ewald,
machine-learned, symmetry, or other rankings are screening devices rather than
first-principles ground-state proofs.

- https://pymatgen.org/pymatgen.transformations.html
- https://pymatgen.org/pymatgen.analysis.interfaces.html
- https://pymatgen.org/pymatgen.analysis.magnetism.html

### Commensurate interface matching

Zur and McGill support the concept of systematically searching for lattice
matches between crystal surfaces. The article limits this evidence correctly: a
lattice match identifies commensurate candidates but does not select a unique
termination, registry, strain distribution, or stable interface.

- https://doi.org/10.1063/1.333084

### Representing substitutional disorder

The original SQS work supports the use of finite periodic structures selected to
reproduce important correlation functions of a random alloy. The article does
not claim that one SQS is random in all respects or that its construction removes
the need to state cell size, target correlations, composition, and retained
alternatives.

- https://doi.org/10.1103/PhysRevLett.65.353

### Point defects and periodic supercells

The Freysoldt et al. review supports the supercell treatment of point defects and
the need to manage the approach to the isolated or dilute limit. The article
uses this only to establish model-building boundaries. It leaves electrostatic
corrections, reference chemical potentials, band-gap treatment, and defect
formation energies to later setup and target-calculation topics.

- https://doi.org/10.1103/RevModPhys.86.253

## Scientific review findings

The article correctly preserves the following distinctions:

- the source structure is not automatically the computational model;
- the model is defined by atoms, composition, cell, periodicity, charge,
  candidate order, and constraints;
- an equivalent cell representation is different from a change to the physical
  model;
- a pristine integer supercell may represent the same infinite ideal bulk, but
  its size becomes physically consequential when it hosts a defect, ordering,
  interface, distortion, or finite-wavelength pattern;
- vacuum and periodicity are parts of the boundary model and require later
  observable-specific convergence;
- a slab is defined by orientation, termination, thickness, lateral cell,
  surfaces, and constraints, not by vacuum alone;
- adsorption coverage depends on both adsorbate count and surface-cell area;
- a defect model must retain its pristine reference, site identity, charge,
  supercell, and possible local reconstructions;
- the supercell approximation represents periodic defect images rather than an
  isolated defect directly;
- a lattice match does not uniquely determine a physical interface;
- one ordered structure is not a random alloy;
- an SQS reproduces declared finite correlation targets rather than every feature
  of an infinite random material;
- initial magnetic moments and enumerated magnetic orders are candidates, not
  evidence for a converged magnetic ground state;
- constraints reduce the accessible configuration space and must be reported as
  model assumptions;
- candidate generation and candidate reduction must preserve lineage and the
  reason each candidate was retained or rejected;
- approximate rankings are screening evidence and do not establish DFT
  stability;
- the completed task can legitimately return a model family rather than one
  supposedly final structure.

## Editorial review

The article follows a topic-specific sequence:

1. the scientific question;
2. representation versus physical-model changes;
3. dimensionality and periodicity;
4. supercells and length scales;
5. surfaces and adsorption;
6. defects and dopants;
7. interfaces and heterostructures;
8. disorder approximations;
9. magnetic order and constraints;
10. candidate generation and reduction;
11. model identity and the handoff to calculation preparation.

This structure is natural to the subject. It does not restore the former
Inputs/Outputs-style contract or split candidate handling into a separate public
operation.

## Deliberate limitations

This batch does not provide:

- a universal supercell size, vacuum thickness, slab thickness, mismatch
  threshold, defect concentration, or adsorption height;
- a worked material-specific model;
- an interface, defect, surface, adsorption, SQS, or magnetic enumeration
  benchmark;
- a universal algorithm for candidate ranking;
- a recommendation that one code or structure library is authoritative;
- exchange–correlation, pseudopotential, basis, k-point, smearing, or convergence
  settings;
- charged-defect correction procedures or defect formation energies;
- evidence that any generated candidate is stable, synthesizable, or a ground
  state.

These omissions keep the article at the model-construction boundary. The next
content topic is **Choose the DFT Method and Computational Setup** only after the
A-section model topics are complete and reviewed.

## Evidence boundary

The source review establishes that the article represents the cited methods and
official documentation accurately within its declared scope. Repository, type,
build, link, and browser checks establish software behaviour only. Neither form
of review validates a real computational model, a numerical protocol, or a
scientific conclusion.

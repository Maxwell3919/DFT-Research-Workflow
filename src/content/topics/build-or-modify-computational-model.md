---
topic_slug: build-or-modify-computational-model
status: reviewed
---

A computational model is the explicit system that a calculation is asked to represent. It is not simply the source structure in a code-specific format. The model includes the atoms, composition, cell, periodicity, charge, candidate order, constraints, and any deliberate departure from the source material. Building it therefore means translating a scientific question into an atomistic hypothesis that can later be tested.

The result of this task is often a **model family**, not one privileged file. A defect may occupy several inequivalent sites. A surface may have several terminations. An adsorbate may have several orientations and coverages. An interface may admit many commensurate cells, strains, and registries. A disordered phase may require several ordered approximants or a special quasirandom structure. Choosing one candidate too early can turn an untested convenience into a hidden scientific assumption.

## Begin with the question the model must answer

Model construction should start from the intended comparison or observable. A primitive bulk cell may be sufficient for a perfect-crystal equation of state, but it cannot represent an isolated point defect, a long-period antiferromagnetic pattern, a dilute dopant, a surface, or a twisted heterostructure. A slab suitable for surface energy may not be suitable for adsorption at a given coverage. A supercell appropriate for one defect concentration may be inadequate for defect–defect interactions or elastic relaxation.

Before changing the source structure, state what the model is meant to approximate:

- an infinite periodic bulk crystal;
- an isolated molecule or cluster;
- a one- or two-dimensional material embedded in a larger periodic cell;
- a surface or thin film;
- a defect or dopant in the dilute limit;
- an adsorbate at a stated coverage;
- an interface, grain boundary, or heterostructure;
- an ordered phase, a magnetic pattern, or a representation of disorder;
- a constrained geometry chosen to isolate a mechanism.

This statement determines which periodic images, length scales, compositions, symmetries, and degrees of freedom are part of the approximation.

## Separate equivalent representations from changes to the physical model

Some transformations can preserve the same ideal periodic structure. Reordering sites, wrapping fractional coordinates, shifting the origin, or changing between exactly equivalent primitive and conventional cells can be representation changes when the lattice transformation and site mapping are preserved. Repeating a perfect bulk cell into an integer supercell can also describe the same infinite crystal if nothing else is changed and the later reciprocal-space treatment remains consistent.

Other transformations change the modelled system. Applying strain, removing or substituting an atom, choosing a defect charge state, selecting one ordering of a partially occupied site, cutting a slab, adding vacuum, choosing a surface termination, attaching an adsorbate, combining two lattices, imposing a magnetic pattern, or freezing degrees of freedom all introduce physical assumptions.

The distinction is not always visible from the final coordinate file. A cell-reduction command and a strained interface builder may both output new lattice vectors, but only the first may be an equivalent representation. Every transformation should therefore record whether it is intended to preserve the physical model or to create a new one.

## Choose dimensionality and periodicity explicitly

Periodic boundary conditions are part of the model. Atomistic libraries such as ASE allow periodicity to be set independently along the three cell directions; this is not a cosmetic flag. It determines which copies of the model interact and how later electronic-structure software interprets the cell.

Low-dimensional calculations often use a three-dimensional periodic code with vacuum inserted along one or more directions. Vacuum is part of the boundary model, not empty experimental material. Its thickness, the placement of the object, and the choice of periodic directions must be recorded and later converged for the target quantity. A two-dimensional monolayer, a finite ribbon, and a repeated stack can share the same atomic motif while representing different systems.

For slabs, the model also includes the surface orientation, number of layers, termination, lateral cell, and whether the two faces are equivalent. Polar or asymmetric slabs can carry fields or dipoles that require additional method choices later. Passivation of a back surface, when used, changes the model and must not be hidden as a numerical trick.

## Let the supercell encode the relevant length scale

A supercell is a modelling choice, not merely a larger file. Its integer transformation matrix determines the periodicity available to defects, distortions, magnetic order, alloy configurations, phonons, and interfaces. Cell shape can matter as much as atom count because the shortest distance between periodic images may be controlled by an oblique lattice vector.

The model record should retain the parent cell, transformation matrix, site mapping, resulting composition, and shortest relevant image separations. A supercell chosen to host a defect implicitly defines a defect concentration. A supercell chosen for an antiferromagnetic pattern defines which ordering wavevectors are allowed. A cell chosen for an interface distributes mismatch and strain in a particular way.

There is no universal minimum supercell size. The appropriate size depends on the physical interaction being suppressed or represented: elastic relaxation, electrostatic image interactions, defect-state overlap, magnetic coupling, compositional correlations, structural modulation, or the wavelength of a perturbation. Numerical convergence of that choice belongs to the later convergence task, but the model must expose the relevant length scales rather than conceal them behind a cell dimension.

## Construct surfaces and adsorption models deliberately

Surface builders can generate slabs from Miller indices, repeat them laterally, add vacuum, and place adsorbates at named or numerical sites. These utilities are useful, but their output is a candidate model rather than a validated surface.

A surface model should identify:

- the parent bulk structure and orientation;
- the termination and any reconstruction assumed or excluded;
- slab thickness and lateral periodicity;
- whether both surfaces are equivalent;
- fixed, passivated, or otherwise modified layers;
- the reference plane used for adsorbate height;
- adsorbate identity, orientation, site, coverage, and coadsorbates;
- whether several symmetry-distinct sites or molecular orientations remain to be tested.

Coverage is set by both adsorbate count and surface-cell area. Adding one molecule to a larger cell changes the physical model even when the local starting geometry looks identical. A high-symmetry adsorption site is only an initial candidate; relaxation may move the adsorbate, and a site generator does not establish which configuration is stable.

## Treat defects and dopants as controlled departures from a reference

A defect model should be traceable to a pristine reference cell with the same lattice convention and compatible numerical treatment. Record the defect species, operation used to create it, site index and local environment, multiplicity of symmetry-equivalent sites, supercell, nominal charge state, and any initial local distortion or magnetic moment.

Removing or replacing a site is not enough to define a defect calculation. Different crystallographic sites can produce chemically distinct defects. Several local reconstructions may exist around the same nominal defect. Interstitials require a defensible set of candidate positions rather than one visually convenient void.

Choosing a charge state changes the model even before an electronic-structure method is selected. In a periodic calculation, the implementation may introduce compensating backgrounds or finite-size corrections; those treatments belong to method setup and defect energetics. At the model stage, the charge, stoichiometric change, electron reservoir convention, and relation to the neutral reference must remain explicit.

The supercell approach represents a periodic array of defects, not an isolated defect directly. The dilute-limit interpretation therefore requires later size and correction analysis. Creating a large cell does not by itself prove that defect images are negligible.

## Build interfaces and heterostructures as families of candidates

An interface is defined by more than two materials placed near each other. The model includes the surface orientations, terminations, in-plane supercells, relative rotation, lattice match, strain allocation, registry, separation, stoichiometry, and boundary conditions.

Lattice-matching algorithms can search for commensurate surface cells. The Zur–McGill construction and implementations such as pymatgen's coherent-interface tools formalize this search, but a match is not a unique physical interface. Different integer cells can trade atom count against mismatch. The same match can distribute strain differently between film and substrate. Different terminations and translations can create distinct bonding environments.

No universal lattice-mismatch threshold decides whether an interface is acceptable. The relevant strain depends on elastic response, thickness, relaxation mechanism, experimental context, and the property being studied. For van der Waals heterostructures, small in-plane mismatch does not remove the need to consider stacking registry, relative orientation, interlayer separation, and possible moiré length scales.

The candidate set should preserve every applied strain tensor and transformation matrix. An interface builder should never silently deform both materials and report only the final combined cell.

## Replace disorder with a declared approximation

Partial occupancy or chemical disorder cannot usually be passed unchanged to a conventional periodic DFT calculation. It must be replaced by an explicit approximation whose meaning is stated.

Possible model families include:

- symmetry-distinct ordered configurations at the required composition;
- larger cells with sampled occupations;
- special quasirandom structures designed to reproduce selected correlation functions;
- multiple stochastic realizations;
- method-specific effective-medium treatments, when the later electronic-structure method supports them.

One ordered cell is not a random alloy. An SQS is also not random in every respect; it is a finite periodic structure selected to reproduce stated correlations over stated clusters. The original composition, occupancy information, target correlation functions, cell size, generation method, objective value, random seed where relevant, and retained alternatives should be recorded.

Enumeration tools can generate many ordered structures, but their internal ranking is not automatically a DFT stability result. Pymatgen, for example, can enumerate orderings and rank candidates with Ewald or machine-learned criteria. Such rankings are screening devices whose assumptions must remain visible. They do not replace consistent first-principles comparison of the candidates that survive.

## Include magnetic order and constraints in model identity

Magnetic order can enlarge the required cell and break crystallographic symmetry. Plausible ferromagnetic, antiferromagnetic, ferrimagnetic, and noncollinear starting patterns may need to be represented as separate candidate models. Automated magnetic-order enumerators can help generate collinear candidates, but the initial moments are hypotheses and numerical starting conditions, not proof of the converged magnetic ground state.

Structural constraints are equally consequential. Fixing substrate layers, holding a lattice vector constant, constraining a molecule, or preserving a symmetry changes the accessible configuration space. ASE constraints, for example, are attached directly to the atomic model and can freeze selected positions or collective degrees of freedom.

Constraints are assumptions written into the model. They should identify the constrained atoms or coordinates, the physical justification, and the comparison required to determine whether the conclusion depends on the constraint. A constrained relaxation cannot be described simply as “fully relaxed.”

## Generate candidates broadly, then reduce them transparently

Candidate generation and candidate reduction belong to the same researcher-scale task because the value of the final model set depends on what was considered and why alternatives were removed.

Useful reductions include exact duplicate removal, crystallographic equivalence, symmetry equivalence of defect or adsorption sites, impossible stoichiometry, severe atomic overlap, incompatible boundary conditions, and clearly documented geometric or chemical filters. These reductions should preserve a mapping from each retained model to its parent and from each rejected candidate to the rule that rejected it.

Cheap energies, empirical scores, electrostatic rankings, machine-learned models, or geometric heuristics may be used to prioritize candidates. They should be labelled as screening evidence. A generated candidate is not a predicted ground state, and a candidate discarded by an approximate ranker has not been disproved by DFT.

The model set should remain large enough to represent the unresolved scientific alternatives but small enough for consistent downstream treatment. That balance is a research decision, not a generic software default.

## Preserve model lineage and identity

Every model should be reconstructable from its source structure and transformation history. At minimum, preserve:

- parent structure identifier and checksum;
- scripts, library versions, and commands used to transform it;
- transformation matrices and site mappings;
- species changes, removed and added sites, and composition;
- periodicity flags, cell vectors, vacuum, orientation, and termination;
- charge, initial magnetic pattern, and constraints;
- interface strain, registry, twist or rotation, and layer order;
- disorder-generation settings, seeds, correlation targets, and candidate rankers;
- a stable model identifier and relation to alternative candidates.

A final coordinate file alone cannot reconstruct these decisions. Two models with identical Cartesian coordinates but different intended charges, constraints, or periodicity are not the same computational model.

## The result of this task

The task is complete when the study has one or more explicit, reconstructable atomistic models whose relation to the source structure and scientific question is clear. Unresolved alternatives remain visible, and representation changes are distinguished from physical-model changes.

This stage does not establish that a model is stable, experimentally realized, numerically converged, or the ground state. It also ends before choosing the exchange–correlation functional, pseudopotential or all-electron treatment, basis cutoff, k-point mesh, smearing, electrostatic correction, or convergence thresholds. Those decisions belong to **Choose the DFT Method and Computational Setup** and **Test Numerical Convergence**.

## Sources and methods

- [ASE: Building things](https://wiki.fysik.dtu.dk/ase/ase/build/build.html)
- [ASE: Surfaces, vacuum, and adsorbates](https://wiki.fysik.dtu.dk/ase/ase/build/surface.html)
- [ASE: The Atoms object and periodic boundary conditions](https://wiki.fysik.dtu.dk/ase/ase/atoms.html)
- [ASE: Constraints](https://wiki.fysik.dtu.dk/ase/ase/constraints.html)
- [pymatgen transformations](https://pymatgen.org/pymatgen.transformations.html)
- [pymatgen interface construction](https://pymatgen.org/pymatgen.analysis.interfaces.html)
- [pymatgen magnetic-structure analysis and enumeration](https://pymatgen.org/pymatgen.analysis.magnetism.html)
- [Zur and McGill, “Lattice match: An application to heteroepitaxy”](https://doi.org/10.1063/1.333084)
- [Zunger et al., “Special quasirandom structures”](https://doi.org/10.1103/PhysRevLett.65.353)
- [Freysoldt et al., “First-principles calculations for point defects in solids”](https://doi.org/10.1103/RevModPhys.86.253)

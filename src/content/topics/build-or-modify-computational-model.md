---
topic_slug: build-or-modify-computational-model
status: reviewed
---

A computational model is the explicit system sent to a calculation: atoms, composition, cell, periodicity, charge, candidate order, constraints, and every deliberate departure from the source structure. The result of this task is often a **model family**, not one privileged file.

## Manual route: define and inspect the model family

Name the comparison or observable first. Read the original paper and supplementary methods for the reported phase, orientation, defects, termination, charge or magnetic state, environment, and experimental constraints. Then list the smallest set of models that can represent the unresolved alternatives.

A primitive bulk cell cannot represent an isolated defect, a surface, a long-period magnetic order, or an interface. A slab built for one coverage is not automatically the model for another. A generated candidate is not a predicted ground state; it is a starting hypothesis.

Write one sentence for each candidate stating what it approximates: periodic bulk, isolated object, low-dimensional layer, surface, defect, adsorbate, interface, ordered composition, magnetic pattern, or constrained geometry. That sentence determines which compositions, periodic images, length scales, and degrees of freedom must remain visible.

## Start from the question and the checked source

Start from the inspected working object produced by [Obtain a Material Structure](/DFT-Research-Workflow/operations/obtain-material-structure/), not from a detached filename. Preserve the unchanged database or publication download outside the model directory. Copy the checked working representation into a source area, record its checksum, and never overwrite it.

Before transforming anything, open the parent with its cell boundary and periodic images visible. Record composition, atom order, cell, periodic directions, occupancy representation, shortest relevant contacts, and any source ambiguity that remains.

[Compare structure viewers, symmetry services, and model-building tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry). VESTA, OVITO, XCrySDen, ASE GUI, browser viewers, and other tools have different format and display strengths; whichever tool is used, retain the exact input file and the settings needed to understand the view.

## Distinguish representation changes from model changes

Wrapping fractional coordinates, shifting an origin, reordering atoms, or changing between exactly equivalent primitive and conventional representations can preserve the ideal periodic structure when the transformation and site mapping are retained. An unchanged integer repeat can also represent the same ideal infinite crystal.

Strain, substitution, deletion, charge, ordering, a slab cut, vacuum, termination, adsorbate, interface, magnetic pattern, or constraint changes the physical model. The final coordinate file may not reveal why the change was made, so preserve that meaning beside the file.

Choosing a charge state changes the model even before an electronic-structure method is selected. No universal lattice-mismatch threshold decides whether an interface is acceptable.

## Optional automation: preserve and compare repeated transformations

For each operation use a separate output name. Keep the checked parent under
`models/source/`, one file per declared child under `models/candidates/`, and
the transformation, mapping, checks, and decision notes under `models/records/`.

Read the source file, apply one declared transformation, write the child, and then reopen the written file. Do not validate only the in-memory object. The practical guides on this page demonstrate bounded file-backed routes for cell repetition, surfaces and adsorbates, pymatgen transformations, a two-dimensional model, and defect/interface candidates.

## Check the child object before calculation

Open parent and child side by side with cell boundaries visible. Inspect orientation, replication, vacuum direction, termination, removed or substituted site, interface registry, coordination, and unexpectedly short contacts. For slabs, layers, and interfaces use both top and side views; one projection cannot establish coverage, registry, separation, and vacuum at once.

Then compare the reopened numerical objects:

- composition, atom count, atom order, occupancies, and site mapping;
- cell vectors, volume, periodic directions, and relevant image separations;
- coordinates, duplicate sites, collisions, coordination, and dimensionality;
- supercell matrix, imposed strain, vacuum, orientation, and termination;
- defect site and concentration, adsorbate count and coverage, or interface registry;
- charge, initial magnetic pattern, constraints, and symmetry treatment;
- metadata or fields lost when the child was serialized or converted.

A checksum binds bytes and is useful provenance, but equal or different hashes do not establish structural equivalence or model suitability. The parsed and visually inspected objects, declared transformation, and scientific purpose must agree.

## Match the model family to the unresolved alternatives

Create separate candidates for different polymorphs, defect sites, reconstructions, terminations, adsorbate orientations, interface registries, magnetic patterns, or ordered approximations to disorder. Reduce the family only with explicit rules such as exact duplication, justified symmetry equivalence, impossible stoichiometry, severe overlap, or incompatible boundary conditions.

One ordered cell is not a random alloy. One named adsorption site is not a preferred geometry. Deleting an atom does not define a charge state. Assigning two layers a common cell does not predict zero mismatch. A surface builder does not prove a termination stable.

A supercell is a modelling choice, not merely a larger file. Periodic size is part of the model: a supercell fixes defect concentration and allowed wavelengths; a lateral slab cell fixes coverage; a low-dimensional cell fixes image geometry. Vacuum is part of the boundary model, not empty experimental material. There is no universal supercell, vacuum, layer-count, or mismatch threshold; test the controls against the target observable.

Constraints are assumptions written into the model. Fixed layers, selected coordinates, cell restrictions, imposed symmetry, and magnetic patterns must identify the affected atoms or components and their physical justification. A constrained stationary point is not an unconstrained minimum.

## Numerical and lineage checks

For every candidate retain:

- candidate identifier and purpose;
- the parent identifier, path, and checksum;
- the tool and version, plus the script or manual operation and command;
- transformation parameters and matrix, plus site mapping and species changes;
- parent and child composition, cell, and periodicity;
- charge, magnetic initialization, and constraints;
- the child filename and checksum;
- visual and numerical observations; and
- alternatives retained or rejected, with reasons.

## Decide which candidates continue

Promote a candidate only when this lineage, its reopened geometry, and its unresolved alternatives are explicit. A quick energy, geometric score, electrostatic rank, or machine-learned estimate can prioritize models, but remains screening evidence rather than a ground-state or stability conclusion.

## The result of this task

This task ends with one or more explicit, reconstructable candidate files. This stage does not establish that a model is stable, experimentally realized, numerically converged, or the ground state.

Next, [choose the exchange–correlation treatment, electron–ion data, spin, relativistic, boundary, and software setup](/DFT-Research-Workflow/operations/choose-dft-method-and-computational-setup/). Then [test the numerical controls](/DFT-Research-Workflow/operations/test-numerical-convergence/) against the quantity that will be used. Return here when convergence, relaxation, or comparison exposes a model-size, boundary, symmetry, state, or candidate-family problem.

## Sources and methods

- [ASE: Building things](https://docs.ase-lib.org/ase/build/build.html)
- [ASE: Surfaces, vacuum, and adsorbates](https://docs.ase-lib.org/ase/build/surface.html)
- [ASE: The Atoms object and periodic boundary conditions](https://docs.ase-lib.org/ase/atoms.html)
- [ASE: Constraints](https://docs.ase-lib.org/ase/constraints.html)
- [pymatgen transformations](https://pymatgen.org/pymatgen.transformations.html)
- [pymatgen interface construction](https://pymatgen.org/pymatgen.analysis.interfaces.html)
- [pymatgen magnetic-structure analysis and enumeration](https://pymatgen.org/pymatgen.analysis.magnetism.html)
- [Zur and McGill, “Lattice match: An application to heteroepitaxy”](https://doi.org/10.1063/1.333084)
- [Zunger et al., “Special quasirandom structures”](https://doi.org/10.1103/PhysRevLett.65.353)
- [Freysoldt et al., “First-principles calculations for point defects in solids”](https://doi.org/10.1103/RevModPhys.86.253)

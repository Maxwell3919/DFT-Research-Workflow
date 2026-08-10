---
topic_slug: build-or-modify-computational-model
status: reviewed
---

A computational model is the explicit system sent to a calculation: atoms, composition, cell, periodicity, charge, candidate order, constraints, and every deliberate departure from the source. The result of this task is often a **model family**, not one privileged file.

## Manual route: define and inspect the model family

Name the comparison or observable first. List the smallest set of physically credible candidates needed to represent unresolved polymorphs, defects, terminations, interfaces, adsorbate arrangements, charge states, magnetic patterns, disorder approximations, or constraints. A generated candidate is not a predicted ground state; it is a hypothesis to test.

## Start from the question and the checked source

Start from the checked object produced by [Obtain a Material Structure](/DFT-Research-Workflow/operations/obtain-material-structure/). Keep the source unchanged. Before editing, record its identifier, checksum, composition, cell, atom order, periodic directions, occupancies, and remaining ambiguity. Open the parent with cell boundaries and periodic images visible; the [viewer and symmetry catalog](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) offers several real tools.

## Distinguish representation changes from model changes

Wrapping coordinates, shifting an origin, or moving between exactly equivalent cells may preserve the ideal periodic structure when the transformation and site mapping are retained. Strain, substitution, deletion, ordering, a slab cut, vacuum, an interface, charge, magnetic pattern, or constraint changes the physical model. Choosing a charge state changes the model even before an electronic-structure method is selected. No universal lattice-mismatch threshold decides whether an interface is acceptable.

## Check the child object before calculation

Write each child to a new file, reopen that file, and compare it with its parent. Inspect composition, cell, periodicity, orientation, replication, vacuum direction, termination, defect or substituted site, interface registry, coordination, and short contacts. For slabs and interfaces inspect both top and side views. Record atom mapping and the exact transformation; visual similarity alone cannot prove equivalence.

## Match the model family to the unresolved alternatives

Keep distinct candidates until an explicit rule removes one. One ordered cell is not a random alloy. One adsorption site is not a preferred geometry. Deleting an atom does not define a charge state. A supercell is a modelling choice, not merely a larger file. Its size fixes concentrations, image separation, and allowed wavelengths. Vacuum is part of the boundary model, not empty experimental material.

Constraints are assumptions written into the model. Identify every fixed atom, coordinate, or cell component and explain why it is fixed. A constrained stationary point is not an unconstrained minimum.

## Numerical and lineage checks

For every candidate preserve: parent identifier and checksum; tool and version; operation or script; transformation parameters and site mapping; parent and child composition, cell, and periodicity; charge, magnetic initialization, and constraints; exported filename and checksum; visual/numerical observations; and retained or rejected alternatives. This lineage is the key output, not a screenshot.

## Optional automation: preserve and compare repeated transformations

Use automation only after one transformation is understood manually. The existing guides provide concrete file-backed routes for [ASE cell repetition](/DFT-Research-Workflow/operations/build-or-modify-computational-model/guides/ase-build-repeat-cells/), [surfaces, vacuum, and adsorbates](/DFT-Research-Workflow/operations/build-or-modify-computational-model/guides/ase-surfaces-vacuum-adsorbates/), [pymatgen transformations](/DFT-Research-Workflow/operations/build-or-modify-computational-model/guides/pymatgen-structure-transformations/), [two-dimensional models](/DFT-Research-Workflow/operations/build-or-modify-computational-model/examples/two-dimensional-monolayer-model/), and [defect/interface candidates](/DFT-Research-Workflow/operations/build-or-modify-computational-model/examples/construct-defect-and-interface-candidates/).

## Decide which candidates continue

Promote only reopened files with explicit lineage, credible geometry, and visible unresolved alternatives. Screening scores may prioritize work, but do not establish stability. One ordered candidate, one interface registry, or one local optimization is not an exhaustive search.

## The result of this task

The handoff contains reconstructable candidate files, parent/child checksums, transformation records, views, constraints, and the candidate inventory. This stage does not establish that a model is stable, experimentally realized, numerically converged, or the ground state. Next [choose the DFT method and setup](/DFT-Research-Workflow/operations/choose-dft-method-and-computational-setup/) and [test numerical convergence](/DFT-Research-Workflow/operations/test-numerical-convergence/).

## Sources and methods

- ASE: [building](https://docs.ase-lib.org/ase/build/build.html), [surfaces](https://docs.ase-lib.org/ase/build/surface.html), [Atoms and periodicity](https://docs.ase-lib.org/ase/atoms.html), and [constraints](https://docs.ase-lib.org/ase/constraints.html).
- pymatgen: [transformations](https://pymatgen.org/pymatgen.transformations.html), [interfaces](https://pymatgen.org/pymatgen.analysis.interfaces.html), and [magnetic structures](https://pymatgen.org/pymatgen.analysis.magnetism.html).
- Zur and McGill, [lattice matching](https://doi.org/10.1063/1.333084); Zunger et al., [special quasirandom structures](https://doi.org/10.1103/PhysRevLett.65.353); Freysoldt et al., [point defects](https://doi.org/10.1103/RevModPhys.86.253).

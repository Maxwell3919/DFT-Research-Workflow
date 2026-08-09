---
topic_slug: build-or-modify-computational-model
guide_slug: ase-surfaces-vacuum-adsorbates
title: Construct Surfaces, Vacuum, and Adsorbates with ASE
kind: implementation
tools:
  - ase
status: reviewed
summary: Build a slab and adsorption candidate with ASE while exposing termination, thickness, lateral periodicity, coverage, vacuum, and the limits of generated starting geometries.
tested_versions:
  - ASE 3.29.0
  - Python 3.12
execution_script: examples/practical-guides/ase_surface_vacuum_adsorbates.py
source_ids:
  - ase-docs-home
  - ase-surface
  - ase-building
  - ase-pypi-3290
media_ids:
  - ase-slab-vacuum-diagram
review: docs/reviews/2026-08-03-practical-guides-model-building-pilot.md
reviewed_at: 2026-08-03
---

Use this guide to create a traceable slab and adsorbate starting candidate. A surface builder produces coordinates; it does not validate the termination, thickness, coverage, vacuum, or adsorption site.

## Run the checked construction

From the repository root, run:

```bash
python3 examples/practical-guides/ase_surface_vacuum_adsorbates.py
```

The companion uses ASE 3.29.0 to construct one illustrative Al(111) slab, add one H atom, center the object in its cell, and print a structured summary. It checks substrate and adsorbate counts, in-plane periodicity, out-of-plane nonperiodicity, adsorbate placement, cell length, atomic extent, and empty-cell length.

These checks establish the declared object construction only. They do not calculate an adsorption energy, relax the geometry, compare sites, converge slab thickness or vacuum, or validate an Al–H model.

## Build one explicit candidate

The executable operation is:

```python
from ase.build import add_adsorbate, fcc111

slab = fcc111("Al", size=(2, 2, 3))
add_adsorbate(slab, "H", height=1.5, position="ontop")
slab.center(vacuum=10.0, axis=2)
```

Every numerical value is illustrative. The call encodes a (111) orientation, a two-by-two lateral repeat, three substrate layers, one initial on-top H site, an out-of-plane nonperiodic ASE object, and centered empty-cell length. None is a production recommendation.

## Inspect the produced object

Check at least:

```python
assert slab.pbc.tolist() == [True, True, False]
assert slab.get_chemical_symbols().count("H") == 1
```

Also record the final cell matrix, atomic extent along the surface normal, remaining empty-cell length, substrate and adsorbate counts, surface-cell area, implied coverage, tagged or fixed layers, parent structure, orientation, and termination.

Report the actual cell length and object extent rather than only the `vacuum` argument. One adsorbate in a different lateral area is a different coverage and therefore a different physical model.

## Generate alternatives before selecting a model

A named high-symmetry site is an initial coordinate, not a stable adsorption conclusion. Prepare the symmetry-distinct sites, orientations, coverages, lateral cells, terminations, initial heights, coadsorbate arrangements, and constraint variants required by the question.

Relaxation may move an adsorbate away from its named starting site. A completed relaxation still does not show that all relevant candidates were considered.

Adding empty cell length does not automatically remove electrostatic image interactions. Asymmetric, polar, charged, or dipolar slabs can require method-specific boundary treatment. A three-layer slab and ten units of vacuum are not automatically sufficient; converge the actual surface energy, work function, adsorption energy, charge redistribution, field, phonon, or other target quantity.

## Decide and continue

Accept a generated candidate only when its parent, orientation, termination, lateral cell, layer count, periodicity, cell and atomic extent, adsorbate identity/site/coverage, constraints, and alternatives are explicit. The next operation is to choose compatible electronic and electrostatic treatments, then converge the slab and target observable before interpreting it.

## What this guide verifies

The companion verifies the pinned ASE version, object construction, atom counts, periodicity, adsorbate position, cell and atomic extents, empty-cell length, and structured summary generation.

It does not validate a surface phase, adsorption site, coverage, relaxation, energy reference, electrostatic treatment, or scientific conclusion.

## Common mistakes

**Using one named site as a conclusion.** It is one starting candidate.

**Reporting vacuum without the cell geometry.** Centering and atomic extent determine the represented empty region.

**Ignoring coverage.** Adsorbate count and lateral area must be recorded together.

**Calling a constrained slab fully relaxed.** Fixed layers reduce the active subspace.

**Comparing incompatible references.** Adsorption energies require method-compatible slab, adsorbate, and combined-system calculations.

## Official sources

- [ASE documentation](https://docs.ase-lib.org/)
- [ASE surfaces, vacuum, and adsorbates](https://docs.ase-lib.org/ase/build/surface.html)
- [ASE structure builders](https://docs.ase-lib.org/ase/build/build.html)
- [ASE 3.29.0 release on PyPI](https://pypi.org/project/ase/3.29.0/)

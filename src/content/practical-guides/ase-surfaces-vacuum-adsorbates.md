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

A surface builder produces a starting model, not a validated surface. The model is defined jointly by the parent crystal, orientation, termination, slab thickness, lateral cell, surface equivalence, constraints, adsorbate configuration, and boundary treatment.

## Build one explicit slab candidate

The executable example follows the ASE documentation pattern for an Al(111) slab:

```python
from ase.build import add_adsorbate, fcc111

slab = fcc111("Al", size=(2, 2, 3))
add_adsorbate(slab, "H", height=1.5, position="ontop")
slab.center(vacuum=10.0, axis=2)
```

The values are illustrative. They are not recommended slab thicknesses, vacuum sizes, adsorption heights, or coverages for a production study.

The construction encodes several assumptions:

- the surface orientation is (111);
- the lateral cell repeats two by two;
- the slab contains three atomic layers;
- one hydrogen atom occupies an initial on-top site;
- the out-of-plane direction is nonperiodic in the ASE model;
- vacuum is distributed around the centered slab.

Each assumption should be visible in the model record.

## Inspect the generated object

At minimum, check:

```python
assert slab.pbc.tolist() == [True, True, False]
assert slab.get_chemical_symbols().count("H") == 1
```

Also record:

- the final cell matrix;
- the atomic extent along the surface normal;
- the remaining empty-cell length;
- the number of substrate atoms and adsorbates;
- the surface-cell area and implied coverage;
- the tagged or constrained layers, when used.

The word `vacuum` should not hide the actual geometry. Report the cell length and object extent rather than only the argument passed to `center`.

## Generate alternatives rather than one convenient site

Named high-symmetry positions are useful for creating candidates, but they do not establish the stable adsorption geometry. A serious adsorption study may need several:

- symmetry-distinct sites;
- molecular orientations;
- coverages and lateral cells;
- surface terminations;
- initial heights;
- coadsorbate arrangements;
- constrained and unconstrained slab models.

Relaxation can move the adsorbate away from the initial named site. A successful geometry optimization still does not prove that all relevant candidates were considered.

## Distinguish slab construction from electrostatic treatment

Adding empty cell length does not automatically remove all interactions between periodic images. Asymmetric slabs, polar terminations, charged slabs, and systems with a net dipole can require method-specific electrostatic treatment. Those decisions belong to calculation setup and convergence, not to the surface builder alone.

Likewise, a three-layer slab is not automatically thick enough and ten units of vacuum are not automatically sufficient. The relevant quantity may be a surface energy, work function, adsorption energy, charge redistribution, field, phonon mode, or another observable with a different convergence behaviour.

## What this guide verifies

The companion script checks:

- the pinned ASE version;
- substrate and adsorbate atom counts;
- in-plane periodicity and out-of-plane nonperiodicity;
- the presence of the adsorbate above the top substrate layer;
- the final cell length, atomic extent, and empty-cell length;
- successful generation of a structured summary.

It does not calculate an adsorption energy, relax the geometry, converge slab thickness or vacuum, compare sites, or validate the Al–H model.

## Common mistakes

**Using one named site as a conclusion.** It is an initial candidate only.

**Reporting vacuum without the cell geometry.** Centering and atomic extent determine the actual empty region.

**Ignoring coverage.** One adsorbate in different lateral cells represents different physical models.

**Calling a constrained slab fully relaxed.** Fixed layers reduce the accessible configuration space and must be reported.

**Comparing incompatible references.** Adsorption energies require method-compatible slab, adsorbate, and combined-system references.

## Official sources

- [ASE documentation](https://docs.ase-lib.org/)
- [ASE surfaces, vacuum, and adsorbates](https://docs.ase-lib.org/ase/build/surface.html)
- [ASE structure builders](https://docs.ase-lib.org/ase/build/build.html)
- [ASE 3.29.0 release on PyPI](https://pypi.org/project/ase/3.29.0/)

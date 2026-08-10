---
topic_slug: build-or-modify-computational-model
guide_slug: two-dimensional-monolayer-model
title: Build a Two-Dimensional Monolayer Model
kind: worked-example
tools:
  - ase
interfaces:
  - Primary paper or structure database
  - Terminal
  - ASE Python API
  - ASE GUI or another structure viewer
status: reviewed
summary: Write and reopen an illustrative 2H-MoS2 unit and repeated child, then compare top and side views, periodicity, atomic extent, empty-cell length, and the limits of a generated monolayer.
tested_versions:
  - ASE 3.29.0
  - Python 3.12
execution_script: examples/practical-guides/ase_monolayer_model.py
source_ids:
  - ase-docs-home
  - ase-building
  - ase-atoms
  - ase-pypi-3290
media_ids: []
review: docs/reviews/2026-08-03-practical-guides-model-building-pilot.md
reviewed_at: 2026-08-03
---

This worked example writes one generated 2H-MoS2 unit, reads it back, repeats it in plane, writes the child, and reopens the exact file that a later tool would receive. It is not derived from an experimental CIF, does not contain a DFT-relaxed lattice, and supports no phase, stability, or property claim.

## Identify the layer before using a builder

Establish the intended material, polytype, composition, orientation, and relation to bulk or experiment from a primary paper, supplementary structure, database record, or explicitly declared prototype. A builder name is not source provenance, and one generated polytype is not a phase-selection result.

Before automation, decide which axis is nonperiodic and which alternatives remain plausible: polytype, stacking, buckling, strain, defects, substrate relation, and termination or passivation where relevant.

## Keep an inspectable unit and child file

```bash
run_root="$(mktemp -d)"
python3 examples/practical-guides/ase_monolayer_model.py --workdir "$run_root"
python3 -m json.tool "$run_root/summary.json"
ase info --files \
  "$run_root/source/mos2-2h-unit.extxyz" \
  "$run_root/output/mos2-2h-2x2.extxyz"
```

The companion creates an illustrative one-by-one 2H-MoS2 unit with declared builder arguments, writes it, reads the file, repeats that exact object two-by-two in plane, writes the child, and reopens both files. The summary records formula, atom count, periodic flags, cell length, atomic z extent, empty-cell length, in-plane area, and hashes.

The demonstration values `a=3.18`, `thickness=3.19`, and `vacuum=8.0` are not certified experimental data, converged DFT settings, or recommendations for another material.

## Inspect top and side views together

```bash
ase gui \
  "$run_root/source/mos2-2h-unit.extxyz" \
  "$run_root/output/mos2-2h-2x2.extxyz"
```

Show the cell boundary. In the top view, inspect the in-plane lattice, stoichiometry, repetition, and orientation. In the side view, inspect layer order, planarity or buckling, atomic thickness, total cell length, empty region, and closest repeated image. Use these exact written objects; a generic periodicity sketch cannot establish their geometry.

The ASE flags are `[True, True, False]`, but a later electronic-structure program may still solve a three-dimensionally periodic electrostatic problem. Record and implement the intended boundary treatment in the solver input; do not assume the coordinate file decides it.

## Decide whether the candidate can continue

Keep the source identity or declared generated origin, builder and version, every argument, parent and child hashes, periodicity, and visual observations. For a research model, also require a defensible material source, phase rationale, relation to experiment or bulk, and convergence evidence for the target observable.

Continue by [choosing the method and boundary treatment](/DFT-Research-Workflow/operations/choose-dft-method-and-computational-setup/), then [testing the relevant cell, vacuum, sampling, and observable convergence](/DFT-Research-Workflow/operations/test-numerical-convergence/).

## What this example does not establish

The companion verifies ASE 3.29.0 builder execution, file writing and reopening, the two-by-two repeat, composition, atom count, periodicity, cell and extent metrics, hashes, and structured summary generation. It does not establish that 2H is the relevant phase, that the lattice or thickness is accurate, that vacuum or sampling is converged, that the isolated layer represents an experiment, or that the monolayer is dynamically or thermodynamically stable.

## Common mistakes

**Calling a generated object experimental.** Preserve the generator origin and every argument.

**Reporting only the vacuum argument.** Inspect the actual cell length, atomic extent, and image geometry.

**Showing only a top view.** A top view cannot reveal layer order, buckling, thickness, or empty-cell length.

## Official sources

- [ASE documentation](https://docs.ase-lib.org/)
- [ASE structure builders](https://docs.ase-lib.org/ase/build/build.html)
- [ASE `Atoms` object](https://docs.ase-lib.org/ase/atoms.html)
- [ASE 3.29.0 release on PyPI](https://pypi.org/project/ase/3.29.0/)

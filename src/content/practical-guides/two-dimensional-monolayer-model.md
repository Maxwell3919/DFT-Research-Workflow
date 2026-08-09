---
topic_slug: build-or-modify-computational-model
guide_slug: two-dimensional-monolayer-model
title: Build a Two-Dimensional Monolayer Model
kind: worked-example
tools:
  - ase
status: reviewed
summary: Follow one generated MoS2 monolayer model from builder arguments to periodicity, cell, atomic extent, lineage, and the limits of an illustrative two-dimensional structure.
tested_versions:
  - ASE 3.29.0
  - Python 3.12
execution_script: examples/practical-guides/ase_monolayer_model.py
source_ids:
  - ase-docs-home
  - ase-building
  - ase-atoms
  - ase-pypi-3290
media_ids:
  - monolayer-periodicity-diagram
review: docs/reviews/2026-08-03-practical-guides-model-building-pilot.md
reviewed_at: 2026-08-03
---

This worked example creates one generated MoS2 monolayer object and checks what was actually built. It is not derived from an experimental CIF, does not contain a DFT-relaxed lattice, and supports no stability or property claim.

## Run the checked model construction

From the repository root, run:

```bash
python3 examples/practical-guides/ase_monolayer_model.py
```

The companion uses ASE 3.29.0, builds the declared object, and reports its formula, atom count, periodicity, cell, atomic z extent, total empty-cell length, and in-plane area. A successful exit verifies those object properties and summary generation only.

Record the origin as `generated illustrative structure`, together with ASE version and every builder argument. Do not describe the result as an experimentally measured or DFT-relaxed monolayer.

## Build the object

```python
from ase.build import mx2

monolayer = mx2(
    "MoS2",
    kind="2H",
    a=3.18,
    thickness=3.19,
    size=(2, 2, 1),
    vacuum=8.0,
)
```

The values are bounded demonstration inputs, not certified experimental data, converged DFT settings, or recommendations for another material.

The call specifies composition, requested layer type, in-plane lattice parameter, builder thickness, two-by-two lateral repetition, one layer along the third direction, and empty-cell length. Changing composition, polytype, strain, thickness, defect content, stacking, or periodicity changes the physical hypothesis.

## Check the produced object

```python
assert monolayer.pbc.tolist() == [True, True, False]
assert len(monolayer) == 12
assert monolayer.get_chemical_symbols().count("Mo") == 4
assert monolayer.get_chemical_symbols().count("S") == 8
```

Also inspect the full cell matrix, minimum and maximum atomic z coordinates, atomic z extent, total empty-cell length, and in-plane area. Reporting only the `vacuum` argument hides the actual object position and cell geometry.

The ASE periodic flags express the intended two-dimensional object. A later electronic-structure program may still solve a three-dimensional periodic problem and require explicit electrostatic treatment. Preserve the boundary intention outside the coordinate file.

## Preserve model identity and decide

Keep the origin, builder and version, formula and layer type, every argument, periodicity, output checksum, execution script, and structured result. For a production model, also require a defensible material source, relation to bulk or experiment, model-selection rationale, convergence evidence, and versioned electronic method.

Accept this object only as a reconstructable starting candidate. It does not establish that 2H is the relevant phase, that the lattice or thickness is accurate, that vacuum is converged, that the isolated layer represents an experiment, or that the monolayer is dynamically or thermodynamically stable.

The next operation is to choose the method and boundary treatment, then converge the relevant cell, sampling, and target observable. A generated coordinate file is not yet a validated calculation input or result.

## What this example does not establish

This example does not establish that the chosen polytype is the relevant phase, that the lattice or thickness values are accurate, that the cell or vacuum is converged, that the monolayer is dynamically or thermodynamically stable, or that a substrate-free isolated layer represents an experiment. It establishes no electronic, optical, vibrational, transport, or superconducting property.

## What this guide verifies

The companion verifies the pinned ASE version, builder execution, composition, atom count, periodicity, cell and extent metrics, and structured summary generation.

It does not run DFT, validate a material phase, converge vacuum or sampling, relax the object, or establish any electronic, optical, vibrational, transport, or superconducting property.

## Common mistakes

**Calling a generated object experimental.** Preserve the builder origin and arguments.

**Reporting only the vacuum argument.** Inspect the actual cell length and atomic extent.

**Assuming ASE periodic flags define the later solver boundary.** Record and implement the electronic boundary treatment explicitly.

**Treating one generated polytype as selected.** Phase identity and stability require separate evidence.

## Official sources

- [ASE documentation](https://docs.ase-lib.org/)
- [ASE structure builders](https://docs.ase-lib.org/ase/build/build.html)
- [ASE `Atoms` object](https://docs.ase-lib.org/ase/atoms.html)
- [ASE 3.29.0 release on PyPI](https://pypi.org/project/ase/3.29.0/)

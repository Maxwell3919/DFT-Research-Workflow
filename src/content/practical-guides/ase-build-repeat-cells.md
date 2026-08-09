---
topic_slug: build-or-modify-computational-model
guide_slug: ase-build-repeat-cells
title: Build and Repeat Cells with ASE
kind: implementation
tools:
  - ase
status: reviewed
summary: Use ASE to create integer supercells while keeping the parent cell, transformation, atom mapping, periodicity, and physical meaning explicit.
tested_versions:
  - ASE 3.29.0
  - Python 3.12
execution_script: examples/practical-guides/ase_repeat_cells.py
source_ids:
  - ase-docs-home
  - ase-atoms
  - ase-build-tools
  - ase-pypi-3290
media_ids:
  - ase-cell-repetition-diagram
review: docs/reviews/2026-08-03-practical-guides-model-building-pilot.md
reviewed_at: 2026-08-03
---

Use this guide when a declared integer transformation is needed before a defect, magnetic, alloy, phonon, or interface calculation. Start from a reconstructable parent object; the final supercell alone is not sufficient lineage.

## Run the checked transformation

From the repository root, run:

```bash
python3 examples/practical-guides/ase_repeat_cells.py
```

The companion creates a two-atom illustrative diamond-Si parent with ASE 3.29.0, builds diagonal and general integer supercells, and prints a structured transformation summary. The lattice parameter is a demonstration value, not an experimental reference or DFT result.

The script checks the pinned ASE version, parent and child atom counts, determinant-based multipliers, periodic-boundary flags, resulting cell matrices, and summary serialization. A successful exit verifies those declared software operations only.

## Build from an explicit parent

The example constructs its parent as code so its origin is reproducible:

```python
from ase.build import bulk

parent = bulk("Si", "diamond", a=5.43)
```

For a research model, replace this generated fixture with the checked structure artifact from the source stage. Retain its checksum, cell, periodicity, atom order, and the reason a larger cell is needed.

## Apply the intended integer transformation

A diagonal repeat is:

```python
repeated = parent.repeat((2, 2, 1))
```

The tuple repeats the first cell vector twice, the second twice, and the third once. For a two-atom parent, the volume and atom-count multiplier is four.

Check the produced object:

```python
assert len(repeated) == 4 * len(parent)
assert repeated.pbc.tolist() == parent.pbc.tolist()
```

When the cell shape must change, use a full integer matrix:

```python
import numpy as np
from ase.build import make_supercell

P = np.array([
    [2, 1, 0],
    [0, 2, 0],
    [0, 0, 1],
])

general = make_supercell(parent, P)
```

Here $\det(P)=4$, so the expected volume and atom-count multiplier is four. Record `P` itself, not only the final vectors, because cell shape controls periodic-image geometry.

## Inspect and decide

Before using the child, record the parent checksum, matrix, atom-count multiplier, parent-to-child mapping, periodicity, resulting cell, shortest relevant image separations, and intended purpose.

Accept the transformation only when those objects agree with the declared model. Repeating an unchanged perfect crystal can preserve the same ideal periodic system. Introducing a defect, composition pattern, distortion, magnetic order, displacement, or interface afterward creates a different physical model and must be a separate recorded operation.

The companion does not establish that the parent lattice is correct, the supercell is large enough, image interactions are negligible, or a later observable is converged. Test the relevant size or wavelength after the perturbation and target quantity are defined.

## What this guide verifies

The companion verifies the pinned ASE version, diagonal and general integer transformations, determinant and atom-count consistency, periodicity preservation, cell matrices, and structured output generation.

It does not run DFT, select a defect concentration or magnetic order, validate a parent material, or establish finite-size convergence.

## Common mistakes

**Using atom count as the only size measure.** Cell shape and shortest periodic-image distance can matter more.

**Losing the transformation matrix.** Final coordinates do not reveal whether a cell was repeated, strained, reduced, or rebuilt.

**Calling every supercell a new material.** An unchanged repeat can be an equivalent representation; a later perturbation changes the model.

**Assuming a large cell is sufficient.** Adequacy belongs to observable-specific convergence testing.

## Official sources

- [ASE documentation](https://docs.ase-lib.org/)
- [ASE `Atoms` object](https://docs.ase-lib.org/ase/atoms.html)
- [ASE supercell-building tools](https://docs.ase-lib.org/ase/build/tools.html)
- [ASE 3.29.0 release on PyPI](https://pypi.org/project/ase/3.29.0/)

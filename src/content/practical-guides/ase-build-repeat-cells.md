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

Repeating a cell is simple to express in ASE, but its scientific meaning depends on what the repeated cell will represent. An integer repeat of an unchanged perfect crystal can be an equivalent periodic representation. The same supercell becomes a different physical model when it hosts a defect, composition pattern, distortion, magnetic order, interface, or finite-wavelength displacement.

## Start from a reconstructable parent

The executable example uses a two-atom diamond-Si cell created by `ase.build.bulk`. The numerical lattice parameter is deliberately a demonstration value. It is not presented as an experimental reference, a relaxed DFT result, or a converged parameter.

```python
from ase.build import bulk

parent = bulk("Si", "diamond", a=5.43)
```

Before repeating the cell, retain at least:

- the parent structure source or generation command;
- the parent cell vectors and periodic-boundary flags;
- atom ordering and identifiers where later site mapping matters;
- the intended reason for increasing the cell;
- the exact integer transformation.

ASE's `Atoms` object carries the atomic positions, cell, and periodic-boundary flags together. That makes it useful for model construction, but it does not decide whether the chosen model is scientifically appropriate.

## Use a diagonal repeat when that is the intended transformation

For a simple diagonal repeat:

```python
repeated = parent.repeat((2, 2, 1))
```

The tuple means two repeats along the first cell vector, two along the second, and one along the third. For a parent with two atoms, this produces eight atoms because the volume multiplier is four.

The minimum checks are not merely that a file was produced. Verify that:

```python
assert len(repeated) == 4 * len(parent)
assert repeated.pbc.tolist() == parent.pbc.tolist()
```

Also inspect the resulting cell matrix and the shortest periodic-image separations relevant to the planned study.

## Use a full integer matrix when the cell shape must change

ASE's `make_supercell` supports a general integer transformation matrix. The example uses:

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

The determinant of `P` gives the cell-volume and atom-count multiplier for a valid integer supercell. Here, `det(P) = 4`, so the expected atom count is again eight.

A non-diagonal matrix can change cell shape and periodic-image geometry even when it represents the same ideal infinite crystal. Record the matrix itself rather than only the final lattice vectors.

## Inspect lineage rather than trusting visual similarity

Two cells can look similar in a viewer while encoding different transformations. A useful record contains:

```text
parent identifier
transformation matrix
atom-count multiplier
parent-to-child site relation
periodicity flags
resulting cell vectors
purpose of the supercell
```

For defect, magnetic, alloy, phonon, or interface work, add the model-specific operation that follows the repeat. The integer repeat alone does not define the later defect concentration, magnetic ordering, displacement pattern, or interfacial strain.

## What this guide verifies

The repository executes the companion script and checks:

- the pinned ASE version;
- parent and child atom counts;
- the determinant-based multiplier;
- preservation of periodic-boundary flags;
- the resulting cell matrices;
- successful serialization of the transformation summary.

These checks establish that the declared structural transformations were executed. They do not establish that the parent lattice parameter is correct, the supercell is large enough, periodic images are negligible, or any later observable is converged.

## Common mistakes

**Treating atom count as the only size measure.** Cell shape and shortest image distances can matter more than total atoms.

**Losing the parent transformation.** A final coordinate file does not reveal whether the cell was repeated, strained, reduced, or rebuilt by another convention.

**Calling every supercell a new material.** An unchanged integer repeat can be an equivalent representation; introducing a defect or ordering changes the model.

**Assuming a large cell is sufficient.** Adequacy depends on the interaction or wavelength that must be represented or suppressed and belongs to observable-specific convergence testing.

## Official sources

- [ASE documentation](https://docs.ase-lib.org/)
- [ASE `Atoms` object](https://docs.ase-lib.org/ase/atoms.html)
- [ASE supercell-building tools](https://docs.ase-lib.org/ase/build/tools.html)
- [ASE 3.29.0 release on PyPI](https://pypi.org/project/ase/3.29.0/)

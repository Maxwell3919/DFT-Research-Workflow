---
topic_slug: build-or-modify-computational-model
guide_slug: pymatgen-structure-transformations
title: Apply Structure Transformations with pymatgen
kind: implementation
tools:
  - pymatgen
status: reviewed
summary: Use pymatgen transformation objects to create supercell, deformed, and species-substituted descendants while preserving the difference between representation and physical-model changes.
tested_versions:
  - pymatgen-core 2026.7.31
  - Python 3.12
execution_script: examples/practical-guides/pymatgen_structure_transformations.py
source_ids:
  - pymatgen-transformations
  - pymatgen-core-docs
  - pymatgen-core-pypi-2026-7-31
media_ids:
  - pymatgen-transformation-lineage-diagram
review: docs/reviews/2026-08-03-practical-guides-model-building-pilot.md
reviewed_at: "2026-08-03"
---

pymatgen transformations are useful because they make a structural operation explicit and return a new structure object. The transformation class does not decide whether the operation preserves the same physical model. That interpretation must be recorded by the researcher.

## Create a small parent structure

The executable example creates a two-site cubic structure solely for software testing:

```python
from pymatgen.core import Lattice, Structure

parent = Structure(
    Lattice.cubic(4.0),
    ["Li", "O"],
    [[0, 0, 0], [0.5, 0.5, 0.5]],
)
```

This is an illustrative object, not a claimed experimental phase, stable compound, or DFT reference structure.

## Generate an integer supercell

```python
from pymatgen.transformations.standard_transformations import SupercellTransformation

make_supercell = SupercellTransformation([
    [2, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
])
supercell = make_supercell.apply_transformation(parent)
```

The transformation doubles the volume and site count. When no species, coordinates, strain, or ordering is changed, this can represent the same ideal infinite crystal in a larger periodic cell. The transformation matrix and parent identity still belong in the record.

## Apply a deformation as a new physical model

```python
from pymatgen.transformations.standard_transformations import DeformStructureTransformation

strain_x = DeformStructureTransformation([
    [1.02, 0, 0],
    [0, 1.00, 0],
    [0, 0, 1.00],
])
strained = strain_x.apply_transformation(parent)
```

A deformation changes lattice lengths, angles, volume, or all three. It is not an equivalent formatting operation. Record the deformation tensor, whether fractional or Cartesian positions were intended to follow the lattice, and the physical reason for imposing strain.

The value `1.02` is a demonstration value. It is not a recommended strain magnitude or an elastic-regime guarantee.

## Replace a species as a compositional change

Site-specific replacement belongs to pymatgen's site-transformation module:

```python
from pymatgen.transformations.site_transformations import ReplaceSiteSpeciesTransformation

substitute = ReplaceSiteSpeciesTransformation({0: "Na"})
substituted = substitute.apply_transformation(parent)
```

Replacing a site changes composition and chemical identity. The record should preserve the parent site index, local environment, replacement rule, resulting composition, and any alternatives that remain to be tested.

A species substitution does not by itself define a dilute dopant calculation. Supercell size, concentration, charge state, local reconstruction, and reference reservoirs remain separate modelling and energetic questions.

## Preserve a transformation ledger

A useful lineage record contains entries such as:

```text
parent structure checksum
transformation module and class
transformation parameters
software version
parent and child compositions
parent and child cell matrices
parent and child site counts
scientific interpretation of the change
```

The class name is not the interpretation. `SupercellTransformation` can preserve an ideal bulk representation, but the resulting cell may later host a physical perturbation. `DeformStructureTransformation` and site-specific species replacement explicitly change the model.

## What this guide verifies

The companion script checks:

- the pinned `pymatgen-core` distribution version;
- import of standard and site-specific transformation modules;
- supercell site-count and volume multipliers;
- deformation-induced changes in lattice and volume;
- the expected substituted species and composition;
- immutability of the original parent object;
- serialization of a transformation-lineage summary.

It does not calculate energies, relax any child structure, establish phase stability, validate the illustrative parent, or decide which descendant is physically relevant.

## Common mistakes

**Importing a class from the wrong transformation module.** Check the current API rather than assuming every transformation belongs to `standard_transformations`.

**Overwriting the parent structure.** Preserve source and descendants as separate objects with stable identities.

**Treating every transformation as normalization.** Deformation and substitution change the physical model.

**Using a class name as provenance.** Module, parameters, version, parent checksum, and output identity are also required.

**Accepting a generated child as a ground state.** A transformation produces a candidate, not energetic evidence.

## Official sources

- [pymatgen transformations](https://pymatgen.org/pymatgen.transformations.html)
- [pymatgen core objects](https://pymatgen.org/pymatgen.core.html)
- [`pymatgen-core` 2026.7.31 release on PyPI](https://pypi.org/project/pymatgen-core/2026.7.31/)

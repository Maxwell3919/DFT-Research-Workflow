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

Use a transformation object when the parent, operation, parameters, and child must remain reconstructable. The class executes a structural change; it does not decide whether that change preserves the physical model.

## Run the checked transformations

From the repository root, run:

```bash
python3 examples/practical-guides/pymatgen_structure_transformations.py
```

The companion uses pymatgen-core 2026.7.31 to create one illustrative parent, generate an integer supercell, apply a deformation, replace one species, and serialize a transformation-lineage summary. It verifies imports, site-count and volume multipliers, lattice changes, resulting species and composition, and immutability of the parent object.

The two-site Li/O parent is a software fixture. It is not a claimed experimental phase, stable compound, or DFT reference structure.

## Create an explicit parent

```python
from pymatgen.core import Lattice, Structure

parent = Structure(
    Lattice.cubic(4.0),
    ["Li", "O"],
    [[0, 0, 0], [0.5, 0.5, 0.5]],
)
```

For research use, replace this fixture with the parsed, checked working structure and retain its source checksum, data block, atom mapping, and parser version.

## Apply one operation and inspect its meaning

An integer supercell is generated with:

```python
from pymatgen.transformations.standard_transformations import SupercellTransformation

make_supercell = SupercellTransformation([
    [2, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
])
supercell = make_supercell.apply_transformation(parent)
```

With no species, coordinate, strain, or ordering change, this can remain an equivalent representation of the same ideal infinite crystal. Record the matrix and parent identity.

A deformation creates a new physical model:

```python
from pymatgen.transformations.standard_transformations import DeformStructureTransformation

strain_x = DeformStructureTransformation([
    [1.02, 0, 0],
    [0, 1.00, 0],
    [0, 0, 1.00],
])
strained = strain_x.apply_transformation(parent)
```

The value `1.02` is a demonstration input, not a recommended strain or an elastic-regime guarantee. Record the deformation tensor, coordinate convention, and reason for imposing strain.

A species replacement changes composition:

```python
from pymatgen.transformations.site_transformations import ReplaceSiteSpeciesTransformation

substitute = ReplaceSiteSpeciesTransformation({0: "Na"})
substituted = substitute.apply_transformation(parent)
```

Record the parent site identity and environment, replacement rule, resulting composition, and untested alternatives. Substitution alone does not define a dilute dopant calculation; supercell size, concentration, charge, reconstruction, and reservoirs remain separate decisions.

## Preserve and check the lineage

For each operation retain the parent checksum, module and class, parameters, software version, parent and child compositions, cell matrices, site counts, atom mapping, output checksum, and scientific interpretation.

Accept a child only when the produced metrics match the intended operation and the parent remains unchanged. A class name is not provenance, and a generated child is not a ground state. Relaxation, energy comparison, finite-size convergence, and physical relevance remain later operations.

## What this guide verifies

The companion verifies the pinned distribution, transformation imports, declared supercell multiplier, deformation-induced lattice changes, substituted composition, parent immutability, and structured lineage output.

It does not run DFT, validate the parent, relax any child, establish phase stability, or select a physically relevant descendant.

## Common mistakes

**Importing a class from the wrong module.** Check the current API rather than assuming every transformation is in `standard_transformations`.

**Overwriting the parent.** Preserve source and descendants as separate identities.

**Treating every transformation as normalization.** Deformation and substitution change the physical model.

**Using a class name as provenance.** Module, version, parameters, parent checksum, and child identity are also required.

**Accepting a generated child as a ground state.** A transformation creates a candidate, not energetic evidence.

## Official sources

- [pymatgen transformations](https://pymatgen.org/pymatgen.transformations.html)
- [pymatgen core objects](https://pymatgen.org/pymatgen.core.html)
- [`pymatgen-core` 2026.7.31 release on PyPI](https://pypi.org/project/pymatgen-core/2026.7.31/)

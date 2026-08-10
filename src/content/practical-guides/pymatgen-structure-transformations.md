---
topic_slug: build-or-modify-computational-model
guide_slug: pymatgen-structure-transformations
title: Apply Structure Transformations with pymatgen
kind: implementation
tools:
  - pymatgen
interfaces:
  - Terminal
  - pymatgen Python API
  - Crystal viewer
  - Text editor
status: reviewed
summary: Write and reopen a parent CIF and separate supercell, deformed, and substituted children while preserving which operations change representation and which change the physical model.
tested_versions:
  - pymatgen-core 2026.7.31
  - Python 3.12
execution_script: examples/practical-guides/pymatgen_structure_transformations.py
source_ids:
  - pymatgen-transformations
  - pymatgen-core-docs
  - pymatgen-core-pypi-2026-7-31
media_ids: []
review: docs/reviews/2026-08-03-practical-guides-model-building-pilot.md
reviewed_at: "2026-08-03"
---

Use a transformation object when the parent, operation, parameters, and child must remain reconstructable. State the intended physical change before choosing a class, and apply one meaningful operation to one preserved parent at a time.

## Choose the operation and comparison first

Decide whether the action is an equivalent representation, an integer repeat, strain, substitution, site removal, ordering, or another model change. Open the parent, preserve an unchanged copy, and write the acceptance checks before transformation. A class can produce an object; it cannot decide whether the object answers the scientific question.

The companion uses a two-site Li/O fixture. It is not an experimental phase, stable compound, or DFT reference. Its purpose is to expose a complete file route for three different transformation meanings.

## Write, read, transform, write, and reopen

```bash
run_root="$(mktemp -d)"
python3 examples/practical-guides/pymatgen_structure_transformations.py --workdir "$run_root"
python3 -m json.tool "$run_root/summary.json"
ase info --files \
  "$run_root/source/li-o-parent.cif" \
  "$run_root/output/li-o-supercell.cif" \
  "$run_root/output/li-o-strained.cif" \
  "$run_root/output/na-o-substituted.cif"
```

The script first writes `source/li-o-parent.cif` and reads that exact file with `Structure.from_file`. It then creates three independent children:

- an integer supercell with matrix `[[2, 0, 0], [0, 1, 0], [0, 0, 1]]`;
- a child with deformation gradient `diag(1.02, 1, 1)`;
- a child in which parent site index 0 changes from Li to Na.

Each child is written to its own CIF and reopened. The script checks the reopened site-count and volume multipliers, composition change, parent immutability, and file hashes. The numerical values are demonstration inputs, not recommended strain, concentration, or material parameters.

## Compare one child at a time

Open the parent beside each child in a viewer. One possible local route is:

```bash
ase gui \
  "$run_root/source/li-o-parent.cif" \
  "$run_root/output/li-o-supercell.cif" \
  "$run_root/output/li-o-strained.cif" \
  "$run_root/output/na-o-substituted.cif"
```

Show cell boundaries and compare orientation, composition, coordination, site identity, periodic contacts, and the displacement or strain introduced by the operation. Also inspect the CIF text because format writing can change labels, symmetry records, precision, or other metadata even when the represented sites remain understandable.

An unchanged integer repeat can represent the same ideal infinite crystal. Deformation and substitution create different physical models. A substitution does not by itself define a dilute dopant calculation: supercell size, concentration, charge, reconstruction, and reservoirs remain separate decisions.

## Preserve the lineage and continue

For every child retain the parent checksum, class and module, parameters, software version, parent and child compositions and cells, site mapping, output checksum, and scientific reason. Reject or repair a child when the reopened file no longer matches the intended transformation.

After accepting the model object, [choose a compatible DFT method and setup](/DFT-Research-Workflow/operations/choose-dft-method-and-computational-setup/) and [test the numerical controls](/DFT-Research-Workflow/operations/test-numerical-convergence/) required by the target quantity.

## What this guide verifies

The companion verifies pymatgen-core 2026.7.31 file writing and reading, the declared supercell, deformation, and substitution operations, reopened site and volume checks, parent immutability, file hashes, and structured lineage output. It does not validate the illustrative parent, run DFT, relax a child, establish phase stability, or select a physically relevant descendant.

## Common mistakes

**Overwriting the parent.** A transformation record needs distinct source and child identities.

**Treating every transformation as normalization.** Strain and substitution change the physical hypothesis.

**Inspecting only the in-memory object.** The serialized and reopened file is the object passed to later tools.

## Official sources

- [pymatgen transformations](https://pymatgen.org/pymatgen.transformations.html)
- [pymatgen core objects](https://pymatgen.org/pymatgen.core.html)
- [`pymatgen-core` 2026.7.31 release on PyPI](https://pypi.org/project/pymatgen-core/2026.7.31/)

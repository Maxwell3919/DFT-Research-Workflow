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

The parameters come from different evidence:

| Operation | Values you must choose | Where they come from |
| --- | --- | --- |
| Integer supercell | `3×3` integer matrix | defect separation, ordering period, displacement wavelength, or interface commensurability |
| Deformation | full deformation gradient | declared strain state, experimental constraint, or a signed convergence/response series |
| Substitution | exact parent site index and new species | a checked site map and the candidate composition; not merely an element name |

Create a separate child for each physical hypothesis. The example below applies one deformation; change `operation` and its fields only after writing a new configuration and output name.

## Create the parent and operation record

```bash
mkdir -p transform-study/{source,output,records}
cd transform-study
PARENT=/absolute/path/to/checked-parent.cif
test -s "$PARENT"
cp -- "$PARENT" source/parent.cif

cat > operation.json <<'EOF'
{
  "parent": "source/parent.cif",
  "child": "output/parent-strain-x-1p02.cif",
  "operation": "deformation",
  "matrix": [[1.02, 0, 0], [0, 1.0, 0], [0, 0, 1.0]]
}
EOF
```

For a supercell use `"operation": "supercell"` with an integer `matrix`. For a substitution replace `matrix` with `"site_index": 0` and `"new_species": "Na"`; the index is only an example and must be verified against your parent site map.

## Create the exact transformation script

Save the following as `transform_structure.py`:

```python
from pathlib import Path
import hashlib
import json

import numpy as np
from pymatgen.core import Structure
from pymatgen.transformations.site_transformations import (
    ReplaceSiteSpeciesTransformation,
)
from pymatgen.transformations.standard_transformations import (
    DeformStructureTransformation,
    SupercellTransformation,
)

cfg = json.loads(Path("operation.json").read_text())
parent_path = Path(cfg["parent"])
child_path = Path(cfg["child"])
parent = Structure.from_file(str(parent_path))
parent_copy = parent.copy()

if cfg["operation"] == "supercell":
    matrix = np.asarray(cfg["matrix"], dtype=int)
    child = SupercellTransformation(matrix).apply_transformation(parent)
elif cfg["operation"] == "deformation":
    matrix = np.asarray(cfg["matrix"], dtype=float)
    child = DeformStructureTransformation(matrix).apply_transformation(parent)
elif cfg["operation"] == "substitution":
    index = int(cfg["site_index"])
    child = ReplaceSiteSpeciesTransformation(
        {index: cfg["new_species"]}
    ).apply_transformation(parent)
else:
    raise SystemExit(f"FAIL: unsupported operation {cfg['operation']}")

if parent != parent_copy:
    raise SystemExit("FAIL: parent object changed in memory")
child_path.parent.mkdir(parents=True, exist_ok=True)
child.to(filename=str(child_path))
reopened = Structure.from_file(child_path)

def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

summary = {
    "operation": cfg["operation"],
    "parameters": {k: v for k, v in cfg.items() if k not in {"parent", "child"}},
    "parent": str(parent_path),
    "child": str(child_path),
    "parent_formula": parent.composition.formula,
    "child_formula": reopened.composition.formula,
    "parent_sites": len(parent),
    "child_sites": len(reopened),
    "parent_lattice_ang": parent.lattice.matrix.tolist(),
    "child_lattice_ang": reopened.lattice.matrix.tolist(),
    "parent_sha256": sha256(parent_path),
    "child_sha256": sha256(child_path),
}
Path("records/summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print(f"PASS: wrote and reopened {child_path}; sites={len(reopened)}")
```

The script records what changed but deliberately does not assert that the change is physically justified. Add operation-specific checks to your decision record: expected determinant and atom multiplier for a supercell, expected signed lattice change for a deformation, or expected site identity and composition for a substitution.

## Run, reopen, and compare one child

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install "pymatgen-core==2026.7.31" "numpy==2.5.1" "ase==3.29.0"

python transform_structure.py
python -m json.tool records/summary.json
ase info --files source/parent.cif output/parent-strain-x-1p02.cif
ase gui source/parent.cif output/parent-strain-x-1p02.cif
```

The run produces the preserved parent, `operation.json`, the exact child CIF, and `records/summary.json`. The terminal prints `PASS: wrote and reopened ...` only after pymatgen can read the serialized child.

## Compare one child at a time

Show cell boundaries and compare orientation, composition, coordination, site identity, periodic contacts, and the displacement or strain introduced by the operation. Also inspect the CIF text because format writing can change labels, symmetry records, precision, or other metadata even when the represented sites remain understandable.

An unchanged integer repeat can represent the same ideal infinite crystal. Deformation and substitution create different physical models. A substitution does not by itself define a dilute dopant calculation: supercell size, concentration, charge, reconstruction, and reservoirs remain separate decisions.

## Decide pass, fail, and continue

Pass only when the reopened child matches the intended operation, cell, composition, site mapping, periodic contacts, and visual geometry. Retain the parent checksum, class/module, parameters, software version, before/after cells and compositions, site mapping, child checksum, and scientific reason.

Fail when the wrong site changes, the sign or axis of strain is wrong, the cell becomes singular or left-handed unexpectedly, occupancy or magnetic metadata disappears without a declared replacement, or the reopened file no longer matches the intended child. Preserve the rejected child and create a new named operation record.

After accepting the model object, [choose a compatible DFT method and setup](/DFT-Research-Workflow/operations/choose-dft-method-and-computational-setup/) and [test the numerical controls](/DFT-Research-Workflow/operations/test-numerical-convergence/) required by the target quantity.

If symmetry changes unexpectedly, use [the symmetry-mismatch troubleshooting route](/DFT-Research-Workflow/operations/troubleshooting/#symmetry-or-kq-mapping-mismatch). If coordination, cell shape, or periodic images look wrong, use [the geometry troubleshooting route](/DFT-Research-Workflow/operations/troubleshooting/#geometry-looks-physically-wrong).

## Optional automation: replay all three fixture transformations

The repository companion is a software fixture, not the primary research route. It uses a generated two-site Li/O object that is not an experimental phase, stable compound, or DFT reference.

- **Reads:** its generated Li/O parent and three hard-coded demonstration operations.
- **Produces:** separate supercell, strained, and substituted CIF children plus `summary.json`.
- **Checks:** file write/reopen, site and volume changes, composition change, parent immutability, and hashes.
- **Does not check:** your source structure, site choice, concentration, strain relevance, relaxation, energy, phase stability, or scientific suitability.

```bash
run_root="$(mktemp -d)"
python3 examples/practical-guides/pymatgen_structure_transformations.py \
  --workdir "$run_root"
python3 -m json.tool "$run_root/summary.json"
ase gui \
  "$run_root/source/li-o-parent.cif" \
  "$run_root/output/li-o-supercell.cif" \
  "$run_root/output/li-o-strained.cif" \
  "$run_root/output/na-o-substituted.cif"
```

## What this guide verifies

The companion verifies pymatgen-core 2026.7.31 file writing and reading, the declared supercell, deformation, and substitution operations, reopened site and volume checks, parent immutability, file hashes, and structured lineage output. It does not validate the illustrative parent, run DFT, relax a child, establish phase stability, or select a physically relevant descendant.

## Common mistakes

**Overwriting the parent.** A transformation record needs distinct source and child identities.

**Treating every transformation as normalization.** Strain and substitution change the physical hypothesis.

**Inspecting only the in-memory object.** The serialized and reopened file is the object passed to later tools.

**Reusing one output name.** One operation record and one child name should represent one physical hypothesis.

**Using a site index without a retained mapping.** Reordering during conversion can make the same integer identify another atom.

## Alternative bridges

[ASE](/DFT-Research-Workflow/tools/ase/) provides direct `Atoms` operations, and [Atomsk](/DFT-Research-Workflow/tools/#resource-atomsk) offers a CLI route for many format and cell changes. [spglib](/DFT-Research-Workflow/tools/spglib/) can test standardized-cell and symmetry relations. A successful transformation in any tool is still only a constructed candidate.

## Official sources

- [pymatgen transformations](https://pymatgen.org/pymatgen.transformations.html)
- [pymatgen core objects](https://pymatgen.org/pymatgen.core.html)
- [`pymatgen-core` 2026.7.31 release on PyPI](https://pypi.org/project/pymatgen-core/2026.7.31/)

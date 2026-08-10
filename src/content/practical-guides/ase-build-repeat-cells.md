---
topic_slug: build-or-modify-computational-model
guide_slug: ase-build-repeat-cells
title: Build and Repeat Cells with ASE
kind: implementation
tools:
  - ase
interfaces:
  - Terminal
  - ASE Python API
  - ASE GUI or another crystal viewer
  - Text editor
status: reviewed
summary: Write a declared parent structure, read it back, create two integer supercells, write and reopen the children, and compare their cells and periodic geometry without claiming finite-size convergence.
tested_versions:
  - ASE 3.29.0
  - Python 3.12
execution_script: examples/practical-guides/ase_repeat_cells.py
source_ids:
  - ase-docs-home
  - ase-atoms
  - ase-build-tools
  - ase-pypi-3290
media_ids: []
review: docs/reviews/2026-08-03-practical-guides-model-building-pilot.md
reviewed_at: 2026-08-03
---

Use this guide when a declared integer transformation is needed before a defect, magnetic, alloy, phonon, or interface calculation. Begin with a checked parent file and a written reason for the larger cell. A final supercell without its parent and transformation is not sufficient lineage.

## Choose the parent and matrix before opening Python

Open the parent with its cell boundary visible. Identify which periodic directions must be repeated and why: a defect-image distance, a magnetic period, an ordering pattern, a displacement wavelength, or an interface match. Write down the integer matrix before using a builder.

The matrix comes from the model requirement, not from ASE. A diagonal `2×2×1` repeat is written as `[[2,0,0],[0,2,0],[0,0,1]]`; a non-diagonal matrix changes the supercell shape and must be inspected explicitly. Select the matrix only after identifying the relevant periodic direction and the finite-size or commensurability series that will later test it.

Create a small directory with the checked parent and one declared configuration. Change `PARENT` to your inspected CIF, POSCAR, or another ASE-readable structure. Do not point it at the unchanged database download if model-stage edits have already been accepted in a separate working object.

```bash
mkdir -p supercell-study/{source,output,records}
cd supercell-study
PARENT=/absolute/path/to/checked-parent.cif
test -s "$PARENT"
cp -- "$PARENT" source/parent.cif

cat > supercell.json <<'EOF'
{
  "parent": "source/parent.cif",
  "output": "output/parent-2x2x1.extxyz",
  "matrix": [[2, 0, 0], [0, 2, 0], [0, 0, 1]]
}
EOF
```

Keep one configuration and one output filename per candidate. Never infer the transformation later from a name such as `large.cif`.

## Create the exact transformation script

The following script reads the file on disk, requires a positive integer-volume multiplier, writes the child, reopens it, checks atom-count and cell consistency, and records both hashes. It does not choose a scientifically adequate size.

```python
from pathlib import Path
import hashlib
import json

import numpy as np
from ase.build import make_supercell
from ase.io import read, write

cfg = json.loads(Path("supercell.json").read_text())
parent_path = Path(cfg["parent"])
child_path = Path(cfg["output"])
P = np.asarray(cfg["matrix"], dtype=int)

if P.shape != (3, 3):
    raise SystemExit("FAIL: matrix must be 3 by 3")
multiplier = int(round(np.linalg.det(P)))
if multiplier <= 0 or not np.isclose(np.linalg.det(P), multiplier):
    raise SystemExit("FAIL: matrix must have a positive integer determinant")

parent = read(parent_path)
child = make_supercell(parent, P)
child_path.parent.mkdir(parents=True, exist_ok=True)
write(child_path, child)
reopened = read(child_path)

expected_atoms = len(parent) * multiplier
if len(reopened) != expected_atoms:
    raise SystemExit(
        f"FAIL: reopened child has {len(reopened)} atoms; expected {expected_atoms}"
    )
if not np.allclose(reopened.cell.array, child.cell.array):
    raise SystemExit("FAIL: reopened cell differs from the written child")

def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

summary = {
    "parent": str(parent_path),
    "child": str(child_path),
    "matrix": P.tolist(),
    "multiplier": multiplier,
    "parent_atoms": len(parent),
    "child_atoms": len(reopened),
    "parent_cell_ang": parent.cell.array.tolist(),
    "child_cell_ang": reopened.cell.array.tolist(),
    "parent_pbc": parent.pbc.tolist(),
    "child_pbc": reopened.pbc.tolist(),
    "parent_sha256": sha256(parent_path),
    "child_sha256": sha256(child_path),
}
Path("records/summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print(f"PASS: wrote and reopened {child_path}; atoms={len(reopened)}")
```

Save it as `build_supercell.py`.

## Run locally and inspect the files produced

Use an isolated environment so that the recorded version is reproducible:

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install "ase==3.29.0" "numpy==2.5.1"

python build_supercell.py
python -m json.tool records/summary.json
ase info --files \
  source/parent.cif \
  output/parent-2x2x1.extxyz
```

The terminal prints `PASS: wrote and reopened ...` only after the serialized child passes the bounded checks. The command produces:

- `source/parent.cif`, the preserved checked parent copy;
- `supercell.json`, the declared transformation;
- `build_supercell.py`, the transparent operation;
- `output/parent-2x2x1.extxyz`, the exact child passed downstream; and
- `records/summary.json`, cells, periodicity, atom counts, and hashes.

On a machine with a graphical session, open the exact written files:

```bash
ase gui source/parent.cif output/parent-2x2x1.extxyz
```

Show cell boundaries and periodic images. Compare orientation, repeated motif, atom count, species order or mapping, periodic directions, and duplicate or colliding sites. Measure the shortest periodic-image distance relevant to the perturbation; atom count alone is not a size criterion.

## Decide pass, fail, and the next calculation

Pass this construction stage only when:

- the matrix and its scientific reason are written;
- determinant, atom-count multiplier, reopened cell, periodicity, and hashes agree;
- parent and child show the intended orientation and repeat with no unexplained overlaps; and
- the perturbation or ordering to be added is compatible with the child cell.

Fail and rebuild when the determinant is zero or negative, the serialized child changes cell or atom count, the wrong direction was repeated, sites collide, or the intended ordering cannot be represented. Preserve the rejected file and reason rather than overwriting it.

After accepting the geometry, add the declared defect, displacement, ordering, interface, or other perturbation under a new filename. Then [choose the DFT method and computational setup](/DFT-Research-Workflow/operations/choose-dft-method-and-computational-setup/) and [test numerical convergence](/DFT-Research-Workflow/operations/test-numerical-convergence/) against the target observable, including the relevant supercell-size series. A regular-looking cell does not show that defect, phonon, magnetic, alloy, or interface finite-size effects are converged.

If symmetry or a primitive-cell relation changes unexpectedly, follow [the symmetry-mismatch troubleshooting route](/DFT-Research-Workflow/operations/troubleshooting/#symmetry-or-kq-mapping-mismatch). If the child looks physically wrong, follow [the geometry troubleshooting route](/DFT-Research-Workflow/operations/troubleshooting/#geometry-looks-physically-wrong).

## Optional automation: replay the repository fixture

The manual route above is the research path. The existing repository companion is an optional software fixture with a generated two-atom diamond-Si parent.

- **Reads:** its own generated illustrative parent and two declared integer matrices.
- **Produces:** one parent, diagonal and non-diagonal children, plus `summary.json` in an empty external directory.
- **Checks:** ASE writing/reopening, determinant and atom-count consistency, periodicity, cells, and hashes.
- **Does not check:** your parent structure, supercell-size choice, finite-size convergence, DFT execution, or stability.

From a repository checkout:

```bash
run_root="$(mktemp -d)"
python3 examples/practical-guides/ase_repeat_cells.py --workdir "$run_root"
python3 -m json.tool "$run_root/summary.json"
ase gui \
  "$run_root/source/si-diamond-parent.extxyz" \
  "$run_root/output/si-repeat-2x2x1.extxyz" \
  "$run_root/output/si-general-supercell.extxyz"
```

## What this guide verifies

The companion verifies ASE 3.29.0 file writing and reading, diagonal and general integer transformations, determinant and atom-count consistency, periodicity preservation, reopened cell matrices, and structured summary generation. It does not validate the illustrative parent, select a supercell size, run DFT, or establish convergence or stability.

## Common mistakes

**Using atom count as the only size measure.** Cell shape and the relevant periodic-image distance can matter more.

**Overwriting the parent.** Source and descendants need separate identities and hashes.

**Calling a larger cell converged.** Adequacy belongs to an observable-specific series after the perturbation is defined.

**Using a singular or left-handed transformation.** Require a positive integer determinant and inspect the resulting handedness and orientation.

**Changing the matrix without regenerating dependent sampling.** Rebuild k meshes, q meshes, paths, site mappings, and constraints for the accepted child.

## Alternative bridges

[pymatgen](/DFT-Research-Workflow/tools/pymatgen/) provides explicit transformation objects, while [Atomsk](/DFT-Research-Workflow/tools/#resource-atomsk) offers a command-line construction route. [spglib](/DFT-Research-Workflow/tools/spglib/) and [SeeK-path](/DFT-Research-Workflow/tools/seekpath/) can analyze cell relations and symmetry conventions. These tools can materialize or inspect a cell; none selects an adequate finite-size model for the target observable.

## Official sources

- [ASE documentation](https://docs.ase-lib.org/)
- [ASE `Atoms` object](https://docs.ase-lib.org/ase/atoms.html)
- [ASE supercell-building tools](https://docs.ase-lib.org/ase/build/tools.html)
- [ASE 3.29.0 release on PyPI](https://pypi.org/project/ase/3.29.0/)

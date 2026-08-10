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

This page first shows how to turn a checked layer file into an explicit two-dimensional model. Its optional repository fixture writes one generated 2H-MoS2 unit, reads it back, repeats it in plane, writes the child, and reopens the exact file that a later tool would receive. It is not derived from an experimental CIF, does not contain a DFT-relaxed lattice, and supports no phase, stability, or property claim.

## Identify the layer before using a builder

Establish the intended material, polytype, composition, orientation, and relation to bulk or experiment from a primary paper, supplementary structure, database record, or explicitly declared prototype. A builder name is not source provenance, and one generated polytype is not a phase-selection result.

Before automation, decide which axis is nonperiodic and which alternatives remain plausible: polytype, stacking, buckling, strain, defects, substrate relation, and termination or passivation where relevant.

The in-plane repeat comes from the perturbation, coverage, ordering, or target-observable size test. Initial vacuum is only a starting boundary value and must later be tested for the actual energy, field, band, force, phonon, or other quantity used.

## Create the source and model record

Change `PARENT` to the checked single-layer file. If the source is a bulk crystal or already contains several layers, stop and construct/justify the intended layer first.

```bash
mkdir -p monolayer-study/{source,output,records}
cd monolayer-study
PARENT=/absolute/path/to/checked-single-layer.cif
test -s "$PARENT"
cp -- "$PARENT" source/layer-parent.cif

cat > model.json <<'EOF'
{
  "parent": "source/layer-parent.cif",
  "output": "output/layer-2x2-vacuum.extxyz",
  "repeat": [2, 2, 1],
  "nonperiodic_axis": 2,
  "vacuum_each_side_ang": 8.0
}
EOF
```

`nonperiodic_axis` uses Python indexing: `0`, `1`, or `2`. Confirm it from the exact source cell and viewer, rather than assuming that the longest vector or `c` is automatically normal to the layer.

## Create the exact model-builder script

Save the following as `build_monolayer.py`:

```python
from pathlib import Path
import hashlib
import json

import numpy as np
from ase.io import read, write

cfg = json.loads(Path("model.json").read_text())
parent_path = Path(cfg["parent"])
child_path = Path(cfg["output"])
axis = int(cfg["nonperiodic_axis"])
repeat = tuple(int(v) for v in cfg["repeat"])

if axis not in (0, 1, 2):
    raise SystemExit("FAIL: nonperiodic_axis must be 0, 1, or 2")
if repeat[axis] != 1:
    raise SystemExit("FAIL: do not repeat the model along the nonperiodic axis")

parent = read(parent_path)
parent.pbc = [i != axis for i in range(3)]
parent.center(vacuum=float(cfg["vacuum_each_side_ang"]), axis=axis)
child = parent.repeat(repeat)
child_path.parent.mkdir(parents=True, exist_ok=True)
write(child_path, child)
reopened = read(child_path)

coords = reopened.positions[:, axis]
cell_length = float(np.linalg.norm(reopened.cell[axis]))
atomic_extent = float(coords.max() - coords.min())
periodic_axes = [i for i in range(3) if i != axis]
area = float(
    np.linalg.norm(
        np.cross(reopened.cell[periodic_axes[0]], reopened.cell[periodic_axes[1]])
    )
)

def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

summary = {
    "parent": str(parent_path),
    "child": str(child_path),
    "formula": reopened.get_chemical_formula(),
    "repeat": list(repeat),
    "nonperiodic_axis": axis,
    "periodicity": reopened.pbc.tolist(),
    "atoms": len(reopened),
    "normal_cell_length_ang": cell_length,
    "atomic_extent_ang": atomic_extent,
    "empty_cell_length_ang": cell_length - atomic_extent,
    "in_plane_area_ang2": area,
    "parent_sha256": sha256(parent_path),
    "child_sha256": sha256(child_path),
}
Path("records/summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print(f"PASS: wrote and reopened {child_path}; atoms={len(reopened)}")
```

This writes exactly one model child and a structured record. It does not infer phase identity, convert a bulk crystal into a monolayer, or choose a converged vacuum.

## Run and inspect the exact child

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install "ase==3.29.0" "numpy==2.5.1"

python build_monolayer.py
python -m json.tool records/summary.json
ase info --files source/layer-parent.cif output/layer-2x2-vacuum.extxyz
ase gui source/layer-parent.cif output/layer-2x2-vacuum.extxyz
```

The run produces the preserved parent copy, `model.json`, `build_monolayer.py`, the written/reopened child, and `records/summary.json`. The terminal prints `PASS: wrote and reopened ...` after the file can be read and measured.

## Inspect top and side views together

Show the cell boundary. In the top view, inspect the in-plane lattice, stoichiometry, repetition, and orientation. In the side view, inspect layer order, planarity or buckling, atomic thickness, total cell length, empty region, and closest repeated image. Use these exact written objects; a generic periodicity sketch cannot establish their geometry.

The ASE flags mark two periodic axes and one nonperiodic axis, but a later electronic-structure program may still solve a three-dimensionally periodic electrostatic problem. Record and implement the intended boundary treatment in the solver input; do not assume the coordinate file decides it.

## Decide whether the candidate can continue

Pass only when source identity, phase rationale, exact layer composition, orientation, in-plane repeat, periodic axes, cell boundary, atomic extent, empty-cell length, contacts, output hash, and visual observations agree. Keep every untested stacking, passivation, substrate, reconstruction, magnetic, or defect alternative explicit.

Fail and rebuild when the source contains the wrong polytype or layer count, the nonperiodic axis is wrong, the layer is repeated through the vacuum, the written child has overlaps or an unintended rotation, or the empty region is not where expected. Use [the geometry troubleshooting route](/DFT-Research-Workflow/operations/troubleshooting/#geometry-looks-physically-wrong) before promoting the file.

Continue by [choosing the method and boundary treatment](/DFT-Research-Workflow/operations/choose-dft-method-and-computational-setup/), then [testing the relevant cell, vacuum, sampling, and observable convergence](/DFT-Research-Workflow/operations/test-numerical-convergence/).

## Optional automation: replay the generated MoS2 fixture

The manual route above begins with your checked layer file. The repository companion instead generates an illustrative `2H-MoS2` unit with `a=3.18`, `thickness=3.19`, and `vacuum=8.0`, then repeats it `2×2` in plane. These demonstration values are not certified experimental data, converged DFT settings, or recommendations.

- **Reads:** its hard-coded ASE `mx2` builder arguments.
- **Produces:** a generated unit, repeated child, and `summary.json` in an empty external directory.
- **Checks:** ASE builder execution, write/reopen, repeat, formula, atom count, periodicity, cell/extent metrics, and hashes.
- **Does not check:** source phase, experimental identity, vacuum or sampling convergence, solver electrostatics, relaxation, stability, or any property.

```bash
run_root="$(mktemp -d)"
python3 examples/practical-guides/ase_monolayer_model.py --workdir "$run_root"
python3 -m json.tool "$run_root/summary.json"
ase gui \
  "$run_root/source/mos2-2h-unit.extxyz" \
  "$run_root/output/mos2-2h-2x2.extxyz"
```

## What this example does not establish

The companion verifies ASE 3.29.0 builder execution, file writing and reopening, the two-by-two repeat, composition, atom count, periodicity, cell and extent metrics, hashes, and structured summary generation. It does not establish that 2H is the relevant phase, that the lattice or thickness is accurate, that vacuum or sampling is converged, that the isolated layer represents an experiment, or that the monolayer is dynamically or thermodynamically stable.

## Common mistakes

**Calling a generated object experimental.** Preserve the generator origin and every argument.

**Reporting only the vacuum argument.** Inspect the actual cell length, atomic extent, and image geometry.

**Showing only a top view.** A top view cannot reveal layer order, buckling, thickness, or empty-cell length.

**Assuming the longest cell vector is the vacuum direction.** Inspect the source basis and exact geometry before selecting `nonperiodic_axis`.

**Repeating along the nonperiodic axis.** This creates periodic layer copies inside the construction rather than only the solver's boundary image.

## Alternative bridges

[Materials Project](/DFT-Research-Workflow/tools/materials-project/) and the database catalog can supply declared computed candidates; [pymatgen](/DFT-Research-Workflow/tools/pymatgen/) and [Atomsk](/DFT-Research-Workflow/tools/#resource-atomsk) provide alternative cell operations; [VESTA](/DFT-Research-Workflow/tools/vesta/) and [OVITO](/DFT-Research-Workflow/tools/#resource-ovito) provide visual inspection. None proves that a selected monolayer phase, vacuum, or lateral model is physically adequate.

## Official sources

- [ASE documentation](https://docs.ase-lib.org/)
- [ASE structure builders](https://docs.ase-lib.org/ase/build/build.html)
- [ASE `Atoms` object](https://docs.ase-lib.org/ase/atoms.html)
- [ASE 3.29.0 release on PyPI](https://pypi.org/project/ase/3.29.0/)

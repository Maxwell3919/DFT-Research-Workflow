---
topic_slug: build-or-modify-computational-model
guide_slug: ase-surfaces-vacuum-adsorbates
title: Construct Surfaces, Vacuum, and Adsorbates with ASE
kind: implementation
tools:
  - ase
interfaces:
  - Primary paper or supplementary methods
  - Terminal
  - ASE Python API
  - ASE GUI or another structure viewer
status: reviewed
summary: Write and reopen an illustrative bulk parent, bare slab, and adsorbate child while exposing orientation, termination, thickness, lateral area, coverage, vacuum, and the limits of generated starting coordinates.
tested_versions:
  - ASE 3.29.0
  - Python 3.12
execution_script: examples/practical-guides/ase_surface_vacuum_adsorbates.py
source_ids:
  - ase-docs-home
  - ase-surface
  - ase-building
  - ase-pypi-3290
media_ids: []
review: docs/reviews/2026-08-03-practical-guides-model-building-pilot.md
reviewed_at: 2026-08-03
---

Use this guide to inspect one file-backed slab and adsorbate construction route. A surface builder produces starting coordinates; it does not select the physical termination, layer count, lateral cell, adsorption site, vacuum, constraint policy, or electrostatic treatment.

## Choose the surface family before building one slab

Use the primary paper, supplementary methods, or a trusted surface record to identify the bulk phase, Miller plane, possible terminations, lateral cell, and symmetry constraints. List the terminations, sites, orientations, and coverages that the scientific question requires before constructing one convenient candidate.

Write where every choice comes from:

| Choice | Record before construction |
| --- | --- |
| Bulk parent | checked source filename, phase, cell representation, checksum |
| Surface | Miller indices in the parent's basis and all terminations retained |
| Size | layer count, lateral repeat, and the later convergence series |
| Vacuum | initial value and the later observable-specific vacuum series |
| Adsorbate | species, count, coverage definition, starting sites/orientations/heights |
| Boundary | periodic axes, intended solver electrostatics, dipole or truncation tests |
| Constraints | exact atoms/components and physical justification |

No universal layer count, vacuum, site height, or lateral repeat follows from the builder.

## Create the source and model configuration

Change `PARENT` to an inspected bulk structure. The example configuration first builds a bare slab; after inspecting it, add the optional adsorbate fields under a new configuration and output name.

```bash
mkdir -p surface-study/{source,output,records}
cd surface-study
PARENT=/absolute/path/to/checked-bulk.cif
test -s "$PARENT"
cp -- "$PARENT" source/bulk-parent.cif

cat > surface.json <<'EOF'
{
  "parent": "source/bulk-parent.cif",
  "bare_output": "output/slab-bare.extxyz",
  "candidate_output": "output/slab-H-site-01.extxyz",
  "record": "records/slab-bare.json",
  "miller": [1, 1, 1],
  "layers": 3,
  "repeat": [2, 2, 1],
  "vacuum_each_side_ang": 10.0,
  "adsorbate": null,
  "adsorbate_xy_ang": null,
  "adsorbate_height_ang": null
}
EOF
```

The values above are placeholders for a first inspected candidate, not production recommendations. Confirm that the Miller indices use the parent basis you intend. A conventional and a primitive parent can give different literal index/cell constructions even when the physical orientation is related.

## Create the exact slab-builder script

Save this as `build_surface.py`:

```python
import hashlib
import json
import os
from pathlib import Path

import numpy as np
from ase.build import add_adsorbate, surface
from ase.io import read, write

config_path = Path(os.environ.get("CONFIG", "surface.json"))
cfg = json.loads(config_path.read_text())
parent_path = Path(cfg["parent"])
bare_path = Path(cfg["bare_output"])
candidate_path = Path(cfg["candidate_output"])
record_path = Path(cfg["record"])

parent = read(parent_path)
slab = surface(
    parent,
    tuple(int(v) for v in cfg["miller"]),
    layers=int(cfg["layers"]),
    vacuum=None,
    periodic=False,
)
slab = slab.repeat(tuple(int(v) for v in cfg["repeat"]))
slab.pbc = (True, True, False)
slab.center(vacuum=float(cfg["vacuum_each_side_ang"]), axis=2)
bare_path.parent.mkdir(parents=True, exist_ok=True)
write(bare_path, slab)
bare = read(bare_path)

written = bare_path
model = bare
if cfg["adsorbate"] is not None:
    if cfg["adsorbate_xy_ang"] is None or cfg["adsorbate_height_ang"] is None:
        raise SystemExit("FAIL: adsorbate requires xy position and height")
    model = bare.copy()
    add_adsorbate(
        model,
        cfg["adsorbate"],
        height=float(cfg["adsorbate_height_ang"]),
        position=tuple(float(v) for v in cfg["adsorbate_xy_ang"]),
    )
    model.center(vacuum=float(cfg["vacuum_each_side_ang"]), axis=2)
    write(candidate_path, model)
    written = candidate_path

reopened = read(written)
z = reopened.positions[:, 2]
cell_z = float(reopened.cell[2, 2])
z_extent = float(z.max() - z.min())
area = float(np.linalg.norm(np.cross(reopened.cell[0], reopened.cell[1])))

def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

summary = {
    "parent": str(parent_path),
    "bare_slab": str(bare_path),
    "written_model": str(written),
    "miller": cfg["miller"],
    "layers": cfg["layers"],
    "repeat": cfg["repeat"],
    "periodicity": reopened.pbc.tolist(),
    "atoms": len(reopened),
    "cell_z_ang": cell_z,
    "atomic_z_extent_ang": z_extent,
    "empty_cell_length_ang": cell_z - z_extent,
    "surface_area_ang2": area,
    "parent_sha256": sha256(parent_path),
    "bare_sha256": sha256(bare_path),
    "written_model_sha256": sha256(written),
}
record_path.parent.mkdir(parents=True, exist_ok=True)
record_path.write_text(json.dumps(summary, indent=2) + "\n")
print(f"PASS: wrote and reopened {written}; record={record_path}")
```

## Build the bare slab, inspect it, then add candidates

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install "ase==3.29.0" "numpy==2.5.1"

python build_surface.py
python -m json.tool records/slab-bare.json
ase info --files source/bulk-parent.cif output/slab-bare.extxyz
ase gui source/bulk-parent.cif output/slab-bare.extxyz
```

The first run produces the parent copy, `surface.json`, `build_surface.py`, the bare slab, and `records/slab-bare.json`. Inspect the bare slab before adding an adsorbate. Use top and side views to verify orientation, termination, lateral cell, layer count, atomic extent, total cell length, empty-cell length, and contacts.

After selecting one explicit starting site from the inspected bare slab, create one complete named configuration. Replace the position and height with values for that candidate:

```json
{
  "parent": "source/bulk-parent.cif",
  "bare_output": "output/slab-bare.extxyz",
  "candidate_output": "output/slab-H-site-01.extxyz",
  "record": "records/slab-H-site-01.json",
  "miller": [1, 1, 1],
  "layers": 3,
  "repeat": [2, 2, 1],
  "vacuum_each_side_ang": 10.0,
  "adsorbate": "H",
  "adsorbate_xy_ang": [0.0, 0.0],
  "adsorbate_height_ang": 1.5
}
```

Save it as `surface-H-site-01.json`, then run and reopen that exact candidate:

```bash
CONFIG=surface-H-site-01.json python build_surface.py
python -m json.tool records/slab-H-site-01.json
ase gui output/slab-bare.extxyz output/slab-H-site-01.extxyz
```

The position and height must come from the candidate family you intend to test, not from this example. Give every site, orientation, coverage, or termination a distinct configuration, output filename, and record.

The ASE object uses `pbc = [True, True, False]`. A later electronic-structure solver may still use three-dimensional periodic electrostatics, so preserve and implement the intended boundary treatment outside the coordinate file.

## Compare the actual structures in top and side views

```bash
ase gui \
  source/bulk-parent.cif \
  output/slab-bare.extxyz \
  output/slab-H-site-01.extxyz
```

Show the cell boundary. View the slab from the side to count layers, locate vacuum, and confirm that H is on the intended side; use the top view to inspect the lateral cell and initial site. Measure slab thickness, repeated-image spacing, and suspicious contacts in these exact written objects; a generic slab-vacuum sketch cannot establish them.

One named high-symmetry site is an initial coordinate, not an energetic conclusion. Prepare the symmetry-distinct sites, terminations, orientations, coverages, initial heights, and constraint variants that remain plausible. Report adsorbate count together with lateral area; changing either changes the physical model.

## Decide what can continue

Retain a candidate only when its parent, orientation, termination, lateral cell, layer count, periodicity, cell and atomic extent, adsorbate identity, initial site, coverage, constraints, and untested alternatives are explicit. Then [choose the method and boundary treatment](/DFT-Research-Workflow/operations/choose-dft-method-and-computational-setup/) and [converge the target observable](/DFT-Research-Workflow/operations/test-numerical-convergence/) with respect to slab, vacuum, lateral size, and any method-specific electrostatic controls.

Fail the construction stage when the intended surface is not reproduced, the termination is ambiguous, the cell normal or vacuum axis is wrong, atoms overlap, the adsorbate is on the wrong side/site, or the reopened file changes composition/cell unexpectedly. Preserve the rejected candidate and correction. A successfully written slab is not yet a relaxed or converged surface.

Use [the geometry troubleshooting route](/DFT-Research-Workflow/operations/troubleshooting/#geometry-looks-physically-wrong) for collapsed vacuum, overlaps, wrong registry, or wrong cell geometry. Use [the symmetry-mismatch route](/DFT-Research-Workflow/operations/troubleshooting/#symmetry-or-kq-mapping-mismatch) before changing symmetry merely to silence a later code warning.

## Optional automation: replay the bounded Al fixture

The manual route above starts from your checked bulk parent. The repository companion instead uses a generated fcc-Al parent, a (111) cut, three layers, a `2×2` lateral repeat, and one H starting coordinate. These values are a software fixture, not a production recommendation or an Al–H result.

- **Reads:** its generated fcc-Al parent and hard-coded demonstration choices.
- **Produces:** parent, bare slab, H candidate, and `summary.json` in an empty external directory.
- **Checks:** ASE write/reopen, atom counts, periodicity, adsorbate placement, cell/atomic extents, area, empty length, and hashes.
- **Does not check:** phase, termination, site family, constraints, relaxation, electrostatics, thickness/vacuum convergence, adsorption energy, or stability.

```bash
run_root="$(mktemp -d)"
python3 examples/practical-guides/ase_surface_vacuum_adsorbates.py \
  --workdir "$run_root"
python3 -m json.tool "$run_root/summary.json"
ase gui \
  "$run_root/source/al-fcc-parent.extxyz" \
  "$run_root/output/al111-bare-slab.extxyz" \
  "$run_root/output/al111-h-ontop-candidate.extxyz"
```

## What this guide verifies

The companion verifies ASE 3.29.0 file writing and reading, the declared bulk-to-slab construction, atom counts, periodicity, initial adsorbate placement, reopened cell and atomic extents, surface area, empty-cell length, hashes, and structured summary generation. It does not validate a surface phase, termination, adsorption site, constraint policy, relaxation, energy reference, electrostatic treatment, convergence, or scientific conclusion.

## Common mistakes

**Showing only a side view.** A side view cannot establish lateral registry or coverage.

**Reporting only the `vacuum` argument.** Inspect the actual cell length, atomic extent, and image separation.

**Calling one starting site preferred.** Site preference requires comparable relaxed candidates and compatible energy references.

**Using Miller indices from another cell setting.** Record the parent basis and inspect the generated orientation before calculating.

**Assuming `pbc=False` changes solver electrostatics.** Coordinate periodic flags and the electronic-structure boundary treatment are separate objects.

## Alternative bridges

[pymatgen](/DFT-Research-Workflow/tools/pymatgen/) provides slab, adsorption, and interface analysis modules; [CatKit](/DFT-Research-Workflow/tools/#resource-catkit) and [Atomsk](/DFT-Research-Workflow/tools/#resource-atomsk) provide other construction routes. [VESTA](/DFT-Research-Workflow/tools/vesta/) and [OVITO](/DFT-Research-Workflow/tools/#resource-ovito) can inspect exact written structures. None of these tools chooses a stable termination, preferred site, converged vacuum, or valid electrostatic model.

## Official sources

- [ASE documentation](https://docs.ase-lib.org/)
- [ASE surfaces, vacuum, and adsorbates](https://docs.ase-lib.org/ase/build/surface.html)
- [ASE structure builders](https://docs.ase-lib.org/ase/build/build.html)
- [ASE 3.29.0 release on PyPI](https://pypi.org/project/ase/3.29.0/)

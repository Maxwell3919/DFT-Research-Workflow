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

## Decide the repeat before opening Python

Open the parent with its cell boundary visible. Identify which periodic directions must be repeated and why: a defect-image distance, a magnetic period, an ordering pattern, a displacement wavelength, or an interface match. Write down the integer matrix before using a builder.

The companion uses a generated two-atom diamond-Si fixture so that software behaviour is reproducible. Its lattice parameter is illustrative, not an experimental source or DFT result. For research, replace the fixture with the checked source-stage working file and keep that source unchanged.

## Produce files that can be inspected

Run from the repository root. `mktemp -d` provides an empty external work directory, and the script refuses to overwrite a nonempty one.

```bash
run_root="$(mktemp -d)"
python3 examples/practical-guides/ase_repeat_cells.py --workdir "$run_root"
python3 -m json.tool "$run_root/summary.json"
ase info --files \
  "$run_root/source/si-diamond-parent.extxyz" \
  "$run_root/output/si-repeat-2x2x1.extxyz" \
  "$run_root/output/si-general-supercell.extxyz"
```

The companion first writes `source/si-diamond-parent.extxyz`, reads that file, applies a diagonal repeat and a general integer matrix, writes two independent children, reopens all three files, and checks the reopened atom counts, cell matrices, periodic flags, and hashes. The retained `summary.json` reports only those bounded object checks.

The diagonal child uses `repeat((2, 2, 1))`. The general child uses

```python
P = [[2, 1, 0],
     [0, 2, 0],
     [0, 0, 1]]
```

Both transformations have an atom-count and volume multiplier of four for this parent, but their cell shapes differ. Preserve the full matrix rather than inferring it later from a filename.

## Reopen parent and children side by side

On a machine with a graphical session, open the exact written files:

```bash
ase gui \
  "$run_root/source/si-diamond-parent.extxyz" \
  "$run_root/output/si-repeat-2x2x1.extxyz" \
  "$run_root/output/si-general-supercell.extxyz"
```

Show cell boundaries and compare orientation, repeated motif, atom count, periodic directions, and duplicate or colliding sites. Use these exact written objects for the comparison; a generic cell-repetition sketch cannot reveal their orientation, contacts, or serialization. Keep `run_root` until the manual comparison is recorded.

Accept the transformation only when the written matrix, reopened cells, atom mapping, periodicity, shortest relevant image separations, and visual repeat all agree. A regular-looking cell does not show that defect, phonon, magnetic, alloy, or interface finite-size effects are converged.

## What this guide verifies

The companion verifies ASE 3.29.0 file writing and reading, diagonal and general integer transformations, determinant and atom-count consistency, periodicity preservation, reopened cell matrices, and structured summary generation. It does not validate the illustrative parent, select a supercell size, run DFT, or establish convergence or stability.

Next, [choose the DFT method and computational setup](/DFT-Research-Workflow/operations/choose-dft-method-and-computational-setup/) for the accepted model, then [test numerical convergence](/DFT-Research-Workflow/operations/test-numerical-convergence/) against the target observable, including the relevant finite-size control.

## Common mistakes

**Using atom count as the only size measure.** Cell shape and the relevant periodic-image distance can matter more.

**Overwriting the parent.** Source and descendants need separate identities and hashes.

**Calling a larger cell converged.** Adequacy belongs to an observable-specific series after the perturbation is defined.

## Official sources

- [ASE documentation](https://docs.ase-lib.org/)
- [ASE `Atoms` object](https://docs.ase-lib.org/ase/atoms.html)
- [ASE supercell-building tools](https://docs.ase-lib.org/ase/build/tools.html)
- [ASE 3.29.0 release on PyPI](https://pypi.org/project/ase/3.29.0/)

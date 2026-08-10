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

The companion deliberately uses a generated fcc-Al parent, a (111) cut, a three-layer slab, a two-by-two lateral repeat, and one H atom above a top-layer Al atom. These values are a software fixture, not a production recommendation or an Al–H result.

## Write the parent, bare slab, and adsorbate child

Run from the repository root:

```bash
run_root="$(mktemp -d)"
python3 examples/practical-guides/ase_surface_vacuum_adsorbates.py --workdir "$run_root"
python3 -m json.tool "$run_root/summary.json"
ase info --files \
  "$run_root/source/al-fcc-parent.extxyz" \
  "$run_root/output/al111-bare-slab.extxyz" \
  "$run_root/output/al111-h-ontop-candidate.extxyz"
```

The script writes the illustrative bulk parent, reads it, cuts the (111) slab, repeats it laterally, writes and reopens the bare slab, adds one H starting coordinate, centers the candidate with empty cell length along the third axis, writes the child, and reopens it. The summary records the actual cell length, atomic extent, remaining empty-cell length, surface area, implied initial coverage, periodicity, and file hashes.

The ASE object uses `pbc = [True, True, False]`. A later electronic-structure solver may still use three-dimensional periodic electrostatics, so preserve the intended boundary treatment outside the coordinate file.

## Compare the actual structures in top and side views

```bash
ase gui \
  "$run_root/source/al-fcc-parent.extxyz" \
  "$run_root/output/al111-bare-slab.extxyz" \
  "$run_root/output/al111-h-ontop-candidate.extxyz"
```

Show the cell boundary. View the slab from the side to count layers, locate vacuum, and confirm that H is on the intended side; use the top view to inspect the lateral cell and initial site. Measure slab thickness, repeated-image spacing, and suspicious contacts in these exact written objects; a generic slab-vacuum sketch cannot establish them.

One named high-symmetry site is an initial coordinate, not an energetic conclusion. Prepare the symmetry-distinct sites, terminations, orientations, coverages, initial heights, and constraint variants that remain plausible. Report adsorbate count together with lateral area; changing either changes the physical model.

## Decide what can continue

Retain a candidate only when its parent, orientation, termination, lateral cell, layer count, periodicity, cell and atomic extent, adsorbate identity, initial site, coverage, constraints, and untested alternatives are explicit. Then [choose the method and boundary treatment](/DFT-Research-Workflow/operations/choose-dft-method-and-computational-setup/) and [converge the target observable](/DFT-Research-Workflow/operations/test-numerical-convergence/) with respect to slab, vacuum, lateral size, and any method-specific electrostatic controls.

## What this guide verifies

The companion verifies ASE 3.29.0 file writing and reading, the declared bulk-to-slab construction, atom counts, periodicity, initial adsorbate placement, reopened cell and atomic extents, surface area, empty-cell length, hashes, and structured summary generation. It does not validate a surface phase, termination, adsorption site, constraint policy, relaxation, energy reference, electrostatic treatment, convergence, or scientific conclusion.

## Common mistakes

**Showing only a side view.** A side view cannot establish lateral registry or coverage.

**Reporting only the `vacuum` argument.** Inspect the actual cell length, atomic extent, and image separation.

**Calling one starting site preferred.** Site preference requires comparable relaxed candidates and compatible energy references.

## Official sources

- [ASE documentation](https://docs.ase-lib.org/)
- [ASE surfaces, vacuum, and adsorbates](https://docs.ase-lib.org/ase/build/surface.html)
- [ASE structure builders](https://docs.ase-lib.org/ase/build/build.html)
- [ASE 3.29.0 release on PyPI](https://pypi.org/project/ase/3.29.0/)

---
topic_slug: charge-density-and-charge-redistribution
guide_slug: check-charge-difference-closure
title: Check a Compatible Difference-Density Closure
kind: implementation
tools:
  - python
status: reviewed
summary: Use invented compatible grid cells to demonstrate full-cell difference-density closure before interpreting local lobes.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/charge_difference_closure.py
source_ids:
  - qe-pp-density
  - vasp-chgcar-density
media_ids: []
review: docs/reviews/2026-08-04-charge-density-and-charge-redistribution.md
reviewed_at: "2026-08-04"
---

## View a signed volumetric field before interpreting charge transfer

For a real system, open the total and reference densities on the same grid in a volumetric viewer, then inspect signed difference-density isosurfaces and planar slices beside the atomic structure. Vary the isovalue and colour scale, integrate the full cell, and compare several sections; numerical closure complements visual inspection but cannot assign a unique chemical bond. Use [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) and [specialist field-analysis tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools).

**Start with real volumetric objects:** export the combined and fragment densities, open them on the same grid, and inspect the signed field before interpreting it. This repository supplies no such output. The optional four-cell fixture below is invented arithmetic, not a charge-density field or software result.

Do not use the fixture as a substitute for those exports. It checks only the arithmetic distinction between local positive and negative cells and a closed complete-cell sum; it does not read a Quantum ESPRESSO or VASP density or perform an electronic-structure calculation.

For real work, the parent objects are the combined-system and fragment density fields generated in the same cell, on the same grid, with compatible geometry, density convention, spin/SOC state, occupations, and electron count. This fixture instead creates four invented combined and fragment values internally.

## Purpose

If you want to test that arithmetic after inspecting the real grids, run from the repository root:

```bash
python3 examples/practical-guides/charge_difference_closure.py
```

The command runs the deterministic arithmetic and prints a JSON object. It creates no image.

## Inspect the reported quantities

Confirm that the process exits normally and prints the boundary sentence `Execution establishes invented-grid arithmetic only; it is not a density field or DFT calculation.` This is program-success evidence for the fixture only.

In the JSON output, inspect:

- `full_cell_delta_integral`, which checks the signed complete-cell sum;
- `positive_cell_sum` and `negative_cell_sum`, which confirm that local accumulation and depletion remain even when the full-cell sum closes;
- `grid_cells`, which identifies the four-cell invented object.

For this fixed fixture, `full_cell_delta_integral` should be zero within the script's $10^{-12}$ assertion while the positive and negative sums remain nonzero. This verifies the script's invented arithmetic, not a physical density or its spatial distribution.

## If a real subtraction does not close

Do not interpret its lobes yet. Check that every field has the same lattice vectors, grid registration, units, electron-number convention, reconstruction/core treatment, charge state, and frozen or relaxed fragment geometry. Then integrate the complete field using the volume element required by the file format.

The [Quantum ESPRESSO `pp.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PP.html) defines code-specific density outputs. [VASP documents the contents and PAW one-center information of `CHGCAR`](https://vasp.at/wiki/CHGCAR). These sources define the real parent objects; this guide does not verify them.

Passing this fixture supports only compatible-grid subtraction bookkeeping. It does not calculate a density, converge a grid, perform Bader analysis, assign an atomic charge, establish charge transfer, or support a material claim.

## Official sources

- [Quantum ESPRESSO `pp.x` density-output documentation](https://www.quantum-espresso.org/Doc/INPUT_PP.html)
- [VASP `CHGCAR` density documentation](https://vasp.at/wiki/CHGCAR)

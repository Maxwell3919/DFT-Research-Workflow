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
media_ids:
  - charge-difference-closure
review: docs/reviews/2026-08-04-charge-density-and-charge-redistribution.md
reviewed_at: "2026-08-04"
---

Run this fixture before interpreting a difference-density image. It checks the arithmetic distinction between local positive and negative cells and a closed complete-cell sum. It does not read a Quantum ESPRESSO or VASP density and does not perform an electronic-structure calculation.

For real work, the parent objects are the combined-system and fragment density fields generated in the same cell, on the same grid, with compatible geometry, density convention, spin/SOC state, occupations, and electron count. This fixture instead creates four invented combined and fragment values internally.

## Purpose

From the repository root, run:

```bash
python3 examples/practical-guides/charge_difference_closure.py \
  --svg public/media/practical-guides/charge-density-and-charge-redistribution/check-charge-difference-closure/charge-difference-closure.svg
```

The command runs the deterministic arithmetic, prints a JSON object to the terminal, and writes the requested SVG. The `--svg` path controls only the rendered diagram location.

## Inspect the reported quantities

Confirm that the process exits normally and prints the boundary sentence `Execution establishes invented-grid arithmetic and SVG rendering only; it is not a DFT calculation.` This is program-success evidence for the fixture only.

In the JSON output, inspect:

- `full_cell_delta_integral`, which checks the signed complete-cell sum;
- `positive_cell_sum` and `negative_cell_sum`, which confirm that local accumulation and depletion remain even when the full-cell sum closes;
- `grid_cells`, which identifies the four-cell invented object.

For this fixed fixture, `full_cell_delta_integral` should be zero within the script's $10^{-12}$ assertion while the positive and negative sums remain nonzero. The generated SVG should show the same local sign pattern. This verifies the script's invented arithmetic and SVG rendering, not a physical density.

## If a real subtraction does not close

Do not interpret its lobes yet. Check that every field has the same lattice vectors, grid registration, units, electron-number convention, reconstruction/core treatment, charge state, and frozen or relaxed fragment geometry. Then integrate the complete field using the volume element required by the file format.

The [Quantum ESPRESSO `pp.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PP.html) defines code-specific density outputs. [VASP documents the contents and PAW one-center information of `CHGCAR`](https://vasp.at/wiki/CHGCAR). These sources define the real parent objects; this guide does not verify them.

Passing this fixture supports only compatible-grid subtraction bookkeeping. It does not calculate a density, converge a grid, perform Bader analysis, assign an atomic charge, establish charge transfer, or support a material claim.

## Official sources

- [Quantum ESPRESSO `pp.x` density-output documentation](https://www.quantum-espresso.org/Doc/INPUT_PP.html)
- [VASP `CHGCAR` density documentation](https://vasp.at/wiki/CHGCAR)

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

This deterministic fixture subtracts invented fragment values from an invented combined density on one compatible grid. It makes the full-cell sum vanish while retaining positive and negative local cells. That closure is a bookkeeping check, not a claim that a real system transfers no charge.

## Keep every comparison object compatible

The [Quantum ESPRESSO `pp.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PP.html) distinguishes charge-density outputs and their conventions; [VASP documents that CHGCAR includes PAW one-center information](https://vasp.at/wiki/CHGCAR). For a real difference field, preserve the same cell, grid, structure convention, and density representation for every subtraction term. This fixture has no electronic-state calculation and no PAW reconstruction.

## Run the invented-grid check

```text
python3 examples/practical-guides/charge_difference_closure.py \
  --svg public/media/practical-guides/charge-density-and-charge-redistribution/check-charge-difference-closure/charge-difference-closure.svg
```

## What this guide verifies

The JSON output reports the signed complete-cell integral and the separately retained positive and negative sums. Execution verifies invented-grid arithmetic and SVG rendering only. It does not calculate a density, converge a grid, perform Bader analysis, assign atomic charge, or establish charge transfer.

## Official sources

- [Quantum ESPRESSO `pp.x` density-output documentation](https://www.quantum-espresso.org/Doc/INPUT_PP.html)
- [VASP `CHGCAR` density documentation](https://vasp.at/wiki/CHGCAR)

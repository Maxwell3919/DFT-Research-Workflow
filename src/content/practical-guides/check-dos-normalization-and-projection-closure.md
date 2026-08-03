---
topic_slug: density-of-states-and-projected-density-of-states
guide_slug: check-dos-normalization-and-projection-closure
title: Check a DOS Integral and Projected-Weight Closure
kind: implementation
tools:
  - python
status: reviewed
summary: Integrate an invented DOS and retain a visible residual when selected projected channels do not equal the total.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/dos_projection_closure.py
source_ids:
  - qe-dos-docs
  - qe-projwfc-docs
  - vasp-doscar
  - vasp-lorbit
media_ids:
  - dos-projection-closure
review: docs/reviews/2026-08-04-density-of-states-and-projected-density-of-states.md
reviewed_at: "2026-08-04"
---

This deterministic fixture uses an invented total DOS and two intentionally incomplete local projections. It checks two quantities that a plot alone can hide: the integral on the declared energy grid and the residual between the total and the displayed projected channels.

## Preserve a residual instead of silently renormalizing

The script integrates all curves with the same trapezoidal rule and reports the missing weight. A real projected DOS can omit interstitial density or use non-complete local projectors. The [VASP `LORBIT` documentation](https://vasp.at/wiki/LORBIT) explicitly describes a qualitative local decomposition, while [Quantum ESPRESSO `projwfc.x`](https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html) documents its own projection route. Neither makes an atom-orbital label basis independent.

## Run the deterministic fixture

```text
python3 examples/practical-guides/dos_projection_closure.py \
  --svg public/media/practical-guides/density-of-states-and-projected-density-of-states/check-dos-normalization-and-projection-closure/dos-projection-closure.svg
```

The fixture prints its invented energy grid, total integral, selected-projection integral, and residual. [Quantum ESPRESSO `dos.x`](https://www.quantum-espresso.org/Doc/INPUT_DOS.html) and [VASP `DOSCAR`](https://vasp.at/wiki/DOSCAR) support the implementation distinction between energy-resolved DOS and its integrated count; the fixture is not an input for either code.

## What this guide verifies

Execution verifies deterministic numerical integration, a declared normalization, residual reporting, and SVG rendering for invented arrays. It does not calculate a DOS, validate a projector, determine an electron count for a material, converge a k mesh, identify an orbital occupation, or establish bonding, charge transfer, magnetism, or a spectral result.

## Official sources

- [Quantum ESPRESSO `dos.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_DOS.html)
- [Quantum ESPRESSO `projwfc.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html)
- [VASP `DOSCAR` documentation](https://vasp.at/wiki/DOSCAR)
- [VASP `LORBIT` documentation](https://vasp.at/wiki/LORBIT)

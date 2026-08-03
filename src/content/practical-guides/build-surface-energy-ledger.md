---
topic_slug: surface-energy-and-work-function
guide_slug: build-surface-energy-ledger
title: Build a Surface-Energy Ledger and Diagnose Bulk Drift
kind: implementation
tools:
  - python
status: reviewed
summary: Assemble a two-surface slab-energy ledger, fit its bulk-like slope, and expose thickness drift caused by a deliberately mismatched reference.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/surface_energy_ledger.py
source_ids:
  - fiorentini-methfessel-surfaces
  - boettger-surface-nonconvergence
  - gpaw-al-surface
media_ids:
  - surface-energy-ledger
review: docs/reviews/2026-08-04-surface-energy-and-work-function.md
reviewed_at: "2026-08-04"
---

A surface-energy table is reliable only when every large term in the subtraction remains inspectable. This guide uses four invented symmetric slabs to show how a small bulk-reference mismatch becomes a thickness-dependent surface excess.

## Keep area, count, and energy units explicit

Each fixture row stores layer count, atom count, one-face area in Å², and slab energy in eV. The script uses two equivalent surfaces and converts eV Å⁻² to J m⁻² only after subtraction. For an asymmetric or nonstoichiometric slab, the same divisor would not assign a unique face energy.

The [GPAW aluminium-surface tutorial](https://gpaw.readthedocs.io/tutorialsexercises/basics/surface/surface.html) illustrates the two-face expression. Fiorentini and Methfessel's [linear slab-series construction](https://doi.org/10.1088/0953-8984/8/36/005) and Boettger's [nonconvergence analysis](https://doi.org/10.1103/PhysRevB.49.16798) motivate the fitted slope and drift diagnostic.

## Fit only one continuous slab family

The script fits `E_slab(N) = N e_bulk^fit + E_excess`. Its intercept is divided by `2A`; its slope is not promoted to a new bulk property. The fit is meaningful here because all rows deliberately share an invented surface identity and area. A real series must first exclude reconstruction, magnetism, stoichiometry, strain, or numerical-protocol switches.

It then shifts the fitted bulk slope by an invented `0.003 eV/atom`. The derived direct-subtraction values drift with atom count, visibly demonstrating why an internally converged bulk energy can still be incompatible with a slab series.

## Rebuild the diagram

```text
python3 examples/practical-guides/surface_energy_ledger.py \
  --svg public/media/practical-guides/surface-energy-and-work-function/build-surface-energy-ledger/surface-energy-ledger.svg
```

The SVG is generated from the same in-file fixture used by `run()`. The red line is intentionally a failure pattern, while the horizontal fit intercept is the result of the bounded synthetic model.

## What this guide verifies

The companion script verifies unit conversion, the factor of two, linear-regression arithmetic, and the direction of thickness drift under one deliberately perturbed bulk slope. It calculates no electronic energy and ingests no material data.

Execution success is not slab convergence for a real calculation. It establishes no surface energy, reconstruction, termination ordering, bulk-reference accuracy, or material stability.

## Official sources

- [Fiorentini and Methfessel, convergent surface energies](https://doi.org/10.1088/0953-8984/8/36/005)
- [Boettger, thin-film surface-energy nonconvergence](https://doi.org/10.1103/PhysRevB.49.16798)
- [GPAW aluminium-surface tutorial](https://gpaw.readthedocs.io/tutorialsexercises/basics/surface/surface.html)

---
topic_slug: surface-energy-and-work-function
guide_slug: build-surface-energy-ledger
title: Build a Surface-Energy Ledger and Diagnose Bulk Drift
kind: implementation
tools:
  - python
status: reviewed
summary: Use an attributed published Si-surface ledger alongside a synthetic bulk-drift diagnostic, without confusing three table values with a converged slab series.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/surface_ledger_intermat.py
source_ids:
  - fiorentini-methfessel-surfaces
  - boettger-surface-nonconvergence
  - gpaw-al-surface
  - intermat-paper
  - intermat-nist-pdf
  - cc-by-3
media_ids:
  - surface-energy-ledger
review: docs/reviews/2026-08-04-surface-energy-and-work-function.md
reviewed_at: "2026-08-04"
---

A surface-energy table is reliable only when every large term in the subtraction remains inspectable. The primary data view here is an attributed three-row public snapshot: unreconstructed Si(111), Si(110), and Si(001) values reported by InterMat. A retained four-slab synthetic diagram then isolates the separate failure pattern in which a mismatched bulk reference causes thickness drift.

## Inspect a real published ledger before using the diagnostic

The open-access [InterMat paper](https://doi.org/10.1039/D4DD00031E) reports
OptB88vdW surface energies of `1.60`, `1.66`, and `2.22 J m⁻²` for the stored
Si(111), Si(110), and Si(001) rows. The committed CC BY 3.0 snapshot identifies
the source table, `JVASP-1002`, method label, units, and exact JSON hash. Its
companion checks those values and source identity without rerunning a slab.

Three orientations from one published table do not form a thickness series. They
cannot diagnose bulk drift, prove a termination or reconstruction, establish
convergence, or create a new ranking. The [NIST-hosted source PDF](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=957179) remains the authority for the reported computational and experimental context.

## Keep area, count, and energy units explicit

Each fixture row stores layer count, atom count, one-face area in Å², and slab energy in eV. The script uses two equivalent surfaces and converts eV Å⁻² to J m⁻² only after subtraction. For an asymmetric or nonstoichiometric slab, the same divisor would not assign a unique face energy.

The [GPAW aluminium-surface tutorial](https://gpaw.readthedocs.io/tutorialsexercises/basics/surface/surface.html) illustrates the two-face expression. Fiorentini and Methfessel's [linear slab-series construction](https://doi.org/10.1088/0953-8984/8/36/005) and Boettger's [nonconvergence analysis](https://doi.org/10.1103/PhysRevB.49.16798) motivate the fitted slope and drift diagnostic.

## Fit only one continuous slab family

The script fits `E_slab(N) = N e_bulk^fit + E_excess`. Its intercept is divided by `2A`; its slope is not promoted to a new bulk property. The fit is meaningful here because all rows deliberately share an invented surface identity and area. A real series must first exclude reconstruction, magnetism, stoichiometry, strain, or numerical-protocol switches.

It then shifts the fitted bulk slope by an invented `0.003 eV/atom`. The derived direct-subtraction values drift with atom count, visibly demonstrating why an internally converged bulk energy can still be incompatible with a slab series.

## Retain a bounded drift diagnostic

```text
python3 examples/practical-guides/surface_energy_ledger.py \
  --svg public/media/practical-guides/surface-energy-and-work-function/build-surface-energy-ledger/surface-energy-ledger.svg
```

The SVG is generated from the same in-file fixture used by `run()`. The red line is intentionally a failure pattern, while the horizontal fit intercept is the result of the bounded synthetic model. It supports the ledger logic but is not the source of the Si values above.

## What this guide verifies

The declared companion verifies the attributed InterMat snapshot, its SHA-256,
orientation order, licence, method label, and three reported surface-energy
values. The retained `surface_energy_ledger.py` separately verifies unit
conversion, the factor of two, linear-regression arithmetic, and the direction
of thickness drift under one deliberately perturbed bulk slope.

Execution success is not slab convergence for a real calculation. It establishes no new surface energy, reconstruction, termination ordering, bulk-reference accuracy, or material stability.

## Official sources

- [Fiorentini and Methfessel, convergent surface energies](https://doi.org/10.1088/0953-8984/8/36/005)
- [Boettger, thin-film surface-energy nonconvergence](https://doi.org/10.1103/PhysRevB.49.16798)
- [GPAW aluminium-surface tutorial](https://gpaw.readthedocs.io/tutorialsexercises/basics/surface/surface.html)
- [Choudhary and Garrity, InterMat](https://doi.org/10.1039/D4DD00031E)
- [NIST-hosted InterMat article PDF](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=957179)
- [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/)

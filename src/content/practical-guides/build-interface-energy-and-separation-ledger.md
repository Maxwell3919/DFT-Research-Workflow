---
topic_slug: interface-and-heterostructure-energetics
guide_slug: build-interface-energy-and-separation-ledger
title: Build an Interface-Energy and Separation Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Keep reservoir excess energy, constrained binding, and separation work as distinct, explicitly normalized energy cycles.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/interface_energy_ledger.py
source_ids:
  - interface-energy-review
  - zur-mcgill
media_ids:
  - interface-energy-ledger
review: docs/reviews/2026-08-04-interface-and-heterostructure-energetics.md
reviewed_at: "2026-08-04"
---

An interface result is easy to mislabel when the fragments and reservoirs are hidden. This fixture makes three distinct subtractions visible with invented energies. It contains no atomic structure and does not run DFT.

## Keep the denominators and reference states visible

The first ledger uses a periodic cell with two equivalent interfaces and subtracts invented reservoir energies before dividing by `2A`; that is an interface excess per area. A second subtraction uses isolated fragments held in the same matched cell, giving a constrained binding energy per area. A third separates the contact into explicitly stated cleavage fragments, giving a work of separation for that path.

Those labels cannot be interchanged merely because all values are reported in energy per area. The [interface-energy review](https://doi.org/10.1038/s41524-019-0160-9) discusses the reservoir dependence and thickness/strain issues behind the first quantity; the matching step remains a separate structural problem.

## Run the deterministic ledger

```text
python3 examples/practical-guides/interface_energy_ledger.py \
  --svg public/media/practical-guides/interface-and-heterostructure-energetics/build-interface-energy-and-separation-ledger/interface-energy-ledger.svg
```

The printed JSON records the invented combined, reservoir, matched-fragment, and cleavage-fragment terms together with interface count and area. A real calculation must replace the fixture only with hashes and state metadata for every matching term.

## What this guide verifies

Execution checks arithmetic, sign, area normalization, the two-interface denominator, and deterministic SVG rendering. It is not a DFT calculation, a convergence study, a proof of a stable interface, a work-of-fracture prediction, or evidence for a material conclusion.

## Official sources

- [Interface-energy review](https://doi.org/10.1038/s41524-019-0160-9)
- [Zur and McGill, lattice-match construction](https://doi.org/10.1063/1.333084)

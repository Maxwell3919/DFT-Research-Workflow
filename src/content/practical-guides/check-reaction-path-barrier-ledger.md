---
topic_slug: reaction-paths-and-transition-states
guide_slug: check-reaction-path-barrier-ledger
title: Check a Reaction-Path Barrier Ledger
kind: worked-example
tools:
  - python
status: reviewed
summary: Inspect invented image energies without confusing a plotted maximum with a validated saddle point.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/reaction_path_barrier_ledger.py
source_ids:
  - qe-neb-input
  - ase-neb
media_ids:
  - reaction-path-barrier-ledger
review: docs/reviews/2026-08-04-reaction-paths-and-transition-states.md
reviewed_at: "2026-08-04"
---

This deterministic fixture subtracts invented image energies from declared endpoint rows. It keeps the maximum as a **candidate** peak: no forces, coordinates, NEB tangent, or Hessian are available.

## Run the invented ledger

```text
python3 examples/practical-guides/reaction_path_barrier_ledger.py
```

## What this example does not establish

It verifies endpoint-referenced arithmetic and a labelled original SVG. It does not construct an NEB, relax images, locate or validate a saddle point, calculate a barrier for a material, calculate a rate, or establish a reaction mechanism.

## Official sources

- [Quantum ESPRESSO `neb.x` input description](https://www.quantum-espresso.org/Doc/INPUT_NEB.html)
- [ASE NEB documentation](https://docs.ase-lib.org/ase/neb.html)

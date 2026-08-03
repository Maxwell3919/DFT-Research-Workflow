---
topic_slug: anharmonic-phonons
guide_slug: check-anharmonic-linewidth-ledger
title: Check an Anharmonic Linewidth Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Keep invented on-shell channel weights separate from force constants, phonon lifetimes, and transport claims.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/anharmonic_linewidth_ledger.py
source_ids:
  - phono3py-workflow
  - phono3py-api
media_ids:
  - anharmonic-linewidth-ledger
review: docs/reviews/2026-08-04-anharmonic-phonons.md
reviewed_at: "2026-08-04"
---

This deterministic fixture multiplies invented squared interaction weights by invented on-shell phase-space weights. Its excluded off-shell row demonstrates a bookkeeping condition, not an energy-conservation calculation.

## Run the deterministic ledger

```text
python3 examples/practical-guides/anharmonic_linewidth_ledger.py \
  --svg public/media/practical-guides/anharmonic-phonons/check-anharmonic-linewidth-ledger/anharmonic-linewidth-ledger.svg
```

## What this guide verifies

Execution verifies invented channel arithmetic, an explicit excluded row, and original SVG rendering. It does not calculate forces, `fc2`, `fc3`, a self-energy, a phonon linewidth, a lifetime, a temperature-dependent spectrum, lattice thermal conductivity, or a scientific conclusion for a material.

## Official sources

- [Phono3py force-set and force-constant workflow](https://phonopy.github.io/phono3py/workflow.html)
- [Phono3py API reference](https://phonopy.github.io/phono3py/api-reference.html)

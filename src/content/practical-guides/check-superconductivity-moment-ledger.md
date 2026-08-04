---
topic_slug: conventional-superconductivity
guide_slug: check-superconductivity-moment-ledger
title: Check a Superconductivity Spectral-Moment Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Keep invented weighted spectral bookkeeping separate from alpha-squared-F construction and superconducting predictions.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/superconductivity_moment_ledger.py
source_ids:
  - qe-epc-coefficients
  - giustino-epc-review
media_ids:
  - superconductivity-moment-ledger
review: docs/reviews/2026-08-04-conventional-superconductivity.md
reviewed_at: "2026-08-04"
---

This deterministic fixture sums invented weighted logarithmic terms and keeps an excluded row visible. It labels `μ*` only as a model-dependent sensitivity input, not as a calculated or universal value.

## Run the deterministic ledger

```text
python3 examples/practical-guides/superconductivity_moment_ledger.py --svg public/media/practical-guides/conventional-superconductivity/check-superconductivity-moment-ledger/superconductivity-moment-ledger.svg
```

## What this guide verifies

It verifies invented weighted arithmetic, explicit exclusion, sensitivity labels, and original SVG rendering. It does not calculate `α²F(ω)`, `λ`, `ω_log`, a Coulomb kernel, an Eliashberg solution, a gap, `T_c`, superconductivity, or a material conclusion.

## Official sources

- [Quantum ESPRESSO PHonon guide](https://www.quantum-espresso.org/Doc/ph_user_guide/node10.html)
- [Giustino EPC review](https://doi.org/10.1103/RevModPhys.89.015003)

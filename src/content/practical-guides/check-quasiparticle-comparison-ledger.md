---
topic_slug: quasiparticle-corrections
guide_slug: check-quasiparticle-comparison-ledger
title: Check a Quasiparticle-Comparison Ledger
kind: worked-example
tools:
  - python
status: reviewed
summary: Reject a direct quasiparticle comparison when the stated starting point or screening model differs.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/quasiparticle_comparison_ledger.py
source_ids:
  - hedin-gw
  - hybertsen-louie-gw
  - abinit-gw1
media_ids:
  - quasiparticle-comparison-ledger
review: docs/reviews/2026-08-04-quasiparticle-corrections.md
reviewed_at: "2026-08-04"
---

This deterministic fixture uses invented metadata for two nominal quasiparticle records. It rejects a direct comparison when the starting state, GW update scheme, screening boundary model, or response representation differs.

## What this example does not establish

It does not run GW, construct `G`, `W`, `Σ`, or a dielectric matrix, solve a quasiparticle equation, calculate a band gap, establish convergence, validate a starting point, or support a material conclusion. Matching labels only makes a comparison interpretable in principle.

## Primary sources

- [Hedin, equations of motion](https://doi.org/10.1103/PhysRev.139.A796)
- [Hybertsen and Louie, GW method](https://doi.org/10.1103/PhysRevB.34.5390)
- [ABINIT GW tutorial](https://docs.abinit.org/tutorial/gw1/)

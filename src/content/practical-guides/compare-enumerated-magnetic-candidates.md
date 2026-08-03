---
topic_slug: magnetic-configuration-and-ground-state-comparison
guide_slug: compare-enumerated-magnetic-candidates
title: Compare an Enumerated Magnetic Candidate Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Preserve final moment patterns and common normalization while comparing invented magnetic candidates.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/magnetic_candidate_ledger.py
source_ids:
  - qe-pw-75
  - vasp-magmom
media_ids:
  - magnetic-candidate-ledger
review: docs/reviews/2026-08-04-magnetic-configuration-and-ground-state-comparison.md
reviewed_at: "2026-08-04"
---

This fixture compares invented, compatible collinear candidates. It retains the final local-moment map, which distinguishes a compensated AFM result from a nonmagnetic result even when both have zero net moment.

## Run the deterministic ledger

```text
python3 examples/practical-guides/magnetic_candidate_ledger.py \
  --svg public/media/practical-guides/magnetic-configuration-and-ground-state-comparison/compare-enumerated-magnetic-candidates/magnetic-candidate-ledger.svg
```

[Quantum ESPRESSO `pw.x`](https://www.quantum-espresso.org/Doc/INPUT_PW.html) documents starting and constrained magnetization. [VASP `MAGMOM`](https://vasp.at/wiki/MAGMOM) documents initial local moments, symmetry, and restart behaviour.

## What this guide verifies

Execution verifies deterministic invented-candidate comparison and SVG rendering. It does not converge magnetic states, identify an exhaustive candidate set, determine a magnetic ground state, calculate exchange interactions, predict a transition temperature, or establish a scientific conclusion.

## Official sources

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [VASP `MAGMOM`](https://vasp.at/wiki/MAGMOM)

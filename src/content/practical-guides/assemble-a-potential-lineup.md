---
topic_slug: electrostatic-potential-and-band-alignment
guide_slug: assemble-a-potential-lineup
title: Assemble an Explicit Potential-Lineup Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Use invented bulk reference terms and an interface step to keep a lineup equation auditable.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/potential_lineup_fixture.py
source_ids:
  - van-de-walle-martin-lineup
  - qe-pp-potential
media_ids:
  - potential-lineup-fixture
review: docs/reviews/2026-08-04-electrostatic-potential-and-band-alignment.md
reviewed_at: "2026-08-04"
---

The fixture combines invented bulk edge-to-reference differences and one invented interface reference step. It models the bookkeeping of a lineup, not a material interface.

## Run the deterministic ledger

```text
python3 examples/practical-guides/potential_lineup_fixture.py \
  --svg public/media/practical-guides/electrostatic-potential-and-band-alignment/assemble-a-potential-lineup/potential-lineup-fixture.svg
```

The [Van de Walle--Martin band-offset method](https://doi.org/10.1103/PhysRevB.35.8154) motivates the explicit interface term. [Quantum ESPRESSO `pp.x`](https://www.quantum-espresso.org/Doc/INPUT_PP.html) is cited only for potential-output context.

## What this guide verifies

Execution verifies deterministic invented-term arithmetic and SVG rendering. It does not calculate an electrostatic potential, vacuum plateau, interface dipole, band edge, band offset, Schottky barrier, or device property.

## Official sources

- [Van de Walle and Martin](https://doi.org/10.1103/PhysRevB.35.8154)
- [Quantum ESPRESSO `pp.x`](https://www.quantum-espresso.org/Doc/INPUT_PP.html)

---
topic_slug: electron-phonon-coupling
guide_slug: check-epc-channel-ledger
title: Check an Electron--Phonon Channel Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Keep invented weighted channel arithmetic separate from calculated EPC matrix elements and their derived observables.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/epc_channel_ledger.py
source_ids:
  - qe-ph-75
  - giustino-epc-review
media_ids:
  - epc-channel-ledger
review: docs/reviews/2026-08-04-electron-phonon-coupling.md
reviewed_at: "2026-08-04"
---

This deterministic fixture multiplies invented channel strengths and weights. A zero-weight row makes an excluded energy window explicit instead of silently treating it as a physical scattering result.

## Run the deterministic ledger

```text
python3 examples/practical-guides/epc_channel_ledger.py --svg public/media/practical-guides/electron-phonon-coupling/check-epc-channel-ledger/epc-channel-ledger.svg
```

Execution verifies invented arithmetic and SVG rendering. It does not calculate Kohn--Sham states, DFPT perturbations, an EPC matrix element, linewidth, `λ`, `α²F(ω)`, mobility, resistivity, or superconductivity.

## What this guide verifies

It verifies only the declared invented channel multiplication, the explicit excluded row, and the original SVG asset.

## Official sources

- [Quantum ESPRESSO `ph.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Giustino EPC review](https://doi.org/10.1103/RevModPhys.89.015003)

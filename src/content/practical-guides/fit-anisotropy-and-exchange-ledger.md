---
topic_slug: magnetic-anisotropy-and-exchange-interactions
guide_slug: fit-anisotropy-and-exchange-ledger
title: Fit an Anisotropy and Exchange Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Fit a deliberately invented directional-energy and two-site exchange ledger while retaining its sign, normalization, and model boundaries.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/anisotropy_exchange_ledger.py
source_ids:
  - qe-pw-75
  - vasp-magnetic-anisotropy
  - vasp-lsorbit
media_ids:
  - anisotropy-exchange-ledger
review: docs/reviews/2026-08-04-magnetic-anisotropy-and-exchange-interactions.md
reviewed_at: "2026-08-04"
---

This deterministic fixture separates two reductions of invented, compatible energies. Its directional entries use one fixed magnetic texture and define the easy direction only within that fixture. Its two-site entries use the explicitly written `H = -J e₁·e₂` convention, so a positive fitted `J` favours parallel moments. They are not outputs from an electronic-structure engine.

## Run the deterministic ledger

```text
python3 examples/practical-guides/anisotropy_exchange_ledger.py \
  --svg public/media/practical-guides/magnetic-anisotropy-and-exchange-interactions/fit-anisotropy-and-exchange-ledger/anisotropy-exchange-ledger.svg
```

[Quantum ESPRESSO `pw.x`](https://www.quantum-espresso.org/Doc/INPUT_PW.html) documents noncollinear and spin--orbit input variables. [VASP's magnetic-anisotropy note](https://vasp.at/wiki/Determining_the_Magnetic_Anisotropy) and [`LSORBIT` page](https://vasp.at/wiki/LSORBIT) describe SOC directional calculations and their sensitivity.

## What this guide verifies

Execution verifies arithmetic, sign convention, normalization labels, held-out energy reconstruction, and original SVG rendering for invented values. It does not converge SOC total energies, calculate MAE or exchange interactions for a material, establish an easy axis, validate a Heisenberg model, predict a transition temperature, or establish a scientific conclusion.

## Official sources

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [VASP: Determining the Magnetic Anisotropy](https://vasp.at/wiki/Determining_the_Magnetic_Anisotropy)
- [VASP `LSORBIT`](https://vasp.at/wiki/LSORBIT)

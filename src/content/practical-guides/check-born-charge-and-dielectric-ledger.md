---
topic_slug: dielectric-response-and-born-effective-charges
guide_slug: check-born-charge-and-dielectric-ledger
title: Check a Born-Charge and Dielectric Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Test invented Born-charge acoustic-sum closure and separate invented ion-clamped from static dielectric tensors.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/born_charge_dielectric_ledger.py
source_ids:
  - qe-ph-75
  - vasp-born-effective-charges
  - vasp-electric-field-dfpt
media_ids:
  - born-charge-dielectric-ledger
review: docs/reviews/2026-08-04-dielectric-response-and-born-effective-charges.md
reviewed_at: "2026-08-04"
---

This fixture uses invented tensor entries for a two-sublattice insulating teaching model. It verifies the stated index convention, componentwise acoustic-sum closure, and the arithmetic decomposition `ε₀ = ε∞ + ε_ion`. It neither applies an electric field nor solves a DFPT response equation.

## Run the deterministic ledger

```text
python3 examples/practical-guides/born_charge_dielectric_ledger.py \
  --svg public/media/practical-guides/dielectric-response-and-born-effective-charges/check-born-charge-and-dielectric-ledger/born-charge-dielectric-ledger.svg
```

[Quantum ESPRESSO `ph.x`](https://www.quantum-espresso.org/Doc/INPUT_PH.html) documents the dielectric and effective-charge response flags. [VASP's Born-effective-charge documentation](https://vasp.at/wiki/Born_effective_charges) states the force/field convention and index-order caveat; [its electric-field DFPT page](https://vasp.at/wiki/Electric_field_response_from_density-functional-perturbation_theory) describes the linear-response scope.

## What this guide verifies

Execution verifies invented tensor arithmetic, acoustic-sum closure, named ion-clamped and ionic terms, and original SVG rendering. It does not compute dielectric response, Born effective charges, polarization branches, phonons, LO--TO splitting, polar stability, or a scientific conclusion for any material.

## Official sources

- [Quantum ESPRESSO `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [VASP Born effective charges](https://vasp.at/wiki/Born_effective_charges)
- [VASP electric-field DFPT response](https://vasp.at/wiki/Electric_field_response_from_density-functional-perturbation_theory)

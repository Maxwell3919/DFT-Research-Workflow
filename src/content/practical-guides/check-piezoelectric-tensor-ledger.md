---
topic_slug: piezoelectric-response
guide_slug: check-piezoelectric-tensor-ledger
title: Check a Piezoelectric Tensor Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Separate invented clamped-ion and internal piezoelectric terms before applying an invented compliance conversion.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/piezoelectric_tensor_ledger.py
source_ids:
  - vasp-electric-field-dfpt
  - vasp-linear-response
  - qe-ph-75
media_ids:
  - piezoelectric-tensor-ledger
review: docs/reviews/2026-08-04-piezoelectric-response.md
reviewed_at: "2026-08-04"
---

**Evidence class: synthetic-only.** This deterministic ledger uses invented piezoelectric entries in a declared local Voigt convention. It verifies the arithmetic $e=e^{\mathrm{clamped}}+e^{\mathrm{internal}}$ and then applies an explicitly invented compliance factor to show why a converted $d$ coefficient requires a separately declared elastic input. No number is a material property.

## Use this only as an arithmetic fixture

There is no crystal structure, tensor orientation, deformation series, polarization branch, or real software output in this page. For a material calculation, first open the structure with its axes visible, inspect positive and negative strains, compare clamped and internally relaxed geometries, and plot the real response components before converting between $e$ and $d$. The [electronic-property resource landscape](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties) lists actual response routes.

### Optional automation: run the invented ledger

```text
python3 examples/practical-guides/piezoelectric_tensor_ledger.py \
  --svg public/media/practical-guides/piezoelectric-response/check-piezoelectric-tensor-ledger/piezoelectric-tensor-ledger.svg
```

## What this guide verifies

Execution verifies invented componentwise arithmetic, a locally named Voigt convention, invented compliance conversion, and original SVG rendering. It does not calculate a piezoelectric tensor, elastic compliance, polarization branch, response convergence, material response, or device coefficient.

## Official sources

- [VASP electric-field DFPT response](https://vasp.at/wiki/Electric_field_response_from_density-functional-perturbation_theory)
- [VASP linear response](https://vasp.at/wiki/Linear_response)
- [Quantum ESPRESSO `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)

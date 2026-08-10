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
media_ids: []
review: docs/reviews/2026-08-04-piezoelectric-response.md
reviewed_at: "2026-08-04"
---

**Evidence class: synthetic-only.** This deterministic ledger uses invented piezoelectric entries in a declared local Voigt convention. It verifies the arithmetic $e=e^{\mathrm{clamped}}+e^{\mathrm{internal}}$ and then applies an explicitly invented compliance factor to show why a converted $d$ coefficient requires a separately declared elastic input. No number is a material property.

Do not use this ledger as the first action for a material. First open the crystal with labelled axes in [VESTA](/DFT-Research-Workflow/tools/vesta/) or another structure viewer; save positive and negative strain or field inputs, their clamped-ion and internally relaxed outputs, the polarization-branch record, and the separately qualified elastic compliance. Tabulate every response component with units, tensor convention, sign, and source file before doing the arithmetic below.

## Optional toy after the real tensor series exists

This page contains no real response series. Plot the real clamped and relaxed components before converting between $e$ and $d$; the [electronic-property resource landscape](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties) lists calculation routes.

### Optional replay of the invented ledger

```bash
python3 examples/practical-guides/piezoelectric_tensor_ledger.py \
  --svg public/media/practical-guides/piezoelectric-response/check-piezoelectric-tensor-ledger/piezoelectric-tensor-ledger.svg
```

## What this guide verifies

Execution verifies invented componentwise arithmetic, a locally named Voigt convention, invented compliance conversion, and original SVG rendering. It does not calculate a piezoelectric tensor, elastic compliance, polarization branch, response convergence, material response, or device coefficient.

If this script fails, repair only the local fixture or its declared convention. In a real response series, a branch jump, inconsistent relaxed geometry, broken positive/negative symmetry, axis mismatch, or unqualified compliance is a parent-evidence failure; do not conceal it with tensor conversion or component averaging.

## Official sources

- [VASP electric-field DFPT response](https://vasp.at/wiki/Electric_field_response_from_density-functional-perturbation_theory)
- [VASP linear response](https://vasp.at/wiki/Linear_response)
- [Quantum ESPRESSO `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)

---
topic_slug: elastic-constants-and-mechanical-properties
guide_slug: check-strain-stress-ledger
title: Check a Strain--Stress Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Compare invented signed strain--stress rows against an explicitly declared cubic stiffness model and retain a fit residual.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/strain_stress_ledger.py
source_ids:
  - nielsen-martin-stress
  - mouhat-elastic-stability
  - vasp-phonons-finite-differences
media_ids:
  - strain-stress-ledger
review: docs/reviews/2026-08-04-elastic-constants-and-mechanical-properties.md
reviewed_at: "2026-08-04"
---

**Evidence class: synthetic-only.** This fixture uses invented signed uniaxial strain and stress rows in one declared component convention. It verifies a least-squares slope, signed-strain symmetry, and the cubic stability inequalities for the invented matrix. It does not calculate a stress tensor or infer a material response.

## Use this only as an arithmetic fixture

There is no reference crystal, deformed structure, stress output, or material-specific symmetry decision in this page. A real workflow opens the reference and representative signed-strain cells, confirms the axes and Voigt convention, inspects internal relaxation, and plots energy and stress against strain before fitting. The [electronic-property and response resources](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties) provide routes for real calculations.

### Optional automation: run the invented ledger

```text
python3 examples/practical-guides/strain_stress_ledger.py \
  --svg public/media/practical-guides/elastic-constants-and-mechanical-properties/check-strain-stress-ledger/strain-stress-ledger.svg
```

[Nielsen and Martin](https://doi.org/10.1103/PhysRevB.32.3780) provide the stress formalism. [Mouhat and Coudert](https://doi.org/10.1103/PhysRevB.90.224104) summarize symmetry-specific elastic-stability conditions, and [VASP's finite-difference documentation](https://vasp.at/wiki/Phonons_from_finite_differences) distinguishes clamped and ion-relaxed moduli.

## What this guide verifies

Execution verifies invented ledger arithmetic, an explicit units label, signed-strain fit closure, the selected cubic inequalities, and original SVG rendering. It does not converge stress, calculate elastic constants for any material, validate a crystal class, establish mechanical or dynamical stability, predict strength or fracture, or establish a scientific conclusion.

## Official sources

- [Nielsen and Martin, stress and force](https://doi.org/10.1103/PhysRevB.32.3780)
- [Mouhat and Coudert, elastic stability](https://doi.org/10.1103/PhysRevB.90.224104)
- [VASP finite-difference phonons and elastic moduli](https://vasp.at/wiki/Phonons_from_finite_differences)

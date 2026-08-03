---
topic_slug: equation-of-state-and-structural-phase-stability
guide_slug: fit-and-challenge-equation-of-state
title: Fit and Challenge an Equation of State
kind: worked-example
tools:
  - python
  - ase
status: reviewed
summary: Fit one synthetic energy–volume dataset with Birch–Murnaghan, Murnaghan, and Vinet forms over two windows, preserving units and model spread.
tested_versions:
  - Python 3.12
  - ASE 3.29.0
execution_script: examples/practical-guides/eos_fit_sensitivity.py
source_ids:
  - ase-equation-of-state
  - birch-eos
  - murnaghan-eos
  - vinet-eos
media_ids:
  - eos-fit-sensitivity
review: docs/reviews/2026-08-03-equation-of-state-and-structural-phase-stability.md
reviewed_at: "2026-08-03"
---

This worked example generates one invented energy–volume table from a Birch–Murnaghan expression and adds small deterministic perturbations. It then asks how much the reported parameters change when the fit form or volume window changes.

## Keep generating data and fitted results distinct

The fixture uses nine volumes from `34` to `46 Å³` per abstract A2B2 cell. Its generating values are invented and exist only to make regression assertions reproducible. They are not material properties or recommended sampling limits.

```python
from eos_fit_sensitivity import run

report = run()
print(report["full_window_fits"])
print(report["narrow_window_fits"])
```

ASE's `EquationOfState` returns equilibrium volume and energy plus bulk modulus in eV/Å³. The script converts the modulus to GPa with the pinned ASE unit constant and retains both units.

## Compare forms on the same points

The full-window Birch–Murnaghan, Murnaghan, and Vinet fits all recover an equilibrium volume near the invented `40 Å³` minimum, but they are not identical. The fixture records a nonzero spread in both volume and bulk modulus.

Similarity is expected here because the data were generated from a smooth nearby form with very small perturbations. A real dataset can show much larger disagreement when its range is broad, its noise is structured, or its branch changes state.

## Change the window without changing the claim

The script repeats all three fits on the five central points. A narrow window may constrain the immediate curvature while weakening higher-order pressure behaviour; a wide window may reveal model inadequacy or include a branch change. Neither is automatically superior.

For a real study, inspect pointwise residuals, fitted-parameter covariance, endpoint leverage, alternative defensible forms, and convergence of the target observable. If the goal is a phase boundary, propagate every accepted fit through the enthalpy comparison rather than selecting a curve by appearance.

## What this example does not establish

The example does not run DFT, validate an energy–volume series, recommend a fit form or volume range, calculate a physical equilibrium volume or bulk modulus, calibrate pressure, establish elastic or phonon stability, or predict a phase transition.

It demonstrates deterministic fitting, native-unit handling, and model/window sensitivity only.

## Official and primary sources

- [ASE equation-of-state documentation](https://docs.ase-lib.org/ase/eos.html)
- [Birch, finite elastic strain of cubic crystals](https://doi.org/10.1103/PhysRev.71.809)
- [Murnaghan, compressibility under extreme pressures](https://doi.org/10.1073/pnas.30.9.244)
- [Vinet and co-workers, compressibility of solids](https://doi.org/10.1029/JB092iB09p09319)

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

## View the sampled structures and challenge the curve visually

Before fitting, open structures across the sampled volume range and check for symmetry changes, magnetic-state changes, or unintended internal-coordinate behaviour. Plot the raw energies, all fitted curves, and residuals; then change the fit window and compare predicted minima and bulk moduli. A spreadsheet or notebook is appropriate for this human comparison, while [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning) provide structural and reference context.

**Audit the stored fixture:** the energy-volume points and fitted figure are synthetic teaching data. The companion script tests model and window sensitivity only; no material equation of state or phase stability follows.

Use this fixture after a traceable energy-volume table has passed branch and convergence checks. It fits one invented table with several forms and windows so model spread remains visible.

Inspect the report from the companion-script directory:

```bash
cd examples/practical-guides
python3 - <<'PY'
from eos_fit_sensitivity import run

report = run()
print(report["full_window_fits"])
print(report["narrow_window_fits"])
PY
```

The report contains fitted equilibrium volumes, energies, bulk moduli, unit conversions, and the difference between fit choices. It does not contain a material property.

## Confirm the input object

The fixture uses nine volumes from $34$ to $46\ \text{\AA}^3$ per abstract A2B2 cell. The energies were generated from a Birch-Murnaghan expression with small deterministic perturbations. These are regression data, not recommended sampling bounds.

For a real table, confirm that the minimum is bracketed, each point belongs to one structural and electronic branch, energies use one normalization, and numerical noise is below the precision required for the target parameter.

## Compare forms and windows

The script applies Birch-Murnaghan, Murnaghan, and Vinet fits to the same full window, then repeats them on five central points. ASE returns the modulus in eV per cubic angstrom; the script preserves that value and converts it to GPa with the pinned ASE unit constant.

Inspect the pointwise residuals and parameter spread, not only one minimum. A narrow window may describe local curvature while poorly constraining pressure behaviour. A broad window may reveal model failure or include a branch change.

For production work, retain the form, range, weights, covariance or resampling estimate, endpoint leverage, code version, residuals, and unit conversion. If the target is a phase boundary, carry every accepted fit into the common-pressure enthalpy comparison.

## Claim boundary

Accept a fitted parameter only when it is stable under defensible numerical, fit-form, and fit-window changes and remains inside the sampled range. If $V_0$, $B_0$, or the intended pressure interval changes materially, collect better points or narrow the claim.

The fixture demonstrates deterministic fitting and sensitivity only. It does not run DFT, validate the point series, select a universally preferred EOS, calculate a physical equilibrium volume or modulus, establish elastic or phonon stability, or predict a transition.

## Official and primary sources

- [ASE equation-of-state documentation](https://docs.ase-lib.org/ase/eos.html)
- [Birch, finite elastic strain of cubic crystals](https://doi.org/10.1103/PhysRev.71.809)
- [Murnaghan, compressibility under extreme pressures](https://doi.org/10.1073/pnas.30.9.244)
- [Vinet and co-workers, compressibility of solids](https://doi.org/10.1029/JB092iB09p09319)

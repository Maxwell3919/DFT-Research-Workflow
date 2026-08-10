---
topic_slug: equation-of-state-and-structural-phase-stability
guide_slug: compare-phase-enthalpies-common-pressure
title: Compare Phase Enthalpies at Common Pressure
kind: worked-example
tools:
  - python
  - ase
status: reviewed
summary: Minimize two invented phase branches at the same pressure, preserve the pV contribution, and locate a synthetic enthalpy crossing without making a stability claim.
tested_versions:
  - Python 3.12
  - ASE 3.29.0
execution_script: examples/practical-guides/eos_phase_enthalpy.py
source_ids:
  - iupac-enthalpy
  - vinet-eos
  - mouhat-elastic-stability
  - phonopy-qha
media_ids:
  - common-pressure-enthalpy-crossing
review: docs/reviews/2026-08-03-equation-of-state-and-structural-phase-stability.md
reviewed_at: "2026-08-03"
---

## Plot both branches and inspect their structures

A real comparison starts by opening the competing phase structures, checking their state identities, and plotting each energy-volume or enthalpy-pressure branch over the same range. At a chosen pressure, inspect the minimizing volume on both branches and the pressure-volume contribution before locating a crossing. Compare the pressure range and phase candidates with the relevant literature through [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning).

**Audit the stored fixture:** both phase branches and the crossing figure are invented conceptual data. The companion script tests common-pressure bookkeeping only; it cannot support a phase boundary or stability claim for a material.

Use this fixture after two phase branches have been fitted over a common supported pressure interval. It checks the common-pressure operation with invented analytic alpha and beta branches; it is not a material calculation.

Inspect the report from the companion-script directory:

```bash
cd examples/practical-guides
python3 - <<'PY'
from eos_phase_enthalpy import run

report = run()
print(report["crossing_pressure_gpa"])
print(report["common_pressure_samples"])
PY
```

The output contains the fixture crossing and sampled enthalpy records. Inspect both branches, not only the reported crossing.

## Minimize each phase independently

At every external pressure $p$, evaluate

$$
H_i(p)=\min_V\left[E_i(V)+pV\right].
$$

Alpha and beta normally minimize at different volumes. They must use the same pressure, energy convention, and cell or formula-unit normalization. The fixture converts GPa to eV per cubic angstrom with ASE 3.29.0 before adding $pV$.

Confirm in each sample that the pressure is common, the minimizing volume is phase-specific, and $pV$ has energy units. Comparing both phases at one arbitrary common volume is not this calculation.

## Locate and challenge the crossing

The invented beta branch begins $0.08$ eV per abstract cell above alpha at zero pressure but has a smaller equilibrium volume. In the fixture it is lower in enthalpy by 6 GPa, and bisection finds equality near 2.6209 GPa.

Treat that value as a regression target. For real phase curves, repeat the minimization across accepted EOS forms, fit windows, numerical settings, and candidate branches. A crossing is usable only when both minimizing volumes lie inside supported data ranges and each phase retains its intended structural and electronic identity.

## Claim boundary

A crossing satisfies

$$
H_\alpha(p_t)=H_\beta(p_t)
$$

for the represented branches. Report the accepted pressure range, both minimizing volumes, phase-set scope, and sensitivity. If a third phase lies lower, or fit and numerical variation are comparable to the claimed resolution, the two-phase transition is unresolved or pre-empted.

The fixture contains no DFT run, pathway, barrier, nucleation model, phonons, elastic tensor, finite-temperature contribution, or experimental pressure calibration. It verifies common-pressure minimization, unit conversion, bracketing, and sign change only.

## Official and primary sources

- [IUPAC definition of enthalpy](https://goldbook.iupac.org/terms/view/H02752)
- [Vinet and co-workers, compressibility of solids](https://doi.org/10.1029/JB092iB09p09319)
- [Mouhat and Coudert, elastic stability conditions](https://doi.org/10.1103/PhysRevB.90.224104)
- [Phonopy quasiharmonic documentation](https://phonopy.github.io/phonopy/qha.html)

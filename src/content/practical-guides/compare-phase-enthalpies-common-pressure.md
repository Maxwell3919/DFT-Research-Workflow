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

This worked example uses two invented analytic branches. Alpha has lower energy at zero pressure; beta has a smaller equilibrium volume. The example determines when the `pV` advantage of the denser branch outweighs its zero-pressure energy offset.

## Minimize each branch at the same pressure

For phase `i`, the fixture evaluates

```text
H_i(p) = min_V [E_i(V) + pV]
```

The analytic quadratic branches make the minimizing volume available exactly. Pressure in GPa is converted to eV/Å³ with ASE 3.29.0 before forming `pV`, so energy, pressure, and volume share one unit system.

```python
from eos_phase_enthalpy import run

report = run()
print(report["crossing_pressure_gpa"])
print(report["common_pressure_samples"])
```

At every sampled pressure, alpha and beta use different minimizing volumes but the same external pressure. Comparing both phases at one arbitrary common volume would answer a different question.

## Locate the fixture crossing

At zero pressure, beta is higher by the invented `0.08 eV` per abstract cell. At `6 GPa`, beta has lower fixture enthalpy. Bisection locates equality near `2.6209 GPa` for these analytic parameters.

That number is a deterministic test target, not a prediction. A real crossing inherits uncertainty from energy convergence, fit form, phase identity, sampled range, pressure conversion, and the completeness of the candidate set.

## Read equilibrium and metastability separately

The lower enthalpy among two represented branches defines only their equilibrium ordering in this zero-temperature fixture. The calculation contains no pathway, barrier, nucleation model, phonons, elastic tensor, competing third phase, temperature contribution, or experimental pressure scale.

A branch may remain locally metastable beyond an enthalpy crossing, or disappear before it. Neither event changes the mathematical equality condition, but both affect what a real compression experiment or relaxation path might observe.

## What this example does not establish

The example does not execute DFT, validate phase curves, predict a material transition, establish coexistence or hysteresis, prove mechanical or dynamical stability, include finite-temperature free energies, or support an experimental phase assignment.

It verifies common-pressure enthalpy minimization, unit conversion, crossing bracketing, and sign changes for two invented branches only.

## Official and primary sources

- [IUPAC definition of enthalpy](https://goldbook.iupac.org/terms/view/H02752)
- [Vinet and co-workers, compressibility of solids](https://doi.org/10.1029/JB092iB09p09319)
- [Mouhat and Coudert, elastic stability conditions](https://doi.org/10.1103/PhysRevB.90.224104)
- [Phonopy quasiharmonic documentation](https://phonopy.github.io/phonopy/qha.html)

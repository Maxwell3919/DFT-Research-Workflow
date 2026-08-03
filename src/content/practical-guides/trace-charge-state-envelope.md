---
topic_slug: defect-formation-energies-and-charge-states
guide_slug: trace-charge-state-envelope
title: Trace a Charge-State Envelope and Neutrality Root
kind: worked-example
tools:
  - python
status: reviewed
summary: Find lower-envelope charge states, thermodynamic transition levels, a skipped intermediate state, and one self-consistent toy Fermi level.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/defect_charge_state_envelope.py
source_ids:
  - van-de-walle-neugebauer-defects
  - freysoldt-defects
  - imperfections-not-zero-k
  - py-sc-fermi
  - doped-thermodynamics
media_ids:
  - defect-charge-state-envelope
review: docs/reviews/2026-08-04-defect-formation-energies-and-charge-states.md
reviewed_at: "2026-08-04"
---

This worked example starts from four invented formation-energy intercepts in an abstract `3 eV` band gap. It separates three operations that are often conflated: drawing all charge-state lines, finding the thermodynamic lower envelope, and solving a charge-neutrality equation for one declared statistical model.

## Intersect the lower envelope, not every pair

The four lines have slopes `+2`, `+1`, `0`, and `−1`. The `+2` and neutral states cross at the fixture level `0.6 eV` above the VBM; the neutral and `−1` states cross at `1.7 eV`. The `+1` line intersects other lines but never reaches the lower envelope.

```python
from defect_charge_state_envelope import run

report = run()
print(report["thermodynamic_transition_levels_eV_above_vbm"])
print(report["charge_state_plus1_on_lower_envelope"])
```

The skipped `+1` state illustrates negative-`U` envelope geometry. It does not establish a physical negative-`U` centre because the fixture has no calculated structures, charge densities, or relaxation energies. [Van de Walle and Neugebauer](https://doi.org/10.1063/1.1682673) define thermodynamic transition levels through relaxed charge-state total energies, while the broader [point-defect review](https://doi.org/10.1103/RevModPhys.86.253) details the numerical and physical requirements.

## Solve neutrality with all assumptions exposed

The fixture then assigns an invented temperature, eligible-site density, band effective densities of states, and fixed ionized-donor concentration. For every trial `E_F`, it evaluates dilute Boltzmann populations for all four charge states plus nondegenerate electron and hole concentrations. Bisection solves

```text
Σ_q q c_q(E_F) + p(E_F) + N_D^+ - n(E_F) = 0
```

The resulting fixture root is approximately `2.455 eV` above the VBM. It is not obtained by selecting the lowest formation-energy line, and it is not a universal pinning level. Changing any defect intercept, missing defect, degeneracy, site density, band density of states, dopant population, temperature, or chemical-potential condition changes the root.

The finite-temperature review [Imperfections are not 0 K](https://doi.org/10.1039/D3CS00432E) explains the free-energy contributions hidden by a static-energy approximation. The [py-sc-fermi paper](https://doi.org/10.21105/joss.04962) documents a production tool for self-consistent defect, carrier, and Fermi-level calculations; [doped](https://doped.readthedocs.io/en/stable/doped.thermodynamics.html) exposes corresponding defect-thermodynamics objects and terms.

## Rebuild the visual

Run:

```text
python3 examples/practical-guides/defect_charge_state_envelope.py \
  --svg public/media/practical-guides/defect-formation-energies-and-charge-states/trace-charge-state-envelope/defect-charge-state-envelope.svg
```

The thick black segments are the thermodynamic envelope. The dashed `q = +1` line remains visible as an excluded equilibrium state, and the orange vertical line marks the separate toy neutrality solution. The image therefore does not equate a transition level with an equilibrium Fermi level.

## What this example does not establish

The example does not execute DFT, validate a band gap or VBM, identify a real defect, demonstrate negative-`U` physics, calculate a finite-temperature free energy, establish a dilute limit, or predict a carrier or defect concentration. Its energies, densities, degeneracies, donor population, and temperature are invented regression fixtures. It verifies line slopes, lower-envelope selection, transition arithmetic, and one bracketed neutrality solve only.

## Official sources

- [Van de Walle and Neugebauer, defect methodology](https://doi.org/10.1063/1.1682673)
- [Freysoldt, Neugebauer, and Van de Walle review](https://doi.org/10.1103/RevModPhys.86.253)
- [Mosquera-Lois and co-workers, finite-temperature defect free energies](https://doi.org/10.1039/D3CS00432E)
- [py-sc-fermi](https://doi.org/10.21105/joss.04962)
- [doped thermodynamics API](https://doped.readthedocs.io/en/stable/doped.thermodynamics.html)

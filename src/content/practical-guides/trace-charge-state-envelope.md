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
media_ids: []
review: docs/reviews/2026-08-04-defect-formation-energies-and-charge-states.md
reviewed_at: "2026-08-04"
---

## Inspect the defect identity behind every line

For a real defect, open the relaxed structure and charge or spin density for each charge state, check that the same defect configuration persists, and mark the host band edges and allowed Fermi-level range. Plot the formation-energy lines with chemical-potential and correction conventions stated, then inspect the lower envelope and any skipped state manually. Use [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), [specialist defect tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools), and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning).

**Optional envelope check:** the transition levels and self-consistent Fermi-level example are deliberately synthetic. Use the script only after real charge-state structures and corrections have passed inspection; it contains no defect geometry, localization evidence, or material transition level.

Use this example only after charge-state intercepts and slopes have been assembled and checked. It separates three operations: draw every line, select the thermodynamic lower envelope, and solve one declared charge-neutrality model. All inputs describe an invented defect in an abstract 3 eV gap.

From the repository root, run:

```bash
python3 examples/practical-guides/defect_charge_state_envelope.py
```

Inspect the report for transition levels, lower-envelope membership, and neutrality-root bracketing.

## Select only lower-envelope crossings

The four fixture lines have slopes $+2$, $+1$, $0$, and $-1$. The $+2$ and neutral states cross at $0.6\ \mathrm{eV}$ above the VBM; the neutral and $-1$ states cross at $1.7\ \mathrm{eV}$. The `+1` line intersects other lines but never reaches the lower envelope.

Confirm both `thermodynamic_transition_levels_eV_above_vbm` and `charge_state_plus1_on_lower_envelope` in the printed report. A pairwise intersection above a lower third state is not a thermodynamic transition. The skipped `+1` state demonstrates negative-$U$ envelope geometry in the fixture; it is not evidence for a physical negative-$U$ centre without calculated structures, localization, relaxations, and converged corrections.

## Solve neutrality as a separate operation

For each trial $E_F$, the fixture evaluates dilute defect populations, nondegenerate carriers, and a fixed ionized-donor population, then solves

$$
\sum_q q\,c_q(E_F)
+p(E_F)+N_{\mathrm D}^{+}-n(E_F)=0.
$$

Bisection returns a fixture root near $2.455\ \mathrm{eV}$ above the VBM. Check that the root is bracketed and the residual meets the script criterion. Do not obtain a Fermi level by selecting the lowest line at one convenient coordinate.

For a real model, record temperature, eligible-site densities, degeneracies, band densities of states, all defect and dopant species, chemical-potential conditions, and any frozen-in populations. Missing defects or a different thermal history can move the solution.

## Claim boundary

The thick envelope, dashed excluded `q = +1` line, and neutrality marker represent different derived objects. A transition level is not an equilibrium Fermi level.

This fixture verifies line slopes, lower-envelope selection, transition arithmetic, and one bracketed neutrality solve. It does not execute DFT, validate the band gap or VBM, identify a real defect, prove negative-$U$ physics, establish a dilute limit, calculate finite-temperature free energies, or predict concentrations.

## Official sources

- [Van de Walle and Neugebauer, defect methodology](https://doi.org/10.1063/1.1682673)
- [Freysoldt, Neugebauer, and Van de Walle review](https://doi.org/10.1103/RevModPhys.86.253)
- [Mosquera-Lois and co-workers, finite-temperature defect free energies](https://doi.org/10.1039/D3CS00432E)
- [py-sc-fermi](https://doi.org/10.21105/joss.04962)
- [doped thermodynamics API](https://doped.readthedocs.io/en/stable/doped.thermodynamics.html)

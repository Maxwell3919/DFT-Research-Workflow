---
topic_slug: adsorption-energies
guide_slug: build-adsorption-energy-ledger
title: Build an Adsorption-Energy and Free-Energy Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Make the reaction, sign, normalization, coverage convention, and thermodynamic corrections explicit before interpreting an adsorption number.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/adsorption_energy_ledger.py
source_ids:
  - cmr-adsorption-paper
  - campbell-adsorbate-entropy
  - campbell-entropy-correction
  - norskov-che
  - reuter-surface-thermodynamics
media_ids:
  - adsorption-energy-ledger
review: docs/reviews/2026-08-04-adsorption-energies.md
reviewed_at: "2026-08-04"
---

An adsorption calculation becomes interpretable only after the energy subtraction is written as a balanced reaction. This guide uses invented totals to make that bookkeeping visible; it does not suggest input parameters or calculate a material.

## Start from a written reaction

The script evaluates `CO(g) + * → CO*` with a products-minus-reactants convention. Its three static terms produce `-0.80 eV per CO`. It separately evaluates `H2(g) + 2* → 2H*` and divides the reaction energy by two only after the stoichiometry is balanced.

The [CMR benchmark paper](https://doi.org/10.1021/acs.jpcc.7b12258) uses explicit gas-phase reference reactions for several molecular and dissociative adsorbates. The same discipline applies to a private calculation: record the clean slab, combined state, every reservoir, coefficient, unit, and sign before subtraction.

## Keep average and differential values separate

The invented one- and two-CO totals give an average adsorption energy of `-0.60 eV per CO` at `N=2`, but the second addition is only `-0.40 eV`. Both values are correct for their definitions. The difference is the information: the next adsorption event is less favourable in this fixture.

Do not compare the average at one coverage with the differential value at another. A coverage label also needs its denominator—site fraction, surface atom, cell, or area—because the same decimal can represent different physical layers.

## Add free-energy terms once

The final ledger adds invented zero-point, thermal-enthalpy, entropy, and environment terms to the static energy. The purpose is to show placement and units, not to provide reusable correction values. [Campbell and Sellers](https://doi.org/10.1021/ja3080117), together with their [published correction](https://doi.org/10.1021/ja407293b), show why adsorbate entropy cannot be assumed negligible.

Gas reservoirs can instead enter through chemical potentials, as in [Reuter and Scheffler's surface thermodynamics](https://doi.org/10.1103/PhysRevB.65.035406). For electrochemical proton–electron steps, the [computational hydrogen electrode paper](https://doi.org/10.1021/jp047349j) defines an additional thermodynamic transformation. Neither approach licenses double-counting a gas chemical potential, entropy term, solvation correction, or electrode-potential term.

## Run the deterministic fixture

```text
python3 examples/practical-guides/adsorption_energy_ledger.py \
  --svg public/media/practical-guides/adsorption-energies/build-adsorption-energy-ledger/adsorption-energy-ledger.svg
```

The JSON output exposes every input term, the molecular and dissociative normalizations, the average and differential coverage values, and the free-energy sum. Replace the invented data only after defining an equivalent schema for real calculations and preserving the source-output hashes.

## What this guide verifies

Execution verifies reaction arithmetic, sign convention, per-adsorbate normalization, average-versus-differential distinction, additive free-energy bookkeeping, and deterministic SVG rendering for the fixture. Execution success is not adsorption-energy convergence, thermodynamic accuracy, or validation of a real surface, adsorbate, entropy model, solvent, pressure, or electrode condition.

## Official sources

- [Schmidt and Thygesen, adsorption benchmark reactions](https://doi.org/10.1021/acs.jpcc.7b12258)
- [Campbell and Sellers, adsorbate entropy](https://doi.org/10.1021/ja3080117)
- [Correction to the adsorbate-entropy paper](https://doi.org/10.1021/ja407293b)
- [Nørskov and co-workers, computational hydrogen electrode](https://doi.org/10.1021/jp047349j)
- [Reuter and Scheffler, atomistic surface thermodynamics](https://doi.org/10.1103/PhysRevB.65.035406)

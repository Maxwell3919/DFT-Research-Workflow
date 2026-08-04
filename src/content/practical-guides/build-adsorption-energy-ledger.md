---
topic_slug: adsorption-energies
guide_slug: build-adsorption-energy-ledger
title: Build an Adsorption-Energy and Free-Energy Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Inspect an attributed CO/surface reaction ledger before using synthetic normalization and free-energy bookkeeping examples.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/adsorption_ledger_cmr.py
source_ids:
  - cmr-adsorption-paper
  - campbell-adsorbate-entropy
  - campbell-entropy-correction
  - norskov-che
  - reuter-surface-thermodynamics
  - cmr-adsorption-page
  - cmr-adsorption-db
  - cmr-data-license
media_ids:
  - adsorption-energy-ledger
review: docs/reviews/2026-08-04-adsorption-energies.md
reviewed_at: "2026-08-04"
---

An adsorption calculation becomes interpretable only after the energy subtraction is written as a balanced reaction. The primary data view uses an attributed CMR CO/fcc(111) extraction; retained invented totals then isolate normalization and free-energy bookkeeping without suggesting universal values.

## Inspect a real reaction ledger first

The CC BY-SA 4.0 CMR snapshot fixes the reaction as `CO(g) + slab → CO/slab`,
with products minus reactants and negative values favourable. It records full
coverage, top-site fcc(111) scope, selected database rows and the exact source
database SHA-256. The PBE values for the committed Cu, Pd, Pt and Au rows are
`0.263`, `-0.682`, `-0.946`, and `0.105 eV` per written reaction.

The companion checks the frozen source identity, reaction, sign convention,
coverage statement, metal order and one exact scalar. It does not re-run CMR,
establish another site or coverage, supply a free energy, or rank catalysts.

## Start from a written reaction

The script evaluates `CO(g) + * → CO*` with a products-minus-reactants convention. Its three static terms produce `-0.80 eV per CO`. It separately evaluates `H2(g) + 2* → 2H*` and divides the reaction energy by two only after the stoichiometry is balanced.

The [CMR benchmark paper](https://doi.org/10.1021/acs.jpcc.7b12258) uses explicit gas-phase reference reactions for several molecular and dissociative adsorbates. The same discipline applies to a private calculation: record the clean slab, combined state, every reservoir, coefficient, unit, and sign before subtraction.

## Keep synthetic average and differential examples separate

The invented one- and two-CO totals give an average adsorption energy of `-0.60 eV per CO` at `N=2`, but the second addition is only `-0.40 eV`. Both values are correct for their definitions. The difference is the information: the next adsorption event is less favourable in this fixture.

Do not compare the average at one coverage with the differential value at another. A coverage label also needs its denominator—site fraction, surface atom, cell, or area—because the same decimal can represent different physical layers.

## Add synthetic free-energy terms once

The final ledger adds invented zero-point, thermal-enthalpy, entropy, and environment terms to the static energy. The purpose is to show placement and units, not to provide reusable correction values. [Campbell and Sellers](https://doi.org/10.1021/ja3080117), together with their [published correction](https://doi.org/10.1021/ja407293b), show why adsorbate entropy cannot be assumed negligible.

Gas reservoirs can instead enter through chemical potentials, as in [Reuter and Scheffler's surface thermodynamics](https://doi.org/10.1103/PhysRevB.65.035406). For electrochemical proton–electron steps, the [computational hydrogen electrode paper](https://doi.org/10.1021/jp047349j) defines an additional thermodynamic transformation. Neither approach licenses double-counting a gas chemical potential, entropy term, solvation correction, or electrode-potential term.

## Reconstruct the public reaction ledger

```text
python3 examples/practical-guides/adsorption_ledger_cmr.py
```

The JSON output exposes the source hash, reaction, sign convention, coverage
scope and four selected PBE values. The retained `adsorption_energy_ledger.py`
still exposes invented molecular/dissociative normalization, average/differential
coverage values and synthetic free-energy sum as a separate explanation.

## What this guide verifies

Execution verifies the attributed public reaction/sign ledger. The retained
fixture separately verifies reaction arithmetic, normalization and additive
free-energy bookkeeping. Neither establishes adsorption-energy convergence,
thermodynamic accuracy, a real site/coverage series, entropy model, solvent,
pressure, electrode condition, or a material conclusion.

## Official sources

- [Schmidt and Thygesen, adsorption benchmark reactions](https://doi.org/10.1021/acs.jpcc.7b12258)
- [Campbell and Sellers, adsorbate entropy](https://doi.org/10.1021/ja3080117)
- [Correction to the adsorbate-entropy paper](https://doi.org/10.1021/ja407293b)
- [Nørskov and co-workers, computational hydrogen electrode](https://doi.org/10.1021/jp047349j)
- [Reuter and Scheffler, atomistic surface thermodynamics](https://doi.org/10.1103/PhysRevB.65.035406)
- [CMR adsorption project and schema](https://cmr.fysik.dtu.dk/adsorption/adsorption.html)
- [CMR adsorption database](https://wiki.fysik.dtu.dk/cmr-files/adsorption.db)
- [CMR data licence](https://cmr.fysik.dtu.dk/index.html)

---
topic_slug: magnetic-anisotropy-and-exchange-interactions
guide_slug: fit-anisotropy-and-exchange-ledger
title: Fit an Anisotropy and Exchange Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Fit a deliberately invented directional-energy and two-site exchange ledger while retaining its sign, normalization, and model boundaries.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/anisotropy_exchange_ledger.py
source_ids:
  - qe-pw-75
  - vasp-magnetic-anisotropy
  - vasp-lsorbit
media_ids: []
review: docs/reviews/2026-08-04-magnetic-anisotropy-and-exchange-interactions.md
reviewed_at: "2026-08-04"
---

## Mark the axes and spin arrangements before fitting energies

For a real material, open the structure with the tested magnetization directions or spin pairs labelled, and inspect final site moments or spin density for every run. Plot directional energies or configuration energies with error scale and fit residuals, keeping the sign, cell, pair counting, and spin normalization visible. Compare with symmetry and published conventions through [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), [specialist magnetic tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools), and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning).

**Audit the stored fixture:** the ledger is deliberately invented teaching arithmetic. No bar chart is published because empty synthetic bars would not show a magnetic structure, spin density, real spin-orbit result, or measured exchange interaction.

Use this fixture to check ledger arithmetic before processing real magnetic energies. It separates two operations: ranking invented SOC directional energies for one fixed magnetic texture, and fitting invented two-site energies to the convention

$$
H=-J\,\mathbf e_1\cdot\mathbf e_2.
$$

Under this written convention, positive $J$ favours parallel moments. The built-in values are not outputs from an electronic-structure engine.

For a real calculation, the parent object must contain compatible total energies, final moment vectors, structure, SOC/noncollinear mode, crystallographic directions, Hamiltonian, numerical settings, and a declared normalization. This script supplies none of those material-specific inputs; it creates its invented ledger internally.

## Purpose

From the repository root, run:

```bash
python3 examples/practical-guides/anisotropy_exchange_ledger.py
```

The command prints a Python result dictionary. Confirm normal exit and the final line `Invented anisotropy/exchange fixture passed; it verifies arithmetic only.` This establishes program completion for the fixture, not SOC or exchange convergence.

## Inspect the directional-energy reduction

Read `easy_direction_within_fixture` and `mae_relative_to_c`. The first names the lowest built-in directional entry; the second subtracts the built-in `c axis` reference. Check that the values use the declared `energy_unit` normalization.

This ranking is conditional on the invented fixed-geometry entries. In real work, all directions must use the same magnetic texture, structure, SOC Hamiltonian, charge, potential data, k points, occupations, symmetry policy, and numerical precision. A scalar-relativistic energy cannot be mixed with an SOC energy, and a collinear energy cannot silently enter a noncollinear directional comparison.

## Inspect the exchange reduction

Read `heisenberg_convention` before `fitted_J`. The fixture uses parallel energy $-J$ and antiparallel energy $+J$, so their difference gives the fitted positive $J$ under the written two-site convention.

Then compare `held_out_orthogonal_energy` with `predicted_orthogonal_energy`. Equality checks one held-out reconstruction for this exactly determined invented model. It does not show that a real material follows a two-site Heisenberg Hamiltonian, that the fitted interaction range is unique, or that moment magnitudes remain fixed.

## Continue with real energies only after compatibility checks

[Quantum ESPRESSO `pw.x`](https://www.quantum-espresso.org/Doc/INPUT_PW.html) documents noncollinear and spin--orbit inputs. [VASP's magnetic-anisotropy note](https://vasp.at/wiki/Determining_the_Magnetic_Anisotropy) and [`LSORBIT` page](https://vasp.at/wiki/LSORBIT) describe SOC directional calculations and their numerical sensitivity. Follow the documentation for the selected code and version; this fixture does not provide or verify those input files.

For real MAE, reconstruct every directional difference from retained high-precision total energies and the declared normalization, then converge the difference and easy-direction ranking. For real exchange, retain the final moment map of every configuration, state the sign and pair-counting convention, fit enough independent configurations, and test held-out states. A passed script run does not replace any of those checks.

Execution verifies invented arithmetic, sign convention, normalization labels, and one held-out reconstruction only. It does not calculate a material MAE or exchange parameter, establish an easy axis, validate a magnetic Hamiltonian, predict a transition temperature, or support a scientific conclusion.

## Official sources

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [VASP: Determining the Magnetic Anisotropy](https://vasp.at/wiki/Determining_the_Magnetic_Anisotropy)
- [VASP `LSORBIT`](https://vasp.at/wiki/LSORBIT)

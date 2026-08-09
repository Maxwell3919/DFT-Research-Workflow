---
topic_slug: defect-formation-energies-and-charge-states
guide_slug: build-defect-formation-ledger
title: Build an Auditable Defect Formation-Energy Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Assemble host, defect, atomic-reservoir, electron-reservoir, and scheme-total correction terms with explicit atom and charge sign conventions.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/defect_formation_ledger.py
source_ids:
  - zhang-northrup-defects
  - van-de-walle-neugebauer-defects
  - fnv-correction
  - kumagai-oba-correction
  - doped-thermodynamics
media_ids:
  - defect-formation-ledger
review: docs/reviews/2026-08-04-defect-formation-energies-and-charge-states.md
reviewed_at: "2026-08-04"
---

Use this guide to assemble host, defect, atomic-reservoir, electron-reservoir, and correction terms before plotting charge-state lines. The four charge states and all energies are invented teaching fixtures for an abstract B vacancy.

From the repository root, run:

```bash
python3 examples/practical-guides/defect_formation_ledger.py \
  --svg public/media/practical-guides/defect-formation-energies-and-charge-states/build-defect-formation-ledger/defect-formation-ledger.svg
```

The script emits a report and rewrites the SVG. Inspect the term table and assertions before the figure.

## Purpose

The input key `delta_atoms` is positive when an atom is added to the defective cell. Charge `q` is positive when electrons are removed. The script evaluates

$$
E_{\mathrm f}
=
E_{\mathrm{def}}-E_{\mathrm{host}}
-\sum_i\Delta n_i\mu_i
+q(E_{\mathrm{VBM}}+E_F)
+E_{\mathrm{corr}}.
$$

For the B vacancy, `delta_atoms["B"]` is `-1`, so the atomic-reservoir contribution is $+\mu_{\mathrm B}$. Check this from the stored convention rather than applying a memorized vacancy sign.

At the fixture probe $E_F=1\ \mathrm{eV}$, the electron terms change with slopes $+2$, $+1$, $0$, and $-1$ for the four charge states. The script asserts that these slopes equal `q`.

## Keep every term separate

Inspect the raw defect-minus-host energy, atomic term, electron term, and `finite_size_scheme_total_eV` before the final sum. Do not replace them upstream with one opaque corrected energy.

The scheme-total field is deliberate. FNV and Kumagai-Oba implementations can package potential-reference and image-charge terms differently. Do not add another “alignment” field unless the chosen implementation documents it as separate.

For production data, add host and defect artifact identities, atom changes, charge and spin, reservoir phase set, VBM reference, dielectric input, charge model, potential files, sampling region, correction diagnostics, implementation version, supercell convergence, localization, and residual uncertainty.

## Inspect the output and decide

The invented B-rich to B-poor change shifts all four vacancy lines equally because their stoichiometry is identical. Their charge slopes and mutual transition levels therefore do not change. Confirm that the report reproduces that relation and that every component sum closes.

The guide verifies ledger arithmetic, atom signs, charge slopes, and a common chemical-potential shift. It does not parse electronic-structure output, create or relax a defect, validate localization or a correction model, converge a supercell, or predict a real formation energy. Continue to the charge-state envelope only after those production checks pass.

## Official sources

- [Zhang and Northrup, defect formation energies](https://doi.org/10.1103/PhysRevLett.67.2339)
- [Van de Walle and Neugebauer, defect methodology](https://doi.org/10.1063/1.1682673)
- [Freysoldt–Neugebauer–Van de Walle correction](https://doi.org/10.1103/PhysRevLett.102.016402)
- [Kumagai–Oba anisotropic correction](https://doi.org/10.1103/PhysRevB.89.195205)
- [doped thermodynamics API](https://doped.readthedocs.io/en/stable/doped.thermodynamics.html)

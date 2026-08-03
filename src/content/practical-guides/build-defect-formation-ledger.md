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

A formation-energy diagram should be generated from an inspectable ledger, not from unlabelled line intercepts. This guide uses four invented charge states of one abstract B vacancy to make every term and sign visible. The values are deterministic teaching fixtures, not settings or results for a material.

## Choose and test one sign convention

The companion script defines `delta_atoms` as positive when an atom is added to the defective cell and charge `q` as positive when electrons are removed. It evaluates

```text
E_f = E_def - E_host - Σ_i Δn_i μ_i + q(E_VBM + E_F) + E_corr
```

For the B vacancy, `Δn(B) = -1`. The atomic-reservoir term is therefore `+μ_B`. Moving from the invented B-rich to B-poor limit lowers all four vacancy lines by the same amount because their stoichiometry is identical. Their slopes and mutual transition levels do not change.

The formalism follows the reservoir construction introduced by [Zhang and Northrup](https://doi.org/10.1103/PhysRevLett.67.2339) and reviewed by [Van de Walle and Neugebauer](https://doi.org/10.1063/1.1682673).

## Keep components separate until the final sum

Each record retains the raw defect-minus-host energy, atomic term, electron term, and one finite-size scheme total. At the fixture probe `E_F = 1 eV`, the charge slopes add `+2`, `+1`, `0`, and `−1 eV` to the four lines. The script asserts that these differences equal `q` exactly.

```python
from defect_formation_ledger import run

report = run()
for row in report["limits"]["B-rich"]:
    print(row["state"], row["at_fermi_probe"])
```

Do not collapse these values into one corrected energy field upstream. Keeping components distinct makes reversed atom signs, wrong Fermi references, and accidental double correction detectable.

## Treat correction output as a scheme total

The fixture calls its final term `finite_size_scheme_total_eV`. That name is deliberate: a correction implementation may already include the potential-reference contribution defined by its method. The [FNV paper](https://doi.org/10.1103/PhysRevLett.102.016402) and the [Kumagai–Oba extension](https://doi.org/10.1103/PhysRevB.89.195205) use related but implementation-specific decompositions. Do not add another field merely because a different tool labels it “potential alignment.”

For production data, preserve the correction method, dielectric input, charge model, potential files, sampling region, diagnostics, implementation version, and residual estimate. The ledger verifies arithmetic only after those scientific choices have been justified.

## Rebuild the diagram

Run from the repository root:

```text
python3 examples/practical-guides/defect_formation_ledger.py \
  --svg public/media/practical-guides/defect-formation-energies-and-charge-states/build-defect-formation-ledger/defect-formation-ledger.svg
```

The generated SVG shows the five terms for every state at one fixture Fermi level. [doped's thermodynamics API](https://doped.readthedocs.io/en/stable/doped.thermodynamics.html) is an official implementation reference for carrying chemical potentials, correction terms, Fermi level, and formation energy through a richer defect record.

## What this guide verifies

The script verifies a declared atom-count convention, reservoir signs, formation-energy component sums, charge-dependent slopes, and a common chemical-potential shift for one invented vacancy. It does not parse electronic-structure output, generate a defect, run DFT, assess localization, validate FNV or Kumagai–Oba assumptions, converge a supercell, or predict a real formation energy.

## Official sources

- [Zhang and Northrup, defect formation energies](https://doi.org/10.1103/PhysRevLett.67.2339)
- [Van de Walle and Neugebauer, defect methodology](https://doi.org/10.1063/1.1682673)
- [Freysoldt–Neugebauer–Van de Walle correction](https://doi.org/10.1103/PhysRevLett.102.016402)
- [Kumagai–Oba anisotropic correction](https://doi.org/10.1103/PhysRevB.89.195205)
- [doped thermodynamics API](https://doped.readthedocs.io/en/stable/doped.thermodynamics.html)

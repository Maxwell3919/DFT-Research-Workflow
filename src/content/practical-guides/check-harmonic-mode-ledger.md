---
topic_slug: harmonic-phonons
guide_slug: check-harmonic-mode-ledger
title: Check a Harmonic-Mode Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Reconstruct a real Silicon Γ-point QE 7.5 DFPT mode ledger while keeping a one-q-point calculation separate from a phonon-dispersion or stability claim.
tested_versions:
  - Python 3.12
  - Quantum ESPRESSO 7.5
execution_script: examples/practical-guides/silicon_gamma_phonon.py
source_ids:
  - qe-ph-75
  - phonopy-command
  - phonopy-setting-tags
media_ids:
  - silicon-gamma-phonon
review: docs/reviews/2026-08-04-harmonic-phonons.md
reviewed_at: "2026-08-04"
---

This is a bounded real-execution case: a COD 9013102 Silicon structure was used for an 8×8×8 QE 7.5 SCF calculation, followed by `ph.x` at Γ using the same `prefix`/`outdir` lineage. The committed output contains three 1.216451 cm⁻¹ acoustic diagnostics and a threefold 514.442616 cm⁻¹ optical result. The structure, SCF and DFPT inputs, standard output, stderr files, dynamical matrix, parsed CSV, and hashes are all committed as small public artifacts.

![Six Silicon Gamma-point modes, with three small acoustic diagnostics and three optical modes at 514.442616 inverse centimetres.](/DFT-Research-Workflow/media/practical-guides/harmonic-phonons/check-harmonic-mode-ledger/silicon-gamma-phonon.svg)

## Reconstruct the published ledger

```text
python3 examples/practical-guides/silicon_gamma_phonon.py \
  --json examples/practical-guides/data/silicon-qe/phonon/silicon-gamma-phonon.json \
  --csv examples/practical-guides/data/silicon-qe/phonon/silicon-gamma-phonon.csv \
  --svg public/media/practical-guides/harmonic-phonons/check-harmonic-mode-ledger/silicon-gamma-phonon.svg
```

## What this guide verifies

The companion verifies exact input/output hashes, QE completion markers, six parsed Γ frequencies, the acoustic diagnostic and optical-triplet values, and regeneration of the CSV/JSON/SVG from the committed `ph.x` output. The empty stderr files are also preserved.

This one Γ-point run does not establish a phonon dispersion, q-mesh/cutoff/k-mesh convergence, an acoustic-sum-rule correction, dynamical stability, finite-temperature behavior, agreement with experiment, or a material conclusion. The 1.216451 cm⁻¹ acoustic value is a diagnostic from this fixed setup, not an exact acoustic zero.

## Official sources

- [Quantum ESPRESSO `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Phonopy command and force-constant workflow](https://phonopy.github.io/phonopy/phonopy.html)
- [Phonopy setting tags](https://phonopy.github.io/phonopy/setting-tags.html)

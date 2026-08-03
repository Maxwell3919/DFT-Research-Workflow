---
topic_slug: harmonic-phonons
guide_slug: check-harmonic-mode-ledger
title: Check a Harmonic-Mode Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Interpret invented harmonic dynamical-matrix eigenvalues without turning a negative-curvature diagnostic into a material-stability claim.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/harmonic_mode_ledger.py
source_ids:
  - qe-ph-75
  - phonopy-command
  - phonopy-setting-tags
media_ids:
  - harmonic-mode-ledger
review: docs/reviews/2026-08-04-harmonic-phonons.md
reviewed_at: "2026-08-04"
---

This deterministic fixture converts six invented mass-weighted eigenvalues to displayed frequencies. It keeps three invented Γ acoustic zeros separate from positive modes and one negative-curvature diagnostic. It neither obtains forces nor constructs a force-constant matrix.

## Run the deterministic ledger

```text
python3 examples/practical-guides/harmonic_mode_ledger.py \
  --svg public/media/practical-guides/harmonic-phonons/check-harmonic-mode-ledger/harmonic-mode-ledger.svg
```

## What this guide verifies

Execution verifies invented eigenvalue-to-display arithmetic, named acoustic bookkeeping, and original SVG rendering. It does not compute a phonon, force constant, dispersion, acoustic-sum-rule correction, imaginary mode, dynamical stability, finite-temperature phase, or a scientific conclusion for a material.

## Official sources

- [Quantum ESPRESSO `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Phonopy command and force-constant workflow](https://phonopy.github.io/phonopy/phonopy.html)
- [Phonopy setting tags](https://phonopy.github.io/phonopy/setting-tags.html)

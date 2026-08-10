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
media_ids: []
review: docs/reviews/2026-08-04-harmonic-phonons.md
reviewed_at: "2026-08-04"
---

This is a bounded real-execution case: a COD 9013102 Silicon structure was used for an 8×8×8 QE 7.5 SCF calculation, followed by `ph.x` at Γ using the same `prefix`/`outdir` lineage. The committed output contains three 1.216451 cm⁻¹ acoustic diagnostics and a threefold 514.442616 cm⁻¹ optical result. The structure, SCF and DFPT inputs, standard output, stderr files, dynamical matrix, parsed CSV, and hashes are all committed as small public artifacts.

This replay is not the first action for a dynamical-stability question. Begin with the complete q-grid route in Quantum ESPRESSO (`pw.x` → `ph.x` → `q2r.x` → `matdyn.x`) or a one-to-one finite-displacement/force-set route in Phonopy, then open the dispersion and suspicious eigenvectors in a compatible viewer. Use this Γ ledger only afterwards to practise inspecting one bounded response object.

## Read the one-point mode object before replaying it

This artifact contains frequencies at Gamma only. It has no phonon path, q-mesh interpolation, or interactive eigenvector animation. Read the six-mode figure as a frequency transcription, then return to the structure and ask which atomic displacement each mode represents; this stored public case cannot answer that mode-character question. A full human phonon workflow opens the dispersion, selects a q point and branch, and animates the eigenvector in a compatible viewer before deciding whether a feature is translational, structural, or physically suspicious. See [lattice-dynamics routes and viewers](/DFT-Research-Workflow/operations/resource-landscape/#lattice-dynamics).

For this stored case, open `examples/practical-guides/data/silicon-qe/phonon/si-gamma-scf.in` beside `si-gamma-scf.out` and `si-gamma-scf.err`, then do the same for `si-gamma-ph.in`, `si-gamma-ph.out`, and `si-gamma-ph.err`. Confirm the QE version banner, matching `prefix` and `outdir`, the requested q point, the raw frequency lines, and `si_gamma.dyn` before looking at the parsed CSV or SVG. A missing q point, incomplete dynamical matrix, non-empty unexplained stderr, or absent normal-termination marker is an execution failure; a small or imaginary frequency after successful execution is instead a numerical or physical question that requires tighter parents, q/supercell convergence, acoustic checks, and eigenvector inspection.

Inspect the stored run markers and frequency lines:

```bash
grep -F "JOB DONE" examples/cases/silicon-ground-state-electronic-structure/output/si-gamma-scf.out
grep -F "convergence has been achieved" examples/cases/silicon-ground-state-electronic-structure/output/si-gamma-scf.out
grep -F "JOB DONE" examples/cases/silicon-ground-state-electronic-structure/output/si-gamma-ph.out
grep -F "Calculation of q =" examples/cases/silicon-ground-state-electronic-structure/output/si-gamma-ph.out
grep -F "freq (" examples/cases/silicon-ground-state-electronic-structure/output/si-gamma-ph.out
```

The `JOB DONE` lines check normal program termination only. The SCF marker checks the stored electronic solve. The q line identifies Gamma, and the frequency lines expose the six modes parsed below. They do not establish a q mesh, interpolation, acoustic-sum correction, dispersion, or dynamical stability.


## Optional reconstruction after the full-q workflow is understood

```bash
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

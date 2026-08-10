---
topic_slug: dielectric-response-and-born-effective-charges
guide_slug: check-born-charge-and-dielectric-ledger
title: Check a Born-Charge and Dielectric Ledger
kind: implementation
tools:
  - python
  - quantum-espresso
status: reviewed
summary: Reconstruct a real Silicon Gamma-point dielectric tensor and Born-charge diagnostic from a bounded Quantum ESPRESSO DFPT run.
tested_versions:
  - Python 3.12
  - Quantum ESPRESSO 7.5
execution_script: examples/practical-guides/silicon_qe_dielectric.py
source_ids:
  - qe-ph-75
  - vasp-born-effective-charges
  - vasp-electric-field-dfpt
  - cod-9013102
media_ids:
  - silicon-qe-dielectric
review: docs/reviews/2026-08-04-dielectric-response-and-born-effective-charges.md
reviewed_at: "2026-08-04"
---

This is a bounded real-execution case for the same CC0 COD 9013102 Silicon structure used by the other Silicon pages. Quantum ESPRESSO 7.5 `pw.x` first converged an 8×8×8 fixed-geometry SCF state; `ph.x` then ran at Γ with `epsil = .true.` using the same `prefix`/`outdir` lineage. The committed output contains the electronic/ion-clamped dielectric tensor, raw and acoustic-sum-rule-adjusted Born effective-charge diagnostics, the response input, and the dynamical matrix.

## Read the physical object before replaying the parser

Open the Silicon structure and the response input together and identify how the cell axes map onto the Cartesian tensor. Read all printed dielectric and Born-charge components, not only the diagonal bars in the figure. For a lower-symmetry or polar material, inspect atom-resolved tensors beside the structure and view the phonon displacement or field direction that consumes them. This case has no such mode animation or LO--TO dispersion; the SVG is a compact transcription diagnostic, not a substitute for that inspection. See [electronic-property resources](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties) and [lattice-dynamics viewers](/DFT-Research-Workflow/operations/resource-landscape/#lattice-dynamics) for full human routes.

Now inspect the stored text evidence:

```bash
grep -F "JOB DONE" examples/cases/silicon-ground-state-electronic-structure/output/si-epsilon-scf.out
grep -F "convergence has been achieved" examples/cases/silicon-ground-state-electronic-structure/output/si-epsilon-scf.out
grep -F "JOB DONE" examples/cases/silicon-ground-state-electronic-structure/output/si-epsilon-ph.out
grep -A 4 -F "Dielectric constant in cartesian axis" examples/cases/silicon-ground-state-electronic-structure/output/si-epsilon-ph.out
grep -A 16 -F "Effective charges (d Force / dE)" examples/cases/silicon-ground-state-electronic-structure/output/si-epsilon-ph.out
```

The first and third commands check normal program termination only. The SCF marker checks the electronic solver condition reported by that stored `pw.x` run. The tensor and effective-charge blocks identify the one-Gamma response that the parser reconstructs. None of them establishes k-mesh, cutoff, response, q-mesh, LO--TO, or observable convergence.

![Silicon QE 7.5 Gamma-point dielectric tensor and Born-charge diagnostic.](/DFT-Research-Workflow/media/practical-guides/dielectric-response-and-born-effective-charges/check-born-charge-and-dielectric-ledger/silicon-qe-dielectric.svg)

## Optional automation: reconstruct the response ledger

```text
python3 examples/practical-guides/silicon_qe_dielectric.py \
  --svg public/media/practical-guides/dielectric-response-and-born-effective-charges/check-born-charge-and-dielectric-ledger/silicon-qe-dielectric.svg
```

The script reads only the committed `pw.x`/`ph.x` inputs and outputs. It checks the QE 7.5 markers, the Γ-point response section, the reported `14.026301123` diagonal tensor, the two raw `-0.08800 e` Silicon diagnostics, the post-processed acoustic-sum-rule values, the SSSP pseudopotential identity, and every public input/output hash.

[Quantum ESPRESSO `ph.x`](https://www.quantum-espresso.org/Doc/INPUT_PH.html) documents the dielectric and effective-charge response flags. [VASP's Born-effective-charge documentation](https://vasp.at/wiki/Born_effective_charges) states the force/field convention and index-order caveat; [its electric-field DFPT page](https://vasp.at/wiki/Electric_field_response_from_density-functional-perturbation_theory) describes the linear-response scope.

## What this guide verifies

The companion verifies software completion, response-section identity, tensor transcription, Born-charge parsing, the reported acoustic-sum-rule post-processing, deterministic SVG regeneration, and file hashes. The SCF and DFPT iterations reached their printed completion markers, but no dielectric cutoff, k-mesh, q-mesh, or observable convergence series was run.

This single Γ-point result reports an electronic/ion-clamped dielectric tensor; it is not a static dielectric constant including ionic lattice contributions, a phonon dispersion, LO--TO splitting study, converged material response, experimental comparison, or a scientific conclusion.

## Official sources

- [Quantum ESPRESSO `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [VASP Born effective charges](https://vasp.at/wiki/Born_effective_charges)
- [VASP electric-field DFPT response](https://vasp.at/wiki/Electric_field_response_from_density-functional-perturbation_theory)
- [COD 9013102 Silicon structure](https://www.crystallography.net/cod/9013102.html)

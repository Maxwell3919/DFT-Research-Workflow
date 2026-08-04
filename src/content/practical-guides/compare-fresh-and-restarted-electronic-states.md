---
topic_slug: calculate-reference-ground-state
guide_slug: compare-fresh-and-restarted-electronic-states
title: Compare Fresh and Restarted Electronic States
kind: implementation
tools:
  - python
  - quantum-espresso
status: reviewed
summary: Distinguish a continuation from a fresh electronic initialization and test whether compatible paths reproduce the same declared state.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/silicon_qe_restarts.py
source_ids:
  - qe-pw-75
  - vasp-istart
  - vasp-icharg
  - cp2k-scf
  - cp2k-dft
  - cod-9013102
media_ids:
  - fresh-restart-state-map
review: docs/reviews/2026-08-03-calculate-reference-ground-state.md
reviewed_at: "2026-08-03"
---

A restart continues from stored electronic data. A fresh run begins from a newly generated initial state. Both are useful, but they provide different evidence.

## Actual Silicon fresh/restart comparison

The public companion uses the fixed two-site COD 9013102 Silicon cell and QE 7.5.
It runs a fresh SCF followed by `restart_mode='restart'` with the same prefix,
outdir, potential, cell, occupations and k mesh. Both hash-bound output snapshots
have electronic-convergence and `JOB DONE` markers and print -22.83943950 Ry.
This is a reproducible execution comparison, not proof that the electronic state
is unique or physically lowest.

## Declare the initialization lineage

For every run, record the initialization mode, parent electronic artifact, structure checksum, method and potential identity, total charge, spin and occupation target, software version, and compatibility checks.

A stored file being readable does not show that it belongs to the same Hamiltonian, structure, charge, or state branch.

## Compare final state identity, not only energy

The deterministic fixture contains a fresh initialization that reaches `FM-A`, a compatible restart that reaches the same state, and another completed restart that reaches `AFM-B`.

```python
from reference_state_fresh_restart import run

report = run()
print(report["same_state_paths"])
print(report["separate_state_paths"])
```

The first two records form one fixture lineage only because completion, state labels, and their declared energy comparison agree. The `AFM-B` record remains a separate candidate. The fixture tolerance is teaching data, not a recommended DFT threshold.

## Use fresh starts to expose path dependence

A state reached from reused electronic data may be legitimate, but the path dependence should remain visible. Repeat sensitive states from controlled fresh initializations and compare occupations, charge, moments, symmetry, and energy.

A different outcome may identify another basin, an unsuitable initialization, or a state switch. Preserve the result instead of merging the lineages.

## Restart only compatible objects

Changes to structure, atom order, functional, potentials, charge, spin treatment, relativistic setup, basis identity, or boundary conditions can make stored data incompatible. Code-specific restart controls do not replace a workflow-level compatibility decision.

## What this guide verifies

`silicon_qe_restarts.py` verifies the actual public-output hashes, matching printed
energies, and completion markers. The retained fixture illustrates a separate
state branch. Neither establishes restart portability, observable convergence,
candidate completeness, or the lowest physical state.

## Common mistakes

**Calling every restart reproducible.** Reproducibility requires compatible protocol and the same final state identity.

**Comparing only total energy.** Inspect occupations, charge, moments, symmetry, and related diagnostics.

**Using incompatible stored data.** Verify structure, Hamiltonian, charge, and representation identity.

**Discarding a different final state.** Retain it as a separate candidate.

## Official sources

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [VASP `ISTART`](https://vasp.at/wiki/ISTART)
- [VASP `ICHARG`](https://vasp.at/wiki/ICHARG)
- [CP2K SCF section](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/SCF.html)
- [CP2K DFT section](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT.html)
- [Crystallography Open Database entry 9013102](https://www.crystallography.net/cod/9013102.html)

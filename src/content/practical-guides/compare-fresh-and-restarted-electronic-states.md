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

## Run the bounded comparison

```bash
python3 examples/practical-guides/silicon_qe_restarts.py
```

The companion checks two stored SCF outputs plus two relaxation-segment outputs. For the fresh/restart SCF pair it requires literal electronic-convergence and `JOB DONE` markers and compares the printed total energies. It does not inspect the inputs or saved restart objects.

Use the report as a first check only. Inspect the structure, prefix/outdir lineage, Hamiltonian, potential, charge, occupations, moments, symmetry, and warnings in both runs. Equal printed energy supports neither equal state identity nor restart compatibility by itself. If the final states agree under all declared diagnostics, retain fresh and restart as two paths to the same candidate. If they differ, preserve both and send them to the candidate-state comparison instead of selecting the convenient result.

## Actual Silicon fresh/restart comparison

The published inputs describe a fresh QE 7.5 SCF and a restart for one Silicon
cell. The declared companion does not read those inputs or verify prefix, outdir,
potential, cell, occupations, k mesh, or restart data. It hashes the two stored
outputs, requires literal electronic-convergence and `JOB DONE` markers, and
confirms equal printed total energies. Equal energy does not establish equal state
identity, compatible execution, uniqueness, or physical ordering.

## Declare the initialization lineage

For every run, record the initialization mode, parent electronic artifact, structure checksum, method and potential identity, total charge, spin and occupation target, software version, and compatibility checks.

A stored file being readable does not show that it belongs to the same Hamiltonian, structure, charge, or state branch.

## Compare final state identity, not only energy

The following deterministic fixture concept contains a fresh initialization that
reaches `FM-A`, a compatible restart that reaches the same state, and another
restart that reaches `AFM-B`. It is not executed by the declared companion:

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

`silicon_qe_restarts.py` verifies four stored-output hashes and marker strings,
equal printed energies for the fresh/restart SCF pair, and two relaxation-segment
messages. It does not verify input compatibility, restart data, or electronic-state
identity and does not execute the conceptual magnetic fixture. It establishes no
restart portability, observable convergence, candidate completeness, or physical
ordering.

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

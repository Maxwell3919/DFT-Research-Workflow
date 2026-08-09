---
topic_slug: validate-results-and-scientific-conclusions
guide_slug: audit-a-qe-calculation
title: Audit a QE Calculation
kind: worked-example
tools:
  - python
  - quantum-espresso
status: reviewed
summary: Audit the committed bcc Fe QE adverse case from artifact identity through termination, SCF evidence, observables, numerical gates, and claim limits.
tested_versions:
  - Python 3.12
  - Quantum ESPRESSO 7.5 committed-output format
execution_script: examples/practical-guides/qe_calculation_audit.py
source_ids:
  - qe-pw-75
  - qe-ph-75
media_ids: []
review: docs/reviews/2026-08-09-qe-terminal-inspection-and-audit.md
reviewed_at: "2026-08-09"
---

## Purpose

This worked example audits a real adverse record rather than turning a successful marker into a success story. The committed `bcc-fe-spin-qe` case contains two attempts:

- Attempt 01 failed in the Slurm/Open MPI launcher before `PWSCF` started.
- Attempt 02 recorded four zero-exit QE 7.5 SCF stages with SCF and `JOB DONE.` markers.
- The case still fails its predeclared fixed-geometry FM k-mesh total-energy convergence test.
- No magnetic-ground-state conclusion is claimed because FM and non-spin-polarized candidates are not an exhaustive magnetic-state set.

The audit asks what each layer can support and stops at the first unresolved gate. It does not repair, rerun, or reinterpret the calculation.

## Prepare

Work from the repository root and anchor the exact case:

```bash
pwd -P
case_root=examples/cases/bcc-fe-spin-qe
test -f "$case_root/manifest.json"
sha256sum -- "$case_root/manifest.json"
```

The path and hash identify bytes in this checkout. They do not prove that the manifest's statements are correct. The companion independently recomputes every artifact size and SHA-256 declared inside the manifest before interpreting any result.

Read the case-level outcome before selecting attractive output lines:

```bash
head -n 80 -- "$case_root/manifest.json"
rg -n '"exit_code"|"status"|"claim_boundary"' \
  "$case_root/manifest.json" \
  "$case_root/derived/attempt-02-pmix/bcc-fe-spin-summary.json" \
  "$case_root/derived/attempt-02-pmix/fm-kmesh-screen.json"
```

This locates the recorded checks and claim boundary. It does not verify their arithmetic or internal consistency.

## Run

Execute the read-only audit:

```bash
python3 examples/practical-guides/qe_calculation_audit.py
```

The script reads the manifest, input files, both attempt records, four Attempt 02 stdout/stderr pairs, the derived candidate summary, and the FM mesh screen. It does not write a report file, regenerate a figure, invoke QE, contact Slurm, or alter the case.

The audit exits normally only when it finds the expected adverse record: exact artifact hashes, an Attempt 01 pre-PWSCF launch failure, four Attempt 02 zero exits with termination and SCF markers, a failed observable-specific numerical screen, no phonon evidence, and the known internal inconsistency in the mesh record's boundary sentence.

## Check

### Artifact identity

Every artifact listed in `manifest.json` is checked against its declared byte count and SHA-256. This covers inputs, environment, launch scripts, sanitized failure evidence, Attempt 02 outputs, derived JSON, and the original PNG.

Passing this check proves that the audit read the manifest-bound bytes. It does not prove that the raw uncommitted hostname-bearing stderr is available, that a pseudopotential body may be redistributed, or that the calculation is scientifically acceptable.

### Termination and scheduler boundaries

Attempt 01 has zero-byte stdout and sanitized stderr stating that Open MPI lacked the required Slurm PMI support and aborted before `MPI_Init`. Its early-exit `run-status.json` is deliberately preserved with a trailing comma and is not valid JSON. These are launch-failure facts, not evidence about SCF behavior.

Attempt 02 records zero exit codes for `fm-k8`, `fm-k10`, `fm-k12`, and `nm-k12`. Each stdout has one `Program PWSCF v.7.5` banner, one SCF-convergence marker, and one `JOB DONE.` marker; each stderr is empty. This supports recorded program and SCF completion for those four stages only.

The case manifest remains `exit_code: 1` with `completed_at: null`. The recorded wrapper failure came from an initial parser expectation, while the child QE stages exited zero. A wrapper exit, scheduler state, and program exit must therefore remain separate fields.

### SCF, energy, and Fermi evidence

The committed outputs report:

| Candidate | Final total energy (Ry per Fe primitive cell) | Fermi energy (eV) | Recorded spin state |
| --- | ---: | ---: | --- |
| `fm-k8` | -329.26610739 | 17.4646 | spin-polarized FM seed |
| `fm-k10` | -329.26720258 | 17.4445 | spin-polarized FM seed |
| `fm-k12` | -329.26710558 | 17.4521 | spin-polarized FM seed |
| `nm-k12` | -329.22527362 | 17.5581 | non-spin-polarized candidate |

The script checks these values against the hash-bound parsed summary. Their presence proves what QE printed for the declared fixed-geometry states. It does not establish cutoff, smearing, lattice, k-mesh, magnetic-state, or Fermi-level convergence. Fermi levels are not compared as independently meaningful absolute reference energies.

At the 12 x 12 x 12 mesh, the stored comparison is

```text
E(nm-k12) - E(fm-k12) = 0.04183196000002454 Ry
                              = 569.1528104936939 meV per Fe primitive cell
```

This arithmetic supports a bounded difference between two declared candidates under one stored setup. Because the FM mesh gate fails and the candidate set excludes AFM, ferrimagnetic, noncollinear, SOC, structural, strain, defect, surface, and finite-temperature alternatives, it cannot identify the magnetic ground state or justify a general Fe conclusion.

### Forces, stress, and coordinates

All four inputs request forces and stress. They use one Fe atom at fractional coordinates `(0, 0, 0)` in an `ibrav = 3` primitive cell with `celldm(1) = 5.4169` bohr. The audit parses the input coordinate unit and atom record, the final total-force line, and the presence of the stress block for each output.

This verifies consistency between the audited input objects and the printed fixed-geometry diagnostics. A zero total force on this one-atom symmetry position does not prove a relaxed lattice, a global minimum, or dynamical stability. The stress is a diagnostic of this fixed cell, not an instruction to change the cell and not a pressure-convergence study.

### Warnings and adverse text

The audit scans each Attempt 02 stdout for explicit warning, fatal-routine, nonconvergence, segmentation, out-of-memory, and killed-signal patterns, while retaining stderr as a separate artifact. No matching line is treated as only a pattern result; it is not proof that the run was numerically healthy.

Attempt 01's launcher error remains adverse evidence even though the later attempt ran. A later successful launch does not erase the failed attempt or establish that the launcher combination is portable to another cluster.

### Phonons and downstream artifacts

The case manifest contains no `ph.x`, dynamical-matrix, `q2r.x`, or `matdyn.x` artifact. The audit therefore reports phonons as `NOT ASSESSED`.

No total-energy, force, stress, magnetic-moment, or SCF marker can substitute for harmonic force constants or q-space coverage. This case cannot support a phonon frequency, dispersion, dynamical-stability, electron-phonon, or finite-temperature claim.

### Numerical convergence and claim boundary

The predeclared FM adjacent energy changes are:

```text
8 x 8 x 8 to 10 x 10 x 10: 0.0010951900000009118 Ry
10 x 10 x 10 to 12 x 12 x 12: 0.00009699999998247222 Ry
tolerance:                            0.0005 Ry
```

The first change exceeds the tolerance, so the declared k-mesh total-energy convergence test fails. Artifact-identity, recorded-exit, SCF-marker, and expected-record checks pass within their stated scope; they do not override the failed numerical test. No broader material conclusion is claimed.

The committed `fm-kmesh-screen.json` also contains an internal textual defect: its `boundary` sentence says both adjacent changes are at or below tolerance even though the values and `status: FAIL` say otherwise. The companion asserts that this contradiction is present and reports it. It does not silently repair source evidence.

## Read

The strongest supported statement is narrow: four declared QE 7.5 SCF stages completed and provide hash-bound energies, Fermi levels, forces, stresses, and FM moments for a fixed bcc Fe model; the stored FM/NM difference is reproducible from those records.

The strongest acceptance statement is adverse: the declared FM k-mesh total-energy screen failed, the case manifest remains incomplete, and no magnetic-ground-state or phonon conclusion is claimed. This is a useful audit result. Scientific validation does not require converting every case into a pass.

## If it fails

If artifact hashes fail, stop before scientific interpretation and determine whether the path, checkout, manifest, or file bytes changed. Do not update a hash merely to make the audit pass.

If a program marker is missing, inspect scheduler exit, stdout, stderr, truncation, and expected downstream artifacts. Do not append `JOB DONE.` or discard the failed stage.

If an observable-specific gate fails, preserve the adverse series and decide whether a new, predeclared calculation is authorized. A denser mesh after seeing the result is new evidence, not a retroactive pass. This guide does not authorize a rerun, a new magnetic candidate set, a phonon calculation, or a changed acceptance threshold.

## Next

Resolve the source-record wording defect in a separately reviewed evidence update while preserving the original bytes and audit finding. Any new numerical work should declare the observable, comparison set, tolerance, and stopping rule before execution. Only a new traceable series can address numerical convergence; only a deliberately expanded candidate search can address the magnetic-state boundary; and only a complete phonon lineage can support a phonon claim.

## Official sources

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Quantum ESPRESSO `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)

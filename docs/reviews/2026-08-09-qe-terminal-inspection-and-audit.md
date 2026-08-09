# Review - QE Terminal Inspection and Calculation Audit

## Scope and routing

The batch adds two subordinate pages under `validate-results-and-scientific-conclusions` without changing the A-E topic registry or treating terminal commands as new research operations.

`inspect-qe-hpc-calculations-from-the-terminal` is an implementation guide. It covers shell context, executable and MPI-launcher discovery, filesystem capacity, bounded file inventory, Slurm submission/observation boundaries, live log following, QE markers, final-coordinate and phonon-frequency searches, output reading, artifact identity, and failure triage. Submission and cancellation are labelled as side effects. The `scancel` example requires current ownership evidence, a fresh detailed job read, and an exact interactive confirmation.

`audit-a-qe-calculation` is a worked example bound to the existing `bcc-fe-spin-qe` adverse case. It preserves the distinction between the Attempt 01 launcher failure, Attempt 02 child-stage completion, the case-level wrapper exit, SCF-marker evidence, failed observable-specific numerical screening, and unclaimed scientific conclusions. Internal manifest codes are not taught as a reader-facing taxonomy.

## Command and executable review

The terminal page provides runnable Bash commands for `pwd`, `command -v`, QE and MPI-launcher version inspection, `df`, `ls`, `find`, `head`, `tail`, `less`, `grep`, `wc`, `diff`, `sed`, and `sha256sum`. It covers `pw.x`, `ph.x`, `bands.x`, `dos.x`, `projwfc.x`, `q2r.x`, and `matdyn.x` as separate producer/consumer stages.

The Slurm sequence covers `sbatch --test-only`, explicitly side-effecting `sbatch`, `squeue`, `sacct`, `scontrol`, `tail -F`, and a confirmation-protected `scancel`. Every command family states what it can observe and what it cannot establish. Site configuration, accounting retention, executable modules, launcher integration, and filesystem visibility remain local facts that must be checked on the target cluster. No Slurm version or cross-site portability claim is made.

## Source and version record

The practical pages reuse existing tool IDs `python` and `quantum-espresso`. The implementation page reuses source IDs `qe-pw-75`, `qe-ph-75`, `qe-bands-docs`, `qe-dos-docs`, and `qe-projwfc-docs`; it adds official `q2r.x`, `matdyn.x`, and Slurm command records. The worked example reuses `qe-pw-75` and `qe-ph-75`.

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Quantum ESPRESSO `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Quantum ESPRESSO `bands.x` input description](https://www.quantum-espresso.org/Doc/INPUT_BANDS.html)
- [Quantum ESPRESSO `dos.x` input description](https://www.quantum-espresso.org/Doc/INPUT_DOS.html)
- [Quantum ESPRESSO `projwfc.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html)
- [Quantum ESPRESSO `q2r.x` input description](https://www.quantum-espresso.org/Doc/INPUT_Q2R.html)
- [Quantum ESPRESSO `matdyn.x` input description](https://www.quantum-espresso.org/Doc/INPUT_MATDYN.html)
- [Slurm `sbatch` command reference](https://slurm.schedmd.com/sbatch.html)
- [Slurm `squeue` command reference](https://slurm.schedmd.com/squeue.html)
- [Slurm `sacct` command reference](https://slurm.schedmd.com/sacct.html)
- [Slurm `scontrol` command reference](https://slurm.schedmd.com/scontrol.html)
- [Slurm `scancel` command reference](https://slurm.schedmd.com/scancel.html)

The companion scope is pinned to Python 3.12 and the committed QE 7.5 output format. The pages do not claim that command syntax, output text, defaults, launchers, or restart formats are unchanged in another release.

## Companion and artifact review

`qe_hpc_terminal_inspection.py` and `qe_calculation_audit.py` use only the Python standard library and expose `run()` for the repository execution harness. Both are read-only: they compute hashes, parse committed text/JSON, and print a JSON result to stdout. They do not write files, call QE or Slurm, submit or cancel work, or access a private host.

Both companions check every artifact byte count and SHA-256 declared by the existing case manifest. The terminal companion reports file inventory, the preserved invalid early-exit status JSON, Attempt 01's pre-PWSCF PMI failure, Attempt 02 stage exits and markers, the absent live-scheduler observation, and the failed numerical-convergence record.

The Fe criterion is now conditional wording consistent with the unchanged recorded FAIL result; no raw value or acceptance state changed.

## Scientific and claim boundary

The batch separates scheduler state, wrapper and child exit codes, QE termination, SCF convergence, fixed-setup printed observables, artifact integrity, observable-specific numerical convergence, physical validity, and scientific claim support.

It supports teaching how to inspect and audit the committed case. It does not establish a current scheduler state, rerun QE, validate another calculation tree, pass the bcc Fe k-mesh gate, identify the magnetic ground state, establish a relaxed structure, support a phonon or stability conclusion, compare with experiment, or authorize cancellation or new computation.

No media are added. Source reachability, companion execution, content validation, build, and browser behavior remain separate checks and were not run as part of this file-creation task.

## Batch 5A operational closure

The terminal guide now covers `cd`, `awk`, `ps`, both `tail -f` and `tail -F`, and fail-closed `grep`/`diff` exit semantics. It supplies real redirected invocation forms for `pw.x`, `bands.x`, `dos.x`, `projwfc.x`, `ph.x`, `q2r.x`, and `matdyn.x`, each with its parent-artifact boundary and an explicit warning that these branches are not a universal sequence. Slurm commands remain inspection text only; CI and companion scripts do not submit, cancel, or run QE jobs. The Calculation Audit presents the evidence ladder in ordinary scientific language and retains the Fe screen's FAIL and no-claim boundary.

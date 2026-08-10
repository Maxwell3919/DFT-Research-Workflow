# Quick Reference source review

## Scope

This review covers the static `/quick-reference/` support page. The page provides
read-only text locators for named output files; it does not define a scientific
acceptance protocol, replace complete stdout/stderr and scheduler records, or
claim that one output marker proves numerical convergence or physical validity.

## Reviewed official entry points

- [Quantum ESPRESSO PWscf troubleshooting](https://www.quantum-espresso.org/Doc/pw_user_guide/node21.html) supports the failure-classification boundary for `pw.x` calculations.
- [Quantum ESPRESSO PHonon troubleshooting](https://www.quantum-espresso.org/Doc/ph_user_guide/node18.html) supports the failure-classification boundary for `ph.x` and phonon artifacts.
- [Quantum ESPRESSO `bands.x` input description](https://www.quantum-espresso.org/Doc/INPUT_BANDS.html) identifies the official post-processing executable and its declared output controls.
- [Quantum ESPRESSO `dos.x` input description](https://www.quantum-espresso.org/Doc/INPUT_DOS.html) identifies the total-DOS post-processing executable and its declared output controls.
- [Quantum ESPRESSO `projwfc.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html) identifies the projected-output executable and its declared output controls.
- [Slurm `squeue` reference](https://slurm.schedmd.com/squeue.html) documents the live queue-inspection interface.
- [Slurm `sacct` reference](https://slurm.schedmd.com/sacct.html) documents the accounting and recorded job-step interface.

The seven HTTPS destinations returned successful documents during the bounded
2026-08-11 reachability check. Reachability does not establish future access,
version compatibility, executable behavior, or scientific correctness.

## Command and evidence boundary

Every public command block begins with one reader-edited `OUT=...` assignment.
The positive QE SCF marker is anchored to the complete text shape observed in
the repository's committed QE 7.5 outputs; negative convergence markers are
searched separately. This avoids the known substring error in which `No
convergence has been achieved` can be counted as a positive marker.

The relaxation block can locate the last complete force, stress, and final
coordinate records from stdout. It cannot decide which Cartesian or cell
components are free without the exact input and version-matching documented
defaults. Aggregate `Total force` therefore remains diagnostic only.

The job, artifact, bands/DOS, and phonon blocks inventory evidence but do not
infer scheduler state, parent compatibility, full-zone sampling, q-space
coverage, dynamical stability, or observable convergence from file presence.

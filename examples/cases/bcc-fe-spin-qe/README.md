# bcc Fe FM/NM QE 7.5 screening case

This terminal-first case stages a real `pw.x` 7.5 fixed-geometry SCF entry for
one-atom bcc Fe.  It declares three ferromagnetic (FM) seeds for an 8/10/12
k-mesh total-energy screen and one non-spin-polarized (NM) candidate at the
12³ mesh.  The runtime UPF is identified by public PSLibrary provenance and a
SHA-256, but its body is intentionally not included.

## Execute only with an authorized allocation

The case needs a QE 7.5 executable and a directory containing the declared
UPF.  It refuses a different pseudopotential hash, refuses an existing public
output directory, uses a fresh temporary runtime directory, and rejects output
that contains a private absolute path before copying it into `output/`.

```bash
QE_PW=/path/to/pw.x \
QE_PSEUDO_DIR=/path/to/pseudopotentials \
QE_LAUNCHER='srun --exclusive --mpi=pmix --ntasks=1 --cpus-per-task=1 --time=00:15:00' \
CASE_ATTEMPT_ID='attempt-02-pmix' \
bash run.sh
CASE_OUTPUT_ROOT="$PWD/output/attempt-02-pmix" bash check.sh
CASE_OUTPUT_ROOT="$PWD/output/attempt-02-pmix" bash extract.sh
```

`QE_PW` and `QE_PSEUDO_DIR` are intentionally runtime-only variables; do not
record their absolute paths in committed evidence.  One allocated task is the
declared low-cost request.  The four SCFs are independent and retain no restart
lineage, so they can be run serially as this script does.

The recorded successful Attempt 02 used exactly the displayed Slurm PMIx
launcher and completed its four QE stages in 60.64 seconds overall. Its wrapper
returned 1 only because the first-generation parser incorrectly demanded one
magnetization line instead of selecting the final SCF iteration; the raw QE
stage exit codes remain zero in `output/attempt-02-pmix/run-status.json`.

Every execution needs a new `CASE_ATTEMPT_ID`.  The script rejects a preexisting
attempt directory and writes valid `run-status.json` after every candidate,
including a failed launch.  The first direct-`srun` launcher failure is retained
under `output/attempt-01-slurm-launch-failure/`; it is not QE completion evidence.

## What the parser requires

For each declared output, `parse.py` requires exactly one QE 7.5 `PWSCF`
banner, exactly one `JOB DONE.` marker, an SCF-convergence marker, one total
energy, separate stdout/stderr, and no listed fatal/nonconvergence marker. FM
outputs must contain one or more SCF-iteration total and absolute magnetization
reports; the parser records their match counts and uses the final reported value.
NM output may omit magnetization, but any reported value must be zero. It writes a
hash-bound parsed summary, a three-point FM k-mesh screen, and an original PNG
of the FM/NM primary-pair energy difference.

The declared G4 test is only the FM 8/10/12 mesh total-energy tail at fixed
cutoffs, smearing, geometry, and seed, with a 0.0005 Ry per Fe-cell tolerance.
It does not test cutoff, smearing, lattice parameter, moment, AFM cell, SOC,
or any other convergence dimension.

## Scientific boundary

An FM run demonstrates only one attained spin-polarized SCF solution.  Even a
completed FM/NM energy comparison identifies, at most, the lower result inside
this explicitly limited pair.  It does **not** establish bcc Fe's magnetic
ground state, an exhaustive magnetic-state search, AFM/ferrimagnetic ordering,
exchange interactions, magnetic anisotropy, a Curie temperature, experimental
agreement, or a general parameter recommendation.

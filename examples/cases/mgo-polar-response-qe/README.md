# MgO Gamma-point QE polar response

This directory records one bounded Quantum ESPRESSO 7.5 entry calculation: a fixed rock-salt MgO primitive cell is first evaluated
by `pw.x` and then passed to a Gamma-point `ph.x` run with `epsil = .true.`.
It is intentionally a single setup, not a convergence study or a material
property reference.

## Execution boundary

`run.sh` is deliberately fail-closed.  It refuses to run unless the caller
provides QE 7.5 `pw.x` and `ph.x`, a separate pseudopotential directory, and
files whose SHA-256 values agree with `input/pseudopotentials.json`.  The
script makes a fresh case-external temporary runtime, stages inputs and UPFs
there, and removes its UPFs, restart tree, WFC files, and scratch on exit.  It
never downloads or commits UPF contents.  Only stdout, stderr, exit-code,
status, and a successful small dynamical matrix are copied back to `output/`.

The planned model is the two-atom rock-salt primitive cell in
`source/model.json`.  Its lattice parameter is a fixed teaching-model choice,
not a relaxed result or a universal recommendation.  `input/qe_plan.json`
sets a zero transcription tolerance only for exact parser identity; it is not
an observable-convergence tolerance.

Suggested allocation after review:

```bash
QE_PW=/path/to/pw.x QE_PH=/path/to/ph.x \
QE_PSEUDO_DIR=/path/to/verified-sssp-pseudos \
QE_RUNNER='srun --ntasks=1 --cpus-per-task=1 --time=00:10:00' \
bash run.sh
```

The allocation cap is 0.17 core-hours.  Actual wall time and charge must be
read from the completed runtime evidence; this estimate is not a benchmark.

## Evidence gates and claim ceiling

| Gate | Current status | Boundary |
| --- | --- | --- |
| G0 input/provenance | PASS | Input files, public pseudo declarations, hashes, and QE 7.5 manual references are present; the selected Mg XML UPF supports automated metadata inspection. |
| G1 execution | PASS | Talos recorded zero exit files, one QE 7.5 banner and one `JOB DONE.` marker for each stage; both captured stderr files are empty. |
| G2 SCF state | PASS | The fixed SCF printed electronic convergence in 15 iterations. This is technical completion only, not cutoff/k-mesh/threshold convergence for a response observable. |
| G3 DFPT response | PASS | The strict parser hash-binds the Γ dynamical matrix, electronic/ion-clamped dielectric tensor (3.214927291 diagonal), and raw/ASR Born-charge blocks actually printed by `ph.x`. |
| G4 observable convergence | NOT TESTED | No cutoff, k-mesh, q-mesh, or response-threshold series is planned in this entry. |
| G5 physical/scientific claim | NOT CLAIMED | No accepted dielectric constant, Born charge, LO--TO splitting, phonon dispersion, or experiment comparison follows. |

`extract.sh` invokes the strict parser.  It
accepts only the planned QE 7.5 markers, one `JOB DONE.` marker for each stage,
SCF and DFPT completion markers, matching `prefix`/`outdir` inputs, and the
printed dielectric/Born-charge sections.  It writes a derived report and PNG.
Only fields actually parsed from `ph.x` may be reported.  A Gamma-only
response does not itself establish LO--TO splitting; that requires a separate
non-analytic/directional workflow and supporting evidence.

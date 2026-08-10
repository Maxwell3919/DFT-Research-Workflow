---
topic_slug: calculate-reference-ground-state
guide_slug: compare-fresh-and-restarted-electronic-states
title: Compare Fresh and File-Initialized Electronic States
kind: implementation
tools:
  - python
  - quantum-espresso
status: reviewed
summary: Separate interrupted-run restart from a new SCF initialized with compatible stored density or wavefunctions, then compare both paths with a controlled fresh solve.
tested_versions:
  - Quantum ESPRESSO 7.5
  - Python 3.12
execution_script: examples/practical-guides/silicon_qe_restarts.py
source_ids:
  - qe-pw-75
  - vasp-istart
  - vasp-icharg
  - cp2k-scf
  - cp2k-dft
  - cod-9013102
media_ids: []
review: docs/reviews/2026-08-03-calculate-reference-ground-state.md
reviewed_at: "2026-08-03"
---

An interrupted-run restart and a file-initialized new SCF are different operations. QE 7.5 reserves `restart_mode='restart'` for a cleanly interrupted calculation. A new fixed-geometry SCF that reads compatible stored density or wavefunctions remains `restart_mode='from_scratch'` and uses `startingpot='file'` and, when justified, `startingwfc='file'`. A controlled fresh SCF instead starts without those parent electronic files.

## Compare histories, not only terminal energies

Create separate fresh-start and restarted directories and place their parent and child inputs, outputs, and restart inventories side by side. Verify the exact geometry, pseudopotential, charge-density, wavefunction, code-version, and numerical-setup identity before treating the two runs as comparable. Open the relevant restart definitions through the [electronic-structure code and manual index](/DFT-Research-Workflow/operations/resource-landscape/#electronic-structure-codes).

Run both branches with the same declared evaluator. Read every SCF iteration, not just the final total energy: compare residual trends, oscillation, iteration count, occupations, charge or spin state, symmetry, warnings, and any fallback algorithm. Where the implementation produces inspectable charge or magnetization data, compare aligned views as a diagnostic; the [visualization resource index](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) lists suitable tools.

Accept equivalence only when both branches meet their electronic criteria and retain the intended physical state within the declared tolerances. Equal terminal energies alone do not prove identical states, valid parent ancestry, or observable convergence. A faster file-initialized branch does not show that the fresh route is wrong; a fresh branch changing state may reveal trapping, path dependence, or an incompatible parent.

## Build one fresh branch and one file-initialized branch

Start from one accepted `scf.in`, exact pseudopotential set, geometry, method, k mesh, occupations, charge, spin treatment, and convergence protocol. Make two isolated directories so neither branch overwrites the other's evidence:

```bash
root="$HOME/drw-runs/si-init-comparison"
test ! -e "$root"
mkdir -p "$root"/{fresh,file-init}/{pseudo,tmp}
cp scf.in "$root/fresh/scf.in"
cp scf.in "$root/file-init/scf.in"
```

The **fresh** input should explicitly use a newly generated starting potential and wavefunctions in `&ELECTRONS`:

```qe
&ELECTRONS
  conv_thr = 1.0d-10,
  startingpot = 'atomic',
  startingwfc = 'atomic+random',
/
```

The displayed threshold belongs to the Silicon example. QE 7.5 documents `startingpot='atomic'` as the normal fresh SCF potential and `startingwfc='atomic+random'` as one fresh wavefunction initialization. A scientifically sensitive state may need more than one controlled fresh seed or initialization; no one seed proves uniqueness.

For the **file-initialized** branch, copy a complete, compatible parent save tree into its isolated `outdir` and preserve a before-run inventory and hashes. The parent must match the geometry representation, atom order, pseudopotentials, Hamiltonian, charge/spin treatment, QE version, prefix, and file representation required by the new calculation:

```bash
: "${PARENT_SAVE:?Set PARENT_SAVE to the accepted parent prefix.save directory}"
test -d "$PARENT_SAVE"
test ! -e "$root/file-init/tmp/si_final.save"
cp -a -- "$PARENT_SAVE" "$root/file-init/tmp/si_final.save"
find "$root/file-init/tmp/si_final.save" -maxdepth 2 -type f -printf '%12s %p\n' | sort > "$root/file-init/parent-save.inventory"
```

Keep `restart_mode='from_scratch'`. Set the matching prefix/outdir and request the existing density; request existing wavefunctions only when their compatibility has also been established:

```qe
&CONTROL
  calculation = 'scf',
  restart_mode = 'from_scratch',
  prefix = 'si_final',
  outdir = './tmp',
  pseudo_dir = './pseudo',
/
&ELECTRONS
  conv_thr = 1.0d-10,
  startingpot = 'file',
  startingwfc = 'file',
/
```

QE 7.5 documents `startingpot='file'` as reading `charge-density.xml` under the declared `prefix` and `outdir`, and `startingwfc='file'` as reading existing wavefunction files there. These controls do not independently validate ancestry or scientific compatibility. If wavefunctions are unavailable or not compatible, do not request them merely to save iterations.

Stage the same exact UPF in both `pseudo/` directories. Run the branches independently and retain stdout, stderr, and exit status:

```bash
for branch in fresh file-init; do
  (
    cd "$root/$branch"
    test ! -e scf.out
    test ! -e scf.err
    if pw.x -in scf.in > scf.out 2> scf.err; then
      status=0
    else
      status=$?
    fi
    printf '%s\n' "$status" > scf.exit-status
    exit "$status"
  )
done
```

For production/HPC work, submit each branch with the site-specific Slurm template in [Prepare a Fixed-Geometry Reference Calculation](/DFT-Research-Workflow/operations/calculate-reference-ground-state/guides/prepare-fixed-geometry-reference-calculation/). Use distinct scratch paths and job IDs; scheduler completion and SCF convergence remain separate.

Compare full histories, not only speed or the terminal energy:

```bash
for branch in fresh file-init; do
  out="$root/$branch/scf.out"
  err="$root/$branch/scf.err"
  printf '\n%s\n' "$branch"
  cat "$root/$branch/scf.exit-status"
  test "$(grep -cF 'Program PWSCF v.' -- "$out")" -eq 1
  test "$(grep -cF 'JOB DONE.' -- "$out")" -eq 1
  grep -E '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' -- "$out" | tail -n 1
  grep -F '!    total energy' -- "$out" | tail -n 1
  grep -Ei 'Fermi energy|highest occupied|magnetization|occupation|symmetry' -- "$out" || true
  grep -niE 'warning|error in routine|stopping|not converged|no convergence' -- "$out" "$err" || true
done
```

Treat the paths as equivalent only under declared tolerances for the energy or free-energy quantity, residual history, occupations/Fermi level, charge and magnetization diagnostics, symmetry, forces/stress where requested, and the downstream observable. Agreement supports path robustness for the tested pair; it does not establish candidate completeness, a unique electronic ground state, or physical validity.

Inspect the bounded Silicon inputs and outputs before running its helper:

```bash
restart_root=examples/practical-guides/data/silicon-qe/restart
fresh_in="$restart_root/fresh.in"
restart_in="$restart_root/restart.in"
fresh_out="$restart_root/fresh.out"
restart_out="$restart_root/restart.out"

sha256sum -- "$fresh_in" "$restart_in" "$fresh_out" "$restart_out"
grep -En 'calculation|restart_mode|prefix|outdir|pseudo_dir|ecutwfc|ecutrho|occupations|K_POINTS' \
  -- "$fresh_in" "$restart_in"
if diff -u -- "$fresh_in" "$restart_in"; then
  printf '%s\n' 'The two inputs are byte-for-byte identical.'
else
  diff_status=$?
  case "$diff_status" in
    1) printf '%s\n' 'Inputs differ; inspect the unified diff above.' ;;
    *) exit "$diff_status" ;;
  esac
fi
for output in "$fresh_out" "$restart_out"; do
  printf '\n%s\n' "$output"
  test "$(grep -cF 'Program PWSCF v.' -- "$output")" -eq 1
  test "$(grep -cF 'JOB DONE.' -- "$output")" -eq 1
  grep -E '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' -- "$output" | tail -n 1
  grep -F '!    total energy' -- "$output" | tail -n 1
  grep -niE 'warning|error in routine|stopping|not converged|no convergence|magnetization|occupation' \
    -- "$output" || true
done
find "$restart_root" -maxdepth 2 -type f -printf '%12s %p\n' | sort
```

The diff and inventory show what is present in this checkout. They do not verify a saved-density or wavefunction parent, and the stored bundle has no separate shell-exit or stderr artifacts. Those evidence fields remain unavailable rather than being inferred from `JOB DONE.`. The stored Silicon comparison script below is optional automation for its bounded artifacts. It can reproduce the declared energy and marker comparison, but it cannot establish a general restart policy or prove state identity beyond the recorded evidence.

## Run the bounded comparison

```bash
python3 examples/practical-guides/silicon_qe_restarts.py
```

The companion checks two stored SCF outputs plus two relaxation-segment outputs. For the fresh/restart SCF pair it requires literal electronic-convergence and `JOB DONE` markers and compares the printed total energies. It does not inspect the inputs or saved restart objects.

Use the report as a first check only. Inspect the structure, prefix/outdir lineage, Hamiltonian, potential, charge, occupations, moments, symmetry, and warnings in both runs. Equal printed energy supports neither equal state identity nor restart compatibility by itself. If the final states agree under all declared diagnostics, retain fresh and restart as two paths to the same candidate. If they differ, preserve both and send them to the candidate-state comparison instead of selecting the convenient result.

## Actual Silicon fresh/restart comparison

The published inputs describe a completed fresh QE 7.5 SCF followed by a second
SCF that sets `restart_mode='restart'` for one Silicon cell. The second run did
execute, but the current QE 7.5 manual does not document this as the general way
to initialize a new SCF from a completed parent. The declared companion does not
read those inputs or verify prefix, outdir, potential, cell, occupations, k mesh,
or saved data. It hashes the two stored outputs, requires literal
electronic-convergence and `JOB DONE` markers, and confirms equal printed total
energies. Preserve this pair as bounded historical execution evidence; do not
copy its `restart_mode` transition as a new recipe. Equal energy does not establish
equal state identity, compatible execution, uniqueness, or physical ordering.

## Declare the initialization lineage

For every run, record the initialization mode, parent electronic artifact, structure checksum, method and potential identity, total charge, spin and occupation target, software version, and compatibility checks.

A stored file being readable does not show that it belongs to the same Hamiltonian, structure, charge, or state branch.

## Compare final state identity, not only energy

The following deterministic fixture concept contains a fresh initialization that
reaches `FM-A`, a compatible restart that reaches the same state, and another
restart that reaches `AFM-B`. It is not executed by the declared companion:

```python
import sys

sys.path.insert(0, "examples/practical-guides")
from reference_state_fresh_restart import run

report = run()
print(report["same_state_paths"])
print(report["separate_state_paths"])
```

The first two records form one fixture lineage only because completion, state labels, and their declared energy comparison agree. The `AFM-B` record remains a separate candidate. The fixture tolerance is teaching data, not a recommended DFT threshold.

## Use fresh starts to expose path dependence

A state reached from reused electronic data may be legitimate, but the path dependence should remain visible. Repeat sensitive states from controlled fresh initializations and compare occupations, charge, moments, symmetry, and energy.

A different outcome may identify another basin, an unsuitable initialization, or a state switch. Preserve the result instead of merging the lineages.

## Initialize only from compatible objects

Changes to structure, atom order, functional, potentials, charge, spin treatment, relativistic setup, basis identity, k-point representation, or boundary conditions can make stored data incompatible. Code-specific file-read controls do not replace a workflow-level compatibility decision. Use the optimization restart guide only for the narrower cleanly interrupted-run operation.

## What this guide verifies

`silicon_qe_restarts.py` verifies four stored-output hashes and marker strings,
equal printed energies for the fresh/restart SCF pair, and two relaxation-segment
messages. It does not verify input compatibility, restart data, or electronic-state
identity and does not execute the conceptual magnetic fixture. It establishes no
restart portability, observable convergence, candidate completeness, or physical
ordering.

## Common mistakes

**Calling every use of stored data a restart.** In QE, interrupted-run restart and file-initialized new SCF have different controls and evidence.

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

---
topic_slug: validate-results-and-scientific-conclusions
guide_slug: inspect-qe-hpc-calculations-from-the-terminal
title: Inspect QE HPC Calculations from the Terminal
kind: implementation
tools:
  - python
  - quantum-espresso
status: reviewed
summary: Inspect Quantum ESPRESSO files and Slurm records from a terminal while keeping scheduler state, program completion, numerical evidence, and scientific acceptance separate.
tested_versions:
  - Python 3.12
  - Quantum ESPRESSO 7.5 committed-output format
execution_script: examples/practical-guides/qe_hpc_terminal_inspection.py
source_ids:
  - qe-pw-75
  - qe-ph-75
  - qe-bands-docs
  - qe-dos-docs
  - qe-projwfc-docs
  - qe-q2r-docs
  - qe-matdyn-docs
  - slurm-sbatch-docs
  - slurm-squeue-docs
  - slurm-sacct-docs
  - slurm-scontrol-docs
  - slurm-scancel-docs
media_ids: []
review: docs/reviews/2026-08-09-qe-terminal-inspection-and-audit.md
reviewed_at: "2026-08-09"
---

## Purpose

Terminal inspection answers bounded operational questions: Where is the calculation? Which executable produced a file? Is a recorded job pending, running, or finished? Does a particular output contain termination and solver markers? Which artifacts exist, and are their bytes the ones that were reviewed?

Those observations are not interchangeable. A Slurm `COMPLETED` state does not prove that `pw.x` reached self-consistency. `JOB DONE.` does not prove convergence of the target observable. An SCF marker does not establish a ground state, a converged phonon dispersion, or a scientific conclusion. Record each observation with its command, path, job ID, and observation time.

The commands below are read-only unless a side effect is explicitly identified. They use the committed `bcc-fe-spin-qe` case when a concrete file is needed, so they can be run from the repository root without inventing a calculation result.

This is the terminal part of a larger human workflow. Before accepting the calculation, also open the structure in an appropriate viewer, inspect convergence tables and plots, and compare the physical result with the intended model and relevant literature. Terminal evidence can locate and classify a problem; it cannot replace those visual and scientific checks.

## Prepare

Anchor the inspection before reading a log:

```bash
case_root=examples/cases/bcc-fe-spin-qe
(
  cd -- "$case_root"
  pwd -P
)
test -d "$case_root"
```

Changing directory inside the subshell proves that the recorded case path is reachable without silently changing the caller's shell. It does not prove that the path belongs to the intended run or that any output is valid.


`pwd -P` proves the shell's resolved current directory at that moment. It does not prove that the directory is the intended project authority, that no process is writing there, or that a similarly named scratch directory is equivalent.

Inventory the relevant executables without starting a calculation:

```bash
for exe in pw.x ph.x bands.x dos.x projwfc.x q2r.x matdyn.x; do
  if path=$(command -v "$exe" 2>/dev/null); then
    printf '%-10s %s\n' "$exe" "$path"
  else
    printf '%-10s %s\n' "$exe" 'NOT FOUND'
  fi
done

if mpi_path=$(command -v mpirun 2>/dev/null); then
  printf '%-10s %s\n' 'mpirun' "$mpi_path"
  mpirun --version | head -n 5
else
  printf '%-10s %s\n' 'mpirun' 'NOT FOUND'
fi

if pw_path=$(command -v pw.x 2>/dev/null); then
  "$pw_path" -h </dev/null 2>&1 | head -n 5
else
  printf '%-10s %s\n' 'pw.x' 'NOT FOUND' >&2
fi
```

`command -v` proves only which command the current shell would resolve. `mpirun --version` identifies the currently resolved launcher, not the launcher used by a previous job and not its compatibility with the installed QE build or the scheduler. The help banner can identify a local executable build when that build supports `-h`. None of these commands proves that a calculation succeeded. For a completed run, compare this shell evidence with the version banner inside the exact saved output:

```bash
find "$case_root/output" -type f -name '*.out' \
  -exec grep -Hn -m 1 -E 'Program (PWSCF|PHONON|BANDS|DOS|PROJWFC|Q2R|MATDYN) v\.' {} +
```

`grep` is used because it is normally present on HPC systems. If `rg` is installed, it can provide a faster recursive search, but a search tool does not strengthen the evidence in the matching line.

Check capacity in both blocks and inodes:

```bash
df -h -- . "${TMPDIR:-.}"
df -ih -- . "${TMPDIR:-.}"
```

This can reveal that the inspected filesystem or declared temporary directory is full. It cannot prove that a compute node sees the same mount, that quota remains available, or that a future write will succeed.

Build a bounded file inventory:

```bash
ls -lah -- "$case_root"
find "$case_root" -maxdepth 4 -type f \
  -printf '%TY-%Tm-%TdT%TH:%TM:%TS %12s %p\n' | sort
find "$case_root" -maxdepth 4 -type f -size 0 -print
```

`ls` and `find` establish names, sizes, and filesystem timestamps visible to this process. They do not establish file completeness, content identity, provenance, or whether a zero-byte file is an expected stderr capture or a failed output. GNU `find -printf` is implementation-specific; on another system, use that site's supported formatting while preserving the same fields.

## Run

### Invoke only the branch the question requires

These are real serial invocation forms. Replace the filenames with reviewed inputs, use the site-approved MPI or scheduler launcher when required, and run only the branch demanded by the scientific question:

```bash
# pw.x: reference, relaxation, NSCF, or bands parent as declared by calculation= in this input.
pw.x -in scf.in > scf.out 2> scf.err

# bands.x: post-process a compatible completed pw.x bands calculation.
bands.x -in bands.in > bands.out 2> bands.err

# dos.x: read a compatible dense-grid pw.x NSCF parent.
dos.x -in dos.in > dos.out 2> dos.err

# projwfc.x: read the compatible pw.x prefix/outdir and wavefunctions it requires.
projwfc.x -in projwfc.in > projwfc.out 2> projwfc.err

# ph.x: start the required phonon branch from a compatible converged pw.x parent.
ph.x -in ph.in > ph.out 2> ph.err

# q2r.x: transform the declared complete ph.x dynamical-matrix set into real-space force constants.
q2r.x -in q2r.in > q2r.out 2> q2r.err

# matdyn.x: read the q2r.x force constants for the requested dispersion or mode calculation.
matdyn.x -in matdyn.in > matdyn.out 2> matdyn.err
```

Each line proves only that the shell attempted that executable with separate stdout and stderr paths. Its exit status and output must still be inspected. The comments state parent requirements; they do not define one mandatory `pw.x → bands.x → dos.x → projwfc.x → ph.x → q2r.x → matdyn.x` sequence. Keep every branch in its own prefix/outdir and record the actual launcher, working directory, input hash, and parent artifact identity.

Before a submission, a Slurm installation may support a non-submitting syntax and feasibility check:

```bash
sbatch --test-only job.slurm
```

This checks how the local scheduler parses the request and may estimate feasibility. It does not submit a job, test the QE executable, confirm file paths on a compute node, or guarantee a start time.

The next command has a side effect: it submits a job. Use it only after checking the script, account, partition, working directory, output paths, and ownership:

```bash
submission=$(sbatch --parsable job.slurm)
job_id=${submission%%;*}
printf 'submitted job_id=%s\n' "$job_id"
```

The returned ID proves that the scheduler accepted a request. It does not prove that the job started or that QE completed.

For a recorded job ID, inspect current and accounting views separately:

```bash
job_id=${job_id:?Set job_id to the exact recorded Slurm job ID}
squeue -j "$job_id" -o '%.18i %.9T %.10M %.10l %.6D %R'
sacct -j "$job_id" --format=JobIDRaw,JobName%24,State,ExitCode,Elapsed,Timelimit,AllocCPUS,MaxRSS
scontrol show job -dd "$job_id"
```

`squeue` is a current queue observation. An empty result can mean completion, purge, the wrong cluster, or the wrong ID. `sacct` is scheduler accounting and can preserve step exit codes after the queue entry disappears, but availability and fields depend on site configuration. `scontrol show job -dd` exposes the scheduler's detailed record, including work directory, command, resources, and reason fields when retained. None reads the scientific meaning of QE output.

Inspect processes owned by the current user on the current host without signalling them:

```bash
ps -u "$USER" -o pid,ppid,stat,etime,cmd --forest
```

This proves only that matching local processes were visible at that instant. It does not inspect another compute node, establish scheduler ownership, identify the correct calculation without its recorded path and job ID, or authorize cancellation.

Follow a known live log by name:

```bash
live_log=${live_log:?Set live_log to the exact stdout path for the recorded stage}

# Follow the currently open file descriptor; stop with Ctrl-C.
tail -f -- "$live_log"

# Alternative when the named file may be rotated or recreated; stop with Ctrl-C.
tail -F -- "$live_log"
```

`tail -f` follows the currently open file descriptor. `tail -F` follows the filename and retries if it disappears, which is useful for rotation but can attach to replacement bytes. Neither proves scheduler state, normal program termination, SCF convergence, or scientific validity.


`tail -F` proves that new bytes become visible at that path and continues across file replacement. Silence does not prove a hung job, and new text does not prove progress or convergence. Exit with `Ctrl-C`; this stops only the local viewer.

Cancellation changes scheduler state and can terminate a running calculation. Use it only for a job that you own and have positively identified. Re-read the job record, require an exact confirmation, then request cancellation:

```bash
job_id=${job_id:?Set job_id to the exact recorded Slurm job ID}
job_owner=$(squeue -h -j "$job_id" -o '%u' | head -n 1)
test -n "$job_owner"
test "$job_owner" = "$USER"
scontrol show job -dd "$job_id"
read -r -p "Type CANCEL $job_id to confirm: " confirmation
test "$confirmation" = "CANCEL $job_id"
scancel "$job_id"
```

This sends a cancellation request for the confirmed job ID; it does not prove that every job step stopped, that output buffers were flushed, or that restart data are usable. Recheck `squeue`, `sacct`, `scontrol`, active processes, and output timestamps. A slow, quiet, or scientifically blocked job is not by itself a reason or authorization to cancel it.

## Check

Choose an exact output rather than searching whichever file happens to be newest:

```bash
out="$case_root/output/attempt-02-pmix/fm-k12.out"
test -f "$out"
head -n 40 -- "$out"
tail -n 80 -- "$out"
less -S +G -- "$out"
```

`head` is useful for the program banner, parallel layout, and input echo. `tail` is useful for the most recent termination context. `less` permits non-destructive review of the complete file. A plausible header and tail do not prove that the middle is intact; inspect the complete stage and bind its hash.

Count and search without silently treating a marker as acceptance:

```bash
wc -l -- "$out"
if grep -n -E \
  'Program (PWSCF|PHONON|BANDS|DOS|PROJWFC|Q2R|MATDYN)|JOB DONE|convergence has been achieved|No convergence has been achieved|^!.*total energy|Fermi energy|Forces acting on atoms|Total force|total[[:space:]]+stress|ATOMIC_POSITIONS' \
  -- "$out"; then
  :
else
  grep_status=$?
  case "$grep_status" in
    1) printf '%s\n' 'No requested marker was found.' >&2 ;;
    *) exit "$grep_status" ;;
  esac
fi

awk '
  /^!.*total energy/ { energy=$0 }
  /the Fermi energy is/ { fermi=$0 }
  END {
    if (energy == "") exit 1
    print energy
    if (fermi != "") print fermi
  }
' "$out"

grep -n -i -E \
  'warning|error in routine|stopping|not converged|no convergence|segmentation fault|out of memory|oom-kill' \
  -- "$out" || true
```

`wc -l` counts newline-terminated records only; it does not prove completeness. The guarded `grep` returns 0 when at least one requested marker is found, 1 when none is found, and a value greater than 1 for an access or execution error; only status 1 is translated into “not found.” The `awk` command prints the last matching total-energy line and, when present, the last matching Fermi-energy line. It is a bounded text extraction, not a unit-aware parser and not evidence of convergence.


The first search locates evidence candidates; it does not decide which gate they satisfy. The second search locates adverse text; an empty result means only that these patterns were absent. Read surrounding lines and stderr because software- and site-specific failures use other wording.

Extract the final coordinate block from an exact relaxation output rather than assuming that the last `ATOMIC_POSITIONS` match is final:

```bash
relax_out=${relax_out:?Set relax_out to the exact relaxation stdout path}
sed -n '/Begin final coordinates/,/End final coordinates/p' "$relax_out"
```

This prints the coordinates that QE labelled as final in that file. An empty result means only that the block was absent or used different version-specific wording. The block does not prove that the ionic thresholds were satisfied, that the geometry is a minimum, or that another coordinate convention was converted correctly.

For a declared `ph.x` or `matdyn.x` output, locate printed mode frequencies:

```bash
ph_out=${ph_out:?Set ph_out to the exact ph.x or matdyn.x stdout path}
if grep -n -E 'freq[[:space:]]*\([[:space:]]*[0-9]+\)[[:space:]]*=' "$ph_out"; then
  :
else
  grep_status=$?
  case "$grep_status" in
    1) printf '%s\n' 'No printed mode-frequency line was found.' >&2 ;;
    *) exit "$grep_status" ;;
  esac
fi
```

A frequency match proves only that a line with the requested QE text shape was printed. It does not establish complete q-point coverage, acoustic-sum-rule treatment, phonon convergence, or dynamical stability.


This reports matching frequencies and units at the q points present in that output. It does not establish q-space coverage, acoustic-sum-rule quality, displacement or q-mesh convergence, dynamical stability, anharmonic stability, or experimental agreement. Preserve negative or imaginary modes instead of filtering them out.

Different QE executables create different evidence:

| Executable | What terminal evidence can establish | What it cannot establish alone |
| --- | --- | --- |
| `pw.x` | Program identity, recorded exit, SCF marker, energies, occupations, forces, stress, and printed structures when requested | Basis, k-point, smearing, geometry, magnetic-state, or target-observable convergence |
| `ph.x` | The requested DFPT stage, q-point text, response convergence, dynamical-matrix output, and termination | Full q-space coverage, interpolation convergence, dynamical stability, EPC convergence, or temperature validity |
| `bands.x` | Post-processing completion and existence of the declared band-data artifact | Adequacy of the parent SCF/path, full-zone extrema, or a physical band gap |
| `dos.x` | Total-DOS post-processing and the declared energy-grid artifact | Brillouin-zone convergence, correct normalization, or projection closure |
| `projwfc.x` | Projection output and orbital/channel labels for one parent state | Basis completeness, unique chemical bonding, or equality between summed projections and total DOS without an explicit check |
| `q2r.x` | Conversion from a declared dynamical-matrix set to a force-constant artifact | Completeness or correctness of that set, real-space convergence, or stability |
| `matdyn.x` | Frequencies/eigenvectors at requested q points from a declared force-constant artifact | Correct parent lineage, q-grid convergence, non-analytic-correction validity, anharmonic stability, or experimental agreement |

Inventory downstream files and zero-byte captures explicitly:

```bash
find "$case_root" -type f \
  \( -name '*.dyn*' -o -name '*.fc' -o -name '*.freq' -o -name '*.modes' \
     -o -name '*.dos' -o -name '*.pdos*' -o -name '*.dat*' -o -name '*.json' \) \
  -printf '%12s %p\n' | sort
find "$case_root" -type f -size 0 -print
```

Existence and nonzero size are artifact checks, not semantic checks. A zero-byte stderr can be expected; a zero-byte dynamical matrix can be terminal adverse evidence. Interpret each file against the stage that was supposed to write it.

Compare inputs and bind bytes:

```bash
if diff -u -- \
  "$case_root/input/fm-k10.scf.in" \
  "$case_root/input/fm-k12.scf.in"; then
  printf '%s\n' 'Inputs are byte-for-byte identical.'
else
  diff_status=$?
  case "$diff_status" in
    1) printf '%s\n' 'Inputs differ; inspect the unified diff above.' >&2 ;;
    *) exit "$diff_status" ;;
  esac
fi

sha256sum -- \
  "$case_root/manifest.json" \
  "$case_root/input/fm-k12.scf.in" \
  "$out"
```

For `diff`, exit 0 means identical inputs, exit 1 means a real difference, and an exit value greater than 1 is an operational error that must not be reported as a scientific difference. `sha256sum` binds exact bytes; neither command establishes which input is scientifically appropriate.


`diff` makes textual changes inspectable; it does not decide whether two calculations are scientifically comparable or reveal defaults that were not printed. `sha256sum` binds exact bytes; matching hashes do not prove correctness, completeness, convergence, or provenance beyond the declared binding.

## Read

**Termination.** Combine scheduler state, step exit code, program banner, fatal text, termination marker, and expected artifacts. Any one item is incomplete. The committed bcc Fe case preserves a first Slurm/Open MPI launch failure before `PWSCF` and a second attempt whose four QE stages each exited zero and printed `JOB DONE.`.

**SCF.** Read the final SCF marker, iteration history, residual threshold, occupations, spin state, and warnings. Internal self-consistency says the declared electronic iteration stopped under its criterion. It does not establish the lowest electronic state or convergence with respect to cutoff, k mesh, smearing, cell, or candidate set.

**Energy and Fermi level.** Use the final exclamation-mark total energy, its units and normalization, and the occupation model. A printed Fermi energy is code-defined output for that state; comparing it across different references, charges, cells, smearings, or Hamiltonians is not automatically meaningful. Small last-iteration energy changes are not a substitute for an external convergence series.

**Forces, stress, and coordinates.** Check that force/stress printing was requested, units are recorded, constrained components are understood, and the coordinates correspond to the exact intended frame. Small forces on a symmetry-fixed one-atom SCF model do not prove relaxation, dynamical stability, or a global minimum. Stress can diagnose a fixed cell but does not by itself authorize changing it.

**Warnings.** Preserve warnings with their surrounding context and software version. A warning-free text search cannot prove absence of silent numerical problems. A warning does not always invalidate a result, but ignoring it without a bounded assessment leaves the claim unsupported.

**Phonons.** Record every computed q point, dynamical-matrix identity, q2r input set, force-constant file, matdyn path, acoustic-sum-rule treatment, and imaginary-frequency convention. One Gamma calculation cannot support a dispersion or whole-Brillouin-zone stability claim. The committed bcc Fe case contains no phonon artifacts, so it supports no phonon conclusion.

**Artifacts.** Match inputs, stdout, stderr, derived tables, figures, restart objects, and manifests by path, size, hash, and lineage. Artifact integrity can prove that reviewed bytes were retained. It cannot upgrade a failed numerical check or validate a scientific interpretation.

Keep the complete output open in `less` while reading any extracted table or plot. Inspect the iteration sequence around an apparent oscillation or warning instead of relying on the last matching line. For a relaxation, compare the final coordinates with the starting structure in a viewer and look for unexpected reconstruction or short contacts. For bands, DOS, and phonons, open the actual figure and underlying table; visual plausibility complements, but never replaces, observable-specific convergence.

## If it fails

First classify the layer that failed. A pending allocation is not a QE failure. A launcher/MPI error before the program banner is not SCF nonconvergence. A nonzero wrapper exit can coexist with successful child stages. `JOB DONE.` can coexist with an observable-specific convergence failure.

Preserve the failed attempt before changing anything. Retain the job ID, submission command, scheduler records, exact work directory, stdout, stderr, inputs, exit codes, and hashes. Put a repaired run in a new attempt directory with a causal link to the failure; do not overwrite the adverse record.

If the output stops moving, recheck `squeue`, `sacct`, `scontrol`, file timestamps, sizes, and the program's known buffering behavior. Do not infer a hang from `tail -F` silence. Do not cancel by default. If a cancellation is actually authorized, the operator must re-establish job ownership, scope, downstream effects, and restart safety immediately before the side effect.

## Next

Run the read-only companion from the repository root:

```bash
python3 examples/practical-guides/qe_hpc_terminal_inspection.py
```

It checks the sizes and SHA-256 values declared by the committed case manifest, the preserved launch failure, the four recorded Attempt 02 exit codes, QE/SCF markers, selected energies and Fermi levels, and the failed numerical-convergence record. It does not call Slurm, inspect a live process, submit or cancel a job, or modify a file.

After terminal triage, use the worked audit to decide which scientific check failed. Continue with [symptom-first Troubleshooting](/DFT-Research-Workflow/operations/troubleshooting/) or return to the relevant A–D topic; do not proceed to a stronger claim until that check has new, traceable evidence under a predeclared criterion.

## Official sources

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

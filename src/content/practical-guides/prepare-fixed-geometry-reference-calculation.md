---
topic_slug: calculate-reference-ground-state
guide_slug: prepare-fixed-geometry-reference-calculation
title: Prepare a Fixed-Geometry Reference Calculation
kind: implementation
tools:
  - quantum-espresso
  - python
status: reviewed
summary: Convert an accepted optimization result into a fixed-geometry reference protocol while preserving model and Hamiltonian identity and recording every numerical refinement.
tested_versions:
  - Quantum ESPRESSO 7.5
  - Python 3.12
execution_script: examples/practical-guides/qe_manual_handoff.py
source_ids:
  - qe-pw-75
  - vasp-electronic-minimization
  - cp2k-scf
  - abinit-basic1
  - cod-9013102
media_ids:
  - silicon-qe-scf-output-terminal
review: docs/reviews/2026-08-03-calculate-reference-ground-state.md
reviewed_at: "2026-08-03"
---

## Purpose

A fixed-cell relaxation and a static SCF calculation are separate runs. The accepted geometry must be copied explicitly; sharing a prefix or scratch directory is not a geometry handoff.

This page is also the daily QE 7.5 SCF route for an already accepted fixed geometry. If the scientific question intentionally uses an experimental, constrained, or scanned structure, record that decision instead of pretending the object was relaxed.

## Write one complete `scf.in`

Create a new directory and keep this run independent of the relaxation scratch tree:

```bash
run="$HOME/drw-runs/si-final-scf"
test ! -e "$run"
mkdir -p "$run"/{pseudo,tmp}
cd "$run"
```

Create `scf.in` in a text editor. This complete QE 7.5 example uses the final coordinates printed by the real Silicon fixed-cell relaxation used elsewhere in this site. Its structure, pseudopotential filename, 40/320 Ry cutoffs, 8×8×8 mesh, and thresholds belong to that teaching case; none is transferable without the B-stage tests required by another model and observable.

```qe
&CONTROL
  calculation = 'scf',
  prefix = 'si_final',
  outdir = './tmp',
  pseudo_dir = './pseudo',
  tprnfor = .true.,
  tstress = .true.,
/
&SYSTEM
  ibrav = 0,
  nat = 2,
  ntyp = 1,
  ecutwfc = 40.0,
  ecutrho = 320.0,
  occupations = 'fixed',
/
&ELECTRONS
  conv_thr = 1.0d-10,
/
ATOMIC_SPECIES
Si 28.0855 Si.pbe-n-rrkjus_psl.1.0.0.UPF
CELL_PARAMETERS angstrom
0.0000000000 2.7152000000 2.7152000000
2.7152000000 0.0000000000 2.7152000000
2.7152000000 2.7152000000 0.0000000000
ATOMIC_POSITIONS crystal
Si 0.0100077351 -0.0000020877 -0.0000020877
Si 0.2599922649  0.2500020877  0.2500020877
K_POINTS automatic
8 8 8 0 0 0
```

Choose each field from a named upstream decision:

| Field or object | Required source |
| --- | --- |
| `CELL_PARAMETERS`, `ATOMIC_POSITIONS`, species and atom order | the accepted geometry or an explicitly justified fixed structure |
| UPF filename, source, release, XC and relativistic metadata, hash | the B-stage pseudopotential decision |
| `ecutwfc`, `ecutrho`, k mesh and occupations | observable-relevant B-stage convergence studies |
| charge, `nspin`/noncollinear/SOC, Hubbard and dispersion settings | the declared Hamiltonian and candidate state |
| `conv_thr` and diagonalization/mixing changes | an electronic protocol shown adequate for the quantities inspected |
| `prefix`, `outdir`, `pseudo_dir` | a unique, writable run identity with no concurrent writer |

For a metal, replace the occupation fields only with the tested metallic protocol and inspect the reported Fermi level. For a magnetic calculation, carry the exact spin treatment and initialization, then inspect the attained total/local moments and occupations. A copied `starting_magnetization` is a search seed, not the final state label.

Before launch, inspect the complete input and exact pseudopotential object:

```bash
: "${PSEUDO_SOURCE:?Set PSEUDO_SOURCE to the verified Silicon UPF}"
test -f "$PSEUDO_SOURCE"
test "$(basename -- "$PSEUDO_SOURCE")" = 'Si.pbe-n-rrkjus_psl.1.0.0.UPF'
sha256sum -- "$PSEUDO_SOURCE"
ln -s -- "$PSEUDO_SOURCE" "pseudo/$(basename -- "$PSEUDO_SOURCE")"

command -v pw.x
grep -En 'calculation|prefix|outdir|pseudo_dir|tprnfor|tstress|ecutwfc|ecutrho|occupations|conv_thr' scf.in
sed -n '/^ATOMIC_SPECIES/,$p' scf.in
test -r pseudo/Si.pbe-n-rrkjus_psl.1.0.0.UPF
test -w tmp
```

The QE version printed in `scf.out` after launch identifies the executable that actually ran. Input readability does not establish pseudopotential suitability, numerical convergence, or a trustworthy reference state.


## Inspect the handoff before running the static state

Open the accepted relaxation geometry and the proposed fixed-geometry input side by side in a text editor and a structure viewer. Compare lattice vectors, units, atom order, species labels, coordinates, constraints, charge, and spin settings. Reopen the source and relaxed endpoints with identical display settings to catch a unit, wrapping, vacuum, or atom-mapping error. A shared prefix or restart directory does not transfer geometry unless the implementation explicitly reads that geometry object.

Read the relaxation's complete electronic, free-force, stress, displacement, warning, and stop histories before accepting the handoff. Copy only the accepted geometry into a new, inspectable static input and use a text diff to review the change. Open the relevant SCF and restart definitions through the [electronic-structure code and manual index](/DFT-Research-Workflow/operations/resource-landscape/#electronic-structure-codes); use the [viewer and symmetry index](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) for the structural comparison.

Run the fixed-geometry calculation in its own directory through the normal executable or scheduler. Inspect its full SCF iteration history, occupations, state diagnostics, warnings, final energy, and force or stress diagnostics where relevant. `JOB DONE` checks normal termination only. The electronic convergence marker checks the solver condition reported by that run; neither establishes a trustworthy reference state.

Decide whether the static result preserves the intended state and is suitable as the parent of the target calculation. The helper later on is an optional convenience for reconstructing the stored Silicon handoff. It does not run QE and does not claim that the stored static calculation descended from the stored relaxation.

## Select the fresh relaxation result

Set these paths to the run you just completed:

~~~bash
repo_root=$(pwd)
case_root="$repo_root/examples/cases/silicon-ground-state-electronic-structure"
runtime="$HOME/drw-runs/si-manual"
relax_in="$runtime/relax/si-relax.in"
relax_out="$runtime/relax/si-relax.out"
reference="$runtime/reference"

test -f "$relax_in"
test -f "$relax_out"
grep -En 'calculation|forc_conv_thr|nstep|ion_dynamics' -- "$relax_in"
sed -n '/^ATOMIC_POSITIONS/,/^K_POINTS/p' "$relax_in"
test "$(grep -cF 'Program PWSCF v.' -- "$relax_out")" -eq 1
test "$(grep -cF 'JOB DONE.' -- "$relax_out")" -eq 1
grep -F 'bfgs converged' -- "$relax_out"

awk '
  /Forces acting on atoms/ {block=$0 ORS; inside=1; next}
  inside {block=block $0 ORS}
  inside && /Total force =/ {last=block; inside=0}
  END {if (last == "") exit 1; printf "%s", last}
' "$relax_out"

awk '
  /Begin final coordinates/ {block=$0 ORS; inside=1; next}
  inside {block=block $0 ORS}
  inside && /End final coordinates/ {last=block; inside=0}
  END {if (last == "") exit 1; printf "%s", last}
' "$relax_out"

grep -niE 'warning|error in routine|stopping|not converged|no convergence' \
  -- "$relax_out" || true
~~~

<code>JOB DONE.</code> checks normal program termination only. Interpret the last complete force block component by component using explicit `if_pos` flags or the documented default; keep aggregate `Total force` separate. The BFGS marker, final geometry, and final force/stress evidence must satisfy the acceptance rule declared before the run. If an active cell degree of freedom was requested, also extract the final complete 3 x 3 stress block and its printed units. This fixed-cell guide does not convert a missing stress history into a pass.

This guide covers a fixed-cell <code>relax</code>. Stop if the accepted run changed the cell: a <code>vc-relax</code> handoff must also transfer the accepted <code>CELL_PARAMETERS</code> in a compatible unit and model.

## Create the accepted geometry and static input

Copy the last complete coordinate block shown above into a new SCF template in a text editor, then review a unified diff. Only the intended coordinate card may change; a `vc-relax` handoff must also transfer the accepted cell in compatible units. The optional helper performs the same bounded mechanical step: it selects the **last complete** <code>Begin final coordinates</code> block, writes <code>accepted-geometry.inc</code>, and replaces the one ATOMIC_POSITIONS card in a copied SCF template:

~~~bash
python3 examples/practical-guides/qe_manual_handoff.py prepare-reference \
  --relax-output "$relax_out" \
  --scf-template "$case_root/input/scf.in" \
  --output-dir "$reference"

cat "$reference/accepted-geometry.inc"
cat "$reference/geometry-handoff.json"
diff -u "$case_root/input/scf.in" "$reference/static-scf.in"
~~~

The command refuses to reuse an existing output directory, requires the atom count to match <code>nat</code>, and records hashes for the source output, template, accepted geometry, and new input. Review the diff before running: only the intended coordinates should change.

## Stage the exact pseudopotential

Read the required filename from the copied input and point <code>PSEUDO_SOURCE</code> to the exact file downloaded from the tested library release selected in B. Preserve the provider receipt, family release, licence, metadata, and checksum. Generating a new pseudopotential is an advanced branch only when no tested release supports the required feature; it requires separate generator provenance plus atomic, transferability, and relevant solid-state tests before this handoff:

~~~bash
pseudo_name=$(awk '
  /ATOMIC_SPECIES/ {inside=1; next}
  inside && NF >= 3 {print $3; exit}
' "$reference/static-scf.in")

: "${PSEUDO_SOURCE:?Set PSEUDO_SOURCE to the verified library UPF file}"
test -f "$PSEUDO_SOURCE"
test "$(basename -- "$PSEUDO_SOURCE")" = "$pseudo_name"
sha256sum -- "$PSEUDO_SOURCE"

mkdir -p "$reference/pseudo" "$reference/tmp"
ln -s -- "$PSEUDO_SOURCE" "$reference/pseudo/$pseudo_name"
~~~

Confirm that <code>pseudo_dir</code> and <code>outdir</code> in <code>static-scf.in</code> resolve to those directories. Preserve the UPF hash; matching a filename is not identity evidence.

## Run the new static calculation

Run locally only where direct MPI execution is permitted, or run the same command inside an allocated Slurm job:

~~~bash
(
  cd "$reference"
  test ! -e static-scf.out
  test ! -e static-scf.err
  if pw.x -in static-scf.in > static-scf.out 2> static-scf.err; then
    pw_status=0
  else
    pw_status=$?
  fi
  printf '%s\n' "$pw_status" > static-scf.exit-status
  exit "$pw_status"
)
~~~

Do not run a long calculation on a login node. The scheduler guide shows how to put this command inside <code>sbatch</code>; <code>squeue</code> reports scheduler state, not QE convergence.

For a direct daily `scf.in`, the same command is:

```bash
if pw.x -in scf.in > scf.out 2> scf.err; then
  pw_status=0
else
  pw_status=$?
fi
printf '%s\n' "$pw_status" > scf.exit-status
test "$pw_status" -eq 0
```

At a Slurm site, create `run-scf.slurm`. Replace the module, resources, allocation, and launcher with the site's documented QE build; this is a site-specific template, not a universal parallel command:

```bash
#!/usr/bin/env bash
#SBATCH --job-name=qe-scf
#SBATCH --nodes=1
#SBATCH --ntasks=4
#SBATCH --cpus-per-task=1
#SBATCH --time=00:30:00
#SBATCH --mem=8G
#SBATCH --output=slurm-%j.out
#SBATCH --error=slurm-%j.err

set -euo pipefail
module purge
module load quantum-espresso/7.5  # replace with the site's documented module
export OMP_NUM_THREADS="${SLURM_CPUS_PER_TASK:-1}"

if srun pw.x -in scf.in > scf.out 2> scf.err; then
  pw_status=0
else
  pw_status=$?
fi
printf '%s\n' "$pw_status" > scf.exit-status
exit "$pw_status"
```

```bash
job_id=$(sbatch --parsable run-scf.slurm)
printf '%s\n' "$job_id" | tee scf.job-id
squeue -j "$job_id"
```

Monitor scheduler and QE state separately. A `RUNNING` job has not necessarily completed one SCF iteration, and a vanished queue entry needs an exit/status check:

```bash
tail -n 60 scf.out
tail -n 40 scf.err
grep -nE 'iteration #|estimated scf accuracy|convergence has been achieved|total energy|Fermi energy|highest occupied|magnetization|warning|Error in routine|JOB DONE' scf.out | tail -n 100
```

Do not parse a partially written last block as the terminal result. Preserve `scf.in`, the pseudopotential receipt/hash, stdout, stderr, exit status, job script, job ID, scheduler exit/resource record, and the `tmp/si_final.save/` identity. The save tree contains native parent data for downstream QE stages; its existence does not prove completion or correct ancestry.

Audit the files produced by this exact invocation manually before using the optional parser:

~~~bash
cat -- "$reference/static-scf.exit-status"
test "$(grep -cF 'Program PWSCF v.' -- "$reference/static-scf.out")" -eq 1
test "$(grep -cF 'JOB DONE.' -- "$reference/static-scf.out")" -eq 1
grep -E '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' -- "$reference/static-scf.out" | tail -n 1
grep -F '!    total energy' -- "$reference/static-scf.out" | tail -n 1
sed -n '/^ATOMIC_POSITIONS/,/^K_POINTS/p' "$reference/static-scf.in"

awk '
  /Forces acting on atoms/ {block=$0 ORS; inside=1; next}
  inside {block=block $0 ORS}
  inside && /Total force =/ {last=block; inside=0}
  END {if (last == "") exit 1; printf "%s", last}
' "$reference/static-scf.out"

awk '
  /total[[:space:]]+stress/ {block=$0 ORS; rows=3; next}
  rows > 0 {block=block $0 ORS; rows--; if (rows == 0) last=block}
  END {
    if (last == "") print "No complete stress block found; stress is not assessed."
    else printf "%s", last
  }
' "$reference/static-scf.out"

tail -n 40 -- "$reference/static-scf.err"
grep -niE 'warning|error in routine|stopping|not converged|no convergence|magnetization|occupation' \
  -- "$reference/static-scf.out" "$reference/static-scf.err" || true
~~~

The shell status, coherent banner, `JOB DONE.`, stderr, and fatal-text scan constrain program completion. The SCF marker constrains one electronic solve. The final complete force and stress blocks are fixed-geometry diagnostics; neither substitutes for the earlier ionic acceptance gate. Neither proves geometry acceptance, cutoff or k-point convergence, observable convergence, model correctness, or a scientific conclusion.

For an ordinary run named `scf.out`, the copy-ready first pass is:

```bash
OUT=scf.out
ERR=scf.err

cat scf.exit-status
test "$(grep -cF 'Program PWSCF v.' -- "$OUT")" -eq 1
test "$(grep -cF 'JOB DONE.' -- "$OUT")" -eq 1
grep -E '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' -- "$OUT" | tail -n 1
grep -F '!    total energy' -- "$OUT" | tail -n 1
grep -Ei 'the Fermi energy|highest occupied|lowest unoccupied|total magnetization|absolute magnetization' -- "$OUT" || true
grep -niE 'warning|error in routine|stopping|not converged|no convergence' -- "$OUT" "$ERR" || true
tail -n 40 -- "$ERR"
```

Interpret the result with separate gates:

| Gate | Pass evidence | A fail means |
| --- | --- | --- |
| launch/runtime | expected banner, zero process/scheduler exit, coherent stdout/stderr, no fatal marker | diagnose environment, input, PP, memory, I/O, MPI, or program failure before SCF interpretation |
| electronic solve | QE reports its SCF condition, the residual history is usable, and no state-changing warning invalidates it | preserve the full history and diagnose model/state/occupations/sampling before changing one solver control |
| attained state | charge, occupations, Fermi level where relevant, magnetization/state labels and symmetry match the intended candidate | retain it as a different or unresolved candidate; do not relabel it from the input seed |
| fixed geometry diagnostics | requested forces/stress are complete and compatible with the accepted geometry decision | return to the geometry/constraint gate; a static SCF does not silently repair it |
| numerical support | the basis, mesh, occupations and electronic threshold are converged for the downstream observable and tolerance | the run may be technically complete but is not a reusable numerical reference |
| scientific acceptance | the candidate set, model checks and claim-specific validation are sufficient | retain `not assessed` or `blocked`; no stronger conclusion follows |

If any required gate is absent, do not substitute the repository's stored output. Preserve the failed branch and follow the matching symptom in [Troubleshoot a Calculation](/DFT-Research-Workflow/operations/troubleshooting/).

After this manual inspection, the repository helper can reproduce its bounded audit report:

~~~bash
python3 examples/practical-guides/qe_manual_handoff.py audit-scf \
  --input "$reference/static-scf.in" \
  --stdout "$reference/static-scf.out" \
  --stderr "$reference/static-scf.err" \
  --report "$reference/static-scf-audit.json"

cat "$reference/static-scf-audit.json"
~~~

The helper is optional parser evidence for the same files. It cannot upgrade a failed manual gate or replace inspection of a feature it does not parse.

## If it fails

Keep <code>static-scf.in</code>, stdout, stderr, and the audit report together. Diagnose missing files, pseudopotential paths, scratch permissions, fatal QE messages, and electronic non-convergence separately. Do not silently reuse scratch from the relaxation or substitute the repository's stored static output.

## Next

Use this new static run as the explicit parent of downstream calculations. Record its input/output hashes and carry its prefix, charge, spin, pseudopotentials, numerical setup, and accepted geometry into the bands or DOS branch.

## Bridge the same operation to other codes

- **VASP:** the analogous fixed-geometry object is built from `POSCAR`, `POTCAR`, `INCAR`, and `KPOINTS`; use the official electronic-minimization reference linked below and retain the same pseudopotential, state, convergence, output, and candidate-comparison boundaries.
- **ABINIT:** start from the official basic ground-state tutorial linked below, then map the accepted geometry, pseudopotential identity, plane-wave cutoff, k sampling, occupations, SCF tolerance, and produced density explicitly.
- **CP2K:** use the official SCF input reference linked below and preserve the basis/potential, periodic cell, k-point, spin, SCF, force/stress, and restart ancestry appropriate to that implementation.

These bridges identify official starting points; they do not claim keyword equivalence, numerical equivalence, or that QE settings can be translated line by line.

## Official sources

- [Quantum ESPRESSO pw.x input reference](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [COD silicon record 9013102](https://www.crystallography.net/cod/9013102.html)
- [ABINIT basic tutorial](https://docs.abinit.org/tutorial/base1/)
- [CP2K SCF input reference](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/SCF.html)
- [VASP electronic minimization reference](https://vasp.at/wiki/Electronic_minimization)

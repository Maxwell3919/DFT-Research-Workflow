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
  - Python 3.12
execution_script: examples/practical-guides/qe_manual_handoff.py
source_ids:
  - qe-pw-75
  - vasp-electronic-minimization
  - cp2k-scf
  - abinit-basic1
  - cod-9013102
media_ids: []
review: docs/reviews/2026-08-03-calculate-reference-ground-state.md
reviewed_at: "2026-08-03"
---

## Purpose

A fixed-cell relaxation and a static SCF calculation are separate runs. The accepted geometry must be copied explicitly; sharing a prefix or scratch directory is not a geometry handoff.


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

Audit the files produced by this exact invocation manually before using the optional parser:

~~~bash
cat -- "$reference/static-scf.exit-status"
test "$(grep -cF 'Program PWSCF v.' -- "$reference/static-scf.out")" -eq 1
test "$(grep -cF 'JOB DONE.' -- "$reference/static-scf.out")" -eq 1
grep -F 'convergence has been achieved' -- "$reference/static-scf.out" | tail -n 1
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

## Official sources

- [Quantum ESPRESSO pw.x input reference](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [COD silicon record 9013102](https://www.crystallography.net/cod/9013102.html)
- [ABINIT basic tutorial](https://docs.abinit.org/tutorial/base1/)
- [CP2K SCF input reference](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/SCF.html)
- [VASP electronic minimization reference](https://vasp.at/wiki/Electronic_minimization)

---
topic_slug: test-numerical-convergence
guide_slug: converge-basis-cutoffs-and-grids
title: Converge Basis Cutoffs and Real-Space Grids
kind: implementation
tools:
  - quantum-espresso
  - python
status: reviewed
summary: Build, run, audit, tabulate, and plot a wavefunction-cutoff and charge-density-cutoff study while keeping the physical model and comparison target fixed.
tested_versions:
  - Quantum ESPRESSO 7.5 stored execution evidence
  - Python 3.12 optional parser and replay
execution_script: examples/practical-guides/qe_manual_handoff.py
source_ids:
  - qe-pw-75
  - sssp-paper
  - sssp-archive
  - pseudodojo-paper
  - cod-9013102
media_ids:
  - silicon-qe-cutoff-matrix
review: docs/reviews/2026-08-03-test-numerical-convergence.md
reviewed_at: "2026-08-11"
---

## Purpose

Numerical convergence is a comparison, not a single successful run. This guide builds a real Quantum ESPRESSO input series, runs every point in isolation, rejects failed outputs before extracting numbers, and compares a declared observable against a declared reference.

The complete Silicon input below is a bounded teaching baseline. Its cell, pseudopotential filename, cutoffs, mesh, and tolerance are not recommendations for another material. Replace the structure and pseudopotential with your accepted model, then keep them unchanged throughout this study.

## Decide the comparison before creating inputs

Write a short `study-plan.txt` containing:

- the target observable, units, and normalization, such as total-energy difference in meV/atom or maximum force component in Ry/bohr;
- the tolerance required by the later scientific comparison;
- the fixed structure, charge, spin state, XC treatment, exact pseudopotential hash, occupations, k mesh, and SCF threshold;
- the `ecutwfc` series and the `ecutrho/ecutwfc` ratios or independent `ecutrho` values to test;
- the reference point and the rule for extending the series.

The pseudopotential provider may give useful starting points. It cannot establish convergence for this model or observable. In QE, `ecutwfc` and `ecutrho` are in Ry. The current `pw.x` input reference defines `ecutwfc` as required, gives `ecutrho = 4 * ecutwfc` as a default, and warns that pseudopotential type, augmentation charge, GGA, and vacuum can require a different or larger charge-density cutoff. Test both controls deliberately.

## Create the working directory

Start outside any public example or production directory:

~~~bash
mkdir -p cutoff-study/{template,inputs,runs,analysis,pseudo}
cd cutoff-study
pwd

: "${PSEUDO_SOURCE:?Set PSEUDO_SOURCE to the exact verified UPF file}"
test -s "$PSEUDO_SOURCE"
PSEUDO_FILE=$(basename -- "$PSEUDO_SOURCE")
cp -- "$PSEUDO_SOURCE" "pseudo/$PSEUDO_FILE"
sha256sum "$PSEUDO_SOURCE" "pseudo/$PSEUDO_FILE" | tee method-pseudopotential.sha256
~~~

Compare this hash with the pseudopotential receipt created in the method-setup guide. A different hash is a different method object and stops the comparison.

## Create one complete baseline input

Create `template/scf.in` with a text editor. The tokens `RUN_ID`, `ECUTWFC_VALUE`, and `ECUTRHO_VALUE` are replaced by the shell loop in the next step. Replace the complete structure and `ATOMIC_SPECIES` record once before generating the series; do not edit individual rows later.

~~~qe
&CONTROL
  calculation = 'scf',
  prefix = 'RUN_ID',
  outdir = './scratch',
  pseudo_dir = './pseudo',
  tprnfor = .true.,
  tstress = .true.,
/
&SYSTEM
  ibrav = 0,
  nat = 2,
  ntyp = 1,
  ecutwfc = ECUTWFC_VALUE,
  ecutrho = ECUTRHO_VALUE,
  occupations = 'fixed',
/
&ELECTRONS
  conv_thr = 1.0d-10,
/
ATOMIC_SPECIES
Si  28.0855  Si.pbe-n-rrkjus_psl.1.0.0.UPF
CELL_PARAMETERS angstrom
0.0000000000 2.7152000000 2.7152000000
2.7152000000 0.0000000000 2.7152000000
2.7152000000 2.7152000000 0.0000000000
ATOMIC_POSITIONS crystal
Si 0.0000000000 0.0000000000 0.0000000000
Si 0.2500000000 0.2500000000 0.2500000000
K_POINTS automatic
8 8 8 0 0 0
~~~

For a metal, keep the already selected occupation function and smearing width fixed during this cutoff study, then perform the separate mesh-by-smearing matrix. For a slab or 2D system, keep the accepted vacuum and boundary treatment fixed. If a relaxation moved the structure outside the tested range, return with the new geometry.

Inspect the baseline before generation:

~~~bash
grep -nE 'prefix|outdir|pseudo_dir|ecutwfc|ecutrho|occupations|conv_thr' template/scf.in
grep -A2 '^ATOMIC_SPECIES' template/scf.in
grep -A4 '^K_POINTS' template/scf.in
test "$(grep -c 'RUN_ID' template/scf.in)" -eq 1
test "$(grep -c 'ECUTWFC_VALUE' template/scf.in)" -eq 1
test "$(grep -c 'ECUTRHO_VALUE' template/scf.in)" -eq 1
~~~

Confirm that the filename in `ATOMIC_SPECIES` equals `$PSEUDO_FILE`. The displayed Silicon file uses the public case identity; a reader using another file must change that line.

## Generate and inspect the declared input series

This illustrative 3 × 3 matrix varies the wavefunction cutoff and charge-density ratio. Choose ranges from the provider starting points and the needs of the model; do not copy these values as acceptance criteria.

~~~bash
for ecut in 30 40 50; do
  for rho_ratio in 4 8 12; do
    ecutrho=$((ecut * rho_ratio))
    id="si-ew${ecut}-r${rho_ratio}"
    sed \
      -e "s/RUN_ID/$id/g" \
      -e "s/ECUTWFC_VALUE/${ecut}.0/g" \
      -e "s/ECUTRHO_VALUE/${ecutrho}.0/g" \
      template/scf.in > "inputs/$id.in"
  done
done

test "$(find inputs -maxdepth 1 -type f -name '*.in' | wc -l)" -eq 9
for input in inputs/*.in; do
  printf '\n%s\n' "$input"
  awk '/ecutwfc|ecutrho/ {print} /K_POINTS/ {print; getline; print}' "$input"
  sha256sum "$input"
done | tee analysis/input-inventory.txt
~~~

Use `diff -u` to prove that representative rows differ only in declared controls and run-local identity:

~~~bash
diff -u inputs/si-ew30-r4.in inputs/si-ew30-r12.in || true
diff -u inputs/si-ew30-r12.in inputs/si-ew50-r12.in || true
~~~

If other fields move, repair the template or generator before launch. A filename is not evidence of the values inside it.

## Run each input in an isolated directory

On a workstation where direct execution is permitted, run:

~~~bash
for input in inputs/*.in; do
  name=$(basename -- "$input" .in)
  run_dir="runs/$name"
  test ! -e "$run_dir"
  mkdir -p "$run_dir"/{pseudo,scratch}
  cp -- "$input" "$run_dir/scf.in"
  cp -- "pseudo/$PSEUDO_FILE" "$run_dir/pseudo/$PSEUDO_FILE"

  (
    cd "$run_dir"
    set +e
    pw.x -in scf.in > scf.out 2> scf.err
    status=$?
    set -e
    printf '%s\n' "$status" > scf.exit-status
    exit "$status"
  ) || printf 'QE failed for %s; keep the artifacts and inspect them first.\n' "$name" >&2
done
~~~

For MPI on a local installation, use the launcher and rank count documented for that installation; do not copy a rank count from this page. QE documents launcher, executable path, and batch behavior as installation- and site-dependent.

### Slurm array placeholder

Create `cutoff-study.slurm` only after consulting the cluster's scheduler and QE module instructions. Replace every `REPLACE_...` placeholder, set `QE_LAUNCH` to the site-approved command, and change the array range when the input count changes.

~~~bash
#!/bin/bash
#SBATCH --job-name=qe-cutoff
#SBATCH --partition=REPLACE_PARTITION
#SBATCH --account=REPLACE_ACCOUNT
#SBATCH --time=REPLACE_WALLTIME
#SBATCH --nodes=1
#SBATCH --ntasks=REPLACE_MPI_TASKS
#SBATCH --mem=REPLACE_MEMORY
#SBATCH --array=0-8
#SBATCH --output=slurm-%A_%a.out
#SBATCH --error=slurm-%A_%a.err

set -euo pipefail
: "${SLURM_SUBMIT_DIR:?Submit this file from cutoff-study}"
: "${QE_LAUNCH:?Export the site-approved launcher plus pw.x}"
root=$SLURM_SUBMIT_DIR
mapfile -t inputs < <(find "$root/inputs" -maxdepth 1 -type f -name '*.in' | sort)
input=${inputs[$SLURM_ARRAY_TASK_ID]}
name=$(basename -- "$input" .in)
run_dir="$root/runs/$name"
test ! -e "$run_dir"
mkdir -p "$run_dir"/{pseudo,scratch}
cp -- "$input" "$run_dir/scf.in"
cp -- "$root/pseudo/$PSEUDO_FILE" "$run_dir/pseudo/$PSEUDO_FILE"

cd "$run_dir"
set +e
bash -lc "$QE_LAUNCH -in scf.in" > scf.out 2> scf.err
status=$?
set -e
printf '%s\n' "$status" > scf.exit-status
exit "$status"
~~~

One possible submission sequence is:

~~~bash
export PSEUDO_FILE
export QE_LAUNCH='REPLACE_WITH_SITE_APPROVED_LAUNCHER_AND_PW_X'
test "$QE_LAUNCH" != 'REPLACE_WITH_SITE_APPROVED_LAUNCHER_AND_PW_X'
sbatch --export=ALL cutoff-study.slurm
squeue -u "$USER"
~~~

Use the local site commands for accounting and memory diagnosis; `sacct` is not enabled everywhere. A scheduler state never substitutes for inspecting QE stdout, stderr, and the recorded exit code.

## Inspect failures before extracting numbers

Run this fail-first audit after the jobs finish:

~~~bash
for run_dir in runs/*; do
  test -d "$run_dir" || continue
  printf '\n%s\n' "$run_dir"
  cat "$run_dir/scf.exit-status"
  grep -F 'Program PWSCF v.' "$run_dir/scf.out" | head -n 1
  grep -E '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' \
    "$run_dir/scf.out" | tail -n 1
  grep -F '!    total energy' "$run_dir/scf.out" | tail -n 1
  grep -F 'Total force' "$run_dir/scf.out" | tail -n 1 || true
  grep -F 'total   stress' "$run_dir/scf.out" | tail -n 1 || true
  grep -F 'JOB DONE.' "$run_dir/scf.out"
  grep -Ei 'warning|error in routine|stopping|not converged|no convergence' \
    "$run_dir/scf.out" "$run_dir/scf.err" || true
  tail -n 20 "$run_dir/scf.err"
done
~~~

For each row, require the expected program banner, exit status `0`, a positive electronic-convergence line, exactly one `JOB DONE.`, and no unresolved fatal message. `JOB DONE.` establishes normal program termination only; the electronic line is a separate solver condition. Neither proves series convergence.

Common repairs are bounded by the failure:

| Symptom | Inspect first | Safe next action |
| --- | --- | --- |
| No output or no banner | Scheduler stderr, executable/module path, permissions | Repair the launch environment; do not change cutoffs. |
| UPF open/read failure | `pseudo_dir`, filename, permissions, size, hash | Restage the exact receipt-bound file. |
| Exit without `JOB DONE.` | Last stdout/stderr block and `Error in routine` | Fix the reported input, memory, disk, or runtime cause; retain the failed row. |
| SCF does not converge | Iteration history, occupations, mixing, state changes | Diagnose the electronic state at the same matrix point before comparing its energy. |
| Only high-cutoff rows fail | Memory and FFT allocation, scratch quota, wall time | Request appropriate resources or split jobs; do not discard them as “converged.” |
| Force or stress jumps while energy looks smooth | Final force/stress blocks and state identity | Converge the quantity required by relaxation or response, not energy alone. |

## Extract a transparent table

The following shell creates `analysis/cutoff-raw.csv` from rows that pass the basic execution and SCF checks. It extracts the last printed total energy and maximum absolute Cartesian force component from the last force data encountered. Inspect the output format for the exact QE version before relying on the parser.

~~~bash
printf '%s\n' 'id,ecutwfc_ry,ecutrho_ry,rho_ratio,total_energy_ry,max_abs_force_ry_bohr' \
  > analysis/cutoff-raw.csv

for run_dir in runs/*; do
  test -d "$run_dir" || continue
  test "$(cat "$run_dir/scf.exit-status")" -eq 0 || continue
  test "$(grep -cF 'JOB DONE.' "$run_dir/scf.out")" -eq 1 || continue
  grep -qE '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' \
    "$run_dir/scf.out" || continue

  id=$(basename -- "$run_dir")
  ew=$(awk -F= '/ecutwfc/ {gsub(/[ ,]/,"",$2); print $2}' "$run_dir/scf.in")
  er=$(awk -F= '/ecutrho/ {gsub(/[ ,]/,"",$2); print $2}' "$run_dir/scf.in")
  ratio=$(awk -v ew="$ew" -v er="$er" 'BEGIN {printf "%.6g", er/ew}')
  energy=$(awk '/^!/ && /total energy/ {value=$(NF-1)} END {print value}' "$run_dir/scf.out")
  max_force=$(awk '
    /Forces acting on atoms/ {inside=1; max=0; next}
    inside && /force =/ {
      for (i=NF-2; i<=NF; i++) {value=$i+0; if (value<0) value=-value; if (value>max) max=value}
    }
    inside && /Total force/ {inside=0; final=max}
    END {if (final!="") printf "%.12g", final}
  ' "$run_dir/scf.out")
  printf '%s,%s,%s,%s,%s,%s\n' "$id" "$ew" "$er" "$ratio" "$energy" "$max_force"
done >> analysis/cutoff-raw.csv

column -s, -t analysis/cutoff-raw.csv | less -S
~~~

Now define the comparison reference explicitly. This Silicon template has two atoms per cell; change `NAT` for your model and choose the strictest completed reference only after checking its state:

~~~bash
REFERENCE_ID='si-ew50-r12'
NAT=2
reference_energy=$(awk -F, -v id="$REFERENCE_ID" '$1==id {print $5}' analysis/cutoff-raw.csv)
test -n "$reference_energy"

awk -F, -v ref="$reference_energy" -v nat="$NAT" '
  BEGIN {OFS=","; print "id,ecutwfc_ry,ecutrho_ry,rho_ratio,delta_energy_mev_atom,max_abs_force_ry_bohr"}
  NR>1 {print $1,$2,$3,$4,($5-ref)*13605.693122994/nat,$6}
' analysis/cutoff-raw.csv > analysis/cutoff-comparison.csv

column -s, -t analysis/cutoff-comparison.csv | less -S
~~~

This conversion uses the exact declared reference row. It is a comparison convention, not an extrapolated infinite-cutoff limit.

## Plot every completed point

With `gnuplot` installed, save the following as `cutoff-plot.gp`; it creates
`analysis/cutoff-convergence.png`:

~~~gnuplot
set datafile separator comma
set terminal pngcairo size 1100,700
set output 'analysis/cutoff-convergence.png'
set title 'QE cutoff study; points are completed rows'
set xlabel 'Wavefunction cutoff ecutwfc (Ry)'
set ylabel 'Energy difference from declared reference (meV/atom)'
set key outside
set grid
plot for [ratio in '4 8 12'] 'analysis/cutoff-comparison.csv' \
  using (strcol(4) eq ratio ? column(2) : 1/0):5 \
  with linespoints title sprintf('ecutrho/ecutwfc = %s', ratio)
~~~

Run it and open the actual figure:

~~~bash
gnuplot cutoff-plot.gp
xdg-open analysis/cutoff-convergence.png
~~~

If you saved the gnuplot block as a different filename, use that filename. The axes, units, completed points, ratio legend, and reference definition must remain visible in the file or caption.

## Make the decision

Declare the acceptance tolerance before choosing a row. Look for a stable region across increasing `ecutwfc` and stricter `ecutrho` at fixed physical model, not a single lucky equality. Check at least the target row and stricter neighbors on both numerical axes. Extend the matrix when the strictest edge is still moving, the response is non-monotonic, or an electronic/magnetic state changes.

Energy convergence does not establish force, stress, pressure, DOS, phonon, dielectric, defect, or electron-phonon convergence. If the later calculation depends on one of those quantities, repeat or augment the study with that observable. Explicit FFT-grid controls, dual grids, localized bases, LAPW cutoffs, and CP2K GPW/GAPW grids have code-specific convergence axes; use their current official manuals and the relevant entries in [Tools & Resources](/DFT-Research-Workflow/tools/).

## Inspect the stored real Silicon evidence

The repository contains nine real QE 7.5 fixed-cell Silicon SCF outputs at 30/40/50 Ry and 6³/8³/10³ k meshes. In that stored series, `ecutrho` was always eight times `ecutwfc`; it does **not** independently converge the charge-density cutoff. Inspect the actual CSV and plot:

~~~bash
less -S examples/cases/silicon-ground-state-electronic-structure/derived/convergence.csv
xdg-open examples/cases/silicon-ground-state-electronic-structure/figures/convergence-matrix.png
grep -H 'JOB DONE.' examples/cases/silicon-ground-state-electronic-structure/output/si_e*_k*.out
~~~

The optional repository helper reads stored or reader-supplied outputs, produces CSV/figure artifacts, and checks documented output markers and hashes. It does not run QE, infer missing inputs, or decide scientific acceptance:

~~~bash
python3 examples/practical-guides/qe_manual_handoff.py self-test
python3 examples/practical-guides/qe_manual_handoff.py extract-runtime --help
~~~

Use `extract-runtime` only for the file layout and output names documented by its
help; the newly generated `runs/` matrix above is intentionally handled by the
manual CSV route rather than silently remapped to an older case convention.

## Next

Carry the accepted pseudopotential hash, cutoff pair, fixed method, tolerance, table, figure, and excluded-run reasons into the k-point/occupation study. Revisit the cutoff study if the pseudopotential, geometry family, spin/SOC/U/vdW treatment, or target observable changes materially.

## Official sources

- [Quantum ESPRESSO 7.5 `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [SSSP pseudopotential verification study](https://doi.org/10.1038/s41524-018-0127-2)
- [Materials Cloud SSSP verification archive](https://archive.materialscloud.org/record/2021.76)
- [PseudoDojo training and grading protocol](https://doi.org/10.1016/j.cpc.2018.01.012)
- [COD Silicon record 9013102](https://www.crystallography.net/cod/9013102.html)

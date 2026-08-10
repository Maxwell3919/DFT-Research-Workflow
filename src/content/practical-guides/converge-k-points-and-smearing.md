---
topic_slug: test-numerical-convergence
guide_slug: converge-k-points-and-smearing
title: Converge k-Point Sampling and Smearing
kind: implementation
tools:
  - quantum-espresso
  - python
status: reviewed
summary: Generate, run, inspect, tabulate, and plot a k-point study, using a full k-mesh-by-smearing matrix for metals rather than accepting a cancelling diagonal series.
tested_versions:
  - Quantum ESPRESSO 7.5 stored execution evidence
  - Python 3.12 optional stored-output reconstruction
execution_script: examples/practical-guides/silicon_qe_convergence.py
source_ids:
  - qe-pw-75
  - monkhorst-pack
  - methfessel-paxton
  - blochl-tetrahedron
  - cod-9013102
media_ids:
  - silicon-qe-kmesh-matrix
review: docs/reviews/2026-08-03-test-numerical-convergence.md
reviewed_at: "2026-08-11"
---

## Purpose

A k-point and occupation study begins with the observable, reciprocal cell, electronic state, and intended integration method. This guide gives an executable Quantum ESPRESSO route for both gapped systems and metals. For a metal, it requires a Cartesian product of meshes and smearing widths; agreement along one coarse-mesh/broad-smearing to dense-mesh/narrow-smearing diagonal is not convergence evidence.

The complete Aluminium input below is a bounded teaching model. Its structure, pseudopotential, cutoff, meshes, smearing kernel, widths, and tolerances are not transferable settings.

## Choose the branch and fixed model

Before editing an input, create `study-plan.txt` and record the target quantity, units, normalization, tolerance, accepted structure, exact pseudopotential hash, cutoff pair, XC/spin/SOC/U/vdW state, charge, SCF threshold, reciprocal-cell shape, mesh offsets, and what will remain fixed.

Use the branch that matches the electronic state and intended observable:

| System or calculation | Starting branch | Required comparison |
| --- | --- | --- |
| Insulator or semiconductor with a trusted gap | `occupations='fixed'` | Several mesh densities at fixed method; check energy, forces, and the later target observable. |
| Metal or uncertain small-gap system | `occupations='smearing'` | Full `k mesh × smearing width` matrix; inspect energy, Fermi level, state, forces, and the target observable. |
| Tetrahedron integration | Current code manual | In QE, tetrahedra require a uniform automatic grid; ordinary tetrahedra are less suitable for forces, optimization, and dynamics. Test the intended observable. |
| 2D material or slab | Dimensional mesh | Use one point along the genuinely nonperiodic reciprocal direction only after confirming cell orientation; vary the in-plane directions. |
| Anisotropic or low-symmetry cell | Reciprocal-resolution series | Do not transfer the same integer triplet between unrelated lattice shapes; inspect spacing and symmetry-reduced sampling. |

For a metal, a smearing width used to integrate occupations is not automatically a physical electronic temperature. Keep that claim separate unless a finite-temperature ensemble is intentionally defined.

## Create the working directory and stage the exact file

~~~bash
mkdir -p k-smearing-study/{template,inputs,runs,analysis,pseudo}
cd k-smearing-study
pwd

: "${PSEUDO_SOURCE:?Set PSEUDO_SOURCE to the exact verified UPF file}"
test -s "$PSEUDO_SOURCE"
PSEUDO_FILE=$(basename -- "$PSEUDO_SOURCE")
cp -- "$PSEUDO_SOURCE" "pseudo/$PSEUDO_FILE"
sha256sum "$PSEUDO_SOURCE" "pseudo/$PSEUDO_FILE" | tee method-pseudopotential.sha256
~~~

The hash, cutoffs, and physical model must match the accepted basis-cutoff study. If they do not, this is a new convergence problem.

## Create one complete metallic input template

Create `template/scf-metal.in`. Replace the full structure and pseudopotential record once for your material. The shell generator replaces only `RUN_ID`, `KVALUE`, and `DEGAUSS_VALUE`.

~~~qe
&CONTROL
  calculation = 'scf',
  prefix = 'RUN_ID',
  pseudo_dir = './pseudo',
  outdir = './scratch',
  tprnfor = .true.,
  tstress = .true.,
/
&SYSTEM
  ibrav = 0,
  nat = 1,
  ntyp = 1,
  ecutwfc = 30.0,
  ecutrho = 240.0,
  occupations = 'smearing',
  smearing = 'mv',
  degauss = DEGAUSS_VALUE,
/
&ELECTRONS
  conv_thr = 1.0d-10,
/
ATOMIC_SPECIES
Al  26.9815385  Al.pbe-n-rrkjus_psl.1.0.0.UPF
ATOMIC_POSITIONS crystal
Al  0.0 0.0 0.0
CELL_PARAMETERS bohr
-3.826500 0.000000 3.826500
 0.000000 3.826500 3.826500
-3.826500 3.826500 0.000000
K_POINTS automatic
KVALUE KVALUE KVALUE 0 0 0
~~~

QE reads `degauss` in Ry. The kernel and widths in this template define one numerical experiment, not a universal metallic protocol. Confirm that `ATOMIC_SPECIES` uses `$PSEUDO_FILE`, then inspect every fixed control:

~~~bash
grep -nE 'prefix|pseudo_dir|outdir|ecutwfc|ecutrho|occupations|smearing|degauss|conv_thr' \
  template/scf-metal.in
grep -A2 '^ATOMIC_SPECIES' template/scf-metal.in
grep -A4 '^K_POINTS' template/scf-metal.in
for token in RUN_ID KVALUE DEGAUSS_VALUE; do
  test "$(grep -o "$token" template/scf-metal.in | wc -l)" -ge 1
done
~~~

## Generate the full mesh-by-smearing matrix

Generate all nine combinations, not three points on a diagonal:

~~~bash
for k in 8 10 12; do
  for degauss in 0.01 0.02 0.04; do
    dtag=${degauss/./}
    id="al-k${k}-d${dtag}"
    sed \
      -e "s/RUN_ID/$id/g" \
      -e "s/KVALUE/$k/g" \
      -e "s/DEGAUSS_VALUE/$degauss/g" \
      template/scf-metal.in > "inputs/$id.in"
  done
done

test "$(find inputs -maxdepth 1 -type f -name '*.in' | wc -l)" -eq 9
for input in inputs/*.in; do
  printf '\n%s\n' "$input"
  awk '/occupations|smearing|degauss/ {print} /K_POINTS/ {print; getline; print}' "$input"
  sha256sum "$input"
done | tee analysis/input-inventory.txt
~~~

Compare rows at fixed width and rows at fixed mesh:

~~~bash
diff -u inputs/al-k8-d002.in inputs/al-k12-d002.in || true
diff -u inputs/al-k12-d001.in inputs/al-k12-d004.in || true
~~~

Only `prefix`, k mesh, and smearing width should differ. Repair any drift in structure, pseudopotential, cutoff, spin state, occupations kernel, or threshold before launch.

### Gapped-system variant

For a trusted insulator or semiconductor, make a separate template with:

~~~qe
occupations = 'fixed',
~~~

Remove `smearing` and `degauss`, generate a one-dimensional mesh series, and keep the band occupation and electronic state fixed. If the gap closes, occupations switch unexpectedly, or the target remains Fermi-surface-sensitive, stop treating the problem as a simple gapped-system series.

### 2D and anisotropic variants

For a slab whose third lattice vector is the nonperiodic direction, a series such as `6 6 1`, `8 8 1`, and `10 10 1` can test in-plane sampling; it is an example of axis logic, not a converged density. For an anisotropic cell, vary reciprocal spacing deliberately, for example by changing one direction at a time or generating triplets from a declared reciprocal-density rule. Always record the actual triplets and offsets, not only a label such as “dense.”

## Run locally in isolated directories

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
  ) || printf 'QE failed for %s; retain and inspect that row.\n' "$name" >&2
done
~~~

Use a site-documented MPI launcher only when required by the installation. Rank count, launcher name, modules, library paths, memory, and filesystem policy are site-specific.

### Submit the matrix as a Slurm array

Create `k-smearing-study.slurm`, replace every resource placeholder, and set `QE_LAUNCH` to the cluster-approved command. The array range below matches nine generated inputs.

~~~bash
#!/bin/bash
#SBATCH --job-name=qe-k-smear
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
: "${SLURM_SUBMIT_DIR:?Submit this file from k-smearing-study}"
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

Submit and monitor using the local scheduler policy:

~~~bash
export PSEUDO_FILE
export QE_LAUNCH='REPLACE_WITH_SITE_APPROVED_LAUNCHER_AND_PW_X'
test "$QE_LAUNCH" != 'REPLACE_WITH_SITE_APPROVED_LAUNCHER_AND_PW_X'
sbatch --export=ALL k-smearing-study.slurm
squeue -u "$USER"
~~~

Accounting commands and queue semantics vary by site. Scheduler completion does not establish QE termination or SCF convergence.

## Inspect failures first

~~~bash
for run_dir in runs/*; do
  test -d "$run_dir" || continue
  printf '\n%s\n' "$run_dir"
  cat "$run_dir/scf.exit-status"
  grep -F 'Program PWSCF v.' "$run_dir/scf.out" | head -n 1
  grep -E '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' \
    "$run_dir/scf.out" | tail -n 1
  grep -F '!    total energy' "$run_dir/scf.out" | tail -n 1
  grep -i 'Fermi energy' "$run_dir/scf.out" | tail -n 1
  grep -F 'Total force' "$run_dir/scf.out" | tail -n 1 || true
  grep -F 'JOB DONE.' "$run_dir/scf.out"
  grep -Ei 'warning|error in routine|stopping|not converged|no convergence' \
    "$run_dir/scf.out" "$run_dir/scf.err" || true
  tail -n 20 "$run_dir/scf.err"
done
~~~

Require exit status `0`, one coherent QE banner, a positive electronic-convergence marker, exactly one `JOB DONE.`, and no unresolved fatal message before extracting a row. `JOB DONE.` is program termination, not electronic or numerical convergence.

| Symptom | First inspection | Safe next action |
| --- | --- | --- |
| Coarse meshes change the reported state | Fermi level, occupations, magnetization, bands near the Fermi level | Extend the mesh series and compare the same state; do not average unlike states. |
| SCF oscillates as width narrows | Iteration history, mixing, charge/spin state | Diagnose SCF stability at that exact row; do not hide it by keeping only broad smearing. |
| Energy looks stable but Fermi level or DOS changes | Fermi line and target-observable data | Converge the target quantity; total energy is not a proxy for full-zone resolution. |
| Odd-even or offset effects | Neighboring meshes, offsets, irreducible-point count | Add offset or intermediate-mesh checks while retaining the same protocol. |
| Slab changes when `kz` exceeds one | Cell orientation and boundary model | Confirm which direction is nonperiodic; investigate if the model is not truly 2D. |

## Extract the mesh-by-smearing table

Create the CSV only from rows that pass the basic execution and SCF checks:

~~~bash
printf '%s\n' 'id,k1,k2,k3,degauss_ry,total_energy_ry,fermi_energy_ev,max_abs_force_ry_bohr' \
  > analysis/k-smearing-raw.csv

for run_dir in runs/*; do
  test -d "$run_dir" || continue
  test "$(cat "$run_dir/scf.exit-status")" -eq 0 || continue
  test "$(grep -cF 'JOB DONE.' "$run_dir/scf.out")" -eq 1 || continue
  grep -qE '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' \
    "$run_dir/scf.out" || continue

  id=$(basename -- "$run_dir")
  read -r k1 k2 k3 _ < <(awk '/K_POINTS automatic/ {getline; print; exit}' "$run_dir/scf.in")
  degauss=$(awk -F= '/degauss/ {gsub(/[ ,]/,"",$2); print $2}' "$run_dir/scf.in")
  energy=$(awk '/^!/ && /total energy/ {value=$(NF-1)} END {print value}' "$run_dir/scf.out")
  fermi=$(awk 'tolower($0) ~ /fermi energy/ {value=$(NF-1)} END {print value}' "$run_dir/scf.out")
  max_force=$(awk '
    /Forces acting on atoms/ {inside=1; max=0; next}
    inside && /force =/ {
      for (i=NF-2; i<=NF; i++) {value=$i+0; if (value<0) value=-value; if (value>max) max=value}
    }
    inside && /Total force/ {inside=0; final=max}
    END {if (final!="") printf "%.12g", final}
  ' "$run_dir/scf.out")
  printf '%s,%s,%s,%s,%s,%s,%s,%s\n' \
    "$id" "$k1" "$k2" "$k3" "$degauss" "$energy" "$fermi" "$max_force"
done >> analysis/k-smearing-raw.csv

column -s, -t analysis/k-smearing-raw.csv | less -S
~~~

Inspect missing rows before continuing. A rectangular table with holes is not silently equivalent to a completed matrix.

## Define a reference and plot the actual points

Choose a completed dense-mesh/narrow-width row as a comparison reference, not as a presumed infinite-grid answer. This Aluminium template has one atom per cell:

~~~bash
REFERENCE_ID='al-k12-d001'
NAT=1
reference_energy=$(awk -F, -v id="$REFERENCE_ID" '$1==id {print $6}' analysis/k-smearing-raw.csv)
test -n "$reference_energy"

awk -F, -v ref="$reference_energy" -v nat="$NAT" '
  BEGIN {OFS=","; print "id,k_linear,degauss_ry,delta_energy_mev_atom,fermi_energy_ev,max_abs_force_ry_bohr"}
  NR>1 {print $1,$2,$5,($6-ref)*13605.693122994/nat,$7,$8}
' analysis/k-smearing-raw.csv > analysis/k-smearing-comparison.csv

column -s, -t analysis/k-smearing-comparison.csv | less -S
~~~

Save this plot definition as `k-smearing-plot.gp`:

~~~gnuplot
set datafile separator comma
set terminal pngcairo size 1050,760
set output 'analysis/k-smearing-matrix.png'
set title 'QE metallic k-mesh x smearing matrix; completed points only'
set xlabel 'Uniform k-mesh linear count'
set ylabel 'Smearing width degauss (Ry)'
set cblabel 'Energy difference from declared reference (meV/atom)'
set palette defined (-5 '#2166ac', 0 '#f7f7f7', 5 '#b2182b')
set grid
plot 'analysis/k-smearing-comparison.csv' using 2:3:4 \
  with points pointtype 7 pointsize 3 palette notitle
~~~

~~~bash
gnuplot k-smearing-plot.gp
xdg-open analysis/k-smearing-matrix.png
~~~

The plot shows tested points without fabricating an interpolated surface. State the actual mesh triplets, offsets, kernel, width units, fixed controls, and reference definition in the caption or adjacent record.

## Decide on a two-dimensional stable region

Compare denser meshes at each fixed width, then narrower widths at each fixed mesh. Inspect more than one dense-mesh/narrow-width corner, Fermi-level and magnetization continuity, force or stress when relevant, and the actual target observable. Do not accept agreement along one diagonal: coarse sampling and broad smearing can cancel.

Accept a working point only when the predeclared target remains inside tolerance under stricter neighbors on both axes and the same electronic state is preserved. If the edge is still moving, the matrix has holes, or the state switches, extend or redesign the study. A k mesh accepted for total energy does not establish DOS, Fermi-surface, phonon, electron-phonon, transport, or optical convergence.

## Inspect the stored real evidence

The repository includes two bounded records:

1. Nine real QE 7.5 Silicon fixed-occupation SCF outputs over 30/40/50 Ry and 6³/8³/10³. They teach a gapped-system matrix but contain no smearing axis.
2. Five real QE 7.5 Aluminium metallic SCF samples: 8³/10³/12³ at 0.02 Ry and 0.01/0.02/0.04 Ry at 12³. This is a cross-shaped exploratory screen, not the full 3 × 3 matrix required above. Its predeclared assessment is `FAIL`.

Inspect the Aluminium artifacts directly:

~~~bash
column -s, -t examples/cases/aluminium-metallic-electronic-structure/derived/aluminium-convergence-matrix.csv
python3 -m json.tool \
  examples/cases/aluminium-metallic-electronic-structure/derived/aluminium-convergence-assessment.json \
  | less
grep -H 'JOB DONE.' \
  examples/cases/aluminium-metallic-electronic-structure/output/convergence-screen/al-k*.out
~~~

`FAIL` here means those named energy/Fermi exploratory thresholds were not all satisfied. It does not mean Aluminium is physically invalid, and it cannot be repaired by calling the five-point cross a full matrix.

The declared companion reconstructs the stored Silicon hashes, markers, and total-energy table:

~~~bash
python3 examples/practical-guides/silicon_qe_convergence.py > silicon-kmesh-reconstruction.json
less silicon-kmesh-reconstruction.json
~~~

It does not run QE, parse the Aluminium matrix, test smearing, or decide a transferable mesh.

## Next

Carry the accepted occupation function, smearing width when used, exact k mesh and offsets, pseudopotential/cutoff identity, tolerance, raw table, plot, and excluded-run reasons into the fresh reference-state SCF. Recheck sampling for every later full-zone or response observable whose integration demands are stricter.

## Official sources

- [Quantum ESPRESSO 7.5 `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Monkhorst and Pack special-point grids](https://doi.org/10.1103/PhysRevB.13.5188)
- [Methfessel and Paxton metallic integration](https://doi.org/10.1103/PhysRevB.40.3616)
- [Blöchl, Jepsen, and Andersen improved tetrahedron method](https://doi.org/10.1103/PhysRevB.49.16223)
- [COD Silicon record 9013102](https://www.crystallography.net/cod/9013102.html)

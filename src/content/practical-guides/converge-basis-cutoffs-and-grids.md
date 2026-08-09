---
topic_slug: test-numerical-convergence
guide_slug: converge-basis-cutoffs-and-grids
title: Converge Basis Cutoffs and Real-Space Grids
kind: implementation
tools:
  - quantum-espresso
  - python
status: reviewed
summary: Design a coupled basis and grid study around the observable that matters, rather than accepting one cutoff or one library recommendation as universal evidence.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/qe_manual_handoff.py
source_ids:
  - qe-pw-75
  - sssp-paper
  - sssp-archive
  - pseudodojo-paper
  - cod-9013102
media_ids:
  - convergence-basis-grid-map
  - silicon-qe-cutoff-matrix
review: docs/reviews/2026-08-03-test-numerical-convergence.md
reviewed_at: "2026-08-03"
---

## Purpose

Numerical convergence is a comparison, not a single successful run. Choose the quantity and tolerance first, vary one numerical control while holding the physical model fixed, and retain every input and output used in the decision.

The silicon files below are an illustrative series for learning the procedure. Their values are not transferable cutoffs or k meshes for another material, pseudopotential, property, or accuracy target.

## Verify the parser

From the repository root:

~~~bash
python3 examples/practical-guides/qe_manual_handoff.py self-test
~~~

A passing self-test establishes that the documented parser can reconstruct the hash-registry-bound public fixture. It does not accept a convergence threshold for your new calculation.

## Generate and inspect the declared input series

Copy the reviewed input series into a new external runtime directory instead of editing the public case:

~~~bash
repo_root=$(pwd)
case_root="$repo_root/examples/cases/silicon-ground-state-electronic-structure"
runtime="$HOME/drw-runs/si-convergence"
mkdir -p "$runtime/inputs"

for ecut in 30 40 50; do
  for kmesh in 6 8 10; do
    name="si_e${{ecut}_k${{kmesh}"
    cp "$case_root/input/${{name}.in" "$runtime/inputs/${{name}.in"
  done
done

for input in "$runtime"/inputs/*.in; do
  printf '\n%s\n' "$input"
  awk '
    /ecutwfc/ {print}
    /K_POINTS/ {print; getline; print}
  ' "$input"
  sha256sum "$input"
done
~~~

The inspection proves which <code>ecutwfc</code> and mesh were actually encoded. Also diff the files to confirm that the structure, pseudopotential, XC treatment, occupations, smearing, charge, spin, and SCF thresholds remain fixed:

~~~bash
diff -u "$runtime/inputs/si_e30_k6.in" "$runtime/inputs/si_e50_k6.in"
diff -u "$runtime/inputs/si_e50_k6.in" "$runtime/inputs/si_e50_k10.in"
~~~

If you generate a different series, preserve the generator or exact edited inputs. Do not describe a filename as evidence of its contents.

## Run each input in an isolated directory

Point <code>PSEUDO_SOURCE</code> to the exact UPF already verified for this model:

~~~bash
: "${{PSEUDO_SOURCE:?Set PSEUDO_SOURCE to the verified UPF file}"

for input in "$runtime"/inputs/*.in; do
  name=$(basename "$input" .in)
  run_dir="$runtime/convergence-$name"
  mkdir -p "$run_dir/pseudo" "$run_dir/tmp"
  cp "$input" "$run_dir/$name.in"

  pseudo_name=$(awk '
    /ATOMIC_SPECIES/ {inside=1; next}
    inside && NF >= 3 {print $3; exit}
  ' "$run_dir/$name.in")
  test "$(basename "$PSEUDO_SOURCE")" = "$pseudo_name"
  ln -s "$PSEUDO_SOURCE" "$run_dir/pseudo/$pseudo_name"

  (
    cd "$run_dir"
    pw.x -in "$name.in" > "$name.out" 2> "$name.err"
  )
done
~~~

Use this loop only on a workstation where direct execution is allowed or inside scheduler allocations sized for each run. For Slurm, submit the same isolated directories with <code>sbatch</code>, then use <code>squeue</code> and <code>sacct</code> where available. Never infer QE success from a scheduler state alone.

## Audit the outputs before comparing numbers

~~~bash
for output in "$runtime"/convergence-*/si_e*_k*.out; do
  printf '\n%s\n' "$output"
  grep "JOB DONE" "$output"
  grep "convergence has been achieved" "$output" | tail -n 1
  grep "!    total energy" "$output" | tail -n 1
  grep -Ei "warning|error|stopping" "$output" || true
done
~~~

<code>JOB DONE</code> checks normal termination. The SCF line checks the electronic solver condition reported for that run. The energy line supplies the compared scalar. None of them establishes convergence of the series.

## Parse and plot the fresh runtime

The helper reads the files below <code>runtime</code>, binds every row to its source hash, and writes ordinary CSV plus light-background SVG:

~~~bash
python3 examples/practical-guides/qe_manual_handoff.py extract-runtime \
  --runtime-dir "$runtime" \
  --output-dir "$runtime/analysis"

less -S "$runtime/analysis/convergence.csv"
xdg-open "$runtime/analysis/convergence.svg"
cat "$runtime/analysis/analysis.json"
~~~

If the same runtime also contains native <code>bands.x</code> and <code>dos.x</code> data, pass them explicitly:

~~~bash
python3 examples/practical-guides/qe_manual_handoff.py extract-runtime \
  --runtime-dir "$runtime" \
  --bands-data "$runtime/bands/si.bands.dat" \
  --dos-data "$runtime/dos/si.dos.dat" \
  --output-dir "$runtime/analysis-with-targets"
~~~

This additionally creates <code>bands.csv</code>, <code>bands.svg</code>, <code>dos.csv</code>, and <code>dos.svg</code>. It reconstructs supplied data; it does not turn a high-symmetry band path into full-zone evidence or establish DOS convergence.

## Make the decision

At each fixed k mesh, compare the chosen quantity as the cutoff increases. After selecting a cutoff, compare the same quantity as the k mesh increases. Declare the acceptance tolerance, units, normalization (for example per atom), and reference point before selecting a result. Energy convergence does not imply force, stress, DOS, phonon, or EPC convergence.

If the curve is noisy, non-monotonic, or changes at the edge of the series, extend the series and inspect electronic convergence, smearing, pseudopotential recommendations, and model consistency. Preserve failed runs; they explain why a point was excluded.

## Next

Carry the accepted numerical baseline and its evidence into the reference-state calculation. Test each target observable on its own convergence axes before using it in a claim.

## Official sources

- [Quantum ESPRESSO pw.x input reference](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [COD silicon record 9013102](https://www.crystallography.net/cod/9013102.html)
- [Materials Cloud SSSP verification archive](https://archive.materialscloud.org/record/2021.76)
- [SSSP precision and efficiency protocol](https://doi.org/10.1016/j.cpc.2018.01.012)
- [SSSP pseudopotential verification study](https://doi.org/10.1038/s41524-018-0127-2)

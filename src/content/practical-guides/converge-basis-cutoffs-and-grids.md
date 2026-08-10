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
media_ids: []
review: docs/reviews/2026-08-03-test-numerical-convergence.md
reviewed_at: "2026-08-03"
---

## Purpose

Numerical convergence is a comparison, not a single successful run. Choose the quantity and tolerance first, vary one numerical control while holding the physical model fixed, and retain every input and output used in the decision.

The silicon files below are an illustrative series for learning the procedure. Their values are not transferable cutoffs or k meshes for another material, pseudopotential, property, or accuracy target.

## Choose the method, data, and manual

Start from the target observable and tolerance. Open the [method and input landscape](/DFT-Research-Workflow/operations/resource-landscape/#method-inputs), the exact code manual, and a maintained, versioned provider record for the selected pseudopotential, PAW dataset, species defaults, or basis set. The ordinary pseudopotential route is download-first from a tested library release: inspect its family, functional, valence treatment, relativity, test evidence or accuracy tier, recommended starting controls, warnings, licence, and exact download receipt before using the file. A generated potential is an advanced branch only when no tested release supports the required feature; it needs preserved generator inputs plus atomic, transferability, and relevant solid-state tests before entering this convergence series.

Identify the completeness controls used by the chosen representation. Plane waves, localized orbitals, real-space grids, LAPW/APW methods, and GPW/GAPW methods do not share one cutoff model. Quantum ESPRESSO and the committed Silicon matrix below provide one plane-wave pseudopotential implementation; other common implementations are indexed under [electronic-structure codes](/DFT-Research-Workflow/operations/resource-landscape/#electronic-structure-codes).

Read comparable Methods or Supporting Information to learn which controls other researchers tested, but do not import their accepted values until the model, dataset, code, state, and target observable are shown to be comparable.

## Generate and inspect the declared input series

Copy the reviewed input series into a new external runtime directory instead of editing the public case:

~~~bash
repo_root=$(pwd)
case_root="$repo_root/examples/cases/silicon-ground-state-electronic-structure"
runtime="$HOME/drw-runs/si-convergence"
test ! -e "$runtime"
mkdir -p "$runtime/inputs"

for ecut in 30 40 50; do
  for kmesh in 6 8 10; do
    name="si_e${ecut}_k${kmesh}"
    cp -- "$case_root/input/${name}.in" "$runtime/inputs/${name}.in"
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

Point <code>PSEUDO_SOURCE</code> to the exact downloaded library file whose provider receipt, family release, licence, metadata, and checksum you already recorded for this model:

~~~bash
: "${PSEUDO_SOURCE:?Set PSEUDO_SOURCE to the verified library UPF file}"
test -f "$PSEUDO_SOURCE"
sha256sum -- "$PSEUDO_SOURCE"

for input in "$runtime"/inputs/*.in; do
  name=$(basename "$input" .in)
  run_dir="$runtime/convergence-$name"
  test ! -e "$run_dir"
  mkdir -p "$run_dir/pseudo" "$run_dir/tmp"
  cp -- "$input" "$run_dir/$name.in"

  pseudo_name=$(awk '
    /ATOMIC_SPECIES/ {inside=1; next}
    inside && NF >= 3 {print $3; exit}
  ' "$run_dir/$name.in")
  test "$(basename -- "$PSEUDO_SOURCE")" = "$pseudo_name"
  ln -s -- "$PSEUDO_SOURCE" "$run_dir/pseudo/$pseudo_name"

  (
    cd "$run_dir"
    if pw.x -in "$name.in" > "$name.out" 2> "$name.err"; then
      pw_status=0
    else
      pw_status=$?
    fi
    printf '%s\n' "$pw_status" > "$name.exit-status"
    exit "$pw_status"
  ) || {
    printf 'QE failed for %s; inspect its stdout, stderr, and exit-status.\n' "$name" >&2
    continue
  }
done
~~~

Use this loop only on a workstation where direct execution is allowed or inside scheduler allocations sized for each run. For Slurm, submit the same isolated directories with <code>sbatch</code>, then use <code>squeue</code> and <code>sacct</code> where available. Never infer QE success from a scheduler state alone.

## Audit the outputs before comparing numbers

~~~bash
for output in "$runtime"/convergence-*/si_e*_k*.out; do
  run_dir=$(dirname -- "$output")
  name=$(basename -- "$output" .out)
  printf '\n%s\n' "$output"
  cat -- "$run_dir/$name.exit-status"
  test "$(grep -cF 'Program PWSCF v.' -- "$output")" -eq 1
  test "$(grep -cF 'JOB DONE.' -- "$output")" -eq 1
  grep -F 'convergence has been achieved' -- "$output" | tail -n 1
  grep -F '!    total energy' -- "$output" | tail -n 1
  tail -n 40 -- "$run_dir/$name.err"
  grep -Ei 'warning|error in routine|stopping|not converged|no convergence' \
    -- "$output" "$run_dir/$name.err" || true
done
~~~

The recorded shell status, one coherent program banner, <code>JOB DONE.</code>, and separate stderr constrain execution completion. The SCF line checks the electronic solver condition reported for that run. The energy line supplies the compared scalar. None of them establishes convergence of the series.

## Inspect the table and plot

Build an ordinary table containing the input identity, varied and fixed controls, termination and solver state, target observable, difference from the declared reference, and cost. Plot every completed point with a spreadsheet, notebook, or plotting program. Inspect the raw table and figure for a stable region, non-monotonicity, state changes, excluded rows, and edge-of-series behavior before accepting a setting.

## Optional parser and replay

The repository helper is an optional way to reproduce that already understood table and figure. Verify its parsing rules first:

~~~bash
python3 examples/practical-guides/qe_manual_handoff.py self-test
~~~

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

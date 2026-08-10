---
topic_slug: test-numerical-convergence
guide_slug: converge-k-points-and-smearing
title: Converge k-Point Sampling and Smearing
kind: implementation
tools:
  - quantum-espresso
  - python
status: reviewed
summary: Test Brillouin-zone sampling and occupation broadening as a coupled problem, especially when metallic states or Fermi-surface-sensitive observables are involved.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/silicon_qe_convergence.py
source_ids:
  - qe-pw-75
  - monkhorst-pack
  - methfessel-paxton
  - blochl-tetrahedron
  - cod-9013102
media_ids: []
review: docs/reviews/2026-08-03-test-numerical-convergence.md
reviewed_at: "2026-08-03"
---

A k-point and occupation study begins with the observable, reciprocal cell, electronic state, and intended integration method. Open the exact code manual and comparable Methods or Supporting Information before choosing mesh labels or smearing widths. Use the [method and input landscape](/DFT-Research-Workflow/operations/resource-landscape/#method-inputs) to compare occupation and sampling routes, and the [electronic-structure code landscape](/DFT-Research-Workflow/operations/resource-landscape/#electronic-structure-codes) to find their implementation names.

Inspect the reciprocal lattice, symmetry, dimensionality, offsets, and irreducible-point count. A browser or GUI Brillouin-zone view can help a researcher detect an unintended mesh orientation or sampling direction; the numerical decision still comes from the declared target and tolerance. Quantum ESPRESSO is the demonstrated execution syntax below, not the definition of k-point convergence.

## Design a metallic mesh-by-smearing study

For a metallic calculation, predeclare the target observable and units, tolerance, reciprocal-resolution series and offsets, smearing kernels, widths and units, and energy or free-energy convention. State which structure, method, pseudopotential, cutoff, band count, symmetry, charge, and spin branch remain fixed, and how Fermi level, magnetization, occupations, and other state diagnostics will be checked.

Use at least several mesh densities and several widths that span the material's integration regime. The values are study parameters, not universal defaults. Generate the complete input matrix before inspecting results.

Run the reader's prepared QE inputs with one naming rule:

~~~bash
mkdir -p metallic-convergence/runs
for input in metallic-convergence/inputs/*.in; do
  test -f "$input"
  name=$(basename -- "$input" .in)
  run_dir="metallic-convergence/runs/$name"
  test ! -e "$run_dir"
  mkdir -p "$run_dir"
  cp -- "$input" "$run_dir/$name.in"
  grep -Ei 'prefix|outdir|pseudo_dir' -- "$run_dir/$name.in"
  (
    cd "$run_dir"
    if pw.x -in "$name.in" > "$name.out" 2> "$name.err"; then
      pw_status=0
    else
      pw_status=$?
    fi
    printf '%s\n' "$pw_status" > "$name.exit-status"
    exit "$pw_status"
  ) || printf 'QE failed for %s; retain and inspect that run.\n' "$name" >&2
done
~~~

This is a protocol for a new metallic study. No such smearing outputs are supplied or claimed by the Silicon companion.

Before launch, inspect the displayed `prefix`, `outdir`, and `pseudo_dir` for every copied input. Stage the exact tested-library pseudopotential files and an isolated scratch path for that run, or use reviewed absolute paths. A loop that silently shares another row's save tree is not a valid mesh-by-smearing comparison.

## Check, extract, and compare

Start with:

~~~bash
for run_dir in metallic-convergence/runs/*; do
  name=$(basename -- "$run_dir")
  out="$run_dir/$name.out"
  err="$run_dir/$name.err"
  printf '\n%s\n' "$run_dir"
  cat -- "$run_dir/$name.exit-status"
  test "$(grep -cF 'Program PWSCF v.' -- "$out")" -eq 1
  test "$(grep -cF 'JOB DONE.' -- "$out")" -eq 1
  grep -F 'convergence has been achieved' -- "$out" | tail -n 1
  grep -iE 'total energy|fermi energy|smearing' -- "$out" | tail -n 12
  tail -n 40 -- "$err"
  grep -Ei 'warning|error in routine|stopping|not converged|no convergence' \
    -- "$out" "$err" || true
done
~~~

The shell status, coherent banner, <code>JOB DONE.</code>, stderr, and fatal-text scan constrain program completion. The SCF marker checks one electronic solver condition reported by QE. The remaining lines locate version-dependent energy, Fermi-level, and smearing records for inspection; define a parser for the exact quantity used in the decision.

Forces, energy differences, DOS near $E_F$, Fermi-surface geometry, and electron–phonon integrals require their own extraction and tolerance. Force convergence does not establish DOS convergence, and DOS convergence does not establish phonon convergence.

## Decide on a two-dimensional stable region

Open the full result table and inspect a plot or heatmap of the target over mesh density and occupation treatment. Look for a two-dimensional stable region, offset or odd-even effects, cancellation along a diagonal, non-monotonic rows, Fermi-level or magnetization changes, and points that remain sensitive at the edge of the matrix. Visual stability must also satisfy the predeclared numerical tolerance.

Inspect denser meshes at fixed width, narrower widths at fixed mesh, and more than one dense-mesh/narrow-width combination. Do not accept agreement along one diagonal; coarse sampling and broad smearing can cancel.

Accept a point only when the target observable remains inside tolerance under both a denser mesh and a narrower or otherwise stricter integration treatment, with the same electronic state. Record the occupation function, width, entropy or free-energy convention, Fermi level, and residual uncertainty.

A smearing width used as a numerical integration device is not automatically a physical electronic temperature. Tetrahedra and smearing also have different force and integration properties; choose the method for the intended observable.

## Inspect the stored Silicon comparison

The committed QE 7.5 Silicon evidence is a real fixed-occupation total-energy matrix, not a metallic smearing study. Inspect its inventory, normal termination, reported electronic solver condition, and printed energy rows:

~~~bash
find examples/practical-guides/data/silicon-qe/convergence -maxdepth 1 -type f -name 'si_e*_k*.out' | sort
grep -H "JOB DONE" examples/practical-guides/data/silicon-qe/convergence/si_e*_k*.out
grep -H "convergence has been achieved" examples/practical-guides/data/silicon-qe/convergence/si_e*_k*.out
grep -H "total energy" examples/practical-guides/data/silicon-qe/convergence/si_e*_k*.out
~~~

These checks expose stored artifacts and selected output lines. They do not establish k-point convergence for DOS, bands, a Fermi surface, phonons, or a metal.

## Optional reconstruction

After inspecting the files and scientific limits, reproduce the committed table and figure with the declared helper:

~~~bash
python3 examples/practical-guides/silicon_qe_convergence.py > silicon-kmesh-reconstruction.json
less silicon-kmesh-reconstruction.json
~~~

The helper hashes and parses the stored outputs. It does not parse the inputs, execute QE, test a smearing width, or replace the human decision.

## What this guide verifies

The companion verifies stored-output hashes, marker presence, parsed total energies, and filename-encoded Silicon mesh coverage. It does not verify the input cell, potential, occupation mode, execution provenance, or a smearing series.

It does not establish a transferable k-point density, converge DOS or bands, resolve a Fermi surface, or establish a physical material property. The conceptual mesh-by-smearing figure is not a real calculation result.

## Official sources

- [Quantum ESPRESSO 7.5 <code>pw.x</code> input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Monkhorst and Pack, special points for Brillouin-zone integrations](https://doi.org/10.1103/PhysRevB.13.5188)
- [Methfessel and Paxton, high-precision sampling for metals](https://doi.org/10.1103/PhysRevB.40.3616)
- [Blöchl, Jepsen, and Andersen, improved tetrahedron method](https://doi.org/10.1103/PhysRevB.49.16223)
- [Crystallography Open Database entry 9013102](https://www.crystallography.net/cod/9013102.html)

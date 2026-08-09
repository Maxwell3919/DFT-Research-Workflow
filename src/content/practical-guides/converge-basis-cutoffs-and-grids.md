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
execution_script: examples/practical-guides/silicon_qe_convergence.py
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

Run the declared companion first:

~~~bash
python3 examples/practical-guides/silicon_qe_convergence.py > silicon-convergence.json
less silicon-convergence.json
~~~

It reads nine committed QE 7.5 Silicon outputs from <code>examples/practical-guides/data/silicon-qe/convergence/</code>, verifies their expected SHA-256 values, checks stored markers, extracts the final printed total energy, and rebuilds the cutoff and k-mesh figures.

Inspect the stored objects directly:

~~~bash
find examples/practical-guides/data/silicon-qe/convergence -maxdepth 1 -type f -name 'si_e*_k*.out' | sort
sha256sum examples/practical-guides/data/silicon-qe/convergence/si_e*_k*.out
grep -H "JOB DONE" examples/practical-guides/data/silicon-qe/convergence/si_e*_k*.out
grep -H "convergence has been achieved" examples/practical-guides/data/silicon-qe/convergence/si_e*_k*.out
grep -H "total energy" examples/practical-guides/data/silicon-qe/convergence/si_e*_k*.out
~~~

<code>find</code> inventories the files. <code>sha256sum</code> checks local fixity. <code>JOB DONE</code> checks normal termination only. <code>convergence has been achieved</code> checks the electronic solver condition reported in each stored QE output. The energy line supplies the value parsed by the companion. None of these commands establishes observable convergence.

Basis completeness is not represented by one number across all electronic-structure methods. The archived matrix varies wavefunction cutoff over 30, 40, and 50 Ry and cubic k meshes over 6, 8, and 10. It uses one fixed Silicon teaching structure and one pseudopotential identity. The companion does not execute QE, parse the inputs, verify the potential source, or choose a production setting.

## Plan the calculation series

Before running, write:

~~~text
target observable and units:
predeclared tolerance:
basis controls to vary:
charge-density, augmentation, or integration-grid controls to vary:
fixed structure, method, pseudopotential, k sampling, occupations, and solver thresholds:
state checks:
input/output naming rule:
stopping rule:
~~~

For plane waves, test <code>ecutwfc</code> together with <code>ecutrho</code> or the relevant augmentation/FFT control. For another representation, substitute the basis size, range, integration grid, or real-space spacing that controls completeness.

Prepare every input before launching the sweep, then run the directory:

~~~bash
mkdir -p convergence/outputs
for input in convergence/inputs/*.in; do
  name=$(basename "$input" .in)
  pw.x -in "$input" > "convergence/outputs/$name.out"
done
~~~

This command runs the reader's prepared inputs; it is not evidence that the archived Silicon companion executed those calculations.

## Extract the same evidence from every run

Check termination and solver status separately, then extract the target quantity with one versioned rule:

~~~bash
grep -H "JOB DONE" convergence/outputs/*.out
grep -H "convergence has been achieved" convergence/outputs/*.out
grep -H "total energy" convergence/outputs/*.out
~~~

Add force, stress, energy-difference, band, phonon, or response extraction according to the stated target. Preserve the exact parser or <code>awk</code> command beside the table.

The boundary is observable-specific:

~~~text
Energy convergence ≠ force convergence.
Force convergence ≠ DOS convergence.
DOS convergence ≠ phonon convergence.
Phonon convergence ≠ EPC convergence.
~~~

Do not use this stored energy matrix to claim any of the later quantities.

## Decide from a stable region

For each setting $i$, compare the target $O_i$ with a declared stricter reference:

$$
\delta O_i = |O_i - O_{\mathrm{ref}}|.
$$

Accept the least costly setting only when all required observables satisfy their predeclared tolerances, the state identity remains unchanged, coupled grid controls are adequate, and at least one stricter setting confirms the decision. A library recommendation is a starting prior; the largest tested cutoff is not automatically the selected point.

If the series is non-monotonic or switches state, do not fit through it. Separate the branches or report the convergence question as unresolved.

## What this guide verifies

The companion verifies the expected hashes, marker presence, nine parsed total energies, filename-encoded $3 \times 3$ coverage, and differences to the 50 Ry, $10^3$ row. Marker presence is stored-output evidence, not an independent runtime or provenance check.

It does not test forces, stress, bands, DOS, phonons, response, pseudopotential transferability, or a production cutoff. Numerical convergence does not establish method accuracy, model correctness, experimental agreement, or a Silicon material conclusion.

## Official sources

- [Quantum ESPRESSO 7.5 <code>pw.x</code> input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Prandini et al., precision and efficiency in solid-state pseudopotential calculations](https://doi.org/10.1038/s41524-018-0127-2)
- [Materials Cloud SSSP archive and provenance record](https://archive.materialscloud.org/record/2021.76)
- [PseudoDojo training and grading paper](https://doi.org/10.1016/j.cpc.2018.01.012)
- [Crystallography Open Database entry 9013102](https://www.crystallography.net/cod/9013102.html)

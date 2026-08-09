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

Basis completeness is not represented by one number across all electronic-structure methods. In a plane-wave pseudopotential calculation it commonly involves a wavefunction cutoff together with a denser charge-density or augmentation grid. In local-orbital, real-space, or all-electron methods, different basis and integration controls play the same role.

## Choose the quantities that must remain stable

Do not test only the total energy when the study will use forces, stress, a phase difference, a band edge, or a phonon frequency. Create a table that preserves every tested control and every target observable.

A minimal record can contain:

```text
basis control
charge-density or integration-grid control
SCF threshold
state identity
absolute energy diagnostic
reported energy difference or derivative
maximum force component
stress component or pressure
runtime and memory
```

The diagram is conceptual. Separately, nine committed output files are recorded
as a bounded QE 7.5 Silicon matrix over 30, 40, and 50 Ry and 6³, 8³, and 10³
meshes. The published inputs describe the COD 9013102 cell, SSSP potential, and
eight-times density cutoff; the declared companion does not execute QE or parse
those inputs.

## Scan the coupled control surface

A one-dimensional cutoff sweep can hide dependence on the associated real-space grid. Test a small matrix first, then refine the region where all target quantities stabilize.

```bash
python3 examples/practical-guides/silicon_qe_convergence.py
```

The companion hashes the nine expected outputs, requires the literal
electronic-convergence and `JOB DONE` markers, parses the last reported total
energy, derives cutoff and mesh labels from filenames, and reports differences
to the 50 Ry, 10³ row. It does not verify the inputs, potential, forces, stress,
or a production setting.

## Use recommendations as prior evidence

Pseudopotential libraries may publish suggested cutoffs or tested precision/efficiency settings. These are valuable starting points and can reduce exploratory cost. They do not establish convergence for a new structure, oxidation state, pressure, magnetic state, response property, or software version.

The SSSP protocol explicitly evaluates several observables because cohesive energies, pressure, band properties, and phonon frequencies do not converge identically. PseudoDojo similarly grades pseudopotentials using defined tests. Preserve the library identity and version, then test the quantity used in the present study.

## Watch for discontinuities

A cutoff change can alter FFT grids, projector representation, diagonalization behaviour, or the converged electronic state. Record magnetic moments, occupations, symmetry, and other state diagnostics. A discontinuity should be investigated before any tail-spread estimate is interpreted.

Do not fit a smooth curve across a state switch. Separate the branches or report that the tested protocol did not produce one comparable series.

## Compare cost inside the stable region

Once several settings satisfy the observable-specific tolerance, cost can select a production point. Record wall time, memory, parallel layout, and I/O conditions, but do not confuse lower cost with scientific adequacy.

The selected point should be followed by at least one stricter point that remains inside the tolerance. The largest tested cutoff is not automatically the best production choice.

## What this guide verifies

The declared companion verifies expected output SHA-256 values, marker presence,
nine parsed total energies, filename-encoded 3 × 3 coverage, and reported
differences. Marker presence is stored-output evidence, not an independent runtime
or provenance check. The script does not test force, stress, band, DOS, phonon,
or response convergence, validate the potential, establish a transferable cutoff,
or support a Silicon material conclusion.

## Common mistakes

**Testing one control while silently changing another.** Preserve the complete numerical specification at every point.

**Using total energy alone.** Test the final difference, force, stress, response, or other reported quantity.

**Accepting a library recommendation as final evidence.** Treat it as a starting prior with a declared version.

**Selecting the largest point without a stopping rule.** Require a stable region and at least one stricter confirmation.

## Official sources

- [Quantum ESPRESSO 7.5 `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Prandini et al., precision and efficiency in solid-state pseudopotential calculations](https://doi.org/10.1038/s41524-018-0127-2)
- [Materials Cloud SSSP archive and provenance record](https://archive.materialscloud.org/record/2021.76)
- [PseudoDojo training and grading paper](https://doi.org/10.1016/j.cpc.2018.01.012)
- [Crystallography Open Database entry 9013102](https://www.crystallography.net/cod/9013102.html)

---
topic_slug: test-numerical-convergence
guide_slug: converge-finite-size-vacuum-and-images
title: Converge Finite Size, Vacuum, and Image Interactions
kind: implementation
tools:
  - python
status: reviewed
summary: Test the cell dimensions and boundary treatment that control periodic-image, concentration, slab-thickness, vacuum, and relaxation-volume errors.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/convergence_finite_size.py
source_ids:
  - ismail-beigi-truncation
  - freysoldt-defects
  - finite-size-scaling-limits
media_ids:
  - convergence-finite-size-asymptote
review: docs/reviews/2026-08-03-test-numerical-convergence.md
reviewed_at: "2026-08-03"
---

Run the companion and inspect its JSON report:

~~~bash
python3 examples/practical-guides/convergence_finite_size.py > finite-size-analysis.json
less finite-size-analysis.json
~~~

This command analyses a hard-coded synthetic table with three lateral sizes and three vacuum lengths. It checks state labels, applies declared tolerances to an illustrative observable and dipole probe, rejects a false plateau, and requires independent stricter checks in both directions. It does not run DFT or recommend a cell.

Finite periodic models replace an isolated, dilute, semi-infinite, or macroscopic limit with a repeated cell. Begin a real study by naming which limit is intended and which residual interaction prevents the current model from reaching it.

## Prepare the size matrix

Write the operation before generating structures:

~~~text
physical limit:
target observable and units:
predeclared tolerance:
independent size axes:
fixed composition, coverage, ordering, boundary treatment, constraints, and method:
state and geometry checks:
extraction rule:
required stricter neighbours:
~~~

For a slab, lateral area, slab thickness, vacuum, and relaxation depth are separate axes. For a charged defect, shape, separation, dielectric treatment, correction, and relaxation volume can interact. Increasing vacuum alone does not test lateral concentration or electrostatic image error.

Name each input from its physical controls and run the prepared series with the actual code. A QE example is:

~~~bash
mkdir -p finite-size/outputs
for input in finite-size/inputs/*.in; do
  name=$(basename "$input" .in)
  pw.x -in "$input" > "finite-size/outputs/$name.out"
done
~~~

This loop is a protocol for the reader's calculations, not execution evidence supplied by the synthetic companion.

## Check and extract

For QE outputs, begin by separating termination and electronic solver evidence:

~~~bash
grep -H "JOB DONE" finite-size/outputs/*.out
grep -H "convergence has been achieved" finite-size/outputs/*.out
tail -n 40 finite-size/outputs/*.out
~~~

<code>JOB DONE</code> checks normal termination only. The convergence marker checks the reported electronic solver condition. <code>tail</code> exposes the final part of each file for manual inspection; none of these commands extracts or converges the target observable.

Use one parser for the reported energy difference, force, potential, work function, correction term, dipole probe, or other target. Preserve cell vectors, concentration, coverage, separation, relaxed geometry, charge state, and boundary method in the same table.

## Decide against independent refinements

Accept a size only when the target lies inside its predeclared tolerance and remains there under a stricter change along every unresolved axis. A visually large vacuum is not evidence. A smooth three-point fit is not evidence that the assumed asymptotic law applies.

If different sizes relax to different structures, charge-localization states, magnetic states, or ordering patterns, stop treating them as one numerical series. Numerical convergence does not repair a changing physical model.

## What this guide verifies

The companion verifies deterministic arithmetic on an illustrative lateral-size/vacuum matrix. It identifies one accepted synthetic region, independent lateral and vacuum confirmations, consistent state labels, and a false plateau.

It does not validate a real slab, defect, correction, vacuum thickness, dilute limit, extrapolation law, or DFT observable. Its selected synthetic point is not a parameter recommendation.

## Official sources

- [Ismail-Beigi, truncation of periodic image interactions for confined systems](https://doi.org/10.1103/PhysRevB.73.233103)
- [Freysoldt et al., first-principles calculations for point defects](https://doi.org/10.1103/RevModPhys.86.253)
- [Limitations of empirical supercell extrapolation](https://doi.org/10.1103/PhysRevB.105.014103)

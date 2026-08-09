---
topic_slug: test-numerical-convergence
guide_slug: converge-q-meshes-and-response-grids
title: Converge q-Meshes, Response Grids, and Interpolation
kind: implementation
tools:
  - python
status: reviewed
summary: Separate convergence of each response solve, the coarse q grid or perturbation grid, the interpolated representation, and the final integrated observable.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/convergence_response_grids.py
source_ids:
  - qe-ph-75
  - baroni-dfpt
  - giustino-epc-review
media_ids:
  - convergence-response-grid-chain
review: docs/reviews/2026-08-03-test-numerical-convergence.md
reviewed_at: "2026-08-03"
---

Run the declared companion first:

~~~bash
python3 examples/practical-guides/convergence_response_grids.py > response-grid-analysis.json
less response-grid-analysis.json
~~~

It analyses a hard-coded synthetic matrix of coarse-q and fine-integration labels, applies illustrative tolerances, checks one direct-versus-interpolated error field, and requires stricter coarse and fine confirmations. It does not run a response calculation.

A converged linear-response solve at one q point does not establish a converged q mesh, force-constant range, interpolation, density of states, thermal integral, or electron–phonon coupling parameter.

## Prepare four linked convergence layers

Record:

~~~text
target observable, units, and tolerance:
accepted reference electronic state and k mesh:
response solver threshold and perturbations:
coarse q-mesh series:
interpolation method and direct check points:
fine integration-grid series:
fixed basis, pseudopotential, bands, symmetry, occupations, and broadening:
state and mode checks:
~~~

Treat the layers separately:

~~~text
reference electronic state
response solve at each q point
coarse response grid used to construct the interpolant
fine grid used for the reported integral or spectrum
~~~

A fine mesh cannot repair unconverged response solves or an inadequate coarse grid.

## Run and preserve the lineage

For a QE phonon route, a study may use a sequence such as:

~~~bash
ph.x -in ph-q4.in > ph-q4.out
q2r.x -in q2r-q4.in > q2r-q4.out
matdyn.x -in matdyn-q4-fine24.in > matdyn-q4-fine24.out
~~~

These filenames illustrate a traceable production protocol. They are not files supplied or executions performed by the synthetic companion. Prepare a series of coarse q meshes and, for each viable coarse mesh, more than one fine interpolation or integration grid.

Check each program separately:

~~~bash
grep "JOB DONE" ph-q4.out q2r-q4.out matdyn-q4-fine24.out
tail -n 40 ph-q4.out
tail -n 40 q2r-q4.out
tail -n 40 matdyn-q4-fine24.out
~~~

<code>JOB DONE</code> checks normal termination only. The <code>tail</code> commands expose final diagnostics for inspection; use the code's documented response residual, artifact checks, and frequency or observable parser to decide whether each layer is usable.

## Compare direct and interpolated quantities

Select off-grid or intermediate q points and calculate them directly. Compare the direct value $O_{\mathrm{direct}}$ with its interpolation:

$$
\delta O_{\mathrm{interp}} =
|O_{\mathrm{direct}} - O_{\mathrm{interpolated}}|.
$$

Apply a predeclared interpolation tolerance in the units of the mode or quantity that controls the claim. Preserve raw and constrained results when applying an acoustic sum rule or other correction; enforcing a rule does not prove the underlying grid is converged.

## Converge the final observable

At each adequate coarse mesh, refine the fine integration grid and extract the reported phonon DOS, free energy, linewidth, transport coefficient, or electron–phonon quantity. Inspect modes and q regions that dominate the result, not only a smooth high-symmetry plot.

Phonon convergence does not establish EPC convergence. EPC additionally depends on electronic k sampling, q sampling, band count, matrix-element interpolation, broadening or delta-function treatment, and convergence of $\alpha^2F(\omega)$, $\lambda$, and $\omega_{\log}$ where those are the targets.

Accept a pair only when response solves pass, direct-versus-interpolated checks meet tolerance, the final observable is stable against stricter coarse and fine grids, and the physical state remains comparable.

## What this guide verifies

The companion verifies illustrative two-level response-grid analysis: at least three coarse labels, multiple fine labels, a direct-versus-interpolated field, consistent state labels, and stricter confirmation pairs. It detects a smooth fine-grid tail built on an inadequate coarse grid.

It does not run <code>ph.x</code>, <code>q2r.x</code>, or <code>matdyn.x</code>; compute phonons or EPC; validate an acoustic sum rule; or recommend a universal q mesh.

## Official sources

- [Quantum ESPRESSO 7.5 <code>ph.x</code> input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Baroni et al., phonons and related properties from density-functional perturbation theory](https://doi.org/10.1103/RevModPhys.73.515)
- [Giustino, electron–phonon interactions from first principles](https://doi.org/10.1103/RevModPhys.89.015003)

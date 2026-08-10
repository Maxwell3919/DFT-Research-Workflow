---
topic_slug: test-numerical-convergence
guide_slug: converge-q-meshes-and-response-grids
title: Converge q-Meshes, Response Grids, and Interpolation
kind: implementation
tools:
  - quantum-espresso
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
media_ids: []
review: docs/reviews/2026-08-03-test-numerical-convergence.md
reviewed_at: "2026-08-03"
---

Begin with the response quantity that controls the scientific decision. Choose a documented route such as density-functional perturbation theory or finite displacement, then open the exact code or specialist-tool manual and comparable Methods or Supporting Information. The [method and input landscape](/DFT-Research-Workflow/operations/resource-landscape/#method-inputs), [electronic-structure code landscape](/DFT-Research-Workflow/operations/resource-landscape/#electronic-structure-codes), and [learning resources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning) show common human entry points without implying that one implementation is universal.

Inspect the reference structure and electronic state before preparing response inputs. Visualize the coarse q grid or displacement supercell where the tool permits it, and decide which direct off-grid points, modes, symmetry diagnostics, acoustic behavior, dispersion regions, or final integrals must be inspected. A converged solve at one q point does not establish a converged q mesh, force-constant range, interpolation, density of states, thermal integral, or electron-phonon quantity. The QE sequence below is one implementation example.

## Prepare four linked convergence layers

Record the target observable, units, tolerance, accepted reference electronic state and k mesh, response threshold and perturbations, coarse q-mesh series, interpolation method and direct checkpoints, and fine integration-grid series. Name the fixed basis, pseudopotential, band count, symmetry, occupations, and broadening, together with state and mode checks.

Treat four layers separately: the accepted reference electronic state; each response solve; the complete coarse response grid used to construct the interpolant; and the fine grid used for the reported integral or spectrum. Each layer retains its own input, stdout, stderr, exit status, artifacts, and parent identity.

A fine mesh cannot repair unconverged response solves or an inadequate coarse grid.

## Run and preserve the lineage

For a QE phonon route, first bind the response calculation to the exact accepted parent. Run <code>ph.x</code> in a new directory and inspect it before any transformation:

~~~bash
: "${QE_PREFIX:?Set QE_PREFIX to the accepted pw.x prefix}"
: "${QE_OUTDIR:?Set QE_OUTDIR to the accepted pw.x outdir}"
test -d "$QE_OUTDIR/$QE_PREFIX.save"
test ! -e ph-q4.out
test ! -e ph-q4.err
grep -Ei 'prefix|outdir|ldisp|nq1|nq2|nq3|fildyn' -- ph-q4.in
if ph.x -in ph-q4.in > ph-q4.out 2> ph-q4.err; then
  ph_status=0
else
  ph_status=$?
fi
printf '%s\n' "$ph_status" > ph-q4.exit-status
tail -n 40 -- ph-q4.out ph-q4.err
grep -Ei 'warning|error in routine|stopping|not converged|no convergence' \
  -- ph-q4.out ph-q4.err || true
test "$ph_status" -eq 0
~~~

These filenames illustrate a traceable production protocol. They are not files supplied or executions performed by the synthetic companion. Before continuing, verify that every required q point or irreducible perturbation for this declared mesh completed, that the dynamical-matrix inventory is nonempty and compatible, and that the parent <code>prefix</code>/<code>outdir</code> match the accepted reference. Do not copy the next block while q coverage is incomplete:

~~~bash
test ! -e q2r-q4.out
test ! -e q2r-q4.err
if q2r.x -in q2r-q4.in > q2r-q4.out 2> q2r-q4.err; then
  q2r_status=0
else
  q2r_status=$?
fi
printf '%s\n' "$q2r_status" > q2r-q4.exit-status
tail -n 40 -- q2r-q4.out q2r-q4.err
test "$q2r_status" -eq 0

test ! -e matdyn-q4-fine24.out
test ! -e matdyn-q4-fine24.err
if matdyn.x -in matdyn-q4-fine24.in > matdyn-q4-fine24.out 2> matdyn-q4-fine24.err; then
  matdyn_status=0
else
  matdyn_status=$?
fi
printf '%s\n' "$matdyn_status" > matdyn-q4-fine24.exit-status
tail -n 40 -- matdyn-q4-fine24.out matdyn-q4-fine24.err
test "$matdyn_status" -eq 0
~~~

Prepare a series of coarse q meshes and, for each viable coarse mesh, more than one fine interpolation or integration grid.

Check each program separately:

~~~bash
for stage in ph-q4 q2r-q4 matdyn-q4-fine24; do
  printf '\n%s\n' "$stage"
  cat -- "$stage.exit-status"
  test "$(grep -cF 'JOB DONE.' -- "$stage.out")" -eq 1
  tail -n 40 -- "$stage.out" "$stage.err"
  grep -Ei 'warning|error in routine|stopping|not converged|no convergence' \
    -- "$stage.out" "$stage.err" || true
done
~~~

The shell status, <code>JOB DONE.</code>, stderr, and fatal-text scan constrain completion separately for each executable. The <code>tail</code> commands expose final diagnostics for inspection; use the code's documented response residual, complete q-coverage and artifact checks, and frequency or observable parser to decide whether each layer is usable.

## Compare direct and interpolated quantities

Plot the directly calculated and interpolated values together at the selected q points. For phonons, also inspect the dispersion and relevant eigenvectors or mode animations when available. Look for branch swaps, localized anomalies, acoustic artifacts, symmetry inconsistencies, and errors hidden by a smooth path. Visual inspection helps identify where the interpolation fails; it does not replace the numerical tolerance.

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

## Optional synthetic replay

After the real response layers and expected artifacts are understood, run the companion as a bounded decision-rule exercise:

~~~bash
python3 examples/practical-guides/convergence_response_grids.py > response-grid-analysis.json
less response-grid-analysis.json
~~~

It analyses a hard-coded synthetic matrix of coarse-q and fine-integration labels, applies illustrative tolerances, checks one direct-versus-interpolated field, and requires stricter coarse and fine confirmations. It does not run a response calculation, produce a phonon mode, or establish a real q mesh.

## What this guide verifies

The companion verifies illustrative two-level response-grid analysis: at least three coarse labels, multiple fine labels, a direct-versus-interpolated field, consistent state labels, and stricter confirmation pairs. It detects a smooth fine-grid tail built on an inadequate coarse grid.

It does not run <code>ph.x</code>, <code>q2r.x</code>, or <code>matdyn.x</code>; compute phonons or EPC; validate an acoustic sum rule; or recommend a universal q mesh.

## Official sources

- [Quantum ESPRESSO 7.5 <code>ph.x</code> input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Baroni et al., phonons and related properties from density-functional perturbation theory](https://doi.org/10.1103/RevModPhys.73.515)
- [Giustino, electron–phonon interactions from first principles](https://doi.org/10.1103/RevModPhys.89.015003)

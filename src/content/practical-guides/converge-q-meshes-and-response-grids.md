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

Response calculations add sampling layers beyond the reference electronic state. A converged linear-response solve at one q point does not establish a converged q mesh, force-constant range, interpolation, density of states, thermal integral, or electron–phonon coupling parameter.

## Separate the four numerical layers

Treat these as distinct evidence questions:

```text
reference electronic state and k mesh
response solver at each perturbation or q point
coarse response grid used to build an interpolant
fine integration or interpolation grid used for the reported quantity
```

A change in the final observable can originate from any layer. Preserve the complete grid lineage rather than reporting only the final dense interpolation mesh.

## Converge the response solve first

At fixed k and q, verify the internal response threshold, number of bands where relevant, perturbation basis, symmetry handling, and reference-state consistency. A failed or loosely converged perturbation should not be hidden inside a later interpolation.

The response residual is a solver diagnostic. It is not a q-mesh convergence test.

## Refine the coarse q mesh

Quantum ESPRESSO exposes `nq1`, `nq2`, and `nq3` as the uniform phonon grid when dispersion calculations are requested. Refining that grid extends the real-space force-constant information available to Fourier interpolation, but the required density depends on the spatial range and target quantity.

The illustrative script analyses synthetic results for several coarse q meshes and fine integration meshes:

```python
from convergence_response_grids import analyse_response_grid_table

report = analyse_response_grid_table()
print(report["accepted_pair"])
```

The values are not phonon or electron–phonon calculations.

## Validate interpolation against direct calculations

A smooth interpolated curve can be visually convincing while the coarse grid remains insufficient. Select off-grid or intermediate points and compare interpolated values with direct response calculations. Record the interpolation method, real-space cutoff, acoustic sum rule or other constraints, and any non-analytic corrections.

The comparison should include the modes or regions that dominate the target observable, not only visually convenient high-symmetry points.

## Refine the final integration grid separately

A fixed coarse q mesh can feed several fine meshes for a phonon density of states, free-energy integral, linewidth, transport coefficient, or electron–phonon coupling. Convergence of the fine integration grid does not repair an inadequate coarse response grid.

For electron–phonon quantities, electronic k sampling, q sampling, band count, broadening, and double-delta integration can be strongly coupled. Giustino's review describes the multiple interpolation and integration layers involved. Test the reported quantity over more than one path through this multidimensional space.

## Check constraints and sensitive regions

Useful diagnostics can include symmetry-equivalent q points, acoustic behaviour near Γ, charge neutrality, sum rules, direct-versus-interpolated frequencies, and mode-resolved contributions. A small violation may be a numerical diagnostic rather than a physical result.

Do not enforce a correction silently and then use the corrected curve as proof that the underlying grid was converged. Preserve both the raw and constrained results.

## What this guide verifies

The companion script verifies an illustrative two-level response-grid analysis. It requires at least three coarse meshes, at least two fine meshes for each accepted coarse mesh, a direct-versus-interpolated check, consistent state labels, and a stricter confirmation pair.

It does not run DFPT, compute phonons or electron–phonon coupling, validate an acoustic sum rule, or recommend a universal q mesh.

## Common mistakes

**Reporting only the final interpolation mesh.** Preserve the expensive coarse response grid and all solver settings.

**Using a smooth dispersion as convergence evidence.** Compare selected interpolated points with direct calculations.

**Refining the fine integration grid while freezing an inadequate coarse mesh.** The two errors are independent.

**Treating Γ-point stability as full-grid stability.** A single q point cannot establish the dispersion or integrated response.

## Official sources

- [Quantum ESPRESSO 7.5 `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Baroni et al., phonons and related properties from density-functional perturbation theory](https://doi.org/10.1103/RevModPhys.73.515)
- [Giustino, electron–phonon interactions from first principles](https://doi.org/10.1103/RevModPhys.89.015003)

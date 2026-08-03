---
topic_slug: fermi-surface-and-full-brillouin-zone-analysis
guide_slug: compare-full-zone-isovalue-and-band-path
title: Compare a Full-Zone Isovalue with a Band-Path Crossing
kind: implementation
tools:
  - python
status: reviewed
summary: Use an invented reciprocal-space energy field to show why a line crossing cannot establish a full-zone pocket.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/fermi_surface_isovalue_fixture.py
source_ids:
  - wannier90-fermi-parameters
  - wannier90-copper-tutorial
  - qe-fermi-postprocessing
media_ids:
  - fermi-surface-isovalue-fixture
review: docs/reviews/2026-08-04-fermi-surface-and-full-brillouin-zone-analysis.md
reviewed_at: "2026-08-04"
---

This fixture evaluates an invented two-dimensional reciprocal-space energy field. A selected diagonal path sees only part of the `E = μ` contour, while a full grid reports every approximate crossing cell and tests whether a small change of the declared isovalue changes the apparent pocket count.

## Keep the scalar field and isovalue together

An isosurface renderer needs the reciprocal mesh, energy field, band/state identifier, and `μ` or chosen isovalue. [Wannier90 documents Fermi-surface output on a regular interpolated grid](https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/parameters/); its [copper tutorial](https://wannier90.readthedocs.io/en/latest/tutorials/tutorial_6/) also directs readers to compare interpolation with direct bands. The fixture does neither calculation: its field is explicitly invented.

## Run the deterministic fixture

```text
python3 examples/practical-guides/fermi_surface_isovalue_fixture.py \
  --svg public/media/practical-guides/fermi-surface-and-full-brillouin-zone-analysis/compare-full-zone-isovalue-and-band-path/fermi-surface-isovalue-fixture.svg
```

The JSON output reports the invented grid, path crossings, full-grid crossing cells, and a bounded isovalue perturbation. [Quantum ESPRESSO's post-processing guide](https://quantum-espresso.org/Doc/pp_user_guide/node8.html) is cited only for the software distinction between band/Fermi-surface post-processing and the underlying electronic state.

## What this guide verifies

Execution verifies deterministic grid sampling, a declared isovalue comparison, and SVG rendering for invented data. It does not calculate eigenvalues, construct a material Fermi surface, converge a k mesh, determine a carrier density, validate a Wannier interpolation, calculate a velocity or transport coefficient, or establish an electronic instability.

## Official sources

- [Wannier90 Fermi-surface parameters](https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/parameters/)
- [Wannier90 copper Fermi-surface tutorial](https://wannier90.readthedocs.io/en/latest/tutorials/tutorial_6/)
- [Quantum ESPRESSO band/Fermi-surface post-processing guide](https://quantum-espresso.org/Doc/pp_user_guide/node8.html)

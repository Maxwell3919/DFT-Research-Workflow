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

Finite periodic models replace an isolated, dilute, semi-infinite, or macroscopic limit with a repeated cell. The resulting error can include electrostatic image interactions, elastic fields, wavefunction overlap, finite concentration, restricted wavelengths, incomplete relaxation volume, slab-thickness effects, and artificial coupling across vacuum.

## Identify the physical limit

State which limit the calculation is meant to approach:

```text
isolated molecule or cluster
dilute point defect
isolated adsorbate at a declared coverage limit
semi-infinite surface
single two-dimensional layer
isolated interface or heterostructure
long-wavelength lattice response
```

The varied dimensions should correspond to the residual interactions that prevent that limit from being represented.

## Vary independent cell directions deliberately

For a slab, lateral area, slab thickness, vacuum, and relaxation depth are separate axes. For a charged defect, supercell shape, dielectric screening, charge correction, and defect separation can matter together. For a two-dimensional material, in-plane sampling and out-of-plane image treatment remain distinct.

The illustrative script analyses synthetic results over several lateral sizes and vacuum lengths:

```python
from convergence_finite_size import analyse_finite_size_table

report = analyse_finite_size_table()
print(report["accepted_region"])
```

The data are not DFT results and do not encode a recommended cell size.

## Inspect the actual residual interaction

A large empty region in a visualizer does not establish that long-range interactions are negligible. Ismail-Beigi's Coulomb-truncation work shows that periodic image effects can be removed by changing the interaction itself rather than only enlarging the cell.

Record the electrostatic boundary treatment, dipole or monopole correction, Coulomb cutoff, dielectric model, and neutralizing-background convention. These settings are part of the method identity and can change the asymptotic behaviour of the convergence series.

## Avoid blind polynomial extrapolation

An extrapolation is defensible only when the residual-error form is physically motivated and the sampled cells are inside its asymptotic regime. Defect wavefunction overlap, electrostatics, elastic interactions, and commensurability can produce non-smooth or anisotropic behaviour.

Test several shapes or refinement paths where possible. A good fit over three points is not evidence that the assumed infinite-size law is correct.

## Preserve concentration and geometry meaning

Increasing a supercell changes more than numerical size when the model contains a defect, adsorbate, alloy pattern, magnetic ordering vector, or constrained distortion. Record the resulting concentration, coverage, separation, and allowed relaxation pattern.

If different cell sizes relax into different structures or charge-localization states, compare them as different physical candidates before attempting an extrapolation.

## What this guide verifies

The companion script verifies a deterministic analysis of an illustrative lateral-size/vacuum table. It requires independent refinement in both directions, checks state labels, rejects a false plateau that lacks a stricter neighbour, and reports whether one axis remains unresolved.

It does not validate a vacuum thickness, defect correction, slab model, dilute limit, or extrapolation law for a real material.

## Common mistakes

**Increasing vacuum while leaving the electrostatic treatment unchanged.** Long-range image interactions may persist.

**Changing supercell size without recording concentration.** The physical model has changed.

**Using one isotropic size measure for an anisotropic cell.** Test directions and shapes that match the residual interaction.

**Fitting before reaching the asymptotic regime.** A smooth curve can conceal the wrong finite-size model.

## Official sources

- [Ismail-Beigi, truncation of periodic image interactions for confined systems](https://doi.org/10.1103/PhysRevB.73.233103)
- [Freysoldt et al., first-principles calculations for point defects](https://doi.org/10.1103/RevModPhys.86.253)
- [Limitations of empirical supercell extrapolation](https://doi.org/10.1103/PhysRevB.105.014103)

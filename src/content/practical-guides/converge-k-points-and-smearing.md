---
topic_slug: test-numerical-convergence
guide_slug: converge-k-points-and-smearing
title: Converge k-Point Sampling and Smearing
kind: implementation
tools:
  - python
status: reviewed
summary: Test Brillouin-zone sampling and occupation broadening as a coupled problem, especially when metallic states or Fermi-surface-sensitive observables are involved.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/convergence_kpoints_smearing.py
source_ids:
  - qe-pw-75
  - monkhorst-pack
  - methfessel-paxton
  - blochl-tetrahedron
media_ids:
  - convergence-k-smearing-matrix
review: docs/reviews/2026-08-03-test-numerical-convergence.md
reviewed_at: "2026-08-03"
---

A k-point label is meaningful only together with the reciprocal cell, offsets, symmetry treatment, occupations, and target observable. Metallic calculations add a coupled smearing dependence that cannot be separated safely by choosing one conventional width and refining only the mesh.

## Record reciprocal resolution, not only integer counts

A `12 × 12 × 1` mesh in one cell is not equivalent to the same integers in a different supercell or strained lattice. Preserve the reciprocal lattice, mesh, offset, irreducible-point count, symmetry settings, and any dimensional reduction.

For comparisons across cells, record a reciprocal-space spacing or density measure in addition to the integer mesh. The exact metric should be defined and used consistently rather than treated as a universal threshold.

## Build a mesh-by-smearing matrix

For a metal, test several meshes at several smearing widths. The illustrative script analyses a synthetic matrix:

```python
from convergence_kpoints_smearing import analyse_k_smearing_matrix

report = analyse_k_smearing_matrix()
print(report["stable_window"])
```

The table contains an energy difference, a density-of-states-like diagnostic, and a state label for every mesh/width pair. The script does not run a DFT code.

## Keep the observable and integration purpose explicit

Smearing can be used as a numerical integration device or as part of a finite-electronic-temperature model. Those meanings are different. Record the occupation function, width, entropy or free-energy convention, and the quantity being extrapolated or reported.

For forces and structural optimization, use an integration treatment compatible with variational forces. Quantum ESPRESSO notes that its tetrahedron option is well suited to density-of-states calculations and less suited to force, optimization, and dynamics calculations. A method suitable for one observable is not automatically suitable for another.

## Inspect more than one refinement path

Useful paths include:

- denser meshes at fixed smearing;
- narrower smearings at fixed mesh;
- several dense-mesh/narrow-smearing combinations;
- an alternative integration method where appropriate.

Agreement along only one diagonal can result from cancellation between insufficient sampling and excessive broadening. Look for a two-dimensional stable region.

## Track state continuity

A mesh or smearing change can alter occupations, magnetic moments, Fermi level, or the selected electronic basin. Preserve those diagnostics. A discontinuity near the Fermi level may be physically meaningful and can require a denser mesh rather than smoothing it away.

Do not declare convergence by averaging points that represent different states.

## What this guide verifies

The companion script verifies that a synthetic k-point/smearing matrix has complete coverage, consistent state identity in the accepted region, a stable tail in more than one mesh and width direction, and at least one stricter confirmation point.

It does not identify a universal k-point density, smearing method, smearing width, electronic temperature, or Fermi-surface resolution for a real system.

## Common mistakes

**Refining only k points at one large smearing.** Residual broadening error can remain hidden.

**Refining only smearing on one coarse mesh.** The apparent zero-width limit can be dominated by sampling noise.

**Comparing integer mesh labels across different cells.** Use a defined reciprocal-resolution measure and preserve offsets and symmetry.

**Treating tetrahedra and smearing as interchangeable switches.** Their mathematical and force properties differ.

## Official sources

- [Quantum ESPRESSO 7.5 `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Monkhorst and Pack, special points for Brillouin-zone integrations](https://doi.org/10.1103/PhysRevB.13.5188)
- [Methfessel and Paxton, high-precision sampling for metals](https://doi.org/10.1103/PhysRevB.40.3616)
- [Blöchl, Jepsen, and Andersen, improved tetrahedron method](https://doi.org/10.1103/PhysRevB.49.16223)

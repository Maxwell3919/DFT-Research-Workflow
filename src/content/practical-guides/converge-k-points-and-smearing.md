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
media_ids:
  - convergence-k-smearing-matrix
  - silicon-qe-kmesh-matrix
review: docs/reviews/2026-08-03-test-numerical-convergence.md
reviewed_at: "2026-08-03"
---

A k-point label is meaningful only together with the reciprocal cell, offsets, symmetry treatment, occupations, and target observable. Metallic calculations add a coupled smearing dependence that cannot be separated safely by choosing one conventional width and refining only the mesh.

## Record reciprocal resolution, not only integer counts

A `12 × 12 × 1` mesh in one cell is not equivalent to the same integers in a different supercell or strained lattice. Preserve the reciprocal lattice, mesh, offset, irreducible-point count, symmetry settings, and any dimensional reduction.

For comparisons across cells, record a reciprocal-space spacing or density measure in addition to the integer mesh. The exact metric should be defined and used consistently rather than treated as a universal threshold.

## Build a mesh-by-smearing matrix

For a metal, test several meshes at several smearing widths. Silicon is not a
metallic-smearing example, so the real teaching case holds `occupations='fixed'`
and samples 6³, 8³, and 10³ meshes at three QE cutoffs. It establishes the
provenance and mesh dimension of a real calculation without pretending to test
smearing or a Fermi surface.

```bash
python3 examples/practical-guides/silicon_qe_convergence.py
```

The reconstruction validates all nine committed QE outputs and displays their
energies relative to the 50 Ry, 10³ row. The neighbouring conceptual matrix
remains useful for the separate metallic mesh-by-smearing question.

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

The stored QE outputs establish electronic completion and a bounded mesh comparison
for one fixed Silicon cell, potential, and code version. They do not test a
smearing width, establish a universal k-point density, converge the DOS/bands,
resolve a Fermi surface, or establish any physical material property.

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
- [Crystallography Open Database entry 9013102](https://www.crystallography.net/cod/9013102.html)

---
topic_slug: charge-density-and-charge-redistribution
status: reviewed
---

Charge density is a real-space field of a declared electronic state. It answers where the selected calculation places electronic charge in its periodic cell; it is not an atom charge, an oxidation state, a bond order, or a measured charge-transfer experiment. Before comparing fields, fix the structure, cell, pseudopotential or all-electron convention, spin/SOC treatment, occupation model, real-space representation, and density units.

## A density field has a normalization and a representation

For an electron number `N`, the density `n(r)` is normalized as `∫cell n(r) dr = N` for the declared cell and electron convention. A code may instead write electron charge density with a sign convention, pseudo-valence density, PAW reconstruction, or a grid value whose conversion to `1/volume` must be stated. Core treatment is therefore not cosmetic: two fields with different reconstructed-core conventions cannot be subtracted or integrated as if they were identical observables.

The field is sampled on a finite grid. An isosurface, plane cut, or planar average discards information and introduces a chosen contour, slice, colour scale, origin, and periodic image. Preserve the volumetric array, lattice vectors, grid dimensions, units, and plotting transform; a screenshot alone cannot reproduce an integral or establish convergence.

## Difference density is a subtraction between compatible objects

A common redistribution field is

```text
Δn(r) = n_combined(r) − Σ_i n_i(r).
```

Here `n_combined(r)` is the selected full system and `n_i(r)` are declared fragment calculations or superposed reference densities evaluated on the same real-space coordinates. The expression asks how density changes relative to that reference construction. It does not define a unique charge-transfer observable: changing the fragments, frozen geometries, charge states, spin states, cell, boundary conditions, or density convention changes `Δn(r)`.

For an adsorption or interface question, calculate every term in the same cell and grid, with compatible Hamiltonian, spin/SOC, occupations, and geometry convention. A relaxed-fragment difference mixes electronic redistribution with structural deformation; a frozen-fragment difference isolates a different comparison. Neither is intrinsically preferable without the stated question.

## Red and blue lobes are evidence of a field difference, not an atomic charge

Positive and negative regions show local accumulation and depletion under the displayed sign convention. They do not by themselves supply an electron count. Integrate `Δn(r)` over the complete compatible cell as a closure check, then integrate only over a declared region or partition if a regional number is needed. For a neutral, exactly compatible full-cell subtraction, the integral should close within numerical representation error; failure can expose a grid, normalization, alignment, or reference mismatch.

An apparent lobe also depends on the selected contour level. Show at least the sign convention, units, isovalue, view direction, and cell boundary. Check whether the decision-relevant feature persists under density-grid refinement and under a bounded, explicit contour change rather than interpreting one aesthetically chosen image.

## Atomic populations depend on the partition

Bader basins partition a density by zero-flux surfaces of its gradient; Hirshfeld partitions use reference-atom weights. Both can produce useful, reproducible numbers when the input density, core treatment, grid, and algorithm are recorded. They answer different partition questions, so their values need not agree and neither automatically equals a formal oxidation state.

Report the partition method, density type, reference atoms or reconstruction choice, grid, algorithm version, integrated total, and residual. Compare like with like across a series. A change in a Bader or Hirshfeld population can support a conditional statement about that partition of that calculation; it cannot alone prove a literal transfer of an integer electron, a bond order, catalytic mechanism, or experimental charge state.

## Spin density and charge density are different fields

In a collinear calculation, a magnetization density is commonly related to the difference between spin-channel densities, while total charge is their sum. In spinor/SOC calculations, magnetization can be vector-valued and a selected component requires an axis. Do not interpret a spin-density lobe as total-charge accumulation, or subtract spin channels from calculations with changed magnetic states without declaring the mapping.

## Numerical completion is not density reliability

SCF completion only establishes the solver criterion for its represented state. Density features can still change with the real-space grid, basis, k sampling, augmentation/reconstruction, smearing, structural state, cell size, vacuum, and chosen reference fragments. Converge the observable actually used downstream: full-cell closure, a regional integral, a planar-average step, a partitioned population difference, or a resolved feature—not only the total energy.

## What this topic establishes

This topic establishes how to generate, compare, visualize, integrate, and partition a declared charge-density field while keeping density convention, reference construction, grid, and partition choice visible. It does not establish a unique atomic charge, oxidation state, bond order, charge-transfer mechanism, chemical reactivity, experimental density, material stability, or device performance from a density image or one population analysis alone.

## Sources and methods

- [Hohenberg and Kohn, inhomogeneous electron gas](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Henkelman, Arnaldsson, and Jónsson, Bader decomposition](https://doi.org/10.1016/j.commatsci.2005.04.010)
- [Tang, Sanville, and Henkelman, grid-based Bader analysis](https://doi.org/10.1088/0953-8984/21/8/084204)
- [Hirshfeld, spatial partitioning of charge density](https://doi.org/10.1002/ijch.197700033)
- [Quantum ESPRESSO `pp.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PP.html)
- [Quantum ESPRESSO plotting guide](https://quantum-espresso.org/Doc/pp_user_guide/node6.html)
- [VASP `CHGCAR` documentation](https://vasp.at/wiki/CHGCAR)

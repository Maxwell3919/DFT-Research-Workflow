---
topic_slug: charge-density-and-charge-redistribution
status: reviewed
---

Use a charge-density calculation when the next decision depends on where a declared electronic state places charge: for example, whether an interface produces a reproducible redistribution, whether a defect changes a local region, or whether a spatial feature survives a change of numerical representation. The parent object is an accepted electronic state with its structure, cell, pseudopotential or all-electron convention, spin/SOC treatment, occupations, and real-space density representation still attached.

If the intended conclusion needs an electron count rather than a picture, choose the integration region or partition before generating the plot. A density is not automatically an atomic charge, oxidation state, bond order, or measured charge-transfer observable.

## A density field has a normalization and a representation

The implementation depends on the electronic-structure code and version.

- In Quantum ESPRESSO, the bounded route is a compatible `pw.x` parent state followed by `pp.x`, using the documented `prefix`, `outdir`, density selector, and output format to write a volumetric field. Confirm the exact selector in the linked `INPUT_PP` documentation for the installed release.
- In VASP, the parent run can produce `CHGCAR`. Preserve whether the comparison uses the valence grid, augmentation information, or another explicitly reconstructed density convention.

Do not subtract a Quantum ESPRESSO pseudo-valence field from a differently reconstructed PAW field, or compare grids only because both can be visualized. Record the lattice vectors, grid dimensions, units, density convention, and parent calculation identity with every exported field.

For an electron number $N$, first confirm the declared normalization,

$$
\int_{\mathrm{cell}} n(\mathbf r)\,d\mathbf r = N.
$$

A program can instead report electron charge density with a sign convention or grid normalization. Resolve that convention from the official output documentation before integrating.

## Difference density is a subtraction between compatible objects

For a combined system and declared fragments, a common redistribution field is

$$
\Delta n(\mathbf r) = n_{\mathrm{combined}}(\mathbf r)
- \sum_i n_i(\mathbf r).
$$

Generate every term in the same cell, on the same grid, with compatible Hamiltonian, spin/SOC, occupations, charge convention, and coordinates. Decide whether fragment densities use frozen combined-system coordinates or separately relaxed fragments. The first isolates redistribution at one geometry; the second also contains structural deformation.

Before processing real fields, [Check a Compatible Difference-Density Closure](/DFT-Research-Workflow/operations/charge-density-and-charge-redistribution/guides/check-charge-difference-closure/). That practical guide runs an invented-grid arithmetic fixture. It verifies subtraction and full-cell bookkeeping only; it does not produce a material density.

## Check the numerical object before reading the image

Inspect the postprocessor output for normal completion and confirm that the written grid has the expected cell, dimensions, units, and density type. Normal program termination establishes only that the export ran.

For a neutral compatible subtraction, integrate $\Delta n$ over the complete cell. The result should close within a tolerance justified by the grid and representation. A failed closure is a reason to inspect grid registration, normalization, electron counts, reference states, and reconstruction conventions before discussing local lobes.

Then test the quantity used for the conclusion. Refine the grid for an integrated charge, vary a declared isovalue for a visual feature, or repeat the selected partition consistently across the comparison. SCF convergence and stable total energy do not establish convergence of a regional integral, planar average, Bader population, or difference-density feature.

## Read only the quantity that was constructed

Positive and negative regions mean accumulation and depletion under the displayed sign convention. Report units, isovalue, view direction, cell boundary, and whether periodic images are shown. A lobe is not an electron count.

## Atomic populations depend on the partition

Bader and Hirshfeld values remain conditional on their respective partition definitions. They can be compared only when the density type, grid, reconstruction, reference atoms where applicable, algorithm version, integrated total, and residual are recorded consistently.

## Spin density and charge density are different fields

In spin-polarized work, distinguish total charge density from magnetization density. A spinor/SOC magnetization field may be vector-valued and requires a declared axis or vector representation.

## What this topic establishes

The supported result is a bounded statement about a declared field, difference, integral, or partition for the accepted parent state. It does not establish a unique atomic charge, formal oxidation state, bond order, charge-transfer mechanism, chemical reactivity, experimental density, or material performance.

## Sources and methods

- [Hohenberg and Kohn, inhomogeneous electron gas](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Henkelman, Arnaldsson, and Jonsson, Bader decomposition](https://doi.org/10.1016/j.commatsci.2005.04.010)
- [Tang, Sanville, and Henkelman, grid-based Bader analysis](https://doi.org/10.1088/0953-8984/21/8/084204)
- [Hirshfeld, spatial partitioning of charge density](https://doi.org/10.1002/ijch.197700033)
- [Quantum ESPRESSO `pp.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PP.html)
- [Quantum ESPRESSO plotting guide](https://quantum-espresso.org/Doc/pp_user_guide/node6.html)
- [VASP `CHGCAR` documentation](https://vasp.at/wiki/CHGCAR)

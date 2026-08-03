---
topic_slug: fermi-surface-and-full-brillouin-zone-analysis
status: reviewed
---

A Fermi-surface calculation identifies the reciprocal-space locus associated with a chosen chemical potential in a specified electronic state. For a periodic eigenvalue model it is an isosurface, not a band path, density-of-states curve, carrier-density measurement, or transport calculation. It is meaningful only after the structure, charge, spin/SOC treatment, occupations, reciprocal cell, and energy reference have been fixed.

## The object is an equal-energy set over the full zone

For band `n`, a zero-temperature Fermi-surface sheet is the set of wavevectors satisfying

```text
ε_n(k) = μ,
```

where `ε_n(k)` is the specified eigenvalue and `μ` is the chemical potential in the same calculation. In three dimensions the set is generally a two-dimensional surface; in two dimensions it is a contour; in one dimension it is a set of points. A plotted sheet therefore depends on the reciprocal-lattice basis and periodic-zone convention used to render repeated images.

At finite electronic temperature or with smearing, occupation changes continuously near `μ`. An isosurface chosen at a reported Fermi energy remains a useful visualization convention, but it does not turn a broadened occupation into a sharp experimental Fermi surface. State the occupation model and whether the displayed energy is the code-reported chemical potential or a deliberately scanned value.

## A high-symmetry path cannot establish a Fermi surface

Crossings on a band path show only where selected lines meet an energy. A pocket may avoid every plotted segment, and an apparent crossing can disappear away from the line. Construct the isosurface from a declared full-Brillouin-zone mesh or a validated interpolation, then retain the mesh, weights, cell transformation, band indices, and isovalue. The DOS complements this work by integrating energy-resolved weight; it does not locate the sheet geometry.

The same warning applies to extrema and topology. A visible neck, pocket, or touching point can be changed by the mesh, interpolation subspace, energy reference, structural state, magnetic order, spin--orbit coupling, or a small numerical energy shift. Treat it as a candidate feature until its local energy field and robustness are checked.

## Electron and hole labels require a declared reference

Near a selected band extremum, an electron-like or hole-like description refers to local curvature and filling within a specified band model. It is not determined by whether a rendered surface looks convex or concave from one viewpoint. In multiband, folded, spin-split, compensated, or semimetallic systems, counting pockets requires a band-by-band full-zone analysis and a documented zone convention.

Luttinger's relation connects the volume enclosed by a Fermi surface to particle density under assumptions that include an appropriate translationally invariant Fermi-liquid setting and a correctly defined interacting Fermi surface. A Kohn--Sham isosurface is not automatically an experimental carrier density or a proof that those assumptions hold. Broken symmetry, disorder, finite-temperature reconstruction, strong correlations, and incomplete occupied-band accounting can change the interpretation.

## Interpolation makes a dense mesh practical, not automatically reliable

Wannier interpolation can evaluate a fitted Hamiltonian efficiently on a regular grid and export an isosurface. Its subspace, disentanglement, windows, localization, spinor treatment, and interpolation convention are part of the result. A dense interpolated picture can be wrong in a small energy window if the fit misses a crossing or shifts a pocket.

Compare direct and interpolated eigenvalues at held-out points around every sheet used for a claim. Refine the full-zone grid and perturb the chosen isovalue within the numerical and physical uncertainty relevant to that claim. There is no universal k mesh, interpolation window, energy offset, pocket-volume tolerance, or number of empty bands.

## Symmetry, magnetism, and dimensionality change the comparison object

Magnetic order or a supercell can fold the Brillouin zone, yielding surfaces that require an explicit unfolding or reciprocal-cell mapping before comparison with a primitive-cell result. Collinear spin channels can have separate sheets. In a noncollinear spinor calculation with SOC, “spin-up sheet” is generally a projection onto a declared axis rather than a conserved quantum number.

For slabs and two-dimensional materials, periodicity in the nonperiodic direction and vacuum can generate artificial three-dimensional rendering context. Use the intended dimensional reciprocal manifold and distinguish a two-dimensional Fermi contour from a projected three-dimensional bulk surface. Surface spectral states and bulk Fermi surfaces require different evidence.

## Geometry alone is not a transport calculation

Fermi velocity is the band gradient, `v_n(k) = (1/ℏ) ∇_k ε_n(k)`, evaluated for the declared model. Even a well-resolved velocity field and sheet geometry do not supply scattering times, phonons, impurities, vertices, contacts, nonequilibrium distributions, or a conductivity tensor. Nesting-like parallel patches are geometric observations; they do not establish an instability, electron--phonon coupling, superconductivity, density wave, or enhanced response without the corresponding susceptibility or coupling calculation.

Angle-resolved photoemission, quantum oscillations, and transport can probe related information under their own surface, matrix-element, field, temperature, and many-body conditions. Agreement of a visually similar calculated sheet is not validation without an explicit observable-level comparison.

## Preserve the field, not only the rendered surface

Keep the parent structure and reference state; reciprocal vectors and zone convention; full mesh and weights; eigenvalues and occupations; chemical potential or chosen isovalue; band and spin/SOC labels; interpolation inputs and held-out checks; mesh/isovalue sensitivity; any unfolding; surface-generation algorithm and version; and machine-readable vertices or scalar fields. A screenshot alone cannot recover a pocket volume, a band assignment, or a perturbation test.

## What this topic establishes

This topic establishes how to construct and interpret a state-specific full-zone equal-energy surface while keeping path data, DOS, energy reference, interpolation, symmetry, dimensionality, and transport claims distinct. It does not establish an experimental Fermi surface, carrier concentration, effective mass, scattering rate, conductivity, quantum oscillation frequency, electronic instability, superconductivity, topology, material stability, or device performance from a rendered isosurface alone.

## Sources and methods

- [Bloch, wave functions in periodic potentials](https://doi.org/10.1007/BF01341914)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Luttinger, Fermi surface and equilibrium properties](https://doi.org/10.1103/PhysRev.119.1153)
- [Marzari and Vanderbilt, maximally localized Wannier functions](https://doi.org/10.1103/PhysRevB.56.12847)
- [Yates and co-workers, Fermi-surface properties from Wannier interpolation](https://doi.org/10.1103/PhysRevB.75.195121)
- [Wannier90 Fermi-surface parameters](https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/parameters/)
- [Wannier90 copper Fermi-surface tutorial](https://wannier90.readthedocs.io/en/latest/tutorials/tutorial_6/)
- [Quantum ESPRESSO band/Fermi-surface post-processing guide](https://quantum-espresso.org/Doc/pp_user_guide/node8.html)

---
topic_slug: density-of-states-and-projected-density-of-states
status: reviewed
---

The electronic density of states (DOS) asks a different question from a band plot. Instead of displaying selected eigenvalues along a line, it counts states per energy over a declared Brillouin-zone integration domain. A DOS can reveal gaps, peaks, spin asymmetry, and energy ranges that merit further analysis, but it does not by itself locate a state in reciprocal space, prove an orbital bond, measure a lifetime, or establish an experimental spectrum.

## What a density of states counts

For a specified one-electron model and Brillouin-zone sampling, the DOS is commonly written

```text
g(E) = Σ_n ∫_BZ δ(E − ε_n(k)) d k / Ω_BZ,
```

where `ε_n(k)` is eigenvalue `n` at wavevector `k`, `δ` is the Dirac delta, and `Ω_BZ` is the volume of the represented Brillouin zone. The result has units of states per energy for the declared cell, formula unit, atom, spin channel, or other normalization. Those denominators are not interchangeable: a plot labelled states/eV/cell cannot be compared directly with one labelled states/eV/atom without a documented conversion.

The integrated DOS, `N(E) = ∫_-∞^E g(E') dE'`, counts the states below an energy. Under the declared occupations it is a useful electron-count check. It does not make a discretely sampled DOS exact: a wrong electron count can expose an error, while a correct integral can still conceal poor k-point integration, too few unoccupied states, an unsuitable energy window, or a changed electronic state.

## A DOS is a full-zone integration, not a band path

A symmetry path samples a small set of reciprocal-space lines. A DOS integrates the bands over a mesh or interpolation defined across the Brillouin zone. A sharp feature can arise from a saddle point or a nearly flat region far from the plotted path; conversely, an apparent feature on a path can carry little full-zone weight. Record the mesh, weights, symmetry reduction, cell and reciprocal convention used for the DOS, and keep it separate from the path data used for a band diagram.

The DOS does not locate a band edge. A gap inferred from a low-DOS interval needs its own full-zone extremum search, occupations, energy reference, numerical resolution, and method boundary. The neighbouring Band Structure topic explains that search; Fermi Surface and Full-Brillouin-Zone Analysis addresses the geometry of states at a selected energy.

## Discrete eigenvalues need a stated integration method

Finite meshes replace the delta functions by an integration construction. Tetrahedron methods interpolate eigenvalues within reciprocal-space simplices; smearing replaces `δ(E − ε)` with a chosen kernel of finite width. Gaussian, Methfessel--Paxton, cold, and Fermi--Dirac functions do not make the same approximation, and a smooth curve may be a consequence of the chosen kernel rather than a physical feature.

The broadening width has energy units. Increasing it merges nearby peaks and fills a narrow gap visually; decreasing it exposes the discreteness and noise of an insufficient mesh. Neither visual smoothness nor agreement after changing only the plotted energy grid demonstrates convergence. Test the decision-relevant quantity—such as an integrated charge, a near-edge DOS, a peak separation, or a spin asymmetry—against the full-zone mesh, integration method, broadening, available bands, structural state, and electronic treatment. There is no transferable mesh, broadening, energy grid, or empty-band count.

## Set the energy reference before comparing curves

It is common to display `E − E_F`, but `E_F` belongs to one calculation and can change with charge, smearing, temperature model, spin state, defects, surfaces, or metallic occupations. In an insulator it can be a code convention inside the gap. Shifting two separate curves to their reported Fermi energies is useful for viewing each one; it is not a band alignment or a chemical-potential comparison.

For a comparison across compositions, charge states, surfaces, interfaces, or different Hamiltonians, retain the absolute calculation reference and declare an alignment construction appropriate to the physical question. An electrostatic lineup, common core reference, interface calculation, or another controlled procedure may be needed. A shared horizontal zero in a figure is not evidence that these operations were performed.

## Projected DOS is a partition chosen by a projector

A projected DOS can be expressed schematically as

```text
g_A(E) = Σ_n ∫_BZ w_A,n(k) δ(E − ε_n(k)) d k / Ω_BZ,
```

where `w_A,n(k)` is the weight of state `n,k` in a declared subspace `A`: an atom, angular-momentum channel, projector, atomic sphere, Wannier function, or another basis. The projection definition, radius or projector set, treatment of overlap, spin representation, and normalization are part of the result. A label such as “O p” therefore describes a chosen local decomposition, not a basis-independent observable.

Projected components often fail to sum exactly to the total DOS because interstitial weight, incomplete projectors, nonorthogonality, numerical truncation, or different normalization conventions remain outside the displayed set. Check the sum against the total on the same energy grid, then report any residual and the definition used. Do not renormalize curves silently until they add up: doing so can turn a diagnostic into an apparent chemical conclusion.

## Spin, spinors, and orbital labels need their own meaning

For collinear magnetism, separate spin-channel DOS curves can represent the chosen quantization axis. In a noncollinear calculation with spin--orbit coupling, an “up” or “down” curve may instead be a projection of a spinor density onto a declared axis, while vector magnetization components can be the relevant output. The same orbital label can also rotate with the local coordinate convention. State the magnetic configuration, collinear or spinor treatment, SOC setting, projector convention, and sign convention before interpreting a spin-polarized or orbital-resolved plot.

An energy coincidence between two projected peaks is not, by itself, a chemical bond, charge transfer, hybridization strength, oxidation state, or magnetic mechanism. Such claims require a defined comparison and additional evidence such as real-space density, wavefunction character, population analysis under its own basis convention, symmetry analysis, or a controlled perturbation.

## DOS is not a measured spectral function

The Kohn--Sham DOS is a count of eigenvalues in the stated effective model. Photoemission, tunnelling, inverse photoemission, and optical measurements involve matrix elements, surface sensitivity, temperatures, instrumental resolution, many-body self-energy, excitations, or selection rules. A numerical broadening added to a DOS plot is not a calculated quasiparticle lifetime, and matching a broad feature by eye is not validation of a spectral theory.

Hybrid or GW calculations can change eigenvalues and gaps; they do not become comparable merely by plotting them over a semilocal DOS. Keep the Hamiltonian, geometry, charge, spin/SOC, basis, k integration, projection definition, and energy alignment visible whenever comparing methods or experiment.

## Preserve the evidence behind the curve

Keep the parent structure and reference calculation; cell and reciprocal vectors; full k mesh and weights; eigenvalues, occupations, bands and energy window; integration or smearing rule; energy grid and reference; spin/SOC and magnetic metadata; projector definitions and radii where applicable; total and projected arrays in machine-readable form; integration checks; convergence series; plotting transforms; and hashes of source outputs. A raster image alone cannot support a later electron-count, normalization, or peak-assignment check.

## What this topic establishes

This topic establishes how to compute, normalize, inspect, and compare a state-specific total or projected DOS without confusing an energy histogram with reciprocal-space location, a chosen projection with a unique atomic observable, plot broadening with a lifetime, or a calculated curve with an experimental spectrum. It does not establish a band-edge location, fundamental or experimental gap, chemical bond, charge transfer, oxidation state, magnetic mechanism, quasiparticle spectrum, transport coefficient, material stability, or device performance from a DOS plot alone.

## Sources and methods

- [Bloch, wave functions in periodic potentials](https://doi.org/10.1007/BF01341914)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Blöchl, Jepsen, and Andersen, improved tetrahedron integration](https://doi.org/10.1103/PhysRevB.49.16223)
- [Methfessel and Paxton, high-precision sampling](https://doi.org/10.1103/PhysRevB.40.3616)
- [Marzari and co-workers, cold smearing](https://doi.org/10.1103/PhysRevLett.82.3296)
- [Quantum ESPRESSO `dos.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_DOS.html)
- [Quantum ESPRESSO `projwfc.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html)
- [VASP `DOSCAR` documentation](https://vasp.at/wiki/DOSCAR)
- [VASP `LORBIT` documentation](https://vasp.at/wiki/LORBIT)

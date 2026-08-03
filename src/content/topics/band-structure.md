---
topic_slug: band-structure
status: reviewed
---

A band-structure calculation represents selected eigenvalues as functions of crystal wavevector. It is a statement about a specified periodic structure, Hamiltonian, electronic state, and reciprocal-space convention. The familiar line plot is useful because it makes dispersions, crossings, and candidate extrema visible; it is not a map of every state in the Brillouin zone and it is not automatically a measured quasiparticle spectrum.

## What the plotted quantity is

For a periodic effective one-electron problem, Bloch's theorem labels states by a band index `n` and a wavevector `k`. A Kohn--Sham calculation solves

```text
H_KS(k) u_nk = ε_nk u_nk,
```

where `H_KS(k)` is the chosen periodic Kohn--Sham Hamiltonian, `u_nk` is the cell-periodic part of the Bloch state, and `ε_nk` is its eigenvalue. The plot joins selected `ε_nk` values along a declared path. Its ordinate is normally an energy in eV after a stated reference shift; its abscissa is cumulative distance along a piecewise path in reciprocal space, not a physical real-space distance or a density of states.

Kohn--Sham eigenvalues organize the self-consistent effective problem. Their difference at two band extrema can be a useful DFT observable, but it does not by itself establish a photoemission peak, optical transition, quasiparticle gap, exciton energy, carrier lifetime, or transport coefficient. Those require the corresponding spectral, many-body, optical, or transport model.

## The reciprocal cell is part of the result

The direct lattice used to make a supercell changes the reciprocal lattice and folds bands into a smaller Brillouin zone. Primitive-cell and conventional-cell paths therefore need not display the same labels or number of branches even when they describe the same physical crystal. A comparison must preserve the chosen cell, reciprocal basis, space group or magnetic group, dimensionality, and the coordinate convention for every special point.

High-symmetry labels such as `Γ`, `X`, `K`, or `L` are not universal Cartesian locations. Their meaning depends on the Bravais lattice and, in some cases, on lattice-parameter ratios. Seek-path and related crystallographic conventions can generate a reproducible recommended path from a standardized structure, but they do not infer a relaxed phase, magnetic order, or electronic ground state.

## A path is a visual cut, not a full-zone search

The valence-band maximum and conduction-band minimum may occur between labelled points or away from every displayed segment. A direct-looking gap on a path can therefore be indirect in the full Brillouin zone; a path can also miss a small pocket, accidental crossing, or spin-split extremum. Locate extrema on an independently converged uniform mesh or another explicitly declared full-zone search before assigning directness, a fundamental gap, carrier valleys, or a Fermi surface.

Conversely, a dense uniform mesh is not a substitute for a readable path plot. The two objects answer different questions: one samples an integration or search domain; the other provides a symmetry-aware visual section. Record which calculation supplied each claim.

## Choose an energy reference that survives comparison

Subtracting the Fermi energy places occupied and unoccupied branches around `E_F = 0` for a specified calculation, but that reference can move with smearing, electron count, spin state, defects, surfaces, or temperature model. In an insulator, a code may report a chemical-potential convention inside the gap rather than a unique physical level.

Comparing separate bulk calculations after an arbitrary `E_F` shift does not align their bands. A common electrostatic reference, an interface lineup, a core-level or branch-point procedure, or another declared alignment construction is needed for a band-offset claim. That problem is addressed by Electrostatic Potential and Band Alignment, not by superposing two isolated band diagrams.

## Occupations, magnetism, and spin--orbit coupling change the object

The eigenvalues must inherit the same charge, spin treatment, occupation procedure, relativistic Hamiltonian, Hubbard definition, and structural state as the reference calculation. A spin-polarized calculation can have separate spin channels; a noncollinear spinor calculation with spin--orbit coupling generally has no globally conserved “up” and “down” label. Plotting two colours is not evidence that spin is a good quantum number.

Magnetic order can change translational symmetry and fold the Brillouin zone. A band comparison across ferromagnetic, antiferromagnetic, nonmagnetic, or different supercell states must state the mapping or unfolding method rather than visually treating folded branches as new physical bands.

## Interpolation is an approximation with a validation task

Direct diagonalization at path points can be expensive or incompatible with a coarse self-consistent mesh. Wannier interpolation constructs a localized representation and evaluates a fitted Hamiltonian at many `k` points. It can expose fine features efficiently, but its bands are only reliable over the represented energy window and subspace. Disentanglement choices, projections, localization, spinor treatment, frozen windows, and interpolation conventions become part of the evidence.

Compare interpolated and directly calculated eigenvalues at held-out path points and around every feature used for a claim. Smooth curves are not enough: an avoided crossing, band inversion, small gap, or valley ordering can be changed by a poor subspace even when the figure looks plausible.

## Band connectivity deserves care

At a crossing or near-degeneracy, sorting by energy can exchange the visual identity of two branches. Overlap-based ordering can instead follow wavefunction character, while symmetry analysis can label irreducible representations on suitable lines. Neither ordering is a licence to claim a protected crossing: protection depends on the relevant symmetry, representation, perturbations, spin--orbit setting, and numerical resolution.

Quantum ESPRESSO documents both overlap and symmetry-based band reordering, and warns that ordering can fail when path points are not in sequence. Keep the raw eigenvalue ordering, any reordered plot, and symmetry or overlap metadata so a later reader can test a proposed connectivity statement.

## Convergence must target the displayed decision

SCF convergence at one mesh does not show that a gap, curvature, splitting, degeneracy, or ordering is converged. Test the observable against basis representation, Brillouin-zone sampling, occupations, number of computed states, structural and magnetic candidate, spin--orbit treatment, and the path or full-zone search resolution relevant to the question. There is no transferable k-path density, number of empty bands, smearing, cutoff, or gap tolerance.

When a conclusion relies on a small separation, quantify numerical drift and method dependence at the relevant extrema. A change in the Fermi reference may make a graph look stable while the actual extrema move; a converged total energy may coexist with an unresolved band ordering.

## Gap labels require their own definitions

For a single specified eigenvalue model, define

```text
E_g = min_k ε_c(k) − max_k ε_v(k),
```

where `ε_v` is the highest occupied valence eigenvalue and `ε_c` the lowest unoccupied conduction eigenvalue under the declared occupations. The minimum and maximum are over the full stated search region. The gap is direct only when those extrema occur at the same `k` within the stated numerical resolution. Metallic occupations, fractional bands, defects, and finite-temperature sampling can make the valence/conduction partition nontrivial; do not apply the formula by inspecting one path image.

Semilocal DFT commonly has a derivative-discontinuity limitation for fundamental gaps. Hybrid functionals, GW, or experiments answer related but different questions under their own approximations and references. A scissor shift can be a presentation or model choice, not a self-contained validation of dispersions, orbital character, effective masses, offsets, or optical spectra.

## Preserve the data behind the figure

Keep the relaxed structure and parent reference; reciprocal vectors; cell transformation; path generator and version; special-point fractional coordinates and labels; every `k` point in order; eigenvalues, occupations, and units; energy reference; spin, SOC, and symmetry metadata; interpolation inputs and held-out comparison; convergence series; plotting transformation; and hashes of raw outputs. Preserve both the full-zone extremum search and the path dataset when a gap or valley claim is made.

## What this topic establishes

This topic establishes how to create and interpret a state-specific band diagram and how to keep reciprocal conventions, energy references, interpolation, crossings, extrema, and numerical controls visible. It does not establish a complete full-zone electronic topology, a quasiparticle or optical spectrum, a fundamental experimental gap, a transport coefficient, a topological invariant, carrier mobility, material stability, or device performance from one plotted path.

## Sources and methods

- [Bloch, wave functions in periodic potentials](https://doi.org/10.1007/BF01341914)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Setyawan and Curtarolo, standardized band paths](https://doi.org/10.1016/j.commatsci.2010.05.010)
- [Hinuma and co-workers, SeeK-path](https://doi.org/10.1016/j.commatsci.2016.01.017)
- [SeeK-path official documentation](https://seekpath.readthedocs.io/en/latest/)
- [Quantum ESPRESSO `bands.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_BANDS.html)
- [Quantum ESPRESSO post-processing guide](https://quantum-espresso.org/Doc/pp_user_guide/node8.html)
- [Marzari and Vanderbilt, maximally localized Wannier functions](https://doi.org/10.1103/PhysRevB.56.12847)
- [Wannier90 official interpolation notes](https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/notes_interpolations/)
- [Hedin, GW approximation](https://doi.org/10.1103/PhysRev.139.A796)
- [Heyd, Scuseria, and Ernzerhof, screened hybrid functional](https://doi.org/10.1063/1.1564060)

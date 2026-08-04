---
topic_slug: wannier-function-construction
status: reviewed
---

Wannier construction changes the representation of a declared Bloch-state subspace. It is useful when localized orbitals and a real-space Hamiltonian make interpolation, Berry-response, surface, tight-binding, or transport analysis tractable. It is not an energy correction, a substitute for a converged parent electronic calculation, or a guarantee that a selected orbital picture is physically unique.

## A gauge choice over a periodic subspace

For an isolated set of bands, Wannier functions are Fourier transforms of Bloch states after a `k`-dependent unitary rotation,

```text
|w_nR> = (1/N_k) sum_k exp(-i k·R) sum_m U_mn(k) |psi_mk>.
```

`R` labels a lattice vector, `n` labels one function in the chosen subspace, `N_k` is the number of sampled k points, and `U(k)` is a unitary gauge transformation among the selected Bloch states. Energies alone do not determine `U(k)`: phases and rotations can produce equally valid extended or localized functions. Localized functions therefore describe a chosen smooth gauge of a specified subspace, not an observable orbital that existed independently of that choice.

Maximally localized Wannier functions select a gauge by minimizing the total quadratic spread

```text
Omega = sum_n [ <r^2>_n - |<r>_n|^2 ].
```

The centres `<r>_n` and spread terms depend on the cell, k mesh, periodic convention, spin/SOC representation, and subspace. A small final spread is useful diagnostics, but it does not by itself prove correct band character, interpolation outside the target window, topology, or transferability.

## Isolated bands and disentangled subspaces are different problems

When exactly the target number of bands is separated by gaps across the sampled Brillouin zone, the construction only chooses a gauge inside that isolated manifold. Metallic and conduction manifolds are commonly entangled with additional bands. Disentanglement first chooses an optimal `N_w`-dimensional subspace inside an outer energy window, often preserving a frozen inner window, and localization is applied afterwards. The outer window, inner/frozen window, number of Wannier functions, trial projections, and any excluded bands are physical modelling choices.

The resulting interpolated band can agree perfectly inside a frozen window while becoming unreliable above it. Conversely, a visually localized orbital can hide an avoided crossing or incorrect orbital exchange. Compare the interpolated and parent eigenvalues, characters where relevant, and symmetry or degeneracy behaviour over the full domain needed by the downstream observable; do not accept a fit only along a presentation band path.

## From overlaps to an interpolated Hamiltonian

Construction consumes compatible eigenvalues, Bloch states, neighbour connectivity, and overlaps such as

```text
M_mn(k,b) = <u_mk | u_n,k+b>.
```

Here `u_nk` is the cell-periodic part of a parent Bloch state and `b` connects declared neighbouring k points. Their ordering, phase convention, spinor treatment, reciprocal cell, and parent Hamiltonian must remain consistent. After a gauge is selected, the real-space matrix elements `H_mn(R)` can be Fourier transformed to interpolate `H(k)` on a target mesh. This is a representation transfer, not a new self-consistent electronic solution.

Interpolation accuracy is controlled by parent k sampling, subspace quality, real-space truncation/interpolation convention, and target energy or k range. A dense interpolated curve does not add information absent from a coarse or incomplete parent calculation. For a non-collinear or SOC calculation, the spinor convention and symmetry treatment must be retained; mixing scalar-relativistic and spinor records can invalidate the representation even if file dimensions match.

## Evidence needed for downstream reuse

Record the structure and parent-state hashes, code and version, pseudopotential or all-electron treatment, k mesh and neighbour graph, selected bands, windows, projections, initialization, spread history, final centres/spreads, symmetry switches, and real-space Hamiltonian convention. Then test the downstream quantity itself: a successful band interpolation does not establish a Berry curvature, surface state, anomalous Hall response, carrier transport coefficient, or topological invariant.

Wannier construction sits between a parent electronic-state calculation and representations used by later analysis. **Band Structure** may display parent or interpolated eigenvalues; **Berry Phase and Berry Curvature**, **Topological Invariants and Boundary States**, and **Electronic Transport** can consume a validated representation but require their own gauge, mesh, operator, and observable checks. This topic does not establish a unique chemical bonding picture, a physical orbital population, or a material conclusion.

## Sources and methods

- [Marzari and Vanderbilt, maximally localized composite-band functions](https://doi.org/10.1103/PhysRevB.56.12847)
- [Souza, Marzari, and Vanderbilt, disentanglement of entangled bands](https://doi.org/10.1103/PhysRevB.65.035109)
- [Wannier90 methodology](https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/methodology/)
- [Wannier90 interpolation notes](https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/notes_interpolations/)
- [Wannier90 Silicon disentanglement tutorial](https://wannier90.readthedocs.io/en/latest/tutorials/tutorial_3/)

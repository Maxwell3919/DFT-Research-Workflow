---
topic_slug: electron-phonon-coupling
status: reviewed
---

Electron--phonon coupling (EPC) asks how a specified vibrational normal mode changes the electronic Hamiltonian and thereby scatters or renormalizes electronic states. It is not a scalar property attached to a chemical formula. The answer depends on the electronic and vibrational reference states, carrier energy and occupation, temperature, reciprocal-space sampling, long-range electrostatics, and the observable being constructed. A harmonic phonon dispersion is necessary input, but it does not determine EPC by itself; a later superconducting calculation is a separate inference with additional assumptions.

## The matrix element is the primitive quantity

For an electronic state `|n k⟩`, a final state `|m, k+q⟩`, and a phonon branch `ν`, the first-order coupling is commonly written

```text
g_mnν(k,q) = ⟨u_m,k+q | Δ_qν v^KS | u_n,k⟩_uc .
```

`u_nk` and `u_m,k+q` are cell-periodic Kohn--Sham states, `q` is a phonon wavevector, and `Δ_qν v^KS` is the lattice-periodic first-order change in the self-consistent Kohn--Sham potential for the normalized phonon mode. The matrix element is an amplitude for a specified scattering channel, not a lifetime, a linewidth, `λ`, a transport coefficient, or a superconducting transition temperature. Its normalization must state the phonon eigenvector and mass convention; changing the cell, mode phase, gauge, or normalization changes an intermediate representation without necessarily changing a correctly constructed observable.

## From a matrix element to an observable

Fermi's golden rule combines `|g_mnν(k,q)|²`, occupations, and energy conservation to form an electron or phonon scattering rate. A phonon linewidth probes the decay of a phonon into electronic excitations under a declared electronic-state and smearing model. An electronic linewidth or self-energy instead describes the selected electronic excitation. These are related through the same interaction but are not interchangeable axes on one plot.

For a metal, a mode-resolved coupling strength can be constructed by a Fermi-surface average. The Eliashberg function `α²F(ω)` then resolves the Fermi-surface-weighted interaction by phonon frequency, and its integral produces a dimensionless `λ` only under that stated definition. A large local `|g|` need not yield a large `λ`: phase space, density of states near the Fermi level, phonon frequency, weights, and the selected electronic window also enter. Conversely, a reported total `λ` cannot recover which bands, momenta, or modes caused it.

## Comparable inputs and dense reciprocal space

DFPT can calculate perturbing potentials and EPC matrix elements on a coarse, explicitly declared k--q representation. Observables usually require much denser reciprocal-space integration because the relevant energy-conserving states can occupy a small region near a Fermi surface or band edge. Wannier-based interpolation is one controlled way to reach that resolution, but it introduces choices about disentanglement, gauges, real-space localization, interpolation windows, polar long-range terms, and validation against the direct coarse-grid quantities. Interpolation smoothness is not proof that the underlying band, phonon, or coupling model is converged.

The electronic ground state, pseudopotential or all-electron treatment, exchange--correlation model, spin/SOC state, cell, carrier condition, phonon eigenvectors, and polar treatment must remain compatible. In polar materials, long-range Fröhlich-like contributions require a stated separation and reconstruction; silently treating a nonanalytic small-`q` feature as a short-range interpolation error can alter the intended observable. A calculation for an intrinsic insulator, a doped model, and a metal with a shifted Fermi level do not share one automatically comparable Fermi-surface average.

## Convergence, diagnostics, and boundaries

Converge the observable that motivates the calculation: selected matrix elements, a linewidth, a self-energy shift, a mode-resolved coupling, `α²F(ω)`, a carrier scattering rate, or a later transport/superconducting input. Test the electronic and phonon meshes, bands and energy windows, occupations and integration treatment, phonon interpolation, Wannier representation where used, small-`q` treatment, temperature, carrier model, and delta-function approximation. No universal k mesh, q mesh, smearing, empty-band count, interpolation window, or `μ*` can certify EPC across materials.

Preserve the reference-state lineage, DFPT perturbations, electronic and phonon meshes and weights, eigenvalue and phonon conventions, matrix-element normalization, interpolation inputs, Fermi-level or doping definition, integration settings, and code versions. A completed calculation or a visually smooth `α²F` curve does not establish electron-phonon-limited mobility, a measured linewidth, a superconducting phase, or a material conclusion. It does not establish electron-phonon-limited mobility from one completed run. This topic provides interaction data and observable-specific averages; Conventional Superconductivity must separately justify its pairing model, Coulomb treatment, and transition-temperature inference.

## Sources and methods

- [Giustino, electron--phonon interactions from first principles](https://doi.org/10.1103/RevModPhys.89.015003)
- [Quantum ESPRESSO `ph.x` electron--phonon input documentation](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Quantum ESPRESSO PHonon guide: interaction coefficients](https://www.quantum-espresso.org/Doc/ph_user_guide/node10.html)
- [EPW theory: electron--phonon matrix elements](https://docs.epw-code.org/Theory.html)
- [EPW coupling, linewidth, and Eliashberg-function documentation](https://docs.epw-code.org/doc/Electron-phononCoupling.html)
- [EPW interpolation tutorial](https://docs.epw-code.org/tutorials/tutorial_01/index.html)
